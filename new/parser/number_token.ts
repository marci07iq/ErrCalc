import { Token, TokenNumber } from "../evaluator/token";
import { NumberWrapper } from "../numbers/basic";
import { StringStream } from "../utils/string_stream";
import { parseUncertain } from "./uncertain";

export function parseNumericToken(stream: StringStream): Token {
	let num = parseUncertain(stream);
	if(num !== undefined && num[0] !== undefined && num[1] !== undefined) {
		return new TokenNumber(new NumberWrapper(num[0]));
	}
	return undefined;
};