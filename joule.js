const fs = require("fs")
const path = require("path")
const { exec } = require("child_process")

const START_CODE = `section .text
	global _start

_start:`

const TYPES = {
	STRING:      "STRING",
	INT: 		 "INT",
	IDENTIFIER:  "IDENTIFIER",
	FLOAT: 		 "FLOAT",
	NONE: 		 "NONE",

	EQUALS:		 "EQUALS"
}

function compile(only_compile, only_o, parser) {
	var out_code_data = `section .data\n`
	var out_code = START_CODE + "\n";
	var code_var = 1
	console.log("[COMPILING] Compiling into assembly code")
	parser.program.forEach((token) => {
		if (token.code == 1) {
			const name_for_str = `strPUTSjsn1kla${Math.floor(Math.random() * 20000)}`
			out_code_data += `	${name_for_str} db "${token.text}"\n`
			out_code += `	mov eax, 4\n`
        	out_code += `	mov ebx, 1\n`
        	out_code += `	mov ecx, ${name_for_str}\n`
        	out_code += `	mov edx, ${token.text.length}\n`
        	out_code += `	int 0x80\n\n`
		} else if (token.code == 2) {
			out_code += "	mov eax, 1\n"
			out_code += "	mov ebx, 0\n"
			out_code += "	int 0x80\n\n"
		} else if (token.code == 3) {
			out_code += "	hlt\n\n"
		} else if (token.code == 4) {
			out_code += "	; CODE INPUT\n"
			out_code += token.text.split("\\n").join("\n") + "\n\n"
		} else if (token.code == 5) {
			if (token.type == TYPES.INT) {
				out_code += `	mov byte [${code_var}h], ${token.value}\n\n`
			} else {
				const name_for_strr = `strVARn2h1s${Math.floor(Math.random() * 20000)}`
				out_code_data += `	${name_for_strr} db "${token.value}"\n`
				out_code += `	mov byte [${code_var}h], ${name_for_strr}\n\n`
			}
		}
	})

	out_code += "	mov eax, 1\n"
	out_code += "	mov ebx, 0\n"
	out_code += "	int 0x80\n\n"

	out_code += out_code_data + "\n"

	console.log("[FILE] Writting assembly code into file")

	fs.truncate("out.asm", 0, () => {
		fs.appendFile("out.asm", out_code, (err) => {
			if (err) throw err;

			if (only_compile == true) {
				console.log("Compiled into out.asm file!")
				process.exit(1)
			}

			console.log("[NASM] Compiling assembly file")
			exec("nasm -felf64 out.asm -o out.o", (err, stou, ster) => {
				if (err) return console.log(`Error ${err.message}`)
				if (ster) return console.log(`StdError ${ster}`)

				if (only_o == true) {
					exec("rm out.asm", (err, stou, ster) => {
						if (err) return console.log(`Error ${err.message}`)
						if (ster) return console.log(`StdError ${ster}`)

						console.log("Compiled into out.o file!")
					})
				} else {
					console.log("[LD] Linking assembly file")
					exec("ld out.o", (err, stou, ster) => {
						if (err) return console.log(`Error ${err.message}`)
						if (ster) return console.log(`StdError ${ster}`)

						console.log("[START FILE] Start the executable file\n")

						exec("rm out.* && ./a.out", (err, stou, ster) => {
							if (err) return console.log(`Error ${err.message}`)
							if (ster) return console.log(`StdError ${ster}`)

							console.log(stou + "\n")
						})
					})
				}
			})
		})
	})
}

class Token {
	constructor(filename, row, col, value, type) {
		this.filename =   filename
		this.row = 		  row
		this.col = 		  col
		this.value = 	  value
		this.type = 	  type
	}

	raw() {
		console.log("Token:" + this.value)
	}
}

function help() {
	console.log("Joule - Programmig language - Help:\nCommand look: joule <file> <args>\n\tFile - Give file of name to compile\n\tArgs:\n\t\t-asm - Create output of program into out.asm file\n\t\t-debug - Shows opcodes thats are eval by the compiler\n\t\t-o - Create output of program into out.o file\n\t\t-help - Show this\n\nLICENSE: MIT | github.com/SolindekDev/joule")
	process.exit(1)
}

