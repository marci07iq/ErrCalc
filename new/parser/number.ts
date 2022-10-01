import { StringStream } from "../utils/string_stream";

import { Token, TokenNumber } from "../evaluator/token";
import { TypeNumber, TypeBigInt, TypeBasic } from "../numbers/basic";
import { TypeUncertain, TypeReal } from "../numbers/uncertain";
import { TypeScalar } from "../numbers/complex";
import { TypeValue } from "../numbers/unit";

//
// Digit parser
//

function isDigit(char: string): boolean {
	return '0' <= char && char <= '9';
}

function parseDigit(stream: StringStream): number | undefined {
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
interface parseUIntResult {
	num: bigint;
	numdgts: number; //We really dont need to worry about overflows here
}

function parseUInt(stream: StringStream): parseUIntResult {
	let num: bigint = 0n;
	let numdgts: number = 0;

	let dgt: number | undefined = undefined;

	while ((dgt = parseDigit(stream)) !== undefined) {
		num = 10n * num + BigInt(dgt);
		numdgts++;
	}

	return {
		num: num,
		numdgts: numdgts
	};
}

interface parseIntResult {
	num: bigint;
	numdgts: number;
	sign: number;
}

function parseInt(stream: StringStream): parseIntResult {
	let sign = parseSign(stream);

	let main_num: parseUIntResult = parseUInt(stream);

	return {
		num: main_num.num * BigInt(sign),
		numdgts: main_num.numdgts,
		sign: sign
	};
}

export function parseUFloat(stream: StringStream): number | bigint | undefined {
	let s = stream.transaction();

	let main_num = parseUInt(s);

	let num : number | bigint = main_num.num;

	//Handle fraction
	if (s.peek(1) == ".") {
		s.get(1);

		let frac_num: parseUIntResult = parseUInt(s);

		//Prevent a single dot from being a number
		// .1 and 1. are valid
		if (frac_num.numdgts == 0 && main_num.numdgts == 0) {
			s.error("No digits found around decimal point");
			return undefined;
		} else {
			//Add fractional part
			num = Number(num) + Number(frac_num.num) / Math.pow(10, frac_num.numdgts);
		}
	} else {
		if (main_num.numdgts == 0) {
			return undefined;
		}
	}

	s.commit();
	return num;
}

export function parseScientific(stream: StringStream): number | bigint | undefined {
	let float = parseUFloat(stream);

	if (float === undefined) {
		return undefined;
	}
	let s = stream.transaction();
	if (parseExponentialSymbol(s)) {

		let num_exp = parseInt(s);

		if (num_exp.numdgts > 0) {
			if(num_exp.num >= 0) {
				if(typeof float == "bigint") {
					float = float * (10n ** num_exp.num);
				} else {
					float = float * (10 ** Number(num_exp.num));
				}
			} else {
				float = Number(float) * (10 ** Number(num_exp.num));
			}
			s.commit();
		}

	}

	return float;
}

export function parseScientificType(stream: StringStream): TypeBasic | undefined {
	let num = parseScientific(stream);

	switch(typeof num) {
		case "bigint":
			return new TypeBigInt(num);
			break;
		case "number":
			return new TypeNumber(num);
			break;
		case "undefined":
			return undefined;
	}
}

//
// Error symbol parser
//

function isErrorSymbol(char: string): boolean {
	if (char === '#') return true;
	if (char === '\u00B1') return true;
	return false;
}

export function parseErrorSymbol(stream: StringStream): boolean {
	let errchar = stream.peek(1);
	if (isErrorSymbol(errchar)) {
		stream.skip(1);
		return true;
	}
	return false;
}

//
//Uncertain number parser
//

export function parseUncertainType(stream: StringStream) : TypeReal | undefined {
	let val = parseScientificType(stream);
	
	if(val === undefined) return undefined;

	let s = stream.transaction();

	s.skipThrough();

	if(parseErrorSymbol(s)) {
		let err: TypeBasic | undefined = parseScientificType(s);

		if(err === undefined) {
			s.error("No number found after uncertaintly symbol");
			return undefined;
		}

		s.commit();

		return new TypeUncertain(val, err);
	}

	return val;
}

//Complex

export function parseImaginarySuffix(stream: StringStream): boolean {
	let errchar = stream.peek(1);
	if (isErrorSymbol(errchar)) {
		stream.skip(1);
		return true;
	}
	return false;
}

export function parseComplexType(stream: StringStream) : TypeScalar | undefined {
	let num = parseUncertainType(stream);
	/*let s = stream.transaction();
	if(parseImaginarySuffix(stream)) {
		return 
		s.commit();
	}*/
	return num;
}

//Units

export function parseUnitsType(stream: StringStream) : TypeValue | undefined {
	return parseComplexType(stream);
}

export function parseNumericToken(stream: StringStream) : Token | undefined {
	let num = parseUnitsType(stream);
	if(num == undefined) return undefined;
	return new TokenNumber(num);
}