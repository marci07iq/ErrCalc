import { Numeric, AlgebraBase } from "../numbers/numeric";
import { Scope } from "./scope";
import { Token } from "./token";

export abstract class Function<Type extends Numeric> {
	algebra: AlgebraBase<Type>;

	constructor(algebra: AlgebraBase<Type>) {
		this.algebra = algebra;
	}

	abstract evaluate(scope: Scope<Type>, args: Array<Token<Type>>): Type;
}

export class FunctionUser<Type extends Numeric> extends Function<Type> {
	argnames: Array<string>;
	token: Token<Type>;

	constructor(algebra: AlgebraBase<Type>, argnames: Array<string>, token: Token<Type>) {
		super(algebra);
		this.token = token;
		this.argnames = argnames;
	}

	evaluate(scope: Scope<Type>, args: Array<Token<Type>>): Type {
		let private_vars = new Map<string, Type>();

		if(this.argnames.length != args.length) {
			throw new Error("Invalid inputs to user definde function");
		}

		//Evaluate function inouts in parent scope
		for(let i = 0; i < args.length; i++) {
			private_vars.set(this.argnames[i], args[i].evaluate(scope));
		}

		let new_scope = new Scope<Type>(scope.parent);

		new_scope.vars_private = private_vars;

		return this.token.evaluate(new_scope);
	}
}


class FunctionBuiltinAdd<Type extends Numeric> extends Function<Type> {

	evaluate(scope: Scope<Type>, args: Array<Token<Type>>): Type {
		if (args.length != 2) {
			throw new Error("Invaild arguments for add");
		}
		return this.algebra.add(
			args[0].evaluate(scope),
			args[1].evaluate(scope)
		);
	}
}

class FunctionBuiltinSub<Type extends Numeric> extends Function<Type> {
	algebra: AlgebraBase<Type>;

	evaluate(scope: Scope<Type>, args: Array<Token<Type>>): Type {
		if (args.length != 2) {
			throw new Error("Invaild arguments for sub");
		}
		return this.algebra.sub(
			args[0].evaluate(scope),
			args[1].evaluate(scope)
		);
	}
}

class FunctionBuiltinMul<Type extends Numeric> extends Function<Type> {
	algebra: AlgebraBase<Type>;

	evaluate(scope: Scope<Type>, args: Array<Token<Type>>): Type {
		if (args.length != 2) {
			throw new Error("Invaild arguments for mul");
		}
		return this.algebra.mul(
			args[0].evaluate(scope),
			args[1].evaluate(scope)
		);
	}
}

class FunctionBuiltinDiv<Type extends Numeric> extends Function<Type> {
	algebra: AlgebraBase<Type>;

	evaluate(scope: Scope<Type>, args: Array<Token<Type>>): Type {
		if (args.length != 2) {
			throw new Error("Invaild arguments for div");
		}
		return this.algebra.div(
			args[0].evaluate(scope),
			args[1].evaluate(scope)
		);
	}
}

class FunctionBuiltinPow<Type extends Numeric> extends Function<Type> {
	algebra: AlgebraBase<Type>;

	evaluate(scope: Scope<Type>, args: Array<Token<Type>>): Type {
		if (args.length != 2) {
			throw new Error("Invaild arguments for pow");
		}
		return this.algebra.pow(
			args[0].evaluate(scope),
			args[1].evaluate(scope)
		);
	}
}

class FunctionBuiltinLn<Type extends Numeric> extends Function<Type> {
	algebra: AlgebraBase<Type>;

	evaluate(scope: Scope<Type>, args: Array<Token<Type>>): Type {
		if (args.length != 1) {
			throw new Error("Invaild arguments for ln");
		}
		return this.algebra.loge(
			args[0].evaluate(scope)
		);
	}
}

class FunctionBuiltinSqrt<Type extends Numeric> extends Function<Type> {
	algebra: AlgebraBase<Type>;

	evaluate(scope: Scope<Type>, args: Array<Token<Type>>): Type {
		if (args.length != 1) {
			throw new Error("Invaild arguments for sqrt");
		}
		return this.algebra.sqrt(
			args[0].evaluate(scope)
		);
	}
}

class FunctionBuiltinExp<Type extends Numeric> extends Function<Type> {
	algebra: AlgebraBase<Type>;

	evaluate(scope: Scope<Type>, args: Array<Token<Type>>): Type {
		if (args.length != 1) {
			throw new Error("Invaild arguments for exp");
		}
		return this.algebra.exp(
			args[0].evaluate(scope)
		);
	}
}



class FunctionBuiltinLog2<Type extends Numeric> extends Function<Type> {
	algebra: AlgebraBase<Type>;

	evaluate(scope: Scope<Type>, args: Array<Token<Type>>): Type {
		if (args.length != 1) {
			throw new Error("Invaild arguments for log2");
		}
		return this.algebra.log2(
			args[0].evaluate(scope)
		);
	}
}

class FunctionBuiltinLog10<Type extends Numeric> extends Function<Type> {
	algebra: AlgebraBase<Type>;

	evaluate(scope: Scope<Type>, args: Array<Token<Type>>): Type {
		if (args.length != 1) {
			throw new Error("Invaild arguments for log10");
		}
		return this.algebra.log10(
			args[0].evaluate(scope)
		);
	}
}

class FunctionBuiltinLog<Type extends Numeric> extends Function<Type> {
	algebra: AlgebraBase<Type>;

