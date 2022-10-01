import { Type, TypeID, TypeTrait, TypeConverter, Types, Overloads } from "./types";
import { TypeBasic, TypeBasicClosed, TypeBigInt, OverloadBasicClosed } from "./basic";
import { TypeScalar, OverloadScalar } from "./complex";

const TRAIT_UNIT: TypeTrait = {
	id: TypeID.Unit,
	//traits: [TypeID.]
	name: "Uncertain",
	converters: new Map<TypeID, TypeConverter>([
		[TypeID.BigInt, {
			fn: (val: any) => {
				let valt = val as TypeBasic;
				return new TypeUnit(valt);
			},
			weight: 1
		}]
	])
};

Types.set(TRAIT_UNIT.id, TRAIT_UNIT);

export class TypeUnit implements Type {
	val: TypeScalar;
	unit: Units;

	get_type(): TypeTrait {
		return TRAIT_UNIT;
	}

	constructor(val: TypeBasic, unit: Units = new Map<string, TypeBasicClosed>()) {
		this.val = val;
		this.unit = unit;
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
		return [this.val.print_text(), ""];
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

export type TypeValue = TypeScalar | TypeUnit;

export const OverloadValue = new Overloads<TypeScalar, TypeValue>(OverloadScalar);

type Units = Map<string, TypeBasicClosed>;

type UnitRegistry = Map<string, Units>;

//Multiply two units (adds the underlying base units)
function mulUnits(lhs: Units, rhs: Units) : Units {
	let res: Units = new Map<string, TypeBasicClosed>();

	for(const [key, val] of lhs.entries()) {
		res.set(key, val);
	}

	for(const [key, val] of rhs.entries()) {
		res.set(key, OverloadBasicClosed.call("\\add", [res.get(key) ?? new TypeBigInt(0n), val]));
	}
	
	return res;
}

function divUnits(lhs: Units, rhs: Units): Units {
	let res: Units = new Map<string, TypeBasicClosed>();

	for(const [key, val] of lhs.entries()) {
		res.set(key, val);
	}

	for(const [key, val] of rhs.entries()) {
		res.set(key, OverloadBasicClosed.call("\\sub", [res.get(key) ?? new TypeBigInt(0n), val]));
	}
	
	return res;
}

function powUnits(lhs: Units, rhs: TypeBasicClosed): Units {
	let res: Units = new Map<string, TypeBasicClosed>();

	for(const [key, val] of lhs.entries()) {
		res.set(key, OverloadBasicClosed.call("\\mul", [val, rhs]));
	}
	
	return res;
}

function isTrivial(units: Units) {
	let zeros = true;
	for(const [key, val] of units.entries()) {
		
	}
}

function recognizeUnit(units: Units, registry: UnitRegistry) {
	//Only recognizes a combination of two registered units

}