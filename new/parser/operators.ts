import { Type } from "../numbers/types";
import { Token, TokenFunction, TokenNumber, TokenVar } from "../evaluator/token";
import { StringStream, checkChar } from "../utils/string_stream";
import { charmap } from "./charmap";
import { parseNumericToken } from "./number_token";

//Parse a valid operator name
function parseOperatorSymbol(stream: StringStream): string {
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
		stream.error("Invalid operator " + res);
	}
	return res;
}

function parseName(stream: StringStream): string {
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

//Function to parse an operaotr class
type operatorParser = (
	stream: StringStream,
	prec_class: number) => Token;

class PrecedenceClass {
	symbols: Map<string, string>; //symbol to useful name
	parser: operatorParser
}

function parsePrimitive(
	stream: StringStream,
	prec_class: number): Token {

	//Grammar:
	//Number, name or bracket.
	//If name followed by ( -> function

	let s: StringStream;

	//Parse as bracket
	s = stream.transaction();
	s.skipThrough();

	if(s.peek() == '(') {

		let res = parseExpression(s);
		s.skipThrough();
		if(s.peek() != ')') {
			s.error("Expected )");
		}
		s.skip();
		s.commit();

		return res;
	}

	//Parse as name
	s = stream.transaction();
	s.skipThrough();
	let name = parseName(s);
	if(name !== undefined) {
		//Name found, save progress
		s.commit();

		//Check for bracket
		s.skipThrough();

		if(s.peek() == '(') {
			let contents = parseList(s);
			s.skipThrough();
			if(s.peek() != ')') {
				s.error("Expected )");
			}
			s.skip();
			s.commit();

			return new TokenFunction(name, contents);
		} else {
			return new TokenVar(name);
		}
	}
	
	//Parse as number
	s = stream.transaction();
	s.skipThrough();
	let num = parseNumericToken(s);
	if(num !== undefined) return num;

	//Not understood.
	return undefined;
}

function parseOpBinaryL2R(
	stream: StringStream,
	prec_class: number): Token {
	
	//Grammar:
	//<wh>Prec(+1)<wh>[op(0)<wh>Prec(+1)]...
	stream.skipThrough();
	let leading = precedence[prec_class + 1].parser(stream, prec_class + 1);
	if(leading === undefined) {
		stream.error("Expected token found nothing");
	}
	let res = leading;

	while(true) {
		stream.skipThrough();
		let s = stream.transaction();
		let op = parseOperatorSymbol(s);
		//This level
		if(precedence[prec_class].symbols.has(op)) {
			let term = precedence[prec_class + 1].parser(s, prec_class + 1);
			if(term === undefined) {
				s.error("Binary " + op + " expected right argument, found nothing");
			}

			res = new TokenFunction(precedence[prec_class].symbols.get(op), [res, term]);

			s.commit();
		} else {
			break;
		}
	}

	return res;
}

function parseOpUnaryL(
	stream: StringStream,
	prec_class: number): Token {

	//Unary prefix operator
	//Grammar: [op(0)]+ token(+1)
	let s = stream.transaction();
	let op = parseOperatorSymbol(s);
	//This level
	if(precedence[prec_class].symbols.has(op)) {
		let term = precedence[prec_class].parser(stream, prec_class);
		if(term === undefined) {
			s.error("Unary " + op + " expected right argument, found nothing");
		}
		
		s.commit();
		return new TokenFunction(precedence[prec_class].symbols.get(op), [term]);
	} else {
		return precedence[prec_class + 1].parser(stream, prec_class + 1);
	}
}

const precedence: Array<PrecedenceClass> = [
	{
		symbols: new Map<string, string>([
			["+", "\\add"],
			["-", "\\sub"]]),
		parser: parseOpBinaryL2R
	},
	{
		symbols: new Map<string, string>([
			["*", "\\mul"],
			["/", "\\div"]]),
		parser: parseOpBinaryL2R
	},
	{
		symbols: new Map<string, string>([
			["+", "\\pos"],
			["-", "\\neg"]
		]),
		parser: parseOpUnaryL
	},
	{
		symbols: new Map<string, string>([]),
		parser: parsePrimitive
	}
];

const operators: Set<string> = new Set<string>();
precedence.forEach((p) => {
	p.symbols.forEach((symbol) => {
		operators.add(symbol);
	});
});

export function parseExpression(stream: StringStream): Token {
	stream.skipThrough();

	return precedence[0].parser(stream, 0);
}

//Grammar: expression? [, expression]+
function parseList(stream: StringStream): Array<Token> {
	let res: Array<Token> = new Array<Token>();

	stream.skipThrough();
	let exp = parseExpression(stream);
	if(exp === undefined) return res;
	
	res.push(exp);
	stream.skipThrough();
	while(stream.peek() == ',') {
		stream.skip();

		stream.skipThrough();
		let exp = parseExpression(stream);
		if(exp === undefined) {
			stream.error("Expected token after ,");
		}
		res.push(exp);
		stream.skipThrough();
	}

	return res;
}