import { Scope } from "./scope";
import { Numeric } from "../numbers/numeric";

export interface Token<Type extends Numeric<Type>> {
	evaluate(scope: Scope<Type>): Type;
}

export class TokenNumber<Type extends Numeric<Type>> implements Token<Type> {
	val: Type;

	constructor(val: Type) {
		this.val = val;
	}

	evaluate(scope: Scope<Type>): Type {
		return this.val;
	}
}

export class TokenVar<Type extends Numeric<Type>> implements Token<Type> {
	name: string;

	constructor(name: string) {
		this.name = name;
	}

	evaluate(scope: Scope<Type>): Type {
		let res = scope.getVar(this.name);
		if(res === undefined) {
			throw new Error("Unknown symbol " + this.name);
		}
		return res;
	}
}

export class TokenFunction<Type extends Numeric<Type>> implements Token<Type> {
	name: string;
	args: Array<Token<Type>>;

	constructor(name: string, args: Array<Token<Type>>) {
		this.name = name;
		this.args = args;
	}

	evaluate(scope: Scope<Type>): Type {
		let res = scope.getFn(this.name);
		if(res === undefined) {
			throw new Error("Unknown symbol " + this.name);
		}
		return res.evaluate(scope, this.args);
	}
}