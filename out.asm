section .text
	global _start

_start:
	mov byte [1h], strVARn2h1s14955

	mov eax, 1
	mov ebx, 0
	int 0x80

section .data
	strVARn2h1s14955 db "Siema"