	evaluate(scope: Scope<Type>, args: Array<Token<Type>>): Type {
		switch (args.length) {
			case 1:
				return this.algebra.log10(
					args[0].evaluate(scope)
				);
				break;
			case 2:
				return this.algebra.log(
					args[0].evaluate(scope),
					args[1].evaluate(scope)
				);
				break;
			default:
				throw new Error("Invaild arguments for log");
				break;
		}
		return undefined;
	}
}

class FunctionBuiltinSin<Type extends Numeric> extends Function<Type> {
	algebra: AlgebraBase<Type>;

	evaluate(scope: Scope<Type>, args: Array<Token<Type>>): Type {
		if (args.length != 1) {
			throw new Error("Invaild arguments for sin");
		}
		return this.algebra.sin(
			args[0].evaluate(scope)
		);
	}
}

class FunctionBuiltinCos<Type extends Numeric> extends Function<Type> {
	algebra: AlgebraBase<Type>;

	evaluate(scope: Scope<Type>, args: Array<Token<Type>>): Type {
		if (args.length != 1) {
			throw new Error("Invaild arguments for cos");
		}
		return this.algebra.cos(
			args[0].evaluate(scope)
		);
	}
}

class FunctionBuiltinTan<Type extends Numeric> extends Function<Type> {
	algebra: AlgebraBase<Type>;

	evaluate(scope: Scope<Type>, args: Array<Token<Type>>): Type {
		if (args.length != 1) {
			throw new Error("Invaild arguments for tan");
		}
		return this.algebra.tan(
			args[0].evaluate(scope)
		);
	}
}

class FunctionBuiltinASin<Type extends Numeric> extends Function<Type> {
	algebra: AlgebraBase<Type>;

	evaluate(scope: Scope<Type>, args: Array<Token<Type>>): Type {
		if (args.length != 1) {
			throw new Error("Invaild arguments for asin");
		}
		return this.algebra.asin(
			args[0].evaluate(scope)
		);
	}
}

class FunctionBuiltinACos<Type extends Numeric> extends Function<Type> {
	algebra: AlgebraBase<Type>;

	evaluate(scope: Scope<Type>, args: Array<Token<Type>>): Type {
		if (args.length != 1) {
			throw new Error("Invaild arguments for acos");
		}
		return this.algebra.acos(
			args[0].evaluate(scope)
		);
	}
}

class FunctionBuiltinATan<Type extends Numeric> extends Function<Type> {
	algebra: AlgebraBase<Type>;

	evaluate(scope: Scope<Type>, args: Array<Token<Type>>): Type {
		if (args.length != 1) {
			throw new Error("Invaild arguments for atan");
		}
		return this.algebra.atan(
			args[0].evaluate(scope)
		);
	}
}

class FunctionBuiltinCtg<Type extends Numeric> extends Function<Type> {
	algebra: AlgebraBase<Type>;

	evaluate(scope: Scope<Type>, args: Array<Token<Type>>): Type {
		if (args.length != 1) {
			throw new Error("Invaild arguments for ctg");
		}
		return this.algebra.ctg(
			args[0].evaluate(scope)
		);
	}
}

class FunctionBuiltinSec<Type extends Numeric> extends Function<Type> {
	algebra: AlgebraBase<Type>;

	evaluate(scope: Scope<Type>, args: Array<Token<Type>>): Type {
		if (args.length != 1) {
			throw new Error("Invaild arguments for sec");
		}
		return this.algebra.sec(
			args[0].evaluate(scope)
		);
	}
}

class FunctionBuiltinCsc<Type extends Numeric> extends Function<Type> {
	algebra: AlgebraBase<Type>;

	evaluate(scope: Scope<Type>, args: Array<Token<Type>>): Type {
		if (args.length != 1) {
			throw new Error("Invaild arguments for csc");
		}
		return this.algebra.csc(
			args[0].evaluate(scope)
		);
	}
}

export function createFns<Type extends Numeric>(algebra: AlgebraBase<Type>) : Map<string, Function<Type>> {
	let fns = new Map<string, Function<Type>>();

	fns.set("add", new FunctionBuiltinAdd<Type>(algebra));
	fns.set("sub", new FunctionBuiltinSub<Type>(algebra));
	fns.set("mul", new FunctionBuiltinMul<Type>(algebra));
	fns.set("div", new FunctionBuiltinDiv<Type>(algebra));

	fns.set("pow", new FunctionBuiltinPow<Type>(algebra));
	fns.set("ln", new FunctionBuiltinLn<Type>(algebra));
	fns.set("loge", new FunctionBuiltinLn<Type>(algebra));
	fns.set("sqrt", new FunctionBuiltinSqrt<Type>(algebra));
	fns.set("exp", new FunctionBuiltinExp<Type>(algebra));
	fns.set("log2", new FunctionBuiltinLog2<Type>(algebra));
	fns.set("log10", new FunctionBuiltinLog10<Type>(algebra));
	fns.set("log", new FunctionBuiltinLog<Type>(algebra));

	fns.set("sin", new FunctionBuiltinSin<Type>(algebra));
	fns.set("cos", new FunctionBuiltinCos<Type>(algebra));
	fns.set("tan", new FunctionBuiltinTan<Type>(algebra));
	fns.set("asin", new FunctionBuiltinASin<Type>(algebra));
	fns.set("acos", new FunctionBuiltinACos<Type>(algebra));
	fns.set("atan", new FunctionBuiltinATan<Type>(algebra));

	fns.set("ctg", new FunctionBuiltinCtg<Type>(algebra));
	fns.set("sec", new FunctionBuiltinSec<Type>(algebra));
	fns.set("csc", new FunctionBuiltinCsc<Type>(algebra));

	return fns;
}