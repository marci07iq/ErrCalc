import { Type } from "../numbers/types";
import { Function } from "./function";

/*export interface ScopeFnEntry {
	fn: Function,
	
}*/

export class Scope {
	//Private: cant be accessed by inner scopes
	//Used for function params
	vars_private: Map<string, Type>;
	fns_private: Map<string, Function>;

	//Public: can be accessed by inner scopes.
	//Use for global, namespaces, ...
	vars_public: Map<string, Type>;
	fns_public: Map<string, Function>;

	parent?: Scope;

	constructor(
		parent?: Scope) {
		this.parent = parent;

		this.vars_private = new Map<string, Type>();
		this.vars_public = new Map<string, Type>();
		this.fns_private = new Map<string, Function>();
		this.fns_public = new Map<string, Function>();
	}

	private getVarTrace(name: string): Type | undefined {
		return this.vars_public.get(name) ?? this.parent?.getVarTrace(name);
	}

	private getFnTrace(name: string): Function | undefined {
		return this.fns_public.get(name) ?? this.parent?.getFnTrace(name);
	}



	getVar(name: string): Type | undefined{
		return this.vars_private.get(name) ?? this.getVarTrace(name);
	}

	getFn(name: string): Function | undefined{
		return this.fns_private.get(name) ?? this.getFnTrace(name);
	}
}