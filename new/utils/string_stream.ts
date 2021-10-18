import { ParserError } from "../parser/parser_error";

export const whitespace = " \t\n\r"; //Space, tab, newline

export function checkChar(char: string, chars: string) {
	if(char.length != 1) return false;
	return chars.indexOf(char);
}

export class StringStream {
	str: string;
	pos: number;
	parent?: StringStream;
	parent_split_pos?: number;

	constructor(str: string, parent?: StringStream) {
		this.str = (parent?.str ?? str);
		this.pos = (parent?.pos ?? 0);
		this.parent = parent;
		this.parent_split_pos = this.parent?.pos;
	}

	//At least one character can still be read
	good(): boolean {
		return this.pos < this.str.length;
	}

	//The last read didnt go out of bounds (but may be exactly on end)
	assertBounds() {
		if(this.pos > this.str.length) {
			throw new ParserError(this.str.length, this, "Unexpected end of stream");
		}
	}

	//Peeking can be done into nothing.
	peek(n: number = 1): string {
		return this.str.substr(this.pos, n);
	}

	get(n: number = 1): string {
		let res: string = this.peek(n);
		this.pos += res.length;
		this.assertBounds();
		return res;
	}

	skip(n: number = 1) {
		this.pos += n;
		this.assertBounds();
	}

	skipThrough(chars: string = whitespace) {
		while(checkChar(this.peek(1), chars)) {
			this.skip();
		}
	}

	//Clone to a new stream
	transaction() {
		return new StringStream(this.str, this);
	}

	commit() {
		if(this.parent == undefined) {
			throw Error("Cant commit without parent.");
		}
		if(this.parent.pos != this.parent_split_pos) {
			throw Error("Commiting into moved stream.");
		}
		//Write back postion
		this.parent.pos = this.pos;
		//
		this.parent_split_pos = this.parent.pos;
	}
}