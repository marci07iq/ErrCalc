import { Type, TypeID, printNumber, TypeTrait, TypeConverter, Types, Overloads, } from "./types";
import { FormatType, settings } from "../settings/settings";

const trait: TypeTrait = {
	id: TypeID.Number,
	name: "Number",
	converters: new Map<TypeID, TypeConverter>([

	])
};

Types.set(trait.id, trait);

export class NumberWrapper implements Type {
	val: number;

	get_type(): TypeTrait {
		return trait;
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

//Basic operators

Overloads.add("\\add", [TypeID.Number, TypeID.Number], (vs) => {
	let vst = vs as Array<NumberWrapper>;
	return new NumberWrapper(vst[0].val + vst[1].val);
});

Overloads.add("\\sub", [TypeID.Number, TypeID.Number], (vs) => {
	let vst = vs as Array<NumberWrapper>;
	return new NumberWrapper(vst[0].val - vst[1].val);
});

Overloads.add("\\mul", [TypeID.Number, TypeID.Number], (vs) => {
	let vst = vs as Array<NumberWrapper>;
	return new NumberWrapper(vst[0].val * vst[1].val);
});

Overloads.add("\\div", [TypeID.Number, TypeID.Number], (vs) => {
	let vst = vs as Array<NumberWrapper>;
	return new NumberWrapper(vst[0].val / vst[1].val);
});

//Powers and logarithms

Overloads.add("sqrt", [TypeID.Number, TypeID.Number], (vs) => {
	let vst = vs as Array<NumberWrapper>;
	return new NumberWrapper(Math.sqrt(vst[0].val));
});

Overloads.add("exp", [TypeID.Number, TypeID.Number], (vs) => {
	let vst = vs as Array<NumberWrapper>;
	return new NumberWrapper(Math.exp(vst[0].val));
});

Overloads.add("pow", [TypeID.Number, TypeID.Number], (vs) => {
	let vst = vs as Array<NumberWrapper>;
	return new NumberWrapper(Math.pow(vst[0].val, vst[1].val));
});

Overloads.add("ln", [TypeID.Number, TypeID.Number], (vs) => {
	let vst = vs as Array<NumberWrapper>;
	return new NumberWrapper(Math.log(vst[0].val));
});

Overloads.add("log", [TypeID.Number, TypeID.Number], (vs) => {
	let vst = vs as Array<NumberWrapper>;
	return new NumberWrapper(Math.log(vst[0].val) / Math.log(vst[1].val));
});

Overloads.add("log2", [TypeID.Number, TypeID.Number], (vs) => {
	let vst = vs as Array<NumberWrapper>;
	return new NumberWrapper(Math.log(vst[0].val) / Math.LN2);
});

Overloads.add("log10", [TypeID.Number, TypeID.Number], (vs) => {
	let vst = vs as Array<NumberWrapper>;
	return new NumberWrapper(Math.log(vst[0].val) / Math.LN10);
});

//Trig shit

Overloads.add("sin", [TypeID.Number, TypeID.Number], (vs) => {
	let vst = vs as Array<NumberWrapper>;
	return new NumberWrapper(Math.sin(vst[0].val));
});

Overloads.add("cos", [TypeID.Number, TypeID.Number], (vs) => {
	let vst = vs as Array<NumberWrapper>;
	return new NumberWrapper(Math.cos(vst[0].val));
});

Overloads.add("tan", [TypeID.Number, TypeID.Number], (vs) => {
	let vst = vs as Array<NumberWrapper>;
	return new NumberWrapper(Math.tan(vst[0].val));
});

Overloads.add("asin", [TypeID.Number, TypeID.Number], (vs) => {
	let vst = vs as Array<NumberWrapper>;
	return new NumberWrapper(Math.asin(vst[0].val));
});

Overloads.add("acos", [TypeID.Number, TypeID.Number], (vs) => {
	let vst = vs as Array<NumberWrapper>;
	return new NumberWrapper(Math.asin(vst[0].val));
});

Overloads.add("atan", [TypeID.Number, TypeID.Number], (vs) => {
	let vst = vs as Array<NumberWrapper>;
	return new NumberWrapper(Math.asin(vst[0].val));
});

Overloads.add("ctg", [TypeID.Number, TypeID.Number], (vs) => {
	let vst = vs as Array<NumberWrapper>;
	return new NumberWrapper(1 / Math.tan(vst[0].val));
});

Overloads.add("sec", [TypeID.Number, TypeID.Number], (vs) => {
	let vst = vs as Array<NumberWrapper>;
	return new NumberWrapper(1 / Math.cos(vst[0].val));
});

Overloads.add("csc", [TypeID.Number, TypeID.Number], (vs) => {
	let vst = vs as Array<NumberWrapper>;
	return new NumberWrapper(1 / Math.sin(vst[0].val));
});