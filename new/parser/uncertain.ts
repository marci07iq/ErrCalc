import { parseScientific } from "./number";
import { StringStream } from "../utils/string_stream";

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

//Uncertain number parser

export function parseUncertain(stream: StringStream) {
	let val = parseScientific(stream);
	let err = 0;

	let s = stream.transaction();

	s.skipThrough();

	if(parseErrorSymbol(s)) {
		err = parseScientific(s);

		if(err === undefined) {
			s.error("No number found after uncertaintly symbol");
			return undefined;
		}

		s.commit();
	}

	return [val, err];
}