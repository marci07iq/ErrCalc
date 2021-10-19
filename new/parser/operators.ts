import { Numeric } from "../numbers/numeric";
import { Token, TokenFunction } from "../evaluator/token";
import { StringStream, checkChar } from "../utils/string_stream";
import { charmap } from "./charmap";
import { ParserError } from "./parser_error";

type operatorParser<Type extends Numeric> = (
	stream: StringStream,
	parser: OperatorParser<Type>,
	precedence: number) => Token<Type>;

class PrecedenceClass<Type extends Numeric> {
	symbols: Set<string>;
	precedence: number;
	parser: operatorParser<Type>
}

function parsePrimitive<Type extends Numeric>(
	stream: StringStream,
	parser: OperatorParser<Type>,
	precedence: number): Token<Type> {

	//Grammar:
	//Number, name or bracket.
	//If name followed by ( -> function
	//If name followed by [ -> array access

	return undefined;
}

function parseOpBinaryL2R<Type extends Numeric>(
	stream: StringStream,
	parser: OperatorParser<Type>,
	precedence: number): Token<Type> {
	
		//Grammar:
		//<wh>Prec(+1)<wh>[op(0)<wh>Prec(+1)]...
	stream.skipThrough();
	let leading = parser.precedence[precedence + 1].parser(stream, parser, precedence + 1);
	if(leading === undefined) {
		throw new ParserError(stream.pos, stream, "Expected token found nothing");
	}
	let res = leading;

	while(true) {
		stream.skipThrough();
		let s = stream.transaction();
		let op = parser.parseOperatorSymbol(s);
		//This level
		if(parser.precedence[precedence].symbols.has(op)) {
			let term = parser.precedence[precedence + 1].parser(stream, parser, precedence + 1);
			if(term === undefined) {
				throw new ParserError(s.pos, s, "Binary " + op + " expected right argument, found nothing");
			}

			res = new TokenFunction(operatorNames.get(op), [res, term]);

			s.commit();
		} else {
			break;
		}
	}

	return res;
}
export class OperatorParser<Type extends Numeric> {
	operators: Set<string>;
	precedence: Array<PrecedenceClass<Type>>;

	constructor() {
		this.precedence = [
			{
				symbols: new Set<string>([","]),
				precedence: 0,
				parser: parseOpBinaryL2R
			},
			{
				symbols: new Set<string>(["+", "-"]),
				precedence: 1,
				parser: parseOpBinaryL2R
			},
			{
				symbols: new Set<string>(["*", "/"]),
				precedence: 2,
				parser: parseOpBinaryL2R
			},
			{
				symbols: new Set<string>([]),
				precedence: 3,
				parser: parsePrimitive
			}
		];

		this.precedence.forEach((p) => {
			p.symbols.forEach((symbol) => {
				this.operators.add(symbol);
			});
		});
	}

	//Parse a valid operator name
	parseOperatorSymbol(stream: StringStream): string {
		let res = "";
		let good = false;
		//While valid operator char
		while (checkChar(stream.peek(), charmap.operator)) {
			let newres = res + stream.peek();
			let newgood = this.operators.has(newres);
			//End of valid operator name (eg ! is valid but !! isnt)
			if (good && !newgood) {
				break;
			}
			res = newres;
			good = newgood;
		}
		//Nothing is not an error, caller will hard fail if needed operator
		if (res.length == 0) {
			return undefined;
		}
		if (!good) {
			throw new ParserError(stream.pos, stream, "Invalid operator " + res);
		}
		return res;
	}

	parseName(stream: StringStream): string {
		let res = "";
		//While valid operator char
		if (checkChar(stream.peek(), charmap.name_start)) {
			while (checkChar(stream.peek(), charmap.name_mid)) {
				res = res + stream.peek();
			}
		} else {
			//Nothing is not an error, caller will hard fail if needed name
			return undefined;
		}
		return res;
	}

	/*parseExpression(stream: StringStream): Token<Type> {

	}*/
}

function createOperatorNames(): Map<string, string> {
	let res = new Map<string, string>();
	res.set("+", "\\add");
	res.set("-", "\\sub");
	res.set("*", "\\mul");
	res.set("/", "\\div");
	return res;
}

export const operatorNames = createOperatorNames();
