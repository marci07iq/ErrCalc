import { FormatType } from "../settings/settings";

export enum TypeID {
	BigInt,
	BigRational,
	Number,
	BigFloat,
	Uncertain,
	Complex,
	Unit,
	Tensor,
	Array
};

export interface TypeConverter {
	fn: (val: Type) => Type;
	weight: number;
}
export interface TypeTrait {
	id: TypeID;
	name: string;
	converters: Map<TypeID, TypeConverter>;
}

export const Types: Map<TypeID, TypeTrait> = new Map<TypeID, TypeTrait>();

export interface Type {
	get_type(): TypeTrait;

	//Print
	print_text(): string;
	print_tex(): string;
};

/*export abstract class TypeSystem {
	//Static factory
	abstract factory(val: number): Type;

	abstract parseNumber(stream: StringStream): TokenNumber;

	//Basic
	abstract add(lhs: Type, rhs: Type): Type;
	abstract sub(lhs: Type, rhs: Type): Type;
	abstract mul(lhs: Type, rhs: Type): Type;
	abstract div(lhs: Type, rhs: Type): Type;

	//Exponential
	abstract pow(lhs: Type, rhs: Type): Type;
	abstract loge(lhs: Type): Type;

	sqrt(lhs: Type): Type {
		return this.pow(lhs, this.factory(0.5));
	}
	exp(lhs: Type): Type {
		return this.pow(this.factory(Math.E), lhs);
	}
	log2(lhs: Type): Type {
		return this.div(this.loge(lhs), this.factory(Math.LN2));
	}
	log10(lhs: Type): Type {
		return this.div(this.loge(lhs), this.factory(Math.LN10));
	}
	log(lhs: Type, rhs: Type): Type {
		return this.div(this.loge(lhs), this.loge(rhs));
	}

	//Trig
	abstract sin(lhs: Type): Type;
	abstract cos(lhs: Type): Type;
	abstract asin(lhs: Type): Type;
	abstract acos(lhs: Type): Type;
	abstract atan(lhs: Type): Type;

	tan(lhs: Type): Type {
		return this.div(this.sin(lhs), this.cos(lhs));
	};
	ctg(lhs: Type): Type {
		return this.div(this.cos(lhs), this.sin(lhs));
	};
	sec(lhs: Type): Type {
		return this.div(this.factory(1), this.cos(lhs));
	};
	csc(lhs: Type): Type {
		return this.div(this.factory(1), this.sin(lhs));
	};
}*/
class OverloadedFunction {
	types: Array<TypeID>;
	fn: (args: Array<any>) => Type;

	constructor(
		types: Array<TypeID>,
		fn: (args: Array<any>) => Type,
		match?: Array<Array<TypeID>>
		) {
		this.types = types;
		this.fn = fn;
	}

	call(vals: Array<Type>): Type {
		let transmuted = vals.map((val, idx) => {
			let srctypeid = val.get_type();
			if(srctypeid.id == this.types[idx]) return val;
			let caster = srctypeid.converters.get(idx);
			if(caster === undefined) throw new Error("Can not convert " + (Types.get(srctypeid.id)?.name ?? "Unknown") + " to " + (Types.get(this.types[idx])?.name ?? "Unknown"));
			return caster.fn(val);
		});

		return this.fn(transmuted);
	}
};

class Overloads_ {
	fns: Map<string, Array<OverloadedFunction>>;

	constructor() {
		this.fns = new Map<string, Array<OverloadedFunction>>();
	}

	add(
		name: string,
		types: Array<TypeID>,
		fn: (args: Array<any>) => Type) {
		if(!this.fns.has(name)) {
			this.fns.set(name, new Array<OverloadedFunction>());
		}
		this.fns.get(name).push(new OverloadedFunction(types, fn));
	}

	find(
		name: string,
		args: Array<TypeID>
	): OverloadedFunction {
		let overloads = this.fns.get(name);
		if(overloads === undefined) throw new Error("Unknown builtin function " + name);
		
		let best: OverloadedFunction = undefined;
		let bestweight: number = undefined;

		overloads.forEach((overload) => {
			if(overload.types.length == args.length) {
				let wt = 0;
				for(let i = 0; i < args.length; i++) {
					//Exact match
					if(overload.types[i] == args[i]) continue;
					//Need conversion
					let converter = Types.get(overload.types[i])?.converters.get(args[i])?.weight;
					//None found: Ignore this option
					if(converter === undefined) return;
					wt += converter;
				}
				if(best === undefined || bestweight > wt) {
					best = overload;
					bestweight = wt;
				}
			}
		});

		if(best === undefined) throw new Error("No overload found for " + name + "(" + args.map(arg => (Types.get(arg)?.name ?? "Unknown")).join(", ") + ")");
		return best;
	}
}

