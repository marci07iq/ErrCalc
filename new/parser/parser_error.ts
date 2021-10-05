import { StringStream } from "../utils/string_stream";

export class ParserError extends Error {
	pos: number;
	stream: StringStream;

	constructor(pos: number, stream: StringStream, message: string) {
		super(message + " at " + pos + " near " + stream.str.substring(pos-10, 21));

		this.pos = pos;
		this.stream = stream;
	}
}