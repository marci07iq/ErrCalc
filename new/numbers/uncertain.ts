import { AlgebraBase, Numeric, getMagnitude, printNumber, printInt } from "./numeric";
import { FormatType, settings } from "../settings/settings";

export class Uncertain implements Numeric<Uncertain> {
	static algebra: AlgebraUncertain_;

	get_algebra(): AlgebraBase<Uncertain> {
		return Uncertain.algebra;
	}

	val: number;
	err: number;

	constructor(val: number, err: number) {
		this.val = val;
		this.err = err;
	}

	print_parts(): Array<string> {
		let num_magnitude: number = getMagnitude(this.val);
		let err_magnitude: number = getMagnitude(this.val);

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

class AlgebraUncertain_ extends AlgebraBase<Uncertain> {
	//Static factory
	factory(val: number): Uncertain {
		return new Uncertain(val, 0);
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
	}*/

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
	};*/
};

Uncertain.algebra = new AlgebraUncertain_();