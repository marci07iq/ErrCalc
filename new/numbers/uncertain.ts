import { Type, TypeID, TypeTrait, TypeConverter, Types, Overloads } from "./types";
import { TypeBasic, OverloadBasic, TypeBigInt, TypeBigRational, TypeNumber } from "./basic";

const TRAIT_UNCERTAIN: TypeTrait = {
	id: TypeID.Uncertain,
	//traits: [TypeID.]
	name: "Uncertain",
	converters: new Map<TypeID, TypeConverter>([
		[TypeID.BigInt, {
			fn: (val: any) => {
				let valt = val as TypeBasic;
				return new TypeUncertain(valt, new TypeBigInt(0n));
			},
			weight: 1
		}],[TypeID.BigRational, {
			fn: (val: any) => {
				let valt = val as TypeBigRational;
				return new TypeUncertain(valt, new TypeBigInt(0n));
			},
			weight: 1
		}],
		[TypeID.Number, {
			fn: (val: any) => {
				let valt = val as TypeNumber;
				return new TypeUncertain(valt, new TypeBigInt(0n));
			},
			weight: 1
		}]
	])
};

Types.set(TRAIT_UNCERTAIN.id, TRAIT_UNCERTAIN);

export class TypeUncertain implements Type {
	val: TypeBasic;
	err: TypeBasic;

	get_type(): TypeTrait {
		return TRAIT_UNCERTAIN;
	}

	constructor(val: TypeBasic, err: TypeBasic) {
		this.val = val;
		this.err = err;
	}

	print_parts(): Array<string> {
		// TODO
		/*let num_magnitude: number = getMagnitude(this.val.val);
		let err_magnitude: number = getMagnitude(this.err.val);

		let format = settings.format;

		if (format == FormatType.Smart) {
			if (num_magnitude < -3 || num_magnitude > 3) {
				format = FormatType.Scientific;
			} else {
				format = FormatType.Direct;
			}
		}

		switch (format) {
			case FormatType.Direct:
				return [
					printNumber(this.val.val, num_magnitude + settings.digits - err_magnitude, FormatType.Direct)[0],
					printNumber(this.err.val, settings.digits, FormatType.Direct)[1]
				];
				break;
			case FormatType.Scientific:
				return [
					printNumber(this.val.val / Math.pow(10, num_magnitude), num_magnitude + settings.digits - err_magnitude, FormatType.Direct)[0],
					printNumber(this.err.val / Math.pow(10, num_magnitude), settings.digits, FormatType.Direct)[1],
					printInt(num_magnitude)
				];
				break;
			default:
				throw Error("Unknown format " + format);
		}*/
		return [this.val.print_text(), this.err.print_text()];
	}

	print_tex(): string {
		let parts = this.print_parts();

		if (parts.length > 2) {
			return "(" + parts[0] + "\\pm" + parts[1] + ") \\times 10^{" + parts[2] + "}";
		}
		return parts[0] + "\\pm" + parts[1];

	}
	print_text(): string {
		let parts = this.print_parts();

		if (parts.length > 2) {
			return parts[0] + "e" + parts[2] + "\u00B1" + parts[1] + "e" + parts[2];
		}
		return parts[0] + "\u00B1" + parts[1];
	}
};

export type TypeReal = TypeBasic | TypeUncertain;

export const OverloadReal = new Overloads<TypeBasic, TypeReal>(OverloadBasic);

//Basic operators

OverloadReal.add("\\add", [TypeID.Uncertain, TypeID.Uncertain], (vs) => {
	let vst = vs as Array<TypeUncertain>;
	return new TypeUncertain(
		OverloadBasic.call("\\add", [vst[0].val, vst[1].val]),
		OverloadBasic.call("sqrt", [
			OverloadBasic.call("\\add", [
				OverloadBasic.call("\\mul", [vst[0].err, vst[0].err]),
				OverloadBasic.call("\\mul", [vst[1].err, vst[1].val])])
		]));
});

