; streak_calculator.asm
; x86_64 NASM reference for the inline assembly in backend/src/assembly.rs
;
; Counts consecutive completed days from most recent (streak).
; Input: RDI = pointer to u8 array (1=completed, 0=missed), RSI = length
; Output: RAX = streak count
;
; Logic: Walk forward through the array. Each 1 increments streak.
;        First 0 encountered breaks the loop.

section .text
global calculate_streak

calculate_streak:
    xor     rax, rax            ; streak = 0
    xor     rcx, rcx            ; index = 0
.loop:
    cmp     rcx, rsi            ; if index >= length, done
    jge     .done
    movzx   edx, byte [rdi+rcx] ; load days[index]
    test    edx, edx            ; if 0, break
    jz      .done
    inc     rax                 ; streak++
    inc     rcx                 ; index++
    jmp     .loop
.done:
    ret
