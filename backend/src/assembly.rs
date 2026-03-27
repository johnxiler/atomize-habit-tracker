/// Counts consecutive 1s from the start of the slice (most recent days first).
/// Uses x86_64 inline assembly for the inner loop.
pub fn calculate_streak(days: &[u8]) -> u32 {
    if days.is_empty() {
        return 0;
    }

    let ptr = days.as_ptr();
    let len = days.len();
    let mut streak: u64;

    unsafe {
        std::arch::asm!(
            // rdi = pointer to days array
            // rsi = length
            // rax = streak counter (output)
            "xor {streak}, {streak}",       // streak = 0
            "2:",
            "cmp {idx}, {len}",             // if idx >= len, done
            "jge 3f",
            "movzx {tmp:e}, byte ptr [{ptr} + {idx}]",  // tmp = days[idx]
            "test {tmp:e}, {tmp:e}",        // if tmp == 0, break
            "jz 3f",
            "inc {streak}",                 // streak++
            "inc {idx}",                    // idx++
            "jmp 2b",
            "3:",
            ptr = in(reg) ptr,
            len = in(reg) len,
            idx = inout(reg) 0u64 => _,
            streak = out(reg) streak,
            tmp = out(reg) _,
            options(nostack, readonly),
        );
    }

    streak as u32
}

/// Calculates a habit score (0-100) from completion rate, avg streak, and habit count.
/// Formula: min(completion_pct * 40 + avg_streak * 3 + total_habits * 5, 100)
pub fn calculate_habit_score(completion_pct: u32, avg_streak: u32, total_habits: u32) -> u32 {
    let mut score: u64;

    unsafe {
        std::arch::asm!(
            // score = completion_pct * 40
            "mov {score}, {comp}",
            "imul {score}, 40",
            // + avg_streak * 3
            "mov {tmp}, {avg}",
            "imul {tmp}, 3",
            "add {score}, {tmp}",
            // + total_habits * 5
            "mov {tmp}, {total}",
            "imul {tmp}, 5",
            "add {score}, {tmp}",
            // cap at 100
            "cmp {score}, 100",
            "jle 4f",
            "mov {score}, 100",
            "4:",
            comp = in(reg) completion_pct as u64,
            avg = in(reg) avg_streak as u64,
            total = in(reg) total_habits as u64,
            score = out(reg) score,
            tmp = out(reg) _,
            options(nostack),
        );
    }

    score as u32
}
/// Calculates a single habit score: streak * difficulty.
pub fn calculate_difficulty_score(streak: u32, difficulty: u32) -> u32 {
    let mut score: u64;

    unsafe {
        std::arch::asm!(
            "mov {score}, {streak_reg}",
            "imul {score}, {diff_reg}",
            streak_reg = in(reg) streak as u64,
            diff_reg = in(reg) difficulty as u64,
            score = out(reg) score,
            options(nostack),
        );
    }

    score as u32
}