export const Overloads: Overloads_ = new Overloads_;

/*export abstract class AlgebraBase {
	//Static factory
	abstract factory(val: number): Numeric;
	
	//Basic
	abstract add(lhs: Numeric, rhs: Numeric): Numeric;
	abstract sub(lhs: Numeric, rhs: Numeric): Numeric;
	abstract mul(lhs: Numeric, rhs: Numeric): Numeric;
	abstract div(lhs: Numeric, rhs: Numeric): Numeric;
	
	//Exponential
	abstract pow(lhs: Numeric, rhs: Numeric): Numeric;
	abstract loge(lhs: Numeric): Numeric;
	
	sqrt(lhs: Numeric): Numeric {
		return this.pow(lhs, this.factory(0.5));
	}
	exp(lhs: Numeric): Numeric {
		return this.pow(this.factory(Math.E), lhs);
	}
	log2(lhs: Numeric): Numeric {
		return this.div(this.loge(lhs), this.factory(Math.LN2));
	}
	log10(lhs: Numeric): Numeric {
		return this.div(this.loge(lhs), this.factory(Math.LN10));
	}
	log(lhs: Numeric, rhs: Numeric): Numeric {
		return this.div(this.loge(lhs), this.loge(rhs));
	}
	
	//Trig
	abstract sin(lhs: Numeric): Numeric;
	abstract cos(lhs: Numeric): Numeric;
	abstract asin(lhs: Numeric): Numeric;
	abstract acos(lhs: Numeric): Numeric;
	abstract atan(lhs: Numeric): Numeric;
	
	tan(lhs: Numeric): Numeric {
		return this.div(this.sin(lhs), this.cos(lhs));
	};
	ctg(lhs: Numeric): Numeric {
		return this.div(this.cos(lhs), this.sin(lhs));
	};
	sec(lhs: Numeric): Numeric {
		return this.div(this.factory(1), this.cos(lhs));
	};
	csc(lhs: Numeric): Numeric {
		return this.div(this.factory(1), this.sin(lhs));
	};
};*/

export function getMagnitude(val: number): number {
	val = Math.abs(val);

	if (val == 0) return 0;
	return Math.floor(Math.log10(val));
}

export function printInt(val: number): string {
	let res: string = "";
	while (val >= 1) {
		let dgt = Math.floor(val % 10);
		val /= 10;
		res = String.fromCharCode('0'.charCodeAt(0) + dgt) + res;
	}
	if (res.length == 0) {
		res = "0";
	}
	return res;
}

export function printNumber(val: number, digits: number, format: FormatType) {
	let sign: string = (val < 0 ? "-" : "");

	val = Math.abs(val);

	let numstr: string = "";
	let expstr: string = undefined;
	let offset: number = getMagnitude(val);

	if (format == FormatType.Smart) {
		if (offset < -3 || (offset > 3 && offset > digits)) {
			format = FormatType.Scientific;
		} else {
			format = FormatType.Direct;
		}
	}

	switch (format) {
		case FormatType.Direct:
			val *= Math.pow(10, digits - offset - 1);
			numstr = printInt(val);

			if (offset > -1) {
				numstr = numstr.substr(0, offset + 1) + "." + numstr.substr(offset + 1);
			} else {
				numstr = "0." + "0".repeat(-1 - offset) + numstr;
			}

			//Remove trailing zeros
			while (numstr.length > 1 && numstr[numstr.length - 1] == "0") {
				numstr = numstr.substr(0, numstr.length - 1);
			}

			//Remove trailing decimal
			if (numstr[numstr.length - 1] == ".") {
				numstr = numstr.substr(0, numstr.length - 1);
			}

			break;
		case FormatType.Scientific:

			val *= Math.pow(10, digits - offset - 1);
			numstr = printInt(val);

			numstr = numstr.substr(0, 1) + "." + numstr.substr(1);

			expstr = printInt(offset);

			break;

		default:
			throw new Error("Unknown format " + format);
	}

	return [sign + numstr, expstr];
}