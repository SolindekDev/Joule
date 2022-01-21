" Vim syntax for Joule

if exists("b:jsyntax")
  finish
endif

" Is keyword
set iskeyword=a-z,A-Z,?,_

" Set keywords
syntax keyword __asm__ puts exit halt def const end

let b:jsyntax = "joule"