OverloadReal.add("\\pos", [TypeID.Uncertain], (vs) => {
	let vst = vs as Array<TypeUncertain>;
	return vst[0];
});

OverloadReal.add("\\sub", [TypeID.Uncertain, TypeID.Uncertain], (vs) => {
	let vst = vs as Array<TypeUncertain>;
	return new TypeUncertain(
		OverloadBasic.call("sub", [vst[0].val, vst[1].val]),
		OverloadBasic.call("sqrt", [
			OverloadBasic.call("\\add", [
				OverloadBasic.call("\\mul", [vst[0].err, vst[0].err]),
				OverloadBasic.call("\\mul", [vst[1].err, vst[1].val])])
		]));
});

OverloadReal.add("\\neg", [TypeID.Uncertain], (vs) => {
	let vst = vs as Array<TypeUncertain>;
	return new TypeUncertain(
		OverloadBasic.call("neg", [vst[0].val]),
		vst[1].err);
});

OverloadReal.add("\\mul", [TypeID.Uncertain, TypeID.Uncertain], (vs) => {
	let vst = vs as Array<TypeUncertain>;
	return new TypeUncertain(
		OverloadBasic.call("\\mul", [vst[0].val, vst[1].val]),
		OverloadBasic.call("sqrt", [
			OverloadBasic.call("\\add", [
				OverloadBasic.call("\\pow", [
					OverloadBasic.call("\\mul", [vst[0].err, vst[1].val]),
					new TypeBigInt(2n)
				]),
				OverloadBasic.call("\\pow", [
					OverloadBasic.call("\\mul", [vst[1].err, vst[0].val]),
					new TypeBigInt(2n)
				])
			])
		]));
});

OverloadReal.add("\\div", [TypeID.Uncertain, TypeID.Uncertain], (vs) => {
	let vst = vs as Array<TypeUncertain>;
	return new TypeUncertain(
		OverloadBasic.call("\\div", [vst[0].val, vst[1].val]),
		OverloadBasic.call("\\div", [
			OverloadBasic.call("sqrt", [
				OverloadBasic.call("\\add", [
					OverloadBasic.call("\\pow", [
						vst[0].err, new TypeBigInt(2n)
					]),
					OverloadBasic.call("\\pow", [
						OverloadBasic.call("\\div", [
							OverloadBasic.call("\\mul", [vst[1].err, vst[0].val]),
							vst[1].val
						]),
						new TypeBigInt(2n)
					])
				])
			]),
			vst[1].val
		]));
});


OverloadReal.add("\\pow", [TypeID.Uncertain, TypeID.Uncertain], (vs) => {
	let vst = vs as Array<TypeUncertain>;
	/*return new TypeUncertain(
		OverloadsBasic.call("\\pow", [vst[0].val, vst[1].val]),
		OverloadsBasic.call("\\mul", [
			OverloadsBasic.call("\\pow", [vst[0].val, vst[1].val]),
			OverloadsBasic.call("sqrt", [
				OverloadsBasic.call("\\add", [
					OverloadsBasic.call("\\pow", [
					
					])	
				])
			])
		])
	);*/
	return OverloadReal.call("exp", [
		OverloadReal.call("\\mul", [
			vst[1],
			OverloadReal.call("ln", [vst[0]])
		])
	])
});


//Powers and logarithms

OverloadReal.add("sqrt", [TypeID.Uncertain], (vs) => {
	let vst = vs as Array<TypeUncertain>;
	return new TypeUncertain(
		OverloadBasic.call("sqrt", [vst[0].val]),
		OverloadBasic.call("\\div", [
			OverloadBasic.call("\\mul", [vst[0].err, new TypeBigRational(1n, 2n)]),
			OverloadBasic.call("sqrt", [vst[0].val])
		])
	);
});

OverloadReal.add("exp", [TypeID.Uncertain], (vs) => {
	let vst = vs as Array<TypeUncertain>;
	return new TypeUncertain(
		OverloadBasic.call("exp", [vst[0].val]),
		OverloadBasic.call("\\mul", [
			vst[0].err,
			OverloadBasic.call("exp", [vst[0].val])
		]),
	);
});