function readfile(path) {
	try {
		const data = fs.readFileSync(path, 'UTF-8');
		return data.split(/\r?\n/)
	} catch {
		console.log(`${colorRed}FileError:${colorWhite} ${path} ${colorReset}could open this file\n`)
		help()
	}
}

// console.log(`${path}:${row}:${col} ${letter}`)

const colorReset = "\033[0m"
const colorRed    = "\033[31m"
const colorGreen  = "\033[32m"
const colorYellow = "\033[33m"
const colorBlue   = "\033[34m"
const colorPurple = "\033[35m"
const colorCyan   = "\033[36m"
const colorWhite  = "\033[37m"

const CONSTANTS = {
	NUMBERS: "0123456789",
	LETTERS: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_?"
}

function lexer(path) {
	const value = readfile(path)
	const token = []

	var row = 0
	var col = 0

	var comments = false;
	var space = 0;
	var string = false;

	value.forEach((line) => {
		row++
		for (col = 0; col < line.length; col++) {
			const actual = line[col];
			const last = line[col-1];
			const lastt = token[token.length-1] || new Token(path, row, col, "None", TYPES.NONE);

			// Inline comment
			if (actual == "#") {
				// if (string == true) {
				// 	if (lastt.type == NONE) {
				// 		token.push(new Token(path, row, col, actual, TYPES.STRING))
				// 	} else {
				// 		token[token.length-1].value += actual
				// 	}
				// } else {
				// 	if (comments == true) {
				// 		comments = false
				// 	} else {
				// 		comments = true
				// 	}
				// }
				if (string == true) {
					if (lastt.type == TYPES.NONE) {
							token.push(new Token(path, row, col, actual, TYPES.STRING))
					} else {
							token[token.length-1].value += actual
					}
				} else {
					if (comments == false) {
						comments = true
					}
				}
			} else if (comments == true) {
				continue;
			} else if (actual == `"`) {
				if (string == true) {
					string = false
				} else {
					token.push(new Token(path, row, col, "", TYPES.STRING))
					string = true
				}
			} else if (actual == ` `) {
				if (string == 1) {
					token[token.length-1].value += actual
				} else {
					space = 1
				}
			} else if (string == true) {
				token[token.length-1].value += actual
			} else if (CONSTANTS.NUMBERS.includes(actual)) {
				if (lastt.type == TYPES.NONE) {
					token.push(new Token(path, row, col, actual, TYPES.INT))
				} else {
					if (space == 1) {
						if (token[token.length-1].type == TYPES.INT || token[token.length-1].type == TYPES.FLOAT) {
							if (token[token.length-1].type == TYPES.INT) {
								token[token.length-1].value += actual
							} else {
								token[token.length-1].type = FLOAT
								token[token.length-1].value += actual
							}
						} else {
							if (token[token.length-1].type == TYPES.IDENTIFIER && this.space == 0) {
								token[token.length-1].type = TYPES.IDENTIFIER
								token[token.length-1].value += actual
							} else {
								token.push(new Token(path, row, col, actual, TYPES.INT))
							}
						}
					} else {
						token.push(new Token(path, row, col, actual, TYPES.INT))
					}
				}
			} else if (CONSTANTS.LETTERS.includes(actual)) {
                if (lastt.type == TYPES.NONE) {
                    token.push(new Token(path, row, col, actual, TYPES.IDENTIFIER))
                    space = 0
                } else {
                    if (space == 0) {
                        if (lastt.type == TYPES.IDENTIFIER) {
                            token[token.length-1].value += actual;
                            space = 0
                        } else {
							token.push(new Token(path, row, col, actual, TYPES.IDENTIFIER))
                            space = 0
                        }
                    } else {
                        token.push(new Token(path, row, col, actual, TYPES.IDENTIFIER))
                        space = 0
                    }
                }
            } else if (actual == "=") {
				token.push(new Token(path, row, col, actual, TYPES.EQUALS))
			} else if (actual == ".") {
				if (lastt.type == TYPES.NONE) {
					token.push(new Token(path, row, col, actual, TYPES.IDENTIFIER))
				} else {
					if (lastt.type == TYPES.INT || last.type == TYPES.FLOAT) {
						if (lastt.type == TYPES.INT) {
							token.type = TYPES.FLOAT
							token.value += actual
						} else {

						}
					} else {
						token.push(new Token(path, row, col, actual, TYPES.INT))
					}
				}
			}
		}
		col = 0
		row = 0
		space = 1
		comments = false
	})

	// console.log(token)

	return token
}

