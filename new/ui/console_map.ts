import { parseExpression } from "../parser/operators";
import { StringStream } from "../utils/string_stream";
import { globalScope } from "../evaluator/evaluator";

declare global {
    interface Window {
		parseExpression: any;
		StringStream: any;
		globalScope: any;
	}
}

window.parseExpression = window.parseExpression || parseExpression;
window.StringStream = window.StringStream || StringStream;
window.globalScope = window.globalScope || globalScope;
window.name = "ASD";
console.log("Hello world");
