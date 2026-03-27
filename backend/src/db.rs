use sqlx::{AnyPool, any::AnyConnectOptions, Pool, Any};
use std::str::FromStr;
use crate::models::HabitLog;

pub type Db = Pool<Any>;

pub async fn init_db() -> Db {
    sqlx::any::install_default_drivers();
    let database_url = std::env::var("DATABASE_URL").unwrap_or_else(|_| "sqlite://../database/atomize.db".to_string());
    
    let options = AnyConnectOptions::from_str(&database_url)
        .expect("Invalid DATABASE_URL");
        
    AnyPool::connect_with(options).await.expect("Failed to connect to database")
}

pub fn get_streak(logs: &[HabitLog], habit_id: i64) -> i64 {
    let mut dates: Vec<String> = logs.iter()
        .filter(|l| l.habit_id == habit_id && l.completed)
        .map(|l| l.date.clone())
        .collect();
    dates.sort_by(|a, b| b.cmp(a)); // Descending

    if dates.is_empty() { return 0; }

    let mut completed: Vec<u8> = Vec::new();
    let today = chrono::Local::now().format("%Y-%m-%d").to_string();
    let mut current = today;

    for _ in 0..365 {
        if dates.contains(&current) {
            completed.push(1);
        } else {
            completed.push(0);
        }
        let prev = chrono::NaiveDate::parse_from_str(&current, "%Y-%m-%d").unwrap()
            - chrono::Duration::days(1);
        current = prev.format("%Y-%m-%d").to_string();
    }

    crate::assembly::calculate_streak(&completed) as i64
}

pub fn get_best_streak(logs: &[HabitLog], habit_id: i64) -> i64 {
    let mut dates: Vec<String> = logs.iter()
        .filter(|l| l.habit_id == habit_id && l.completed)
        .map(|l| l.date.clone())
        .collect();
    dates.sort(); // Ascending

    if dates.is_empty() { return 0; }

    let mut best: i64 = 0;
    let mut current_run: i64 = 1;

    for i in 1..dates.len() {
        let prev = chrono::NaiveDate::parse_from_str(&dates[i - 1], "%Y-%m-%d").unwrap();
        let curr = chrono::NaiveDate::parse_from_str(&dates[i], "%Y-%m-%d").unwrap();
        if (curr - prev).num_days() == 1 {
            current_run += 1;
        } else {
            best = best.max(current_run);
            current_run = 1;
        }
    }
    best.max(current_run)
}