function parse_numbers(tokens) {
	tokens.forEach((token) => {
		if (token.type == TYPES.INT) {
			const parseingInt = parseInt(token.value)

			if (isNaN(parseingInt)) {
				console.log(`${colorRed}ParseError: ${colorWhite}${token.filename}:${token.row}:${token.col}${colorReset} failed at parsing number: "${token.value}"`)
				process.exit(0)
			} else {
				token.value = parseingInt
			}
		} else if (token.type == TYPES.FLOAT) {
			const parseingInt = parseInt(token.value)

			if (isNaN(parseingInt)) {
				console.log(`${colorRed}ParseError: ${colorWhite}${token.filename}:${token.row}:${token.col}${colorReset} failed at parsing number: "${token.value}"`)
				process.exit(0)
			} else {
				token.value = parseingInt
			}
		}
	})

	return tokens
}

const KEYWORDS = {
	PUTS: "puts",
	EXIT: "exit",
	HALT: "halt",
	ASM: "__asm__",
	DEF: "def",
	CONST: "const",
	END: "end"
}

const PRINT = (text, pos) => { return({ code: 1, text: text, pos: pos }) }
const EXIT = (pos) => { return({ code: 2, pos: pos }) }
const HALT = (pos) => { return({ code: 3, pos: pos }) }
const ASM = (text ,pos) => { return({ code: 4, text: text, pos: pos }) }
const VARIABLE = (name, value, type ,pos) => { return({ code: 5, value: value, name: name, type: type, pos: pos }) }

const program = [

]

class Variables {
	constructor(name, value, type) {
		this.name = name;
		this.value = value;
		this.type = type;
	}
}

class Function {
	constructor(name, argument) {
		this.name = name;
		this.argument = argument
	}
}

