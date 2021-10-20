import { Overloads, Type } from "../numbers/types";
import { Scope } from "./scope";
import { Token } from "./token";

export abstract class Function {
	constructor() {
	}

	abstract evaluate(scope: Scope, args: Array<Token>): Type;
}

export class FunctionUser extends Function {
	argnames: Array<string>;
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

export class FunctionBuiltinAlgebra extends Function {
	name: string;
	constructor(name: string) {
		super();
		this.name = name;
	}

	evaluate(scope: Scope, args: Array<Token>): Type {
		let argsv = args.map(arg => arg.evaluate(scope));
		let overload = Overloads.find(this.name, argsv.map(argv => argv.get_type().id));
		return overload.call(argsv);
	}
}