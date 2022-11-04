import { createGlobalScope } from "../evaluator/evaluator";
import { Scope } from "../evaluator/scope";
import { Token } from "../evaluator/token";
import { Type } from "../numbers/types";
import { parseExpression } from "../parser/operators";
import { ParserError } from "../parser/parser_error";
import { createElem } from "../utils/dom";
import { StringStream } from "../utils/string_stream";
import { QueryHistory, QueryHistoryItem, QueryOutputTree, QueryOutputValue, QueryOutputError, QueryOutput } from "./history";

export class Context {
    history: QueryHistory;

    scope: Scope;

    elem_input: HTMLInputElement;
    elem: HTMLElement;

    constructor() {
        this.scope = createGlobalScope();

        this.history = new QueryHistory();

        this.elem = createElem("div", ["context"], undefined, undefined, [
            this.history.elem,
            this.elem_input = createElem("input", ["console"]) as HTMLInputElement
        ]);

        this.elem_input.onkeydown = (ev) => {
            if(ev.key == "Enter") {
                this.evaluate();
            }
        }
    }

    evaluate() {
        let text = this.elem_input.value;
        this.elem_input.value = "";

        let outputs = new Array<QueryOutput>();

        (() => {
            let tree: Token | undefined = undefined;

            //Parse
            try {
                tree = parseExpression(new StringStream(text));
                if(tree === undefined) throw new Error("Parse failed, unknown error");
            } catch (e) {
                if(e instanceof Error) {
                    outputs.push(new QueryOutputError(e.message));
                } else {
                    outputs.push(new QueryOutputError("Unknown parser error"));
                    console.error(e);
                }
                return;
            }

            outputs.push(new QueryOutputTree(tree));

            let res: Type;
            try {
                res = tree.evaluate(this.scope);
            } catch (e) {
                if(e instanceof Error) {
                    outputs.push(new QueryOutputError(e.message));
                } else {
                    outputs.push(new QueryOutputError("Unknown evaluation error"));
                    console.error(e);
                }
                return;
            }

            outputs.push(new QueryOutputValue(res));
        })();
        
        this.history.addItem(new QueryHistoryItem(text, outputs));
    }
}