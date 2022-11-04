import { Type, Types } from "../numbers/types";
import { Scope } from "./scope";
import { Token } from "./token";
import { TypeBigInt, TypeBool } from "../numbers/basic";

import { OverloadValue } from "../numbers/unit";

export const globalOverload = OverloadValue;

export abstract class Function {
	constructor() {
	}

	abstract evaluate(scope: Scope, args: Array<Token>): Type;
}

//Evaluator of a user defined function
export class FunctionUser extends Function {
	//Names of arguments as expected
	argnames: Array<string>;
	//Syntax tree inside function
	token: Token;

	constructor(argnames: Array<string>, token: Token) {
		super();
		this.token = token;
		this.argnames = argnames;
	}

	evaluate(scope: Scope, args: Array<Token>): Type {
		let private_vars = new Map<string, Type>();

		if(this.argnames.length != args.length) {
			throw new Error("Invalid inputs to user definde function");
		}

		//Evaluate function inouts in parent scope
		for(let i = 0; i < args.length; i++) {
			private_vars.set(this.argnames[i], args[i].evaluate(scope));
		}

		let new_scope = new Scope(scope.parent);

		new_scope.vars_private = private_vars;

		return this.token.evaluate(new_scope);
	}
}

//Evaluator for builtin operators and functions
export class FunctionBuiltinAlgebra extends Function {
	name: string;
	constructor(name: string) {
		super();
		this.name = name;
	}

	evaluate(scope: Scope, args: Array<Token>): Type {
		let argsv = args.map(arg => arg.evaluate(scope));
		return globalOverload.call(this.name, argsv);
	}
}

//Evaluator for the comparison operators based on the TCO
export class FunctionBuiltinCompare extends Function {
	mask: bigint;
	testmask: bigint;
	constructor(mask: bigint) {
		super();
		this.mask = mask;
		this.testmask = mask*8n;
	}

	evaluate(scope: Scope, args: Array<Token>): TypeBool {
		let argsv = args.map(arg => arg.evaluate(scope));
		let argst = argsv.map(arg => arg.get_type().id);
		let tcores: bigint = (globalOverload.call("\\tco", argsv) as TypeBigInt).val;
		if((tcores & this.testmask) != this.testmask) {
			throw new Error(
				"Unable to compare " +
				(this.mask & 1n ? "<" : "") +
				(this.mask & 4n ? ">" : "") +
				(this.mask & 2n ? "=" : "") + " with args (" + argst.map(argt => (Types.get(argt)?.name ?? "Unknown")).join(", ") + ")");
		}
		return new TypeBool(0n != (this.mask & tcores));
	}
}