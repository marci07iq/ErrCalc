import { TypeNumber } from "../numbers/basic";
import { FunctionBuiltinAlgebra, FunctionBuiltinCompare } from "./function";
import { Scope } from "./scope";

export const globalScope: Scope = new Scope();

//Operators

globalScope.fns_public.set("\\add", new FunctionBuiltinAlgebra("\\add")); //a+b
globalScope.fns_public.set("\\pos", new FunctionBuiltinAlgebra("\\pos")); //+a
globalScope.fns_public.set("\\sub", new FunctionBuiltinAlgebra("\\sub")); //a-b
globalScope.fns_public.set("\\neg", new FunctionBuiltinAlgebra("\\neg")); //-a
globalScope.fns_public.set("\\mul", new FunctionBuiltinAlgebra("\\mul")); //a*b
globalScope.fns_public.set("\\div", new FunctionBuiltinAlgebra("\\div")); //a/b
globalScope.fns_public.set("\\mod", new FunctionBuiltinAlgebra("\\mod")); //a%b
globalScope.fns_public.set("\\pow", new FunctionBuiltinAlgebra("\\pow")); //a^b
globalScope.fns_public.set("\\idx", new FunctionBuiltinAlgebra("\\idx")); //a[b]

//Bitmasked. 1<, 2=, 4>
globalScope.fns_public.set("\\tco", new FunctionBuiltinAlgebra("\\tco")); //a<=>b Threeways comparison operator.
globalScope.fns_public.set("\\eq", new FunctionBuiltinCompare(2n));
globalScope.fns_public.set("\\nq", new FunctionBuiltinCompare(5n));
globalScope.fns_public.set("\\lt", new FunctionBuiltinCompare(1n));
globalScope.fns_public.set("\\gt", new FunctionBuiltinCompare(4n));
globalScope.fns_public.set("\\le", new FunctionBuiltinCompare(3n));
globalScope.fns_public.set("\\ge", new FunctionBuiltinCompare(6n));

//Builtin functions
//Powers
globalScope.fns_public.set("sqrt", new FunctionBuiltinAlgebra("sqrt"));
globalScope.fns_public.set("ln", new FunctionBuiltinAlgebra("ln"));
globalScope.fns_public.set("log", new FunctionBuiltinAlgebra("log"));
globalScope.fns_public.set("log2", new FunctionBuiltinAlgebra("log2"));
globalScope.fns_public.set("log10", new FunctionBuiltinAlgebra("log10"));
//Trigonometry
globalScope.fns_public.set("sin", new FunctionBuiltinAlgebra("sin"));
globalScope.fns_public.set("cos", new FunctionBuiltinAlgebra("cos"));
globalScope.fns_public.set("tan", new FunctionBuiltinAlgebra("tan"));
globalScope.fns_public.set("asin", new FunctionBuiltinAlgebra("asin"));
globalScope.fns_public.set("acos", new FunctionBuiltinAlgebra("acos"));
globalScope.fns_public.set("atan", new FunctionBuiltinAlgebra("atan"));
globalScope.fns_public.set("ctg", new FunctionBuiltinAlgebra("ctg"));
globalScope.fns_public.set("sec", new FunctionBuiltinAlgebra("sec"));
globalScope.fns_public.set("csc", new FunctionBuiltinAlgebra("csc"));
//Utilits
globalScope.fns_public.set("abs", new FunctionBuiltinAlgebra("abs"));
globalScope.fns_public.set("re", new FunctionBuiltinAlgebra("re"));
globalScope.fns_public.set("im", new FunctionBuiltinAlgebra("im"));

globalScope.vars_public.set("E", new TypeNumber(Math.E));
globalScope.vars_public.set("pi", new TypeNumber(Math.PI));