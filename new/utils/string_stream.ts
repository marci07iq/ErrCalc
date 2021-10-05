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

	peek(n: number = 1) {
		return this.str.substr(this.pos, n);
	}

	get(n: number = 1) {
		let res: string = this.peek(n);
		this.pos += res.length;
		return res;
	}

	skipChar() {
		++this.pos;
	}

	skipThrough(chars: string = whitespace) {
		while(chars.indexOf(this.peek(1)) != -1) {
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