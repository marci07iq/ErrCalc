import { Type, TypeID, TypeTrait, TypeConverter, Types, Overloads, } from "./types";
import { FormatType } from "../settings/settings";
import { printNumber } from "./number_utils";

//BigInt

const TRAIT_BIG_INT: TypeTrait = {
	id: TypeID.BigInt,
	//traits: [TypeID.TypeBasic],
	name: "BigInt",
	converters: new Map<TypeID, TypeConverter>([
	])
};

Types.set(TRAIT_BIG_INT.id, TRAIT_BIG_INT);

export class TypeBigInt implements Type {
	val: bigint;

	get_type(): TypeTrait {
		return TRAIT_BIG_INT;
	}

	constructor(val: bigint) {
		this.val = val;
	}

	print_text(): string {
		return this.val.toString();
	}
	print_tex(): string {
		return this.print_text();
	}
};

//Rational

const TRAIT_BIG_RATIONAL: TypeTrait = {
	id: TypeID.BigRational,
	//traits: [TypeID.TypeBasic],
	name: "BigRational",
	converters: new Map<TypeID, TypeConverter>([
		[TypeID.BigInt, {
			fn: (val: any) => {
				let valt = val as TypeBigInt;
				return new TypeBigRational(valt.val, 1n);
			},
			weight: 1
		}]
	])
};

Types.set(TRAIT_BIG_RATIONAL.id, TRAIT_BIG_RATIONAL);

export class TypeBigRational implements Type {
	num: bigint;
	den: bigint;

	get_type(): TypeTrait {
		return TRAIT_BIG_RATIONAL;
	}

	static gcd(a: bigint, b: bigint): bigint {
		//absolute val
		if(a < 0) a = -a;
		if(b < 0) b = -b;
		//sorting
		if(a > b) return TypeBigRational.gcd(b, a);
		//euler gcd
		while(b > 0) {
			let t = b;
			b = a % t;
			a = t;
		}
		return a;
	}

	constructor(num: bigint, den: bigint) {
		if(den < 0) {
			den = -den;
			num = -num;
		}
		//Auto-simplify
		let gcd = TypeBigRational.gcd(num, den);
		this.num = num / gcd;
		this.den = den / gcd;
	}

	print_text(): string {
		return this.num.toString() + "/" + this.den.toString();
	}
	print_tex(): string {
		return "\\frac{" + this.num.toString() + "," + this.den.toString() + "}";
	}
};

//Number

const TRAIT_NUMBER: TypeTrait = {
	id: TypeID.Number,
	//traits: [TypeID.TypeBasic],
	name: "Number",
	converters: new Map<TypeID, TypeConverter>([
		[TypeID.BigInt, {
			fn: (val: any) => {
				let valt = val as TypeBigInt;
				return new TypeNumber(Number(valt.val));
			},
			weight: 1
		}],
		[TypeID.BigRational, {
			fn: (val: any) => {
				let valt = val as TypeBigRational;
				return new TypeNumber(Number(valt.num)/Number(valt.den));
			},
			weight: 1
		}]
	])
};

Types.set(TRAIT_NUMBER.id, TRAIT_NUMBER);

export class TypeNumber implements Type {
	val: number;

	get_type(): TypeTrait {
		return TRAIT_NUMBER;
	}

	constructor(val: number) {
		this.val = val;
	}

	print_tex(): string {
		let parts = printNumber(this.val, 5, FormatType.Smart);
		return parts[0] + (parts[1] !== undefined ? ("e" + parts[1]) : "");
	}
	print_text(): string {
		return "" + this.val;
	}
};

export type TypeBasicClosed = TypeBigInt | TypeBigRational;
export type TypeBasic = TypeBasicClosed | TypeNumber;

export const OverloadBasicClosed = new Overloads<TypeBasicClosed, TypeBasicClosed>();
export const OverloadBasic = new Overloads<TypeBasicClosed, TypeBasic>(OverloadBasicClosed);

//Alegbra operators (algebraically closed)

//BigInt

OverloadBasicClosed.add("abs", [TypeID.BigInt], (vs) => {
	let vst = vs as Array<TypeBigInt>;
	return new TypeBigInt(vst[0].val < 0 ? -vst[0].val : vst[0].val);
});

