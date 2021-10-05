import { Value } from "./value";

export interface Function {

}

export class Scope {
	vars: Map<string, Value>;
	fns: Map<string, Function>;

	parent?: Scope;

	constructor(parent?: Scope, vars?: Map<string, Value>, fns?: Map<string, Function>) {
		this.parent = parent;
		this.vars = vars ?? new Map<string, Value>();
		this.fns = fns ?? new Map<string, Function>();
	}

	getVar(name: string): Value {
		let res = this.vars.get(name);
		return res ?? this.parent?.getVar(name);
	}

	getFn(name: string): Value {
		let res = this.fns.get(name);
		return res ?? this.parent?.getFn(name);
	}
}