OverloadReal.add("ln", [TypeID.Uncertain], (vs) => {
	let vst = vs as Array<TypeUncertain>;
	return new TypeUncertain(
		OverloadBasic.call("ln", [vst[0].val]),
		OverloadBasic.call("\\div", [vst[0].err, vst[0].val]),
	);
});

OverloadReal.add("log", [TypeID.Uncertain, TypeID.Uncertain], (vs) => {
	let vst = vs as Array<TypeUncertain>;
	return OverloadReal.call("\\div", [
		OverloadReal.call("ln", [vst[0]]),
		OverloadReal.call("ln", [vst[1]])
	]);
});

OverloadReal.add("log2", [TypeID.Uncertain], (vs) => {
	let vst = vs as Array<TypeUncertain>;
	return OverloadReal.call("\\div", [
		OverloadReal.call("ln", [vst[0]]),
		new TypeNumber(Math.LN2)
	]);
});

OverloadReal.add("log10", [TypeID.Uncertain], (vs) => {
	let vst = vs as Array<TypeUncertain>;
	return OverloadReal.call("\\div", [
		OverloadReal.call("ln", [vst[0]]),
		new TypeNumber(Math.LN10)
	]);
});

//Trig shit

OverloadReal.add("sin", [TypeID.Uncertain], (vs) => {
	let vst = vs as Array<TypeUncertain>;
	return new TypeUncertain(
		OverloadBasic.call("sin", [vst[0].val]),
		OverloadBasic.call("\\mul", [
			OverloadBasic.call("abs", [
				OverloadBasic.call("cos", [vst[0].val])
			]),
			vst[0].err
		])
	);
});

OverloadReal.add("cos", [TypeID.Uncertain], (vs) => {
	let vst = vs as Array<TypeUncertain>;
	return new TypeUncertain(
		OverloadBasic.call("cos", [vst[0].val]),
		OverloadBasic.call("\\mul", [
			OverloadBasic.call("abs", [
				OverloadBasic.call("sin", [vst[0].val]),
			]),
			vst[0].err
		])
	);
});

OverloadReal.add("tan", [TypeID.Uncertain], (vs) => {
	let vst = vs as Array<TypeUncertain>;
	return OverloadReal.call("\\div", [
		OverloadReal.call("sin", [vst[0]]),
		OverloadReal.call("cos", [vst[0]])
	]);
});

OverloadReal.add("asin", [TypeID.Uncertain], (vs) => {
	let vst = vs as Array<TypeUncertain>;
	return new TypeUncertain(
		OverloadBasic.call("asin", [vst[0].val]),
		OverloadBasic.call("\\div", [
			vst[0].err,
			OverloadBasic.call("sqrt", [
				OverloadBasic.call("sub", [
					new TypeBigInt(1n),
					OverloadBasic.call("\\mul", [vst[0].val, vst[0].val]),
				])
			])
		])
	);
});

OverloadReal.add("acos", [TypeID.Uncertain], (vs) => {
	let vst = vs as Array<TypeUncertain>;
	return new TypeUncertain(
		OverloadBasic.call("acos", [vst[0].val]),
		OverloadBasic.call("\\div", [
			vst[0].err,
			OverloadBasic.call("sqrt", [
				OverloadBasic.call("sub", [
					new TypeBigInt(1n),
					OverloadBasic.call("\\mul", [vst[0].val, vst[0].val]),
				])
			])
		])
	);
});

OverloadReal.add("atan", [TypeID.Uncertain], (vs) => {
	let vst = vs as Array<TypeUncertain>;
	return new TypeUncertain(
		OverloadBasic.call("atan", [vst[0].val]),
		OverloadBasic.call("\\div", [
			vst[0].err,
			OverloadBasic.call("\\add", [
				new TypeBigInt(1n),
				OverloadBasic.call("\\mul", [vst[0].val, vst[0].val]),
			])
		])
	);
});

