export enum TypeID {
	BigInt,
	BigRational,
	Number,
	BigFloat,
	TypeBasic,
	//^ TypeBasic
	Uncertain,
	TypeScalar,
	//^ TypeScalar
	Complex,
	TypeNumber,
	//^ TypeNumber
	Unit,
	TypeValue,
	//^ TypeValue
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
	//traits: Array<TypeID>;
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
class OverloadedFunction<RetType extends Type> {
	types: Array<TypeID>;
	fn: (args: Array<any>) => RetType;

	constructor(
		types: Array<TypeID>,
		fn: (args: Array<any>) => RetType
		) {
		this.types = types;
		this.fn = fn;
	}

	call(vals: Array<Type>): RetType {
		let transmuted = vals.map((val, idx) => {
			let srctypeid = val.get_type();
			let dsttypeid = this.types[idx];
			if(srctypeid.id == dsttypeid) return val;
			let caster = Types.get(dsttypeid)?.converters.get(srctypeid.id);
			if(caster === undefined) throw new Error("Can not convert " + (Types.get(srctypeid.id)?.name ?? "Unknown") + " to " + (Types.get(this.types[idx])?.name ?? "Unknown"));
			return caster.fn(val);
		});

		return this.fn(transmuted);
	}
};

interface OverloadedFunctionCandidate<RetType extends Type> {
	fn: OverloadedFunction<RetType>,
	weight: number;
}

export class Overloads<BaseType extends RetType, RetType extends Type> {
	base?: Overloads<any, BaseType>;

	fns: Map<string, Array<OverloadedFunction<RetType>>>;

	constructor(
		base?: Overloads<BaseType, any>
	) {
		this.fns = new Map<string, Array<OverloadedFunction<RetType>>>();
		this.base = base;
	}

	add(
		name: string,
		types: Array<TypeID>,
		fn: (args: Array<any>) => RetType) {
		if(!this.fns.has(name)) {
			this.fns.set(name, new Array<OverloadedFunction<RetType>>());
		}
		this.fns.get(name)?.push(new OverloadedFunction<RetType>(types, fn));
	}

	find(
		name: string,
		args: Array<TypeID>
	): OverloadedFunctionCandidate<RetType> | undefined {
		let overloads = this.fns.get(name);
		if(overloads === undefined) throw new Error("Unknown builtin function " + name);
		
		let best: OverloadedFunctionCandidate<RetType> | undefined = this.base?.find(name, args);

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
				if(best === undefined || best.weight > wt) {
					best = {
						fn: overload,
						weight: wt
					};
				}
			}
		});

		return best;
	}

	call(
		name: string,
		args: Array<Type>
	): RetType {
		let argst = args.map(arg => arg.get_type().id);
		let overload = this.find(name, argst);
		if(overload === undefined) throw new Error("No overload found for " + name + "(" + argst.map(argt => (Types.get(argt)?.name ?? "Unknown")).join(", ") + ")");
		//console.debug("Looking for " + name + "(" + argst.map(argt => (Types.get(argt)?.name ?? "Unknown")).join(", ") + ")");
		//console.debug("Found " + name + "(" + overload.fn.types.map(argt => (Types.get(argt)?.name ?? "Unknown")).join(", ") + ")");
		return overload.fn.call(args);
	}
}

//export const Overloads: Overloads_ = new Overloads_;
