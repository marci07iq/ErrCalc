import { StringStream } from "../utils/string_stream";
import { ParserError } from "./parser_error";

//
// Digit parser
//

function isDigit(char: string): boolean {
	return '0' <= char && char <= '9';
}

function parseDigit(stream: StringStream): number {
	let char = stream.peek(1);
	
	if (isDigit(char)) {
		stream.skip(1);
		return Number(char);
	}
	return undefined;
}

//
// Sign parser
//

function isPositiveSign(char): boolean {
	return '+' === char;
}

function isNegativeSign(char): boolean {
	return '-' === char;
}

function parseSign(stream: StringStream): number {
	let signchar = stream.peek(1);
	if(isPositiveSign(signchar)) {
		stream.skip(1);
		return 1;
	}
	if(isNegativeSign(signchar)) {
		stream.skip(1);
		return -1;
	}
	return 1;
}

//
// Error symbol parser
//

function isErrorSymbol(char: string): boolean {
	if(char === '#') return true;
	if(char === '\u00B1') return true;
	return false;
}

function checkErrorSymbol(stream: StringStream): boolean {
	let errchar = stream.peek(1);
	if(isErrorSymbol(errchar)) {
		stream.skip(1);
		return true;
	}
	return false;
}

//
// Exponential symbol parser
//

function isExponentialSymbol(char: string): boolean {
	if(char === 'e') return true;
	if(char === 'E') return true;
	return false;
}


function checkExponentialSymbol(stream: StringStream): boolean {
	let expchar = stream.peek(1);
	if(isExponentialSymbol(expchar)) {
		stream.skip(1);
		return true;
	}
	return false;
}

//Parse sequence of digits

interface parseDigitsResult {
	num: number;
	numdgts: number;
}

function parseDigits(stream: StringStream): parseDigitsResult {
	let num: number = 0;
	let numdgts: number = 0;

	let dgt = undefined;

	while((dgt = parseDigit(stream)) != undefined) {
		num = 10*num + dgt;
		numdgts++;
	}

	return {
		num: num,
		numdgts: numdgts
	};
}

interface NumberParserArgs {
	allow_sign: boolean; //Allow number to have sign
	allow_exp: boolean; //Allow number to have expoential part
	allow_fraction: boolean; //Allow number to have floating point
	allow_error: boolean; //Allow number to have error
	allow_unit: boolean; //Allow to have units
	error_none: boolean; //Allow number to have 0 digits (used for parsing exponent when e is actually unit name)
}

export function NumberParser(stream: StringStream, args: NumberParserArgs) {
	let s = stream.transaction();

	let sign: number = 1;
	if(args.allow_sign) {
		sign = parseSign(s);
	}

	let main_num: parseDigitsResult = parseDigits(s);

	let num = main_num.num;

	//Handle fraction
	if(args.allow_fraction) {
		if(s.peek(1) == ".") {
			s.get(1);

			let frac_num: parseDigitsResult = parseDigits(s);

			//Prevent a single dot from being a number
			// .1 and 1. are valid
			if(frac_num.numdgts == 0 && main_num.numdgts == 0) {
				throw new ParserError(s.pos - 1, s, "No digits found around decimal point");
			} else {
				//Add fractional part
				num += frac_num.num / Math.pow(10, frac_num.numdgts);
			}
		}
	//No fraction, check for empty
	} else {
		if(main_num.numdgts == 0) {
			if(args.error_none) {
				throw new ParserError(s.pos, s, "No digits found in number");
			}
			return undefined;
		}
	}

	//Exponential part
	if(args.allow_exp) {
		let s2 = s.transaction();

		if(checkExponentialSymbol(s2)) {
			let exp_num = NumberParser(s2, {
				allow_sign: true, //1e+1 or 1e-1
				allow_exp: false, //no 1e1e1
				allow_fraction: false, //no 1e1.5
				allow_error: false, //Error is parsed on the main number
				allow_unit: false, //Unit is parsed onto the main number
				error_none: false //e could be unit name
			});

			if(exp_num !== undefined) {
				num *= Math.pow(10, num);
			}

			//Exponent successfully parsed
			s2.commit();
		}
	}

	
}