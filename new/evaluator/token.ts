import { Scope } from "./scope";
import { Type } from "../numbers/types";
import { ExpressionTransformer } from "../transformer/transformer";

export interface Token {
	evaluate(scope: Scope): Type;
	clone(transformer?: ExpressionTransformer): Token;
	debug_write(): string;
}

export class TokenNumber implements Token {
	val: Type;

	constructor(val: Type) {
		this.val = val;
	}

	evaluate(scope: Scope): Type {
		return this.val;
	}
	clone(transformer?: ExpressionTransformer): Token {
		return new TokenNumber(this.val);
	}
	debug_write(): string {
		return "Number " + this.val.print_text();
	}
	print_txt(): string {
		return this.val.print_text();
	}
	print_tex(): string {
		return this.val.print_tex();
	}
}

export class TokenVar implements Token {
	name: string;

	constructor(name: string) {
		this.name = name;
	}

	evaluate(scope: Scope): Type {
		let res = scope.getVar(this.name);
		if (res === undefined) {
			throw new Error("Unknown symbol " + this.name);
		}
		return res;
	}
	clone(transformer?: ExpressionTransformer): Token {
		return new TokenVar(this.name);
	}
	debug_write(): string {
		return "Var " + this.name;
	}
	print_txt(): string {
		return this.name;
	}
	print_tex(): string {
		return this.name;
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
		if (res === undefined) {
			throw new Error("Unknown symbol " + this.name);
		}
		return res.evaluate(scope, this.args);
	}
	clone(transformer?: ExpressionTransformer): Token {
		return new TokenFunction(
			this.name,
			this.args.map((arg) =>
				(transformer !== undefined) ?
					transformer.transform_tree(arg) :
					arg.clone()
			));
	}
	debug_write(): string {
		return "Fn " + this.name + "(" + this.args.map((arg) => arg.debug_write()).join(", ") + ")";
	}
}