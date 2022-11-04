import { parseExpression } from "../parser/operators";
import { StringStream } from "../utils/string_stream";
import { PrintTxt, PrintTex } from "../transformer/print";
import { Context } from "./context";

declare global {
    interface Window {
		parseExpression: any;
		StringStream: any;
		globalContext: any;
		PrintTxt: any;
		PrintTex: any;
	}
}

let new_ctx = new Context();

window.parseExpression = window.parseExpression || parseExpression;
window.StringStream = window.StringStream || StringStream;
window.globalContext = window.globalContext || new_ctx;
window.PrintTxt = window.PrintTxt || PrintTxt;
window.PrintTex = window.PrintTex || PrintTex;
window.name = "ASD";
console.log("Hello world");

window.document.body.appendChild(new_ctx.elem);