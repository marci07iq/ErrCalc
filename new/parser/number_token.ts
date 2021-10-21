import { Token, TokenNumber } from "../evaluator/token";
import { NumberWrapper, TypeBigInt } from "../numbers/basic";
import { StringStream } from "../utils/string_stream";
import { parseUncertain } from "./uncertain";

export function parseNumericToken(stream: StringStream): Token | undefined {
	let num = parseUncertain(stream);
	if(num !== undefined && num[0] !== undefined && num[1] !== undefined) {
		if(typeof num[0] == "bigint") {
			return new TokenNumber(new TypeBigInt(num[0]));
		} else {
			return new TokenNumber(new TypeNumber(num[0]));
		}
	}
	return undefined;
};