OverloadReal.add("ctg", [TypeID.Uncertain], (vs) => {
	let vst = vs as Array<TypeUncertain>;
	return OverloadReal.call("\\div", [
		OverloadReal.call("cos", [vst[0]]),
		OverloadReal.call("sin", [vst[0]])
	]);
});

OverloadReal.add("sec", [TypeID.Uncertain], (vs) => {
	let vst = vs as Array<TypeUncertain>;
	return OverloadReal.call("\\div", [
		new TypeBigInt(1n),
		OverloadReal.call("cos", [vst[0]])
	]);
});

OverloadReal.add("csc", [TypeID.Uncertain], (vs) => {
	let vst = vs as Array<TypeUncertain>;
	return OverloadReal.call("\\div", [
		new TypeNumber(1),
		OverloadReal.call("sin", [vst[0]])
	]);
});

OverloadReal.add("abs", [TypeID.Uncertain], (vs) => {
	let vst = vs as Array<TypeUncertain>;
	return new TypeUncertain(
		OverloadBasic.call("abs", [vst[0].val]),
		vst[1].val
	);
});

OverloadReal.add("re", [TypeID.Uncertain], (vs) => {
	let vst = vs as Array<TypeUncertain>;
	return new TypeUncertain(
		vst[0].val,
		vst[1].val
	);
});

OverloadReal.add("im", [TypeID.Uncertain], (vs) => {
	let vst = vs as Array<TypeUncertain>;
	return new TypeUncertain(
		new TypeBigInt(0n),
		new TypeBigInt(0n)
	);
});


