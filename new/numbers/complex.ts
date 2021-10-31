import { Overloads } from "./types";
import { TypeReal, OverloadReal } from "./uncertain";


/*import { Type, TypeID, TypeTrait, TypeConverter, Types, Overloads } from "./types";
import { OverloadScalar, TypeScalar } from "./scalar";
import { TypeBasic, TypeBigInt, TypeNumber } from "./basic";

const TRAIT_COMPLEX: TypeTrait = {
	id: TypeID.Complex,
	name: "Complex",
	converters: new Map<TypeID, TypeConverter>([
		[TypeID.BigInt, {
			fn: (val: any) => {
				let valt = val as TypeScalar;
				return new TypeComplex(valt, new TypeBigInt(0n));
			},
			weight: 1
		}],
		[TypeID.BigRational, {
			fn: (val: any) => {
				let valt = val as TypeScalar;
				return new TypeComplex(valt, new TypeBigInt(0n));
			},
			weight: 1
		}],
		[TypeID.Number, {
			fn: (val: any) => {
				let valt = val as TypeScalar;
				return new TypeComplex(valt, new TypeBigInt(0n));
			},
			weight: 1
		}],
		//For now, disable uncertain complex values.
		[TypeID.Uncertain, {
			fn: (val: any) => {
				let valt = val as TypeScalar;
				return new TypeComplex(valt, new TypeBigInt(0n));
			},
			weight: 1
		}]
	])
};

Types.set(TRAIT_COMPLEX.id, TRAIT_COMPLEX);

export class TypeComplex implements Type {
	real: TypeScalar;
	imag: TypeScalar;

	get_type(): TypeTrait {
		return TRAIT_COMPLEX;
	}

	constructor(real: TypeScalar, imag: TypeScalar) {
		this.real = real;
		this.imag = imag;
	}

	print_tex(): string {
		return this.print_text();

	}
	print_text(): string {
		return this.real.print_text() + "+" + this.imag.print_text() + "i";
	}
};

export type TypeDimless = TypeScalar | TypeComplex;

export const OverloadNumber = new Overloads<TypeScalar, TypeDimless>(OverloadScalar);

OverloadNumber.add("real", [TypeID.Complex], (vs) => {
	let vst = vs as Array<TypeComplex>;
	return vst[0].real;
});

OverloadNumber.add("imag", [TypeID.Complex], (vs) => {
	let vst = vs as Array<TypeComplex>;
	return vst[0].imag;
});

OverloadNumber.add("abs", [TypeID.Complex], (vs) => {
	let vst = vs as Array<TypeComplex>;
	return OverloadScalar.call("sqrt", [
		OverloadScalar.call("add", [
			OverloadScalar.call("pow", [
				vst[0].real,
				new TypeBigInt(2n)
			]),
			OverloadScalar.call("pow", [
				vst[0].imag,
				new TypeBigInt(2n)
			])
		])
	]);
});

OverloadNumber.add("add", [TypeID.Complex, TypeID.Complex], (vs) => {
	let vst = vs as Array<TypeComplex>;
	return new TypeComplex(
		OverloadScalar.call("add", [vst[0].real, vst[1].real]),
		OverloadScalar.call("add", [vst[0].imag, vst[1].imag])
	);
});

OverloadNumber.add("pos", [TypeID.Complex], (vs) => {
	let vst = vs as Array<TypeComplex>;
	return vst[0];
});

OverloadNumber.add("sub", [TypeID.Complex, TypeID.Complex], (vs) => {
	let vst = vs as Array<TypeComplex>;
	return new TypeComplex(
		OverloadScalar.call("sub", [vst[0].real, vst[1].real]),
		OverloadScalar.call("sub", [vst[0].imag, vst[1].imag])
	);
});

OverloadNumber.add("neg", [TypeID.Complex], (vs) => {
	let vst = vs as Array<TypeComplex>;
	return new TypeComplex(
		OverloadScalar.call("neg", [vst[0].real]),
		OverloadScalar.call("neg", [vst[0].imag])
	);
});

OverloadNumber.add("mul", [TypeID.Complex, TypeID.Complex], (vs) => {
	let vst = vs as Array<TypeComplex>;
	return new TypeComplex(
		OverloadScalar.call("sub", [
			OverloadScalar.call("mul", [vst[0].real, vst[1].real]),
			OverloadScalar.call("mul", [vst[0].imag, vst[1].imag])
		]),
		OverloadScalar.call("add", [
			OverloadScalar.call("mul", [vst[0].imag, vst[1].real]),
			OverloadScalar.call("mul", [vst[0].real, vst[1].imag])
		]),
	);
});

OverloadNumber.add("div", [TypeID.Complex, TypeID.Complex], (vs) => {
	let vst = vs as Array<TypeComplex>;
	let denom = OverloadScalar.call("add", [
		OverloadScalar.call("pow", [
			vst[1].real,
			new TypeBigInt(2n)
		]),
		OverloadScalar.call("pow", [
			vst[1].imag,
			new TypeBigInt(2n)
		])
	]);

	return new TypeComplex(
		OverloadScalar.call("div", [
			OverloadScalar.call("add", [
				OverloadScalar.call("mul", [vst[0].real, vst[1].real]),
				OverloadScalar.call("mul", [vst[0].imag, vst[1].imag])
			]),
			denom
		]),
		OverloadScalar.call("div", [
			OverloadScalar.call("sub", [
				OverloadScalar.call("mul", [vst[0].imag, vst[1].real]),
				OverloadScalar.call("mul", [vst[0].real, vst[1].imag])
			]),
			denom
		])
	);
});

//Powers and logarithms

OverloadNumber.add("sqrt", [TypeID.Complex], (vs) => {
	let vst = vs as Array<TypeComplex>;
	return new TypeComplex(Math.sqrt(vst[0].val));
});

OverloadNumber.add("exp", [TypeID.Complex], (vs) => {
	let vst = vs as Array<TypeComplex>;
	return new TypeComplex(Math.exp(vst[0].val));
});

OverloadNumber.add("pow", [TypeID.Complex, TypeID.Complex], (vs) => {
	let vst = vs as Array<TypeComplex>;
	return new TypeComplex(Math.pow(vst[0].val, vst[1].val));
});

OverloadNumber.add("ln", [TypeID.Complex], (vs) => {
	let vst = vs as Array<TypeComplex>;
	return new TypeComplex(Math.log(vst[0].val));
});

OverloadNumber.add("log", [TypeID.Complex, TypeID.Complex], (vs) => {
	let vst = vs as Array<TypeComplex>;
	return new TypeComplex(Math.log(vst[0].val) / Math.log(vst[1].val));
});

OverloadNumber.add("log2", [TypeID.Complex], (vs) => {
	let vst = vs as Array<TypeComplex>;
	return new TypeComplex(Math.log(vst[0].val) / Math.LN2);
});

OverloadNumber.add("log10", [TypeID.Complex], (vs) => {
	let vst = vs as Array<TypeComplex>;
	return new TypeComplex(Math.log(vst[0].val) / Math.LN10);
});

//Trig shit

OverloadNumber.add("sin", [TypeID.Complex], (vs) => {
	let vst = vs as Array<TypeComplex>;
	return new TypeComplex(Math.sin(vst[0].val));
});

OverloadNumber.add("cos", [TypeID.Complex], (vs) => {
	let vst = vs as Array<TypeComplex>;
	return new TypeComplex(Math.cos(vst[0].val));
});

OverloadNumber.add("tan", [TypeID.Complex], (vs) => {
	let vst = vs as Array<TypeComplex>;
	return new TypeComplex(Math.tan(vst[0].val));
});

OverloadNumber.add("asin", [TypeID.Complex], (vs) => {
	let vst = vs as Array<TypeComplex>;
	return new TypeComplex(Math.asin(vst[0].val));
});

OverloadNumber.add("acos", [TypeID.Complex], (vs) => {
	let vst = vs as Array<TypeComplex>;
	return new TypeComplex(Math.asin(vst[0].val));
});

OverloadNumber.add("atan", [TypeID.Complex], (vs) => {
	let vst = vs as Array<TypeComplex>;
	return new TypeComplex(Math.asin(vst[0].val));
});

OverloadNumber.add("ctg", [TypeID.Complex], (vs) => {
	let vst = vs as Array<TypeComplex>;
	return new TypeComplex(1 / Math.tan(vst[0].val));
});

OverloadNumber.add("sec", [TypeID.Complex], (vs) => {
	let vst = vs as Array<TypeComplex>;
	return new TypeComplex(1 / Math.cos(vst[0].val));
});

OverloadNumber.add("csc", [TypeID.Complex], (vs) => {
	let vst = vs as Array<TypeComplex>;
	return new TypeComplex(1 / Math.sin(vst[0].val));
});*/

export type TypeScalar = TypeReal;

export const OverloadScalar = new Overloads<TypeReal, TypeScalar>(OverloadReal);
