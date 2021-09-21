# Error Calculator

An interpreter-console style calculator with Gaussian error propagation, variables, functions, SI units and dimension checking.

# How to use

Type your expression to calculate, and hit enter to evaluate.

Type `/help` to get a list of commands.

## Syntax

### Numbers

- Scientific exponential notation supported, e.g. 5.32e-2 meaning 0.0532
- - Note: Non-integer exponents supported. I dont know why you wound want that.

- Numbers with error: `value#error` or `value#percenterror%`
- - Eg. `10#1` and `10#10%` both mean `10 ± 1`
- - Note: The Unicode symbol ± is also accepted instead of `#`

### Units

- Append unit name at the end of number. SI prefixes supported.
- Eg. `1e3mohm` (1 Ohm) or `180deg` (Pi)
- Warning: Currently adding units and errors to the same number is undefined behaviour. Please multiply your number with error and `1unit` for best results.

### Operators

- `+,-,*,/`: Trivial meanings
- Power operator: `^`

### Angles

- Angle: Trig functions are in radians. Use the `deg` unit to convert.
- - Eg. `sin 90deg` (is 1)

### Unary functions

- Brackets may be omited, simply use `sqrt 4` for simple tasks
- For complex calculations brackets recommended
- Unicode symbol √ can be used instead of sqrt

### Pre-defined names

- Constants are arranged into literal packs.
- - `\packs` to list known packs
- - `\load <name>` to load it
- `\listunits` to list known units
- `\listfns` to list known functions

### Definitions

- To define a new value (evaluated immediately): `:name = expression`
- To define a new function (evaluated when called): `:name(arg1,arg2) = expression`
- - Warning: Do not add spaces where not shown above (for now)