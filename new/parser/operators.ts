import { Type } from "../numbers/types";
import { Token, TokenFunction, TokenVar } from "../evaluator/token";
import { StringStream, checkChar } from "../utils/string_stream";
import { charmap } from "./charmap";
import { parseNumericToken } from "./number";

//Parse a valid operator name
function parseOperatorSymbol(stream: StringStream): string | undefined {
	let res = "";
	let good = false;
	//While valid operator char
	while (checkChar(stream.peek(), charmap.operator)) {
		let newres = res + stream.peek();
		let newgood = operators.has(newres);
		//End of valid operator name (eg ! is valid but !! isnt)
		if (good && !newgood) {
			break;
		}
		stream.skip();
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

function parseName(stream: StringStream): string | undefined {
	let res = "";
	//While valid operator char
	if (checkChar(stream.peek(), charmap.name_start)) {
		while (checkChar(stream.peek(), charmap.name_mid)) {
			res = res + stream.get();
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
	prec_class: number) => Token | undefined;

class PrecedenceClass {
	symbols: Map<string, string>; //symbol to useful name
	parser: operatorParser
}

function parsePrimitive(
	stream: StringStream,
	prec_class: number): Token | undefined {

	//Grammar:
	//number or {name (<expression>)? [<expression>]*}
	//If name followed by ( -> function

	let s: StringStream;

	//Parse as bracket
	s = stream.transaction();
	s.skipThrough();

	if(s.peek() == '(') {
		s.skip();
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

		let res : TokenFunction | TokenVar;

		if(s.peek() == '(') {
			s.skip();
			let contents = parseList(s);
			s.skipThrough();
			if(s.peek() != ')') {
				s.error("Expected )");
			}
			s.skip();
			s.commit();

			res = new TokenFunction(name, contents);
		} else {
			res = new TokenVar(name);
		}
		//Apply array indices
		while(s.peek() == '[') {
			s.skip();
			let content = parseExpression(s);
			if(content == undefined) {
				s.error("Expected token in []");
				return;
			}
			s.skipThrough();
			if(s.peek() != ']') {
				s.error("Expected ]");
			}
			s.skip();
			s.commit();

			res = new TokenFunction("\\idx", [res, content]);
		}

		return res;
	}
	
	//Parse as number
	s = stream.transaction();
	s.skipThrough();
	let num = parseNumericToken(s);
	if(num !== undefined) {
		s.commit();
		return num;
	}

	//Not understood.
	return undefined;
}

function parseOpBinaryNochain(
	stream: StringStream,
	prec_class: number): Token | undefined {
	
	//Grammar:
	//<wh>Prec(+1)<wh>[op(0)<wh>Prec(+1)]...
	stream.skipThrough();
	let leading = precedence[prec_class + 1].parser(stream, prec_class + 1);
	if(leading === undefined) {
		stream.error("Expected token found nothing");
		return;
	}
	let res = leading;

	let first = true;

	while(true) {
		stream.skipThrough();
		let s = stream.transaction();
		let op = parseOperatorSymbol(s);
		//This level
		if(op !== undefined && precedence[prec_class].symbols.has(op)) {
			if(!first) {
				s.error("Unable to chain operators " + Array.from(precedence[prec_class].symbols.keys()).join(", "));
			}
			first = false;
			let term = precedence[prec_class + 1].parser(s, prec_class + 1);
			if(term === undefined) {
				s.error("Binary " + op + " expected right argument, found nothing");
				return;
			}

			let op_fn = precedence[prec_class].symbols.get(op);
			if(op_fn === undefined) {
				s.error("Impossible error: Parsed unknown operator " + op);
				return;
			}
			res = new TokenFunction(op_fn, [res, term]);

			s.commit();
		} else {
			break;
		}
	}

	return res;
}

function parseOpBinaryL2R(
	stream: StringStream,
	prec_class: number): Token | undefined {
	
	//Grammar:
	//<wh>Prec(+1)<wh>[op(0)<wh>Prec(+1)]...
	stream.skipThrough();
	let leading = precedence[prec_class + 1].parser(stream, prec_class + 1);
	if(leading === undefined) {
		stream.error("Expected token found nothing");
		return;
	}
	let res = leading;

	while(true) {
		stream.skipThrough();
		let s = stream.transaction();
		let op = parseOperatorSymbol(s);
		//This level
		if(op !== undefined && precedence[prec_class].symbols.has(op)) {
			let term = precedence[prec_class + 1].parser(s, prec_class + 1);
			if(term === undefined) {
				s.error("Binary " + op + " expected right argument, found nothing");
				return;
			}

			let op_fn = precedence[prec_class].symbols.get(op);
			if(op_fn === undefined) {
				s.error("Impossible error: Parsed unknown operator " + op);
				return;
			}
			res = new TokenFunction(op_fn, [res, term]);

			s.commit();
		} else {
			break;
		}
	}

	return res;
}

function parseOpBinaryR2L(
	stream: StringStream,
	prec_class: number): Token | undefined {
	
	//Grammar:
	//<wh>Prec(+1)<wh>[op(0)<wh>Prec(+1)]...
	stream.skipThrough();
	let leading = precedence[prec_class + 1].parser(stream, prec_class + 1);
	if(leading === undefined) {
		stream.error("Expected token found nothing");
		return;
	}
	let res = leading;

	stream.skipThrough();
	let s = stream.transaction();
	let op = parseOperatorSymbol(s);
	//This level
	if(op !== undefined &&precedence[prec_class].symbols.has(op)) {
		//Parse RHS with self
		let term = precedence[prec_class].parser(s, prec_class);
		if(term === undefined) {
			s.error("Binary " + op + " expected right argument, found nothing");
			return;
		}

		let op_fn = precedence[prec_class].symbols.get(op);
		if(op_fn === undefined) {
			s.error("Impossible error: Parsed unknown operator " + op);
			return;
		}
		res = new TokenFunction(op_fn, [res, term]);

		s.commit();
	}

	return res;
}

function parseOpUnaryL(
	stream: StringStream,
	prec_class: number): Token | undefined {

	//Unary prefix operator
	//Grammar: [op(0)]+ token(+1)
	let s = stream.transaction();
	s.skipThrough();
	let op = parseOperatorSymbol(s);
	//This level
	if(op !== undefined && precedence[prec_class].symbols.has(op)) {
		let term = precedence[prec_class].parser(s, prec_class);
		if(term === undefined) {
			s.error("Unary " + op + " expected right argument, found nothing");
			return;
		}
		
		s.commit();

		let op_fn = precedence[prec_class].symbols.get(op);
		if(op_fn === undefined) {
			s.error("Impossible error: Parsed unknown operator " + op);
			return;
		}

		return new TokenFunction(op_fn, [term]);
	} else {
		return precedence[prec_class + 1].parser(stream, prec_class + 1);
	}
}

const precedence: Array<PrecedenceClass> = [
	{
		symbols: new Map<string, string>([
			["||", "\\lor"]]),
		parser: parseOpBinaryL2R
	},
	{
		symbols: new Map<string, string>([
			["&&", "\\lan"]]),
		parser: parseOpBinaryL2R
	},
	{
		symbols: new Map<string, string>([
			["==", "\\eq"],
			["!=", "\\nq"],
			["<", "\\lt"],
			[">", "\\gt"],
			["<=", "\\le"],
			[">=", "\\ge"],
			["<=>", "\\tco"]]),
		parser: parseOpBinaryNochain
	},
	{
		symbols: new Map<string, string>([
			["+", "\\add"],
			["-", "\\sub"]]),
		parser: parseOpBinaryL2R
	},
	{
		symbols: new Map<string, string>([
			["*", "\\mul"],
			["/", "\\div"],
			["%", "\\mod"]]),
		parser: parseOpBinaryL2R
	},
	{
		symbols: new Map<string, string>([
			["^", "\\pow"]]),
		parser: parseOpBinaryR2L
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
precedence.forEach((prec_class) => {
	for (const [key, value] of prec_class.symbols.entries()) {
		operators.add(key);
	}
})


export function parseExpression(stream: StringStream): Token | undefined {
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
			return new Array<Token>();
		}
		res.push(exp);
		stream.skipThrough();
	}

	return res;
}