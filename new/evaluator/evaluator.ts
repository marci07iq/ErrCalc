import { TypeNumber } from "../numbers/basic";
import { FunctionBuiltinAlgebra, FunctionBuiltinCompare } from "./function";
import { Scope } from "./scope";

//Operators

export function createGlobalScope(): Scope {
    let scope: Scope = new Scope();

    scope.fns_public.set("\\add", new FunctionBuiltinAlgebra("\\add")); //a+b
    scope.fns_public.set("\\pos", new FunctionBuiltinAlgebra("\\pos")); //+a
    scope.fns_public.set("\\sub", new FunctionBuiltinAlgebra("\\sub")); //a-b
    scope.fns_public.set("\\neg", new FunctionBuiltinAlgebra("\\neg")); //-a
    scope.fns_public.set("\\mul", new FunctionBuiltinAlgebra("\\mul")); //a*b
    scope.fns_public.set("\\div", new FunctionBuiltinAlgebra("\\div")); //a/b
    scope.fns_public.set("\\mod", new FunctionBuiltinAlgebra("\\mod")); //a%b
    scope.fns_public.set("\\pow", new FunctionBuiltinAlgebra("\\pow")); //a^b
    scope.fns_public.set("\\idx", new FunctionBuiltinAlgebra("\\idx")); //a[b]

    //Bitmasked. 1<, 2=, 4>
    scope.fns_public.set("\\tco", new FunctionBuiltinAlgebra("\\tco")); //a<=>b Threeways comparison operator.
    scope.fns_public.set("\\eq", new FunctionBuiltinCompare(2n));
    scope.fns_public.set("\\nq", new FunctionBuiltinCompare(5n));
    scope.fns_public.set("\\lt", new FunctionBuiltinCompare(1n));
    scope.fns_public.set("\\gt", new FunctionBuiltinCompare(4n));
    scope.fns_public.set("\\le", new FunctionBuiltinCompare(3n));
    scope.fns_public.set("\\ge", new FunctionBuiltinCompare(6n));

    //Builtin functions
    //Powers
    scope.fns_public.set("sqrt", new FunctionBuiltinAlgebra("sqrt"));
    scope.fns_public.set("ln", new FunctionBuiltinAlgebra("ln"));
    scope.fns_public.set("log", new FunctionBuiltinAlgebra("log"));
    scope.fns_public.set("log2", new FunctionBuiltinAlgebra("log2"));
    scope.fns_public.set("log10", new FunctionBuiltinAlgebra("log10"));
    //Trigonometry
    scope.fns_public.set("sin", new FunctionBuiltinAlgebra("sin"));
    scope.fns_public.set("cos", new FunctionBuiltinAlgebra("cos"));
    scope.fns_public.set("tan", new FunctionBuiltinAlgebra("tan"));
    scope.fns_public.set("asin", new FunctionBuiltinAlgebra("asin"));
    scope.fns_public.set("acos", new FunctionBuiltinAlgebra("acos"));
    scope.fns_public.set("atan", new FunctionBuiltinAlgebra("atan"));
    scope.fns_public.set("ctg", new FunctionBuiltinAlgebra("ctg"));
    scope.fns_public.set("sec", new FunctionBuiltinAlgebra("sec"));
    scope.fns_public.set("csc", new FunctionBuiltinAlgebra("csc"));
    //Utilits
    scope.fns_public.set("abs", new FunctionBuiltinAlgebra("abs"));
    scope.fns_public.set("re", new FunctionBuiltinAlgebra("re"));
    scope.fns_public.set("im", new FunctionBuiltinAlgebra("im"));

    scope.vars_public.set("E", new TypeNumber(Math.E));
    scope.vars_public.set("pi", new TypeNumber(Math.PI));

    return scope;
};