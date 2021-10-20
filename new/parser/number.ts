import { StringStream } from "../utils/string_stream";

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
	if (isPositiveSign(signchar)) {
		stream.skip(1);
		return 1;
	}
	if (isNegativeSign(signchar)) {
		stream.skip(1);
		return -1;
	}
	return 1;
}

//
// Exponential symbol parser
//

function isExponentialSymbol(char: string): boolean {
	if (char === 'e') return true;
	if (char === 'E') return true;
	return false;
}


function parseExponentialSymbol(stream: StringStream): boolean {
	let expchar = stream.peek(1);
	if (isExponentialSymbol(expchar)) {
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

	while ((dgt = parseDigit(stream)) != undefined) {
		num = 10 * num + dgt;
		numdgts++;
	}

	return {
		num: num,
		numdgts: numdgts
	};
}

interface parseSignedResult {
	num: number;
	numdgts: number;
	sign: number;
}

function parseSigned(stream: StringStream): parseSignedResult {
	let sign = parseSign(stream);

	let main_num: parseDigitsResult = parseDigits(stream);

	return {
		num: main_num.num * sign,
		numdgts: main_num.numdgts,
		sign: sign
	};
}

export function parseFloat(stream: StringStream): number {
	let s = stream.transaction();

	let main_num = parseSigned(s);

	let num = main_num.num;

	//Handle fraction
	if (s.peek(1) == ".") {
		s.get(1);

		let frac_num: parseDigitsResult = parseDigits(s);

		//Prevent a single dot from being a number
		// .1 and 1. are valid
		if (frac_num.numdgts == 0 && main_num.numdgts == 0) {
			s.error("No digits found around decimal point");
			return undefined;
		} else {
			//Add fractional part
			num += main_num.sign * frac_num.num / Math.pow(10, frac_num.numdgts);
		}
	} else {
		if(main_num.numdgts == 0) {
			return undefined;
		}
	}

	s.commit();
	return num;
}

export function parseScientific(stream: StringStream): number {
	let float = parseFloat(stream);

	if(float === undefined) {
		return undefined;
	}
	let s = stream.transaction();
	if(parseExponentialSymbol(s)) {
		let exponent = parseDigits(s);

		if(exponent.numdgts) {
			let num_exp = parseSigned(s);

			if(num_exp.numdgts > 0) {
				float *= Math.pow(10, num_exp.num);
				s.commit();
			}
		}
	}

	return float;
}