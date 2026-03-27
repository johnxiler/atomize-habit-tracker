use axum::{
    extract::{Path, State},
    http::StatusCode,
    Json,
};
use chrono::Datelike;

use crate::db::{Db, get_streak, get_best_streak};
use crate::models::*;
use crate::assembly;

fn calculate_xp_value(difficulty: i64) -> i64 {
    match difficulty {
        1 => 10,
        2 => 30,
        3 => 50,
        _ => 10,
    }
}

pub async fn list_habits(State(db): State<Db>) -> Result<Json<Vec<HabitResponse>>, StatusCode> {
    let habits: Vec<Habit> = sqlx::query_as("SELECT id, title, color, frequency, difficulty, category, created_at FROM habits")
        .fetch_all(&db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let logs: Vec<HabitLog> = sqlx::query_as("SELECT habit_id, date, completed FROM habit_logs")
        .fetch_all(&db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let today = chrono::Local::now().format("%Y-%m-%d").to_string();

    let mut res = Vec::new();
    for habit in habits.into_iter().rev() {
        let streak = get_streak(&logs, habit.id);
        let best_streak = get_best_streak(&logs, habit.id);
        let completed_today = logs.iter().any(|l| l.habit_id == habit.id && l.date == today && l.completed);
        let habit_score = assembly::calculate_difficulty_score(streak as u32, habit.difficulty as u32);
        res.push(HabitResponse {
            id: habit.id,
            title: habit.title,
            color: habit.color,
            frequency: habit.frequency,
            difficulty: habit.difficulty,
            category: habit.category,
            xp_value: calculate_xp_value(habit.difficulty),
            habit_score: habit_score as i64,
            created_at: habit.created_at,
            streak,
            best_streak,
            completed_today,
        });
    }

    Ok(Json(res))
}

pub async fn create_habit(
    State(db): State<Db>,
    Json(req): Json<CreateHabitRequest>,
) -> Result<(StatusCode, Json<HabitResponse>), StatusCode> {
    let color = req.color.unwrap_or_else(|| "#cadbfc".to_string());
    let frequency = req.frequency.unwrap_or_else(|| "daily".to_string());
    let difficulty = req.difficulty.unwrap_or(1);
    let category = req.category.unwrap_or_else(|| "general".to_string());
    let now = chrono::Local::now().format("%Y-%m-%d %H:%M:%S").to_string();

    let habit = sqlx::query_as::<_, Habit>(
        "INSERT INTO habits (title, color, frequency, difficulty, category, created_at) VALUES (?, ?, ?, ?, ?, ?) RETURNING *"
    )
    .bind(&req.title)
    .bind(color)
    .bind(frequency)
    .bind(difficulty)
    .bind(category)
    .bind(now)
    .fetch_one(&db)
    .await
    .map_err(|e| {
        eprintln!("Error creating habit: {:?}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    let res = HabitResponse {
        id: habit.id,
        title: habit.title,
        color: habit.color,
        frequency: habit.frequency,
        difficulty: habit.difficulty,
        category: habit.category,
        xp_value: calculate_xp_value(habit.difficulty),
        habit_score: 0,
        created_at: habit.created_at,
        streak: 0,
        best_streak: 0,
        completed_today: false,
    };

    Ok((StatusCode::CREATED, Json(res)))
}

pub async fn delete_habit(
    State(db): State<Db>,
    Path(id): Path<i64>,
) -> StatusCode {
    let result = sqlx::query("DELETE FROM habits WHERE id = ?")
        .bind(id)
        .execute(&db)
        .await;

    match result {
        Ok(res) if res.rows_affected() > 0 => StatusCode::NO_CONTENT,
        Ok(_) => StatusCode::NOT_FOUND,
        Err(_) => StatusCode::INTERNAL_SERVER_ERROR,
    }
}

pub async fn update_habit(
    State(db): State<Db>,
    Path(id): Path<i64>,
    Json(req): Json<UpdateHabitRequest>,
) -> Result<Json<HabitResponse>, StatusCode> {
    sqlx::query(
        "UPDATE habits SET 
            title = COALESCE(?, title),
            color = COALESCE(?, color),
            frequency = COALESCE(?, frequency),
            difficulty = COALESCE(?, difficulty),
            category = COALESCE(?, category)
        WHERE id = ?"
    )
    .bind(req.title)
    .bind(req.color)
    .bind(req.frequency)
    .bind(req.difficulty)
    .bind(req.category)
    .bind(id)
    .execute(&db)
    .await
    .map_err(|e| {
        eprintln!("Error updating habit: {:?}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    // Return the updated habit with stats
    let habit: Habit = sqlx::query_as("SELECT * FROM habits WHERE id = ?")
        .bind(id)
        .fetch_one(&db)
        .await
        .map_err(|_| StatusCode::NOT_FOUND)?;

    let logs: Vec<HabitLog> = sqlx::query_as("SELECT habit_id, date, completed FROM habit_logs WHERE habit_id = ?")
        .bind(id)
        .fetch_all(&db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let today = chrono::Local::now().format("%Y-%m-%d").to_string();
    let streak = get_streak(&logs, habit.id);
    let best_streak = get_best_streak(&logs, habit.id);
    let completed_today = logs.iter().any(|l| l.habit_id == habit.id && l.date == today && l.completed);
    let habit_score = assembly::calculate_difficulty_score(streak as u32, habit.difficulty as u32);

    Ok(Json(HabitResponse {
        id: habit.id,
        title: habit.title,
        color: habit.color,
        frequency: habit.frequency,
        difficulty: habit.difficulty,
        category: habit.category,
        xp_value: calculate_xp_value(habit.difficulty),
        habit_score: habit_score as i64,
        created_at: habit.created_at,
        streak,
        best_streak,
        completed_today,
    }))
}

pub async fn toggle_log(
    State(db): State<Db>,
    Json(req): Json<ToggleLogRequest>,
) -> Result<Json<HabitLog>, StatusCode> {
    let existing_log: Option<HabitLog> = sqlx::query_as(
        "SELECT habit_id, date, completed FROM habit_logs WHERE habit_id = ? AND date = ?"
    )
    .bind(req.habit_id)
    .bind(&req.date)
    .fetch_optional(&db)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let final_log = if let Some(mut log) = existing_log {
        log.completed = !log.completed;
        sqlx::query("UPDATE habit_logs SET completed = ? WHERE habit_id = ? AND date = ?")
            .bind(log.completed)
            .bind(log.habit_id)
            .bind(&log.date)
            .execute(&db)
            .await
            .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
        log
    } else {
        sqlx::query("INSERT INTO habit_logs (habit_id, date, completed) VALUES (?, ?, ?)")
            .bind(req.habit_id)
            .bind(&req.date)
            .bind(true)
            .execute(&db)
            .await
            .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
        HabitLog {
            habit_id: req.habit_id,
            date: req.date,
            completed: true,
        }
    };

    Ok(Json(final_log))
}

pub async fn get_analytics(State(db): State<Db>) -> Result<Json<AnalyticsResponse>, StatusCode> {
    let habits: Vec<Habit> = sqlx::query_as("SELECT id, title, color, frequency, difficulty, category, created_at FROM habits")
        .fetch_all(&db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let total_habits = habits.len();

    if total_habits == 0 {
        return Ok(Json(AnalyticsResponse {
            habit_score: 0,
            weekly_rates: vec![0.0; 7],
            completion_dates: vec![],
            total_habits: 0,
            avg_streak: 0.0,
            completion_rate: 0.0,
        }));
    }

    let logs: Vec<HabitLog> = sqlx::query_as("SELECT habit_id, date, completed FROM habit_logs")
        .fetch_all(&db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let today = chrono::Local::now().format("%Y-%m-%d").to_string();
    let today_completed = logs.iter()
        .filter(|l| l.date == today && l.completed)
        .count();

    let completion_rate = today_completed as f64 / total_habits as f64;

    let mut weekly_rates: Vec<f64> = Vec::with_capacity(7);
    for i in (0..7).rev() {
        let date = (chrono::Local::now() - chrono::Duration::days(i))
            .format("%Y-%m-%d").to_string();
        let count = logs.iter()
            .filter(|l| l.date == date && l.completed)
            .count();
        weekly_rates.push(count as f64 / total_habits as f64);
    }

    let completion_dates: Vec<String> = logs.iter()
        .filter(|l| l.completed)
        .map(|l| l.date.clone())
        .collect::<std::collections::HashSet<_>>()
        .into_iter()
        .collect();

    let total_streaks: i64 = habits.iter()
        .map(|h| get_streak(&logs, h.id))
        .sum();
    let avg_streak = total_streaks as f64 / total_habits as f64;

    let completion_pct = (completion_rate * 100.0) as u32;
    let habit_score = assembly::calculate_habit_score(
        completion_pct,
        avg_streak as u32,
        total_habits as u32,
    );

    Ok(Json(AnalyticsResponse {
        habit_score,
        weekly_rates,
        completion_dates,
        total_habits,
        avg_streak,
        completion_rate,
    }))
}

pub async fn get_ai_analysis(State(db): State<Db>) -> Result<Json<AIAnalysisResponse>, StatusCode> {
    let habits: Vec<Habit> = sqlx::query_as("SELECT id, title, color, frequency, difficulty, category, created_at FROM habits")
        .fetch_all(&db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let logs: Vec<HabitLog> = sqlx::query_as("SELECT habit_id, date, completed FROM habit_logs")
        .fetch_all(&db)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    let mut insights = Vec::new();
    let mut predictions = Vec::new();

    let today = chrono::Local::now();

    for habit in habits {
        let mut sun_misses = 0;
        let mut sun_total = 0;
        let mut last_7_days_completions = 0;

        for i in 0..30 {
            let date = today - chrono::Duration::days(i);
            let date_str = date.format("%Y-%m-%d").to_string();
            let is_sunday = date.weekday() == chrono::Weekday::Sun;
            
            let completed = logs.iter().any(|l| l.habit_id == habit.id && l.date == date_str && l.completed);
            
            if is_sunday && i > 0 { // Check previous Sundays
                sun_total += 1;
                if !completed { sun_misses += 1; }
            }
            
            if i < 7 && completed {
                last_7_days_completions += 1;
            }
        }

        if sun_total >= 2 && sun_misses as f32 / sun_total as f32 > 0.5 {
            insights.push(format!("You often miss '{}' on Sundays. Try scheduling it earlier!", habit.title));
        }
        
        if last_7_days_completions < 2 && last_7_days_completions > 0 {
            predictions.push(format!("Risk of failing '{}' this week is HIGH. Try to restore your streak tomorrow!", habit.title));
        }
    }

    if insights.is_empty() {
        insights.push("You're doing great! No negative patterns detected.".to_string());
    }

    Ok(Json(AIAnalysisResponse { insights, predictions }))
}

pub async fn create_reflection(
    State(db): State<Db>,
    Json(payload): Json<CreateReflectionRequest>,
) -> Result<Json<Reflection>, StatusCode> {
    let reflection = sqlx::query_as::<_, Reflection>(
        "INSERT INTO reflections (habit_id, date, content) VALUES (?, ?, ?) RETURNING id, habit_id, date, content"
    )
    .bind(payload.habit_id)
    .bind(&payload.date)
    .bind(&payload.content)
    .fetch_one(&db)
    .await
    .map_err(|e| {
        eprintln!("Error creating reflection: {:?}", e);
        StatusCode::INTERNAL_SERVER_ERROR
    })?;

    Ok(Json(reflection))
}

pub async fn get_reflections(
    State(db): State<Db>,
    Path(habit_id): Path<i64>,
) -> Result<Json<Vec<Reflection>>, StatusCode> {
    let reflections = sqlx::query_as::<_, Reflection>(
        "SELECT id, habit_id, date, content FROM reflections WHERE habit_id = ? ORDER BY date DESC"
    )
    .bind(habit_id)
    .fetch_all(&db)
    .await
    .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(reflections))
}