OverloadBasicClosed.add("add", [TypeID.BigInt, TypeID.BigInt], (vs) => {
	let vst = vs as Array<TypeBigInt>;
	return new TypeBigInt(vst[0].val + vst[1].val);
});

OverloadBasicClosed.add("pos", [TypeID.BigInt], (vs) => {
	let vst = vs as Array<TypeBigInt>;
	return vst[0];
});

OverloadBasicClosed.add("sub", [TypeID.BigInt, TypeID.BigInt], (vs) => {
	let vst = vs as Array<TypeBigInt>;
	return new TypeBigInt(vst[0].val - vst[1].val);
});

OverloadBasicClosed.add("neg", [TypeID.BigInt], (vs) => {
	let vst = vs as Array<TypeBigInt>;
	return new TypeBigInt(-vst[0].val);
});

OverloadBasicClosed.add("mul", [TypeID.BigInt, TypeID.BigInt], (vs) => {
	let vst = vs as Array<TypeBigInt>;
	return new TypeBigInt(vst[0].val * vst[1].val);
});

OverloadBasicClosed.add("div", [TypeID.BigInt, TypeID.BigInt], (vs) => {
	let vst = vs as Array<TypeBigInt>;
	return new TypeBigRational(vst[0].val, vst[1].val);
});

OverloadBasicClosed.add("pow", [TypeID.BigInt, TypeID.BigInt], (vs) => {
	let vst = vs as Array<TypeBigInt>;
	if(vst[1].val >= 0) {
		return new TypeBigInt(vst[0].val ** vst[1].val);
	}
	//a^-b = 1/a^b
	return new TypeBigRational(1n, vst[0].val ** (-vst[1].val));
});

//BigRational

OverloadBasicClosed.add("abs", [TypeID.BigRational], (vs) => {
	let vst = vs as Array<TypeBigRational>;
	return new TypeBigRational(
		vst[0].num < 0 ? -vst[0].num : vst[0].num,
		vst[1].den
	);
});

OverloadBasicClosed.add("add", [TypeID.BigRational, TypeID.BigRational], (vs) => {
	let vst = vs as Array<TypeBigRational>;
	return new TypeBigRational(vst[0].num * vst[1].den + vst[1].num * vst[0].den, vst[0].den * vst[1].den);
});

OverloadBasicClosed.add("pos", [TypeID.BigRational], (vs) => {
	let vst = vs as Array<TypeBigRational>;
	return vst[0];
});

OverloadBasicClosed.add("sub", [TypeID.BigRational, TypeID.BigRational], (vs) => {
	let vst = vs as Array<TypeBigRational>;
	return new TypeBigRational(vst[0].num * vst[1].den - vst[1].num * vst[0].den, vst[0].den * vst[1].den);
});

OverloadBasicClosed.add("neg", [TypeID.BigRational], (vs) => {
	let vst = vs as Array<TypeBigRational>;
	return new TypeBigRational(-vst[0].num, vst[0].den);
});

OverloadBasicClosed.add("mul", [TypeID.BigRational, TypeID.BigRational], (vs) => {
	let vst = vs as Array<TypeBigRational>;
	return new TypeBigRational(vst[0].num * vst[1].num, vst[0].den * vst[1].den);
});

OverloadBasicClosed.add("div", [TypeID.BigRational, TypeID.BigRational], (vs) => {
	let vst = vs as Array<TypeBigRational>;
	return new TypeBigRational(vst[0].num * vst[1].den, vst[0].den * vst[1].num);
});

OverloadBasic.add("pow", [TypeID.BigRational, TypeID.BigRational], (vs) => {
	let vst = vs as Array<TypeBigRational>;
	if(vst[1].den == 1n) {
		if(vst[1].num >= 0) {
			return new TypeBigRational(vst[0].num ** vst[1].num, vst[0].den ** vst[1].num);
		} else {
			return new TypeBigRational(vst[0].den ** (-vst[1].num), vst[0].num ** (-vst[1].num));
		}
	}
	return new TypeNumber((Number(vst[0].num) / Number(vst[0].den)) ** (Number(vst[1].num) / Number(vst[1].den)));
});

//Number (simple JS float fallback)

//Basic operators

OverloadBasic.add("abs", [TypeID.Number], (vs) => {
	let vst = vs as Array<TypeNumber>;
	return new TypeNumber(vst[0].val < 0 ? -vst[0].val : vst[0].val);
});

