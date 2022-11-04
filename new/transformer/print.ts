import { Token, TokenFunction, TokenNumber, TokenVar } from "../evaluator/token";
import { PrinterTransformer } from "./transformer";

interface printer_fn {
    (op: string, args: Array<string>): string;
}


const printer_txt_ops_bin: Map<string, string> = new Map<string, string>([
    ["\\add", "+"],
    ["\\sub", "-"],
    ["\\mul", "*"],
    ["\\div", "/"],
    ["\\mod", "%"],
    ["\\pow", "^"],

    ["\\tco", "<=>"],
    ["\\eq", "=="],
    ["\\nq", "!="],
    ["\\lt", "<"],
    ["\\gt", ">"],
    ["\\le", "<="],
    ["\\ge", ">="]
]);

const printer_txt_ops_pre: Map<string, string> = new Map<string, string>([
    ["\\pos", "+"],
    ["\\neg", "-"]
]);

const printer_txt_ops_post: Map<string, string> = new Map<string, string>([
    
]);

const printer_txt_precedences: Map<string, Array<number>> = new Map<string, Array<number>>([
    //0 all compare operators will be fully bracketed
    ["\\tco", [0, 7, 7]],
    ["\\eq", [0, 7, 7]],
    ["\\nq", [0, 7, 7]],
    ["\\lt", [0, 7, 7]],
    ["\\gt", [0, 7, 7]],
    ["\\le", [0, 7, 7]],
    ["\\ge", [0, 7, 7]],
    //7 add only brackets compare
    ["\\add", [7, 7, 7]],
    //8 sub brackets sub if its a-(b-c)
    ["\\sub", [8, 7, 9]],
    //9 mul only brackets sub/lower
    ["\\mul", [7, 9, 9]],
    //10 div, mod brackets rhs if its another div/mod
    ["\\div", [10, 9, 11]],
    ["\\mod", [11, 9, 11]],
    //12 pow brackets LHS if its another pow
    ["\\pow", [12, 13, 12]],
    //13 
    ["\\pos", [13, 13]],
    ["\\neg", [14, 13]]
    //15
]);

export class PrintTxt implements PrinterTransformer {

    printer_txt_bracket(arg: string): string {
        return "(" + arg + ")";
    }
    printer_txt_index(args: Array<string>): string {
        return args[0] + "[" + args[1] + "]";
    }
    printer_txt_binary(op: string, args: Array<string>): string {
        return args[0] + op + args[1];
    }
    printer_txt_pref(op: string, args: Array<string>): string {
        return op + args[0];
    }
    printer_txt_post(op: string, args: Array<string>): string {
        return args[0] + op;
    }
    printer_txt_fn(op: string, args: Array<string>): string {
        const printer_txt_sfns: Map<string, string> = new Map<string, string>([
            
        ]);
    
        if(printer_txt_sfns.has(op)) {
            op = printer_txt_sfns.get(op)!;
        }
    
        return op + "(" + args.join(", ") + ")";
    }
    printer_txt(op: string, args: Array<string>): string {
        if(op == "\\idx") {
            return this.printer_txt_index(args);
        }
        if(printer_txt_ops_bin.has(op)) {
            return this.printer_txt_binary(printer_txt_ops_bin.get(op)!, args);
        }
        if(printer_txt_ops_pre.has(op)) {
            return this.printer_txt_pref(printer_txt_ops_bin.get(op)!, args);
        }
        if(printer_txt_ops_post.has(op)) {
            return this.printer_txt_post(printer_txt_ops_bin.get(op)!, args);
        }
        return this.printer_txt_fn(op, args);
    }

    constructor() {
    }

    transform_tree(tree: Token): string {
        if(tree instanceof TokenNumber) {
            return tree.print_txt();
        }
        if(tree instanceof TokenVar) {
            return tree.print_txt();
        }
        if(tree instanceof TokenFunction) {
            let str_args: Array<string> = tree.args.map((arg, idx) => {
                let res = this.transform_tree(arg);

                if(arg instanceof TokenFunction) {
                    if(printer_txt_precedences.has(arg.name) && printer_txt_precedences.has(tree.name)) {
                        if(printer_txt_precedences.get(arg.name)![0] < printer_txt_precedences.get(tree.name)![idx + 1]) {
                            res = this.printer_txt_bracket(res);
                        }
                    }
                }

                return res;
            });

            return this.printer_txt(tree.name, str_args);
        }
        throw "Unknown token type";
    }
}



const printer_tex_sfns: Map<string, string> = new Map<string, string>([
    ["ln", "\\ln"],
    ["sin", "\\sin"],
    ["cos", "\\cos"],
    ["tan", "\\tan"],
    ["asin", "\\asin"],
    ["acos", "\\acos"],
    ["atan", "\\atan"],
    ["ctg", "\\ctg"],
    ["sec", "\\sec"],
    ["csc", "\\csc"],
    ["re", "\\mathrm{Re}"],
    ["im", "\\mathrm{Im}"],
]);