function parser(tokens) {

	var freeze = 0;
	var error = 0;

	var variables = [];
	var names = [];
	var functions = [];

	for (let i = 0; i < tokens.length; i++) {
		const token = tokens[i]

		if (freeze != 0)  {
			freeze--
			continue
		}

		if (token.type == TYPES.IDENTIFIER) {
			if (token.value == KEYWORDS.PUTS) {
				if (tokens[i+1] == undefined) {
					console.log(`${colorRed}TypeError: ${colorWhite}${token.filename}:${token.row}:${token.col}${colorReset} "${colorYellow}puts${colorReset}" keyword need argument`)
					error+=1;
				} else {
					if (tokens[i+1].type == TYPES.STRING) {
						program.push(PRINT(tokens[i+1].value, token))
						freeze++;
					} else {
						console.log(`${colorRed}TypeError: ${colorWhite}${token.filename}:${token.row}:${token.col}${colorReset} ${colorYellow}puts${colorReset} keyword need argument of type ${colorYellow}STRING${colorReset} no ${colorYellow}${tokens[i+1].type}${colorReset}`)
						error+=1;
					}
				}
			} else if (token.value == KEYWORDS.EXIT) {
				program.push(EXIT(token))
			} else if (token.value == KEYWORDS.HALT) {
				program.push(HALT(token))
			} else if (token.value == KEYWORDS.CONST) {
				if (tokens[i+1] == undefined) {
					console.log(`${colorRed}TypeError: ${colorWhite}${token.filename}:${token.row}:${token.col}${colorReset} "${colorYellow}const${colorReset}" keyword need argument`)
					error+=1;
				} else {
					if (tokens[i+1].type == TYPES.IDENTIFIER) {
						if (tokens[i+2] == undefined) {
							console.log(`${colorRed}TypeError: ${colorWhite}${token.filename}:${token.row}:${token.col}${colorReset} "${colorYellow}const${colorReset}" keyword need argument`)
							error+=1;
						} else {
							if (tokens[i+2].type == TYPES.EQUALS) {
								if (tokens[i+3] == undefined) {
									console.log(`${colorRed}TypeError: ${colorWhite}${token.filename}:${token.row}:${token.col}${colorReset} "${colorYellow}const${colorReset}" keyword need value`)
									error+=1;
								} else {
									if (tokens[i+3].type == TYPES.INT || tokens[i+3].type == TYPES.STRING) {
										if (tokens[i+4] == undefined) {
											console.log(`${colorRed}TypeError: ${colorWhite}${token.filename}:${token.row}:${token.col}${colorReset} "${colorYellow}const${colorReset}" keyword need "${colorYellow}end${colorReset}"`)
											error+=1;
										} else {
											if (tokens[i+4].type == TYPES.IDENTIFIER) {
												if (tokens[i+4].value == KEYWORDS.END) {
													if (names.includes(tokens[i+1].value)) {
														console.log(`${colorRed}TypeError: ${colorWhite}${token.filename}:${token.row}:${token.col}${colorReset} ${colorYellow}${tokens[i+1].value}${colorReset} is already defined`)
														freeze += 4
														error+=1;
													} else {
														program.push(VARIABLE(tokens[i+1].value, tokens[i+3].value, tokens[i+3].type, token))
														variables.push(new Variables(tokens[i+1].value, tokens[i+3].value, tokens[i+3].type))
														names.push(tokens[i+1].value)
														freeze += 4
													}
												}
											} else {
												console.log(`${colorRed}TypeError: ${colorWhite}${token.filename}:${token.row}:${token.col}${colorReset} ${colorYellow}const${colorReset} keyword need argument of type ${colorYellow}IDENTIFIER${colorReset} no ${colorYellow}${tokens[i+1].type}${colorReset}`)
												error+=1;
											}
										}
									} else {
										console.log(`${colorRed}TypeError: ${colorWhite}${token.filename}:${token.row}:${token.col}${colorReset} ${colorYellow}const${colorReset} keyword need argument of type ${colorYellow}INT or STRING${colorReset} no ${colorYellow}${tokens[i+1].type}${colorReset}`)
										error+=1;
									}
								}
							} else {
								console.log(`${colorRed}TypeError: ${colorWhite}${token.filename}:${token.row}:${token.col}${colorReset} ${colorYellow}const${colorReset} keyword need argument of type ${colorYellow}IDENTIFIER${colorReset} no ${colorYellow}${tokens[i+1].type}${colorReset}`)
								error+=1;
							}
						}
					} else {
						console.log(`${colorRed}TypeError: ${colorWhite}${token.filename}:${token.row}:${token.col}${colorReset} ${colorYellow}const${colorReset} keyword need argument of type ${colorYellow}IDENTIFIER${colorReset} no ${colorYellow}${tokens[i+1].type}${colorReset}`)
						error+=1;
					}
				}
			} else if (token.value == KEYWORDS.ASM) {
				if (tokens[i+1] == undefined) {
					console.log(`${colorRed}TypeError: ${colorWhite}${token.filename}:${token.row}:${token.col}${colorReset} "${colorYellow}__asm__${colorReset}" keyword need argument`)
					error+=1;
				} else {
					if (tokens[i+1].type == TYPES.STRING) {
						program.push(ASM(tokens[i+1].value, token))
						freeze++;
					} else {
						console.log(`${colorRed}TypeError: ${colorWhite}${token.filename}:${token.row}:${token.col}${colorReset} ${colorYellow}__asm__${colorReset} keyword need argument of type ${colorYellow}STRING${colorReset} no ${colorYellow}${tokens[i+1].type}${colorReset}`)
						error+=1;
					}
				}
			} else {
				if (names.includes(token.value)) {
					if (variables.find(variable => variable.name == token.value) == undefined) {
						if (functions.find(_function => _function.name == token.value) == undefined) {
							console.log(`${colorRed}TypeError: ${colorWhite}${token.filename}:${token.row}:${token.col}${colorReset} ${colorYellow}${tokens[i+1].value}${colorReset} is not defined`)
							error+=1;
						} else {
							console.log("Function is defined")
						}
					} else {
						const _var = variables.find(variable => variable.name == token.value)
						const _freezer = 0
						const _next = 0

						if (_var.type == TYPES.INT) {
							// if (tokens[i+_next])
						} else if (_var.type == TYPES.FLOAT) {

						} else {

						}
					}
				} else {
					console.log(`${colorRed}TypeError: ${colorWhite}${token.filename}:${token.row}:${token.col}${colorReset} ${colorYellow}${token.value}${colorReset} keyword or variable not found`)
					error+=1;
				}
			}
		}
	}

	// console.log(variables)
	// console.log({freeze:freeze, error:error, program:program})
	return {freeze:freeze, error:error, program:program}
}

