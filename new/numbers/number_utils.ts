import { FormatType } from "../settings/settings";

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
	let expstr: string | undefined = undefined;
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