const printer_tex_ops_bin: Map<string, string> = new Map<string, string>([
    ["\\add", "+"],
    ["\\sub", "-"],
    ["\\mul", "\\cdot"],
    ["\\div", "/"],
    ["\\mod", "\\%"],
    ["\\pow", "^"],

    ["\\tco", "\\stackrel{?}{=}"],
    ["\\eq", "="],
    ["\\nq", "\\neq"],
    ["\\lt", "<"],
    ["\\gt", ">"],
    ["\\le", "\\le"],
    ["\\ge", "\\ge"]
]);

const printer_tex_ops_pre: Map<string, string> = new Map<string, string>([
    ["\\pos", "+"],
    ["\\neg", "-"]
]);

const printer_tex_ops_post: Map<string, string> = new Map<string, string>([
    
]);

const printer_tex_precedences: Map<string, Array<number>> = printer_txt_precedences;

export class PrintTex implements PrinterTransformer {
    div_nesting: number = 0;

    printer_tex_bracket(arg: string): string {
        return "\\left(" + arg + "\\right)";
    }
    printer_tex_index(args: Array<string>): string {
        return args[0] + "\\left[" + args[1] + "\\right]";
    }
    printer_tex_binary(op: string, args: Array<string>): string {
        return "{" + args[0] + "}" + op + "{" + args[1] + "}";
    }
    printer_tex_div(args: Array<string>): string {
        return "\\frac{" + args[0] + "}{" + args[1] + "}";
    }
    printer_tex_pref(op: string, args: Array<string>): string {
        return op + "{" + args[0] + "}";
    }
    printer_tex_post(op: string, args: Array<string>): string {
        return "{" + args[0] + "}" + op;
    }
    printer_tex_log_helper(arg: string, base?: string): string {
        if (base) {
            return "\\log_{" + base + "} \\left(" + arg + "\\right)";
        } else {
            return "\\log \\left(" + arg + "\\right)";
        }
    }
    printer_tex_log(args: Array<string>): string {
        if (args.length > 1) {
            return this.printer_tex_log_helper(args[0], args[1]);
        } else {
            return this.printer_tex_log_helper(args[0]);
        }
    }
    printer_tex_log2(args: Array<string>): string {    
        return this.printer_tex_log_helper(args[0], "2");
    }
    printer_tex_log10(args: Array<string>): string {    
        return this.printer_tex_log_helper(args[0], "10");
    }
    printer_tex_sqrt(args: Array<string>): string {
        return "\\sqrt{" + args[0] + "}";
    }
    printer_tex_fn(op: string, args: Array<string>): string {
        
    
        if(printer_tex_sfns.has(op)) {
            op = printer_tex_sfns.get(op)!;
        }
        return op + "\\left(" + args.join(", ") + "\\right)";
    }
    printer_tex(op: string, args: Array<string>): string {
        if(op == "\\idx") {
            return this.printer_tex_index(args);
        }
        if(op == "\\div" && this.div_nesting == 0) {
            return this.printer_tex_div(args);
        }
        if(printer_tex_ops_bin.has(op)) {
            return this.printer_tex_binary(printer_tex_ops_bin.get(op)!, args);
        }
        if(printer_tex_ops_pre.has(op)) {
            return this.printer_tex_pref(printer_tex_ops_bin.get(op)!, args);
        }
        if(printer_tex_ops_post.has(op)) {
            return this.printer_tex_post(printer_tex_ops_bin.get(op)!, args);
        }
        if(op == "sqrt") {
            return this.printer_tex_sqrt(args);
        }
        if(op == "log") {
            return this.printer_tex_log(args);
        }
        if(op == "log2") {
            return this.printer_tex_log2(args);
        }
        if(op == "log10") {
            return this.printer_tex_log10(args);
        }
        return this.printer_tex_fn(op, args);
    }

    constructor() {
    }

    transform_tree(tree: Token): string {
        if(tree instanceof TokenNumber) {
            return tree.print_tex();
        }
        if(tree instanceof TokenVar) {
            return tree.print_tex();
        }
        if(tree instanceof TokenFunction) {
            let old_nest = this.div_nesting;
            if(tree.name == "\\div") {
                this.div_nesting+=1;
            }

            let str_args: Array<string> = tree.args.map((arg, idx) => {
                let res = this.transform_tree(arg);

                if(arg instanceof TokenFunction) {
                    if(printer_tex_precedences.has(arg.name) && printer_tex_precedences.has(tree.name)) {
                        if(printer_tex_precedences.get(arg.name)![0] < printer_tex_precedences.get(tree.name)![idx + 1]) {
                            res = this.printer_tex_bracket(res);
                        }
                    }
                }

                return res;
            });

            this.div_nesting = old_nest;        
            
            return this.printer_tex(tree.name, str_args);
        }
        throw "Unknown token type";
    }
}