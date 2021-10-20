import { Scope } from "./scope";
import { Type } from "../numbers/types";

export interface Token {
	evaluate(scope: Scope): Type;
}

export class TokenNumber implements Token {
	val: Type;

	constructor(val: Type) {
		this.val = val;
	}

	evaluate(scope: Scope): Type {
		return this.val;
	}
}

export class TokenVar implements Token {
	name: string;

	constructor(name: string) {
		this.name = name;
	}

	evaluate(scope: Scope): Type {
		let res = scope.getVar(this.name);
		if(res === undefined) {
			throw new Error("Unknown symbol " + this.name);
		}
		return res;
	}
}

export class TokenFunction implements Token {
	name: string;
	args: Array<Token>;

	constructor(name: string, args: Array<Token>) {
		this.name = name;
		this.args = args;
	}

	evaluate(scope: Scope): Type {
		let res = scope.getFn(this.name);
		if(res === undefined) {
			throw new Error("Unknown symbol " + this.name);
		}
		return res.evaluate(scope, this.args);
	}
}