/*import { Type, getMagnitude, printNumber, printInt, TypeSystem } from "./types";
import { FormatType, settings } from "../settings/settings";
import { parseUncertain } from "../parser/uncertain";
import { TokenNumber } from "../evaluator/token";
import { StringStream } from "../utils/string_stream";
import { Basic } from "./basic";


export class Uncertain implements Type {
	static algebra: TypeSystemUncertain_;

	val: Basic;
	err: Basic;

	constructor(val: Basic, err: Basic) {
		this.val = val;
		this.err = err;
	}

	print_parts(): Array<string> {
		let num_magnitude: number = getMagnitude(this.val.val);
		let err_magnitude: number = getMagnitude(this.err.val);

		let format = settings.format;

		if(format == FormatType.Smart) {
			if(num_magnitude < -3 || num_magnitude > 3) {
				format = FormatType.Scientific;
			} else {
				format = FormatType.Direct;
			}
		}

		switch(format) {
			case FormatType.Direct:
				return [
					printNumber(this.val, num_magnitude + settings.digits - err_magnitude, FormatType.Direct)[0],
					printNumber(this.err, settings.digits, FormatType.Direct)[1]
				];
				break;
			case FormatType.Scientific:
				return [
					printNumber(this.val / Math.pow(10, num_magnitude), num_magnitude + settings.digits - err_magnitude, FormatType.Direct)[0],
					printNumber(this.err / Math.pow(10, num_magnitude), settings.digits, FormatType.Direct)[1],
					printInt(num_magnitude)
				];
				break;
			default:
				throw Error("Unknown format " + format);
		}
	}

	print_tex(): string {
		let parts = this.print_parts();

		if(parts.length > 2) {
			return "(" + parts[0] + "\\pm" + parts[1] + ") \\times 10^{" + parts[2] + "}";
		}
		return parts[0] + "\\pm" + parts[1];

	}
	print_text(): string {
		let parts = this.print_parts();

		if(parts.length > 2) {
			return parts[0] + "e" + parts[2] + "\u00B1" + parts[1] + "e" + parts[2];
		}
		return parts[0] + "\u00B1" + parts[1];
	}
}

class TypeSystemUncertain_ extends TypeSystem {
	//Static factory
	factory(val: number): Uncertain {
		return new Uncertain(val, 0);
	}

	parseNumber(stream: StringStream): TokenNumber {
		let res = parseUncertain(stream);
		if(res === undefined) return undefined;
		return new TokenNumber(new Uncertain(res[0], res[1]));
	}

	//Uncertain
	add(lhs: Uncertain, rhs: Uncertain): Uncertain {
		return new Uncertain(lhs.val + rhs.val,
			Math.sqrt(lhs.err*lhs.err + rhs.err*rhs.err));
	}
	sub(lhs: Uncertain, rhs: Uncertain): Uncertain {
		return new Uncertain(lhs.val - rhs.val,
			Math.sqrt(lhs.err*lhs.err + rhs.err*rhs.err));
	}
	mul(lhs: Uncertain, rhs: Uncertain): Uncertain {
		return new Uncertain(lhs.val * rhs.val,
			Math.sqrt(Math.pow(lhs.err * rhs.val, 2) + Math.pow(rhs.err * lhs.val, 2)));
	}
	div(lhs: Uncertain, rhs: Uncertain): Uncertain {
		return new Uncertain(lhs.val / rhs.val,
			Math.sqrt(Math.pow(lhs.err, 2) + Math.pow(rhs.err * lhs.val / rhs.val, 2)) / rhs.val);
	}

	//Exponential
	pow(lhs: Uncertain, rhs: Uncertain): Uncertain {
		return new Uncertain(Math.pow(lhs.val, rhs.val),
		Math.pow(lhs.val, rhs.val) * Math.sqrt(
			Math.pow(rhs.val * lhs.err / lhs.val, 2) +
			Math.pow(Math.log(Math.abs(lhs.val)) * rhs.err, 2)),);
	}
	loge(lhs: Uncertain): Uncertain {
		return new Uncertain(Math.log(lhs.val),
		lhs.err / lhs.val);
	}


	sqrt(lhs: Uncertain): Uncertain {
		return new Uncertain(Math.sqrt(lhs.val),
		Math.sqrt(lhs.val) * 0.5 * lhs.err / lhs.val);
	}
	exp(lhs: Uncertain): Uncertain {
		return new Uncertain(Math.exp(lhs.val),
		Math.exp(lhs.val)*lhs.err);
	}
	log2(lhs: Uncertain): Uncertain {
		return new Uncertain(Math.log2(lhs.val),
		lhs.err / lhs.val / Math.LN2);
	}
	log10(lhs: Uncertain): Uncertain {
		return new Uncertain(Math.log10(lhs.val),
		lhs.err / lhs.val / Math.LN10);
	}
	/*log(lhs: Uncertain, rhs: Uncertain): Uncertain{
		return this.div(this.loge(lhs), this.loge(rhs));
	}*

	//Trig
	sin(lhs: Uncertain): Uncertain{
		return new Uncertain(Math.sin(lhs.val),
		Math.cos(lhs.val) * lhs.err);
	}
	cos(lhs: Uncertain): Uncertain{
		return new Uncertain(Math.cos(lhs.val),
		Math.sin(lhs.val) * lhs.err);
	}
	asin(lhs: Uncertain): Uncertain{
		return new Uncertain(Math.asin(lhs.val),
		lhs.err / Math.sqrt(1 - lhs.val * lhs.val));
	}
	acos(lhs: Uncertain): Uncertain{
		return new Uncertain(Math.acos(lhs.val),
		- lhs.err / Math.sqrt(1 - lhs.val * lhs.val));
	}
	atan(lhs: Uncertain): Uncertain{
		return new Uncertain(Math.atan(lhs.val),
		lhs.err / (1 + lhs.val * lhs.val));
	}

	/*tan(lhs: Uncertain): Uncertain {
		return this.div(this.sin(lhs), this.cos(lhs));
	};
	ctg(lhs: Uncertain): Uncertain {
		return this.div(this.cos(lhs), this.sin(lhs));
	};
	sec(lhs: Uncertain): Uncertain {
		return new Uncertain(1/Math.cos(lhs.val));
	};
	csc(lhs: Uncertain): Uncertain {
		return new Uncertain(1/Math.sin(lhs.val));
	};*
};

Uncertain.algebra = new TypeSystemUncertain_();*/