async function exists(path) {
	try {
		const data = fs.readFileSync(path, 'UTF-8');
		return true
	} catch (e) {
		console.log(`${colorRed}FileError:${colorWhite} ${path} ${colorReset}this file not exists\n`)
		help()
	}
}

function debuger(tokens) {
	console.log(`----------------| ${colorRed}Debug${colorReset} |----------------\n`)
	tokens.program.forEach((token) => {
		if (token.code == 2) {
			console.log(`${colorYellow}${token.pos.filename}:${token.pos.row}:${token.pos.col}${colorReset} | ${colorBlue}${token.pos.value}${colorReset} | ${colorPurple}${token.code}${colorReset} |`)
		} else if (token.code == 3) {
			console.log(`${colorYellow}${token.pos.filename}:${token.pos.row}:${token.pos.col}${colorReset} | ${colorBlue}${token.pos.value}${colorReset} | ${colorPurple}${token.code}${colorReset} |`)
		} else if (token.code == 1) {
			console.log(`${colorYellow}${token.pos.filename}:${token.pos.row}:${token.pos.col}${colorReset} | ${colorBlue}${token.pos.value}${colorReset} | ${colorPurple}${token.code}${colorReset} | text: ${colorCyan}${token.text}${colorReset}`)
		} else if (token.code == 4) {
			console.log(`${colorYellow}${token.pos.filename}:${token.pos.row}:${token.pos.col}${colorReset} | ${colorBlue}${token.pos.value}${colorReset} | ${colorPurple}${token.code}${colorReset} | text: ${colorCyan}${token.text}${colorReset}`)
		} else if (token.code == 5) {
			console.log(`${colorYellow}${token.pos.filename}:${token.pos.row}:${token.pos.col}${colorReset} | ${colorBlue}${token.pos.value}${colorReset} | ${colorPurple}${token.code}${colorReset} | type: ${colorCyan}${token.type}${colorReset} | name: ${colorPurple}${token.name}${colorReset} | value: ${colorCyan}${token.value}${colorReset} |`)
		}
	})
	console.log(`\n-----------------------------------------`)

}

async function main() {
	var only_compile = false;
	var save_o = false;
	var debug = false;

	if (process.argv.includes("-asm")) only_compile = true;
	if (process.argv.includes("-o")) save_o = true;
	if (process.argv.includes("-debug")) debug = true;
	if (process.argv.includes("-help")) return help();

	process.argv.shift()

	if (process.argv.length >= 2) {
		exists(process.argv[1]);

		var tokens = lexer(process.argv[1]);
		var tokensParsed = parse_numbers(tokens)
		var parsert = parser(tokensParsed);

		if (parsert.error == 0) {
			if (debug == true) {
				debuger(parsert);
				process.exit(1)
			} else {
				const compiler = compile(only_compile, save_o, parsert)
			}
		} else {
			process.exit(1)
		}
	} else {
		help()
	}
}

main()
