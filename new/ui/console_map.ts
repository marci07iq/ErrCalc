import { parseExpression } from "../parser/operators";
import { StringStream } from "../utils/string_stream";
import { globalScope } from "../evaluator/evaluator";

declare global {
    interface Window {
		parseExpression: any;
		StringStream: any;
		scope: any;
	}
}

window.onload = () => {
	window.parseExpression = window.parseExpression || parseExpression;
	window.StringStream = window.StringStream || StringStream;
	window.StringStream = window.StringStream || globalScope;
}

console.log("Hello world");