import { TypeNumber } from "../numbers/basic";
import { FunctionBuiltinAlgebra } from "./function";
import { Scope } from "./scope";

export const globalScope: Scope = new Scope();

globalScope.fns_public.set("\\add", new FunctionBuiltinAlgebra("add"));
globalScope.fns_public.set("\\pos", new FunctionBuiltinAlgebra("pos"));
globalScope.fns_public.set("\\sub", new FunctionBuiltinAlgebra("sub"));
globalScope.fns_public.set("\\neg", new FunctionBuiltinAlgebra("neg"));
globalScope.fns_public.set("\\mul", new FunctionBuiltinAlgebra("mul"));
globalScope.fns_public.set("\\div", new FunctionBuiltinAlgebra("div"));
globalScope.fns_public.set("sqrt", new FunctionBuiltinAlgebra("sqrt"));
globalScope.fns_public.set("\\pow", new FunctionBuiltinAlgebra("pow"));
globalScope.fns_public.set("ln", new FunctionBuiltinAlgebra("ln"));
globalScope.fns_public.set("log", new FunctionBuiltinAlgebra("log"));
globalScope.fns_public.set("log2", new FunctionBuiltinAlgebra("log2"));
globalScope.fns_public.set("log10", new FunctionBuiltinAlgebra("log10"));
globalScope.fns_public.set("sin", new FunctionBuiltinAlgebra("sin"));
globalScope.fns_public.set("cos", new FunctionBuiltinAlgebra("cos"));
globalScope.fns_public.set("tan", new FunctionBuiltinAlgebra("tan"));
globalScope.fns_public.set("asin", new FunctionBuiltinAlgebra("asin"));
globalScope.fns_public.set("acos", new FunctionBuiltinAlgebra("acos"));
globalScope.fns_public.set("atan", new FunctionBuiltinAlgebra("atan"));
globalScope.fns_public.set("ctg", new FunctionBuiltinAlgebra("ctg"));
globalScope.fns_public.set("sec", new FunctionBuiltinAlgebra("sec"));
globalScope.fns_public.set("csc", new FunctionBuiltinAlgebra("csc"));

globalScope.vars_public.set("E", new TypeNumber(Math.E));
globalScope.vars_public.set("pi", new TypeNumber(Math.PI));