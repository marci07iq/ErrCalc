/*import { AlgebraBase, Type, getMagnitude, printNumber, printInt } from "./numeric";
import { FormatType, settings } from "../settings/settings";

export class Tensor<Underlying extends Type> implements Type {
	static algebra: AlgebraTensor_<Underlying>;

	get_algebra(): AlgebraBase<Tensor<Underlying>> {
		return Tensor.algebra;
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

class AlgebraTensor_<Underlying extends Type<Underlying>> extends AlgebraBase<Tensor<Underlying>> {
	//Static factory
	factory(val: number): Tensor<Underlying> {
		return new Tensor(val, 0);
	}

	//Tensor
	add(lhs: Tensor<Underlying>, rhs: Tensor<Underlying>): Tensor<Underlying> {
		return new Tensor(lhs.val + rhs.val,
			Math.sqrt(lhs.err*lhs.err + rhs.err*rhs.err));
	}
	sub(lhs: Tensor<Underlying>, rhs: Tensor<Underlying>): Tensor<Underlying> {
		return new Tensor(lhs.val - rhs.val,
			Math.sqrt(lhs.err*lhs.err + rhs.err*rhs.err));
	}
	mul(lhs: Tensor<Underlying>, rhs: Tensor<Underlying>): Tensor<Underlying> {
		return new Tensor(lhs.val * rhs.val,
			Math.sqrt(Math.pow(lhs.err * rhs.val, 2) + Math.pow(rhs.err * lhs.val, 2)));
	}
	div(lhs: Tensor<Underlying>, rhs: Tensor<Underlying>): Tensor<Underlying> {
		return new Tensor(lhs.val / rhs.val,
			Math.sqrt(Math.pow(lhs.err, 2) + Math.pow(rhs.err * lhs.val / rhs.val, 2)) / rhs.val);
	}

	//Exponential
	pow(lhs: Tensor<Underlying>, rhs: Tensor<Underlying>): Tensor<Underlying> {
		return new Tensor(Math.pow(lhs.val, rhs.val),
		Math.pow(lhs.val, rhs.val) * Math.sqrt(
			Math.pow(rhs.val * lhs.err / lhs.val, 2) +
			Math.pow(Math.log(Math.abs(lhs.val)) * rhs.err, 2)),);
	}
	loge(lhs: Tensor<Underlying>): Tensor<Underlying> {
		return new Tensor(Math.log(lhs.val),
		lhs.err / lhs.val);
	}
	

	sqrt(lhs: Tensor<Underlying>): Tensor<Underlying> {
		return new Tensor(Math.sqrt(lhs.val),
		Math.sqrt(lhs.val) * 0.5 * lhs.err / lhs.val);
	}
	exp(lhs: Tensor<Underlying>): Tensor<Underlying> {
		return new Tensor(Math.exp(lhs.val),
		Math.exp(lhs.val)*lhs.err);
	}
	log2(lhs: Tensor<Underlying>): Tensor<Underlying> {
		return new Tensor(Math.log2(lhs.val),
		lhs.err / lhs.val / Math.LN2);
	}
	log10(lhs: Tensor<Underlying>): Tensor<Underlying> {
		return new Tensor(Math.log10(lhs.val),
		lhs.err / lhs.val / Math.LN10);
	}
	/*log(lhs: Tensor<Underlying>, rhs: Tensor<Underlying>): Tensor<Underlying> {
		return this.div(this.loge(lhs), this.loge(rhs));
	}*

	//Trig
	sin(lhs: Tensor<Underlying>): Tensor<Underlying> {
		return new Tensor(Math.sin(lhs.val),
		Math.cos(lhs.val) * lhs.err);
	}
	cos(lhs: Tensor<Underlying>): Tensor<Underlying> {
		return new Tensor(Math.cos(lhs.val),
		Math.sin(lhs.val) * lhs.err);
	}
	asin(lhs: Tensor<Underlying>): Tensor<Underlying> {
		return new Tensor(Math.asin(lhs.val),
		lhs.err / Math.sqrt(1 - lhs.val * lhs.val));
	}
	acos(lhs: Tensor<Underlying>): Tensor<Underlying> {
		return new Tensor(Math.acos(lhs.val),
		- lhs.err / Math.sqrt(1 - lhs.val * lhs.val));
	}
	atan(lhs: Tensor<Underlying>): Tensor<Underlying> {
		return new Tensor(Math.atan(lhs.val),
		lhs.err / (1 + lhs.val * lhs.val));
	}

	/*tan(lhs: Tensor<Underlying>): Tensor<Underlying> {
		return this.div(this.sin(lhs), this.cos(lhs));
	};
	ctg(lhs: Tensor<Underlying>): Tensor<Underlying> {
		return this.div(this.cos(lhs), this.sin(lhs));
	};
	sec(lhs: Tensor<Underlying>): Tensor<Underlying> {
		return new Tensor(1/Math.cos(lhs.val));
	};
	csc(lhs: Tensor<Underlying>): Tensor<Underlying> {
		return new Tensor(1/Math.sin(lhs.val));
	};*
};

Tensor.algebra = new AlgebraTensor_();*/