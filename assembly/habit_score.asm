; habit_score.asm
; x86_64 NASM reference for the inline assembly in backend/src/assembly.rs
;
; Calculates habit score (0-100) from three inputs:
; Input: RDI = completion_pct (0-100), RSI = avg_streak, RDX = total_habits
; Output: RAX = score (capped at 100)
;
; Formula: min(completion_pct * 40 + avg_streak * 3 + total_habits * 5, 100)

section .text
global calculate_habit_score

calculate_habit_score:
    mov     rax, rdi
    imul    rax, 40             ; completion_pct * 40

    mov     rcx, rsi
    imul    rcx, 3              ; avg_streak * 3
    add     rax, rcx

    mov     rcx, rdx
    imul    rcx, 5              ; total_habits * 5
    add     rax, rcx

    cmp     rax, 100
    jle     .done
    mov     rax, 100            ; cap at 100
.done:
    ret
