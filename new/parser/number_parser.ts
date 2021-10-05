import { StringStream } from "../utils/string_stream";
import { ParserError } from "./parser_error";

function parseDigit(stream: StringStream): number {
	let char = stream.peek(1);

	if ("0" <= char && char <= "9") {
		stream.get(1);
		return char.charCodeAt(0) - "0".charCodeAt(0);
	}
	return undefined;
}

function parseSign(stream: StringStream): number {
	let signchar = stream.peek(1);
	if(signchar === '+') {
		stream.get(1);
		return 1;
	}
	if(signchar === '-') {
		stream.get(1);
		return -1;
	}
	return 1;
}

function checkErrorSymbol(stream: StringStream): boolean {
	let errchar = stream.peek(1);
	if(errchar === '#') {
		stream.get(1);
		return true;
	}
	//Unicode +- symbol
	if(errchar === '\u00B1') {
		stream.get(1);
		return true;
	}
	
	return false;
}

function checkExponentialSymbol(stream: StringStream): boolean {
	let expchar = stream.peek(1);
	if(expchar === 'e') {
		stream.get(1);
		return true;
	}
	return false;
}

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
	allow_sign: boolean;
	allow_exp: boolean;
	allow_fraction: boolean;
	allow_error: boolean;
	allow_unit: boolean;
	allow_none: boolean;
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
			if(frac_num.numdgts == 0 && main_num.numdgts == 0) {
				throw new ParserError(s.pos - 1, s, "No digits found around decimal point");
			} else {
				//Add fractional part
				num += frac_num.num / Math.pow(10, frac_num.numdgts);
			}
		}
	} else {
		if(main_num.numdgts == 0) {
			if(args.allow_none) {
			 return undefined;
			}
			throw new ParserError(s.pos, s, "No digits found in number");
		}
	}

	if(args.allow_exp) {
		let s2 = s.transaction();

		if(checkErrorSymbol(stream)) {

		}
	}
}