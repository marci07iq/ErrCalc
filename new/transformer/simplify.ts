import { Token, TokenFunction } from "../evaluator/token";
import { ExpressionTransformer } from "./transformer";


export class Simplify implements ExpressionTransformer {
    print_mode: boolean;

    constructor(print_mode: boolean) {
        this.print_mode = print_mode;
    }

    transform_tree(tree: Token) {
        if (tree instanceof TokenFunction) {
            if (tree.name == "\\div") {
                //Transmute (a/b)/c into a/(b*c)
                //Always active
                if (tree.args[0] instanceof TokenFunction) {
                    if (tree.args[0].name == "\\div") {
                        return new TokenFunction("\\div", [
                            tree.args[0].args[0].clone(this),
                            new TokenFunction("\\mul", [
                                tree.args[0].args[1].clone(this),
                                tree.args[1].clone(this)
                            ])
                        ]);
                    }
                }

                //Transmute a/(b/c) into (a*c)/b
                //Only active when not in print mode
                if(!this.print_mode) {
                    if (tree.args[1] instanceof TokenFunction) {
                        if (tree.args[1].name == "\\div") {
                            return new TokenFunction("\\div", [
                                new TokenFunction("\\mul", [
                                    tree.args[0].clone(this),
                                    tree.args[1].args[1].clone(this)
                                ]),
                                tree.args[1].args[0].clone(this)
                            ]);
                        }
                    }
                }
            }
        }

        return tree.clone(this);
    }
}