import { StringStream } from "../utils/string_stream";

function parseDigit(stream: StringStream) {
	let char = stream.peekChar();

	if ("0" <= char && char <= "9") {
		stream.getChar();
		return char.charCodeAt(0) - "0".charCodeAt(0);
	}
	return undefined;
}

export function PrimitiveNumberParser(stream: StringStream) {
	let s = stream.transaction();


}

export function NumberParser() {

}

export function FullNumberParser() {

}