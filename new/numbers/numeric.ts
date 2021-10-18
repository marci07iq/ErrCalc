import { FormatType } from "../settings/settings";

export interface Numeric {
	//Print
	print_text(): string;
	print_tex(): string;
};

export abstract class AlgebraBase<Type extends Numeric> {
	//Static factory
	abstract factory(val: number): Type;

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
};

export function getMagnitude(val: number): number {
	val = Math.abs(val);

	if (val == 0) return 0;
	return Math.floor(Math.log10(val));
}

export function printInt(val: number): string {
	let res: string = "";
	while(val >= 1) {
		let dgt = Math.floor(val % 10);
		val /= 10;
		res = String.fromCharCode('0'.charCodeAt(0) + dgt) + res;
	}
	if(res.length == 0) {
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

	if(format == FormatType.Smart) {
		if(offset < -3 || (offset > 3 && offset > digits	)) {
			format = FormatType.Scientific;
		} else {
			format = FormatType.Direct;
		}
	}

	switch (format) {
		case FormatType.Direct:
			val *= Math.pow(10, digits - offset - 1);
			numstr = printInt(val);

			if(offset > -1) {
				numstr = numstr.substr(0, offset + 1) + "." + numstr.substr(offset + 1);
			} else {
				numstr = "0." + "0".repeat(-1 - offset) + numstr;
			}

			//Remove trailing zeros
			while(numstr.length > 1 && numstr[numstr.length - 1] == "0") {
				numstr = numstr.substr(0, numstr.length - 1);
			}

			//Remove trailing decimal
			if(numstr[numstr.length - 1] == ".") {
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