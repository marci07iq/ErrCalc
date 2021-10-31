import { Token, TokenNumber } from "../evaluator/token";
import { TypeNumber, TypeBigInt, TypeBasic } from "../numbers/basic";
import { TypeUncertain } from "../numbers/uncertain";
import { StringStream } from "../utils/string_stream";
import { parseUncertain } from "./uncertain";

export function parseNumericToken(stream: StringStream): Token | undefined {
	let num = parseUncertain(stream);
	
	if(num === undefined) return undefined;

	let num_val: TypeBasic | undefined = undefined;
	let num_err: TypeBasic | undefined = undefined;

	switch(typeof num[0]) {
		case "bigint":
			num_val = new TypeBigInt(num[0]);
			break;
		case "number":
			num_val = new TypeNumber(num[0]);
			break;
		case "undefined":
			return undefined;
	}

	switch(typeof num[1]) {
		case "bigint":
			num_err = new TypeBigInt(num[1]);
			break;
		case "number":
			num_err = new TypeNumber(num[1]);
			break;
	}

	if(num_err === undefined) {
		return new TokenNumber(num_val);
	} else {
		return new TokenNumber(new TypeUncertain(num_val, num_err));
	}
};