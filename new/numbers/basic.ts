import { AlgebraBase, Numeric, printNumber } from "./numeric";
import { FormatType, settings } from "../settings/settings";

export class Basic implements Numeric {
	val: number;

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
}

class AlgebraBasic_ extends AlgebraBase<Basic> {
	//Static factory
	factory(val: number): Basic {
		return new Basic(val);
	}

	//Basic
	add(lhs: Basic, rhs: Basic): Basic {
		return new Basic(lhs.val + rhs.val);
	}
	sub(lhs: Basic, rhs: Basic): Basic {
		return new Basic(lhs.val - rhs.val);
	}
	mul(lhs: Basic, rhs: Basic): Basic {
		return new Basic(lhs.val * rhs.val);
	}
	div(lhs: Basic, rhs: Basic): Basic {
		return new Basic(lhs.val / rhs.val);
	}

	//Exponential
	pow(lhs: Basic, rhs: Basic): Basic {
		return new Basic(Math.pow(lhs.val, rhs.val));
	}
	log(lhs: Basic, rhs: Basic): Basic{
		return new Basic(Math.log(lhs.val) / Math.log(rhs.val));
	}

	sqrt(lhs: Basic): Basic {
		return new Basic(Math.sqrt(lhs.val));
	}
	exp(lhs: Basic): Basic {
		return new Basic(Math.exp(lhs.val));
	}
	log2(lhs: Basic): Basic {
		return new Basic(Math.log2(lhs.val));
	}
	loge(lhs: Basic): Basic {
		return new Basic(Math.log(lhs.val));
	}
	log10(lhs: Basic): Basic {
		return new Basic(Math.log10(lhs.val));
	}

	//Trig
	sin(lhs: Basic): Basic{
		return new Basic(Math.sin(lhs.val));
	}
	cos(lhs: Basic): Basic{
		return new Basic(Math.cos(lhs.val));
	}
	asin(lhs: Basic): Basic{
		return new Basic(Math.asin(lhs.val));
	}
	acos(lhs: Basic): Basic{
		return new Basic(Math.acos(lhs.val));
	}
	atan(lhs: Basic): Basic{
		return new Basic(Math.atan(lhs.val));
	}

	tan(lhs: Basic): Basic {
		return new Basic(Math.tan(lhs.val));
	};
	ctg(lhs: Basic): Basic {
		return new Basic(1/Math.tan(lhs.val));
	};
	sec(lhs: Basic): Basic {
		return new Basic(1/Math.cos(lhs.val));
	};
	csc(lhs: Basic): Basic {
		return new Basic(1/Math.sin(lhs.val));
	};
};

export const AlgebraBasic: AlgebraBasic_ = new AlgebraBasic_();