; analytics.asm
; x86_64 NASM reference for analytics calculations
;
; The analytics endpoint in the Rust backend computes:
; 1. Weekly completion rates (daily_completed / total_habits) for 7 days
; 2. Average streak across all habits
; 3. Habit score via calculate_habit_score
;
; These calculations use standard Rust code for the data gathering
; and inline assembly (via calculate_habit_score) for the scoring formula.
; See: backend/src/assembly.rs and backend/src/routes.rs
