import { Numeric } from "../numbers/numeric";
import { Function } from "./function";

export class Scope<Type extends Numeric> {
	//Private: cant be accessed by inner scopes
	vars_private: Map<string, Type>;
	fns_private: Map<string, Function<Type>>;

	//Public: can be accessed by inner scopes.
	vars_public: Map<string, Type>;
	fns_public: Map<string, Function<Type>>;

	parent?: Scope<Type>;

	constructor(
		parent?: Scope<Type>) {
		this.parent = parent;

		this.vars_private = new Map<string, Type>();
		this.vars_public = new Map<string, Type>();
		this.fns_private = new Map<string, Function<Type>>();
		this.fns_public = new Map<string, Function<Type>>();
	}

	getVarTrace(name: string): Type {
		return this.vars_public.get(name) ?? this.parent?.getVarTrace(name);
	}

	getFnTrace(name: string): Function<Type> {
		return this.fns_public.get(name) ?? this.parent?.getFnTrace(name);
	}



	getVar(name: string): Type {
		return this.vars_private.get(name) ?? this.getVarTrace(name);
	}

	getFn(name: string): Function<Type> {
		return this.fns_private.get(name) ?? this.getFnTrace(name);
	}
}