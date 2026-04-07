mod db;
mod models;
mod routes;
mod assembly;

use axum::{
    Router,
    routing::{get, post, put, delete},
};
use tower_http::cors::{CorsLayer, Any};

#[tokio::main]
async fn main() {
    let database = db::init_db().await;
    let database_url = std::env::var("DATABASE_URL").unwrap_or_default();
    let is_sqlite = database_url.is_empty() || database_url.contains("sqlite");

    if is_sqlite {
        // SQLite Auto-Schema
        let schema = std::fs::read_to_string("../database/schema.sql").expect("Could not read schema.sql");
        sqlx::query(&schema).execute(&database).await.expect("Failed to execute local schema");
        println!("✅ Local SQLite database connected and schema verified");
    } else {
        // Postgres Auto-Schema (Safe subset for 'habits', 'habit_logs', 'reflections')
        println!("✅ Production database connected (PostgreSQL)");
        
        // Simple DDL for Postgres to ensure app works on first run
        let postgres_schema = "
            CREATE TABLE IF NOT EXISTS habits (
                id SERIAL PRIMARY KEY,
                title TEXT NOT NULL,
                color TEXT NOT NULL DEFAULT '#cadbfc',
                frequency TEXT NOT NULL DEFAULT 'daily',
                difficulty INTEGER NOT NULL DEFAULT 1,
                category TEXT NOT NULL DEFAULT 'general',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
            CREATE TABLE IF NOT EXISTS habit_logs (
                id SERIAL PRIMARY KEY,
                habit_id INTEGER NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
                date TEXT NOT NULL,
                completed INTEGER NOT NULL DEFAULT 1,
                UNIQUE(habit_id, date)
            );
            CREATE TABLE IF NOT EXISTS reflections (
                id SERIAL PRIMARY KEY,
                habit_id INTEGER NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
                date TEXT NOT NULL,
                content TEXT NOT NULL,
                UNIQUE(habit_id, date)
            );
        ";
        sqlx::query(postgres_schema).execute(&database).await.expect("Failed to initialize production schema");
        println!("✅ Production schema verified");
    }

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        .route("/habits", get(routes::list_habits).post(routes::create_habit))
        .route("/habits/:id", put(routes::update_habit).delete(routes::delete_habit))
        .route("/logs", post(routes::toggle_log))
        .route("/analytics", get(routes::get_analytics))
        .route("/ai-analysis", get(routes::get_ai_analysis))
        .route("/reflections", post(routes::create_reflection))
        .route("/reflections/:habit_id", get(routes::get_reflections))
        .layer(cors)
        .with_state(database);

    let port = std::env::var("PORT").unwrap_or_else(|_| "3000".to_string());
    let addr = format!("0.0.0.0:{}", port);
    
    println!("🚀 Atomize backend running on http://{}", addr);

    let listener = tokio::net::TcpListener::bind(&addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
