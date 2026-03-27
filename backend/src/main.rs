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
        // Ensure our schema is applied for local SQLite
        let schema = std::fs::read_to_string("../database/schema.sql").expect("Could not read schema.sql");
        sqlx::query(&schema).execute(&database).await.expect("Failed to execute schema");

        // Manual migrations for missing columns
        let migrations = [
            "ALTER TABLE habits ADD COLUMN color TEXT NOT NULL DEFAULT '#cadbfc'",
            "ALTER TABLE habits ADD COLUMN frequency TEXT NOT NULL DEFAULT 'daily'",
            "ALTER TABLE habits ADD COLUMN difficulty INTEGER NOT NULL DEFAULT 1",
            "ALTER TABLE habits ADD COLUMN category TEXT NOT NULL DEFAULT 'general'",
        ];

        for m in migrations {
            let _ = sqlx::query(m).execute(&database).await; 
        }
        println!("✅ Local SQLite database connected and schema verified");
    } else {
        println!("✅ Production database connected (PostgreSQL)");
        println!("⚠️  Note: Ensure your production schema matches the SQLite design.");
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

    let addr = "0.0.0.0:3000";
    println!("🚀 Atomize backend running on http://{}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
