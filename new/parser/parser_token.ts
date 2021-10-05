export enum OperatorInput {
	Unary,
	Binary
}

export enum OperatorAssociativity {
	Left,
	Right
}

export interface Operator {
	input: OperatorInput;
	assoc: OperatorAssociativity;
}

export enum TokenType {
	Operator,
	Value
}

export interface Token {
	type: TokenType;
	evaluate: (scope: Scope) => Value;
};