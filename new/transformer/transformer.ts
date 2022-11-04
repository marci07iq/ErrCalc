import { Token } from "../evaluator/token";


export interface GenericTransformer<Out> {
    transform_tree(tree: Token): Out;
}

export type ExpressionTransformer = GenericTransformer<Token>;
export type PrinterTransformer = GenericTransformer<string>;