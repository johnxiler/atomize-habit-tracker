use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize, sqlx::FromRow, Clone)]
pub struct Habit {
    pub id: i64,
    pub title: String,
    pub color: String,
    pub frequency: String,
    pub difficulty: i64,
    pub category: String,
    pub created_at: String,
}

#[derive(Serialize, Deserialize, sqlx::FromRow)]
pub struct Reflection {
    pub id: i64,
    pub habit_id: i64,
    pub date: String,
    pub content: String,
}

#[derive(Deserialize)]
pub struct CreateReflectionRequest {
    pub habit_id: i64,
    pub date: String,
    pub content: String,
}

#[derive(Serialize, Deserialize, Clone, Debug, sqlx::FromRow)]
pub struct HabitLog {
    pub habit_id: i64,
    pub date: String,
    pub completed: bool,
}

#[derive(Serialize, Clone)]
pub struct HabitResponse {
    pub id: i64,
    pub title: String,
    pub color: String,
    pub frequency: String,
    pub difficulty: i64,
    pub category: String,
    pub xp_value: i64,
    pub habit_score: i64,
    pub created_at: String,
    pub streak: i64,
    pub best_streak: i64,
    pub completed_today: bool,
}

#[derive(Deserialize)]
pub struct CreateHabitRequest {
    pub title: String,
    pub color: Option<String>,
    pub frequency: Option<String>,
    pub difficulty: Option<i64>,
    pub category: Option<String>,
}

#[derive(Deserialize)]
pub struct UpdateHabitRequest {
    pub title: Option<String>,
    pub color: Option<String>,
    pub frequency: Option<String>,
    pub difficulty: Option<i64>,
    pub category: Option<String>,
}

#[derive(Deserialize)]
pub struct ToggleLogRequest {
    pub habit_id: i64,
    pub date: String,
}

#[derive(Serialize)]
pub struct AIAnalysisResponse {
    pub insights: Vec<String>,
    pub predictions: Vec<String>,
}

#[derive(Serialize)]
pub struct AnalyticsResponse {
    pub habit_score: u32,
    pub weekly_rates: Vec<f64>,
    pub completion_dates: Vec<String>,
    pub total_habits: usize,
    pub avg_streak: f64,
    pub completion_rate: f64,
}