OverloadBasic.add("add", [TypeID.Number, TypeID.Number], (vs) => {
	let vst = vs as Array<TypeNumber>;
	return new TypeNumber(vst[0].val + vst[1].val);
});

OverloadBasic.add("pos", [TypeID.Number], (vs) => {
	let vst = vs as Array<TypeNumber>;
	return vst[0];
});

OverloadBasic.add("sub", [TypeID.Number, TypeID.Number], (vs) => {
	let vst = vs as Array<TypeNumber>;
	return new TypeNumber(vst[0].val - vst[1].val);
});

OverloadBasic.add("neg", [TypeID.Number], (vs) => {
	let vst = vs as Array<TypeNumber>;
	return new TypeNumber(-vst[0].val);
});

OverloadBasic.add("mul", [TypeID.Number, TypeID.Number], (vs) => {
	let vst = vs as Array<TypeNumber>;
	return new TypeNumber(vst[0].val * vst[1].val);
});

OverloadBasic.add("div", [TypeID.Number, TypeID.Number], (vs) => {
	let vst = vs as Array<TypeNumber>;
	return new TypeNumber(vst[0].val / vst[1].val);
});

//Powers and logarithms

OverloadBasic.add("sqrt", [TypeID.Number], (vs) => {
	let vst = vs as Array<TypeNumber>;
	return new TypeNumber(Math.sqrt(vst[0].val));
});

OverloadBasic.add("exp", [TypeID.Number], (vs) => {
	let vst = vs as Array<TypeNumber>;
	return new TypeNumber(Math.exp(vst[0].val));
});

OverloadBasic.add("pow", [TypeID.Number, TypeID.Number], (vs) => {
	let vst = vs as Array<TypeNumber>;
	return new TypeNumber(Math.pow(vst[0].val, vst[1].val));
});

OverloadBasic.add("ln", [TypeID.Number], (vs) => {
	let vst = vs as Array<TypeNumber>;
	return new TypeNumber(Math.log(vst[0].val));
});

OverloadBasic.add("log", [TypeID.Number, TypeID.Number], (vs) => {
	let vst = vs as Array<TypeNumber>;
	return new TypeNumber(Math.log(vst[0].val) / Math.log(vst[1].val));
});

OverloadBasic.add("log2", [TypeID.Number], (vs) => {
	let vst = vs as Array<TypeNumber>;
	return new TypeNumber(Math.log(vst[0].val) / Math.LN2);
});

OverloadBasic.add("log10", [TypeID.Number], (vs) => {
	let vst = vs as Array<TypeNumber>;
	return new TypeNumber(Math.log(vst[0].val) / Math.LN10);
});

//Trig shit

OverloadBasic.add("sin", [TypeID.Number], (vs) => {
	let vst = vs as Array<TypeNumber>;
	return new TypeNumber(Math.sin(vst[0].val));
});

OverloadBasic.add("cos", [TypeID.Number], (vs) => {
	let vst = vs as Array<TypeNumber>;
	return new TypeNumber(Math.cos(vst[0].val));
});

OverloadBasic.add("tan", [TypeID.Number], (vs) => {
	let vst = vs as Array<TypeNumber>;
	return new TypeNumber(Math.tan(vst[0].val));
});

OverloadBasic.add("asin", [TypeID.Number], (vs) => {
	let vst = vs as Array<TypeNumber>;
	return new TypeNumber(Math.asin(vst[0].val));
});

OverloadBasic.add("acos", [TypeID.Number], (vs) => {
	let vst = vs as Array<TypeNumber>;
	return new TypeNumber(Math.asin(vst[0].val));
});

OverloadBasic.add("atan", [TypeID.Number], (vs) => {
	let vst = vs as Array<TypeNumber>;
	return new TypeNumber(Math.asin(vst[0].val));
});

OverloadBasic.add("ctg", [TypeID.Number], (vs) => {
	let vst = vs as Array<TypeNumber>;
	return new TypeNumber(1 / Math.tan(vst[0].val));
});

OverloadBasic.add("sec", [TypeID.Number], (vs) => {
	let vst = vs as Array<TypeNumber>;
	return new TypeNumber(1 / Math.cos(vst[0].val));
});

OverloadBasic.add("csc", [TypeID.Number], (vs) => {
	let vst = vs as Array<TypeNumber>;
	return new TypeNumber(1 / Math.sin(vst[0].val));
});