export const whitespace = " \t\n\r"; //Space, tab, newline

export class StringStream {
	str: string;
	pos: number;
	parent?: StringStream;

	constructor(str: string, parent?: StringStream) {
		this.str = (parent?.str ?? str);
		this.pos = (parent?.pos ?? 0);
		this.parent = parent;
	}

	peekChar() {
		if(this.pos < this.str.length) {
			return this.str[this.pos];
		}
		return "";
	}

	peek(n: number = 1) {
		return this.str.substr(this.pos, n);
	}

	getChar() {
		if(this.pos < this.str.length) {
			return this.str[this.pos++];
		}
		return "";
	}

	skipChar() {
		++this.pos;
	}

	skipThrough(chars: string = whitespace) {
		while(chars.indexOf(this.peekChar()) != -1) {
			this.skipChar();
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
		this.parent.pos = this.pos;
	}
}