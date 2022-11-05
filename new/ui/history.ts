import { createGlobalScope } from "../evaluator/evaluator";
import { Token } from "../evaluator/token";
import { Type } from "../numbers/types";
import { TypeValue } from "../numbers/unit";
import { PrintTex } from "../transformer/print";
import { Simplify } from "../transformer/simplify";
import { createElem } from "../utils/dom";

const katex = require('katex');

//import { parse, HtmlGenerator } from 'latex.js'

//declare var katex;

export interface QueryOutput {
    elem: HTMLElement;
}


class QueryOutputLatex implements QueryOutput {
    latex_src: string;
    elem: HTMLElement;

    constructor(latex_src: string) {
        this.latex_src = latex_src;
        

        /*let generator = new HtmlGenerator({ hyphenate: false });
        let parsed = parse(this.latex_src, { generator: generator });
    
        this.elem = createElem("div", ["output-tex"], undefined, undefined, [parsed.domFragment()]);*/

        katex.render(this.latex_src, this.elem = createElem("div", ["output-tex"]), {
            throwOnError: false
        });
    }
}

export class QueryOutputTree extends QueryOutputLatex {
    latex_src: string;
    elem: HTMLElement;

    constructor(tree: Token) {
        //Simplify common formats
        let tree2 = new Simplify(true).transform_tree(tree);
        //Transform to latex
        let latex_src = new PrintTex().transform_tree(tree2);
        
        super(latex_src);
    }
}

export class QueryOutputValue extends QueryOutputLatex {
    latex_src: string;
    elem: HTMLElement;

    constructor(value: Type) {
        super(value.print_tex());
    }
}


export class QueryOutputError implements QueryOutput {
    text: string;
    elem: HTMLElement;

    constructor(text: string) {
        this.text = text;

        this.elem = createElem("div", ["output-error"], undefined, this.text);
    }
}

export class QueryHistoryItem {
    input: string;

    outputs: Array<QueryOutput>;

    elem: HTMLElement;

    constructor(input: string, outputs: Array<QueryOutput>) {
        this.input = input;
        this.outputs = outputs;

        this.elem = createElem("div", ["history-item"], undefined, undefined, [
            createElem("div", ["history-item-query"], undefined, this.input),
            ...this.outputs.map((val) => val.elem)
        ]);
    }
};

export class QueryHistory {
    items: Array<QueryHistoryItem>;
    elem: HTMLElement;

    cursor: number;

    constructor() {
        this.cursor = -1;

        this.items = new Array<QueryHistoryItem>();

        this.elem = createElem("div", ["history"]);
    }

    addItem(item: QueryHistoryItem) {
        this.items.push(item);
        this.elem.appendChild(item.elem);
        this.cursorReset();
    }

    getCursor(): number {
        return this.cursor;
    }

    cursorSet(val: number) {
        if(this.cursor != -1) {
            this.items[this.cursor].elem.classList.remove("history-active");
        }
        this.cursor = val;
        if(this.cursor != -1) {
            this.items[this.cursor].elem.classList.add("history-active");
        }
    }

    cursorReset() {
        this.cursorSet(-1);
    }

    cursorUp(): number {
        if(this.cursor == -1) {
            this.cursorSet(this.items.length - 1);
        } else {
            this.cursorSet(Math.max(0, this.cursor - 1));
        }
        return this.cursor;
    }

    cursorDown(): number {
        if(this.cursor == -1) {
            
        } else {
            let newcursor = this.cursor + 1;
            if(0 <= newcursor && newcursor < this.items.length) {
                this.cursorSet(this.cursor);
            } else {
                this.cursorSet(-1);
            }
        }
        return this.cursor;
    }
}