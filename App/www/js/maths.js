//BASICS

var TokenTypes = Object.freeze({ "operator": 0, "object": 1 });

if (!String.prototype.splice) {
    /**
     * {JSDoc}
     *
     * The splice() method changes the content of a string by removing a range of
     * characters and/or adding new characters.
     *
     * @this {String}
     * @param {number} start Index at which to start changing the string.
     * @param {number} delCount An integer indicating the number of old chars to remove.
     * @param {string} newSubStr The String that is spliced in.
     * @return {string} A new string with the spliced substring.
     */
    String.prototype.splice = function(start, delCount, newSubStr) {
        return this.slice(0, start) + newSubStr + this.slice(start + Math.abs(delCount));
    };
}

function printNumber(num, exponent, lastdigitexponent) {
    /*num /= Math.pow(10., exponent);
    lastdigitexponent -= exponent;
    lastdigitnum = Math.pow(10., lastdigitexponent)
    numint = Math.round(num / lastdigitnum);
    numstr = numint.toString(10);
    numstr = numstr.splice(numstr.length + lastdigitexponent, 0, ".");
    return numstr;*/
    let digits = exponent - lastdigitexponent;
    if (digits < 1) {
        digits = 1;
    }
    return num.toExponential(digits);
}

function skipWhitespaces(str, i) {
    while (i < str.length && str[i] == " ") { //
        ++i;
    }
    return i;
}

function readNum(str, i, enableE = true, enableUnits = false) {
    i = skipWhitespaces(str, i); //skip leading whitespace
    var valSign = 1;
    var frac = 0.1;
    var val = 0;

    while (i < str.length && ('-' == str[i] || str[i] <= '+')) { //flip sign
        if (str[i] == '-') {
            valSign *= -1;
        }
        ++i;
    }

    while (i < str.length && '0' <= str[i] && str[i] <= '9') { //read main part
        val *= 10;
        val += (str[i] - '0');
        ++i;
    }

    if (i < str.length && '.' == str[i]) { //has fractional part
        ++i;
        while (i < str.length && '0' <= str[i] && str[i] <= '9') {
            val += frac * (str[i] - '0');
            frac /= 10.0;
            ++i;
        }
    }

    let savei = i;

    if (i < str.length && 'e' == str[i] && enableE) { //has e part
        var epart;
        ++i;
        [i, epart] = readNum(str, i, false, false);

        val *= Math.pow(10, epart);
    }

    let theunit = units["1"];

    if (enableUnits) {
        //Only found a single e
        if (i <= savei + 1) {
            i = savei;
        }

        savei = i;

        [i, unitname] = readUnit(str, i);

        if (i > savei) {
            let foundUnit = false;

            for (let j = 0; j < unitname.length; j++) {
                prefix = unitname.substr(0, j);
                siname = unitname.substr(j, unitname.length - j);
                if (prefix in prefixes && siname in units) {
                    theunit = units[siname];
                    val *= prefixes[prefix];
                    //Found valid match.
                    foundUnit = true;
                }
            }

            if (!foundUnit) {
                throw Error("Unit name " + unitname + " not recognized");
            }
        }
    }

    return [i, val * valSign * theunit[0], theunit[1]];
}

function isLiteral(c, internal = false) {
    //Literals cant contain operator characters
    if (isOperator(c)) return false;
    if (c == "#") return false;
    if (c == "(" || c == ")") return false;
    if (c == " ") return false;
    //All other characters are permitted inside
    if (internal) return true;
    //All but numbers are ok to start with
    return (c < '0' || '9' < c);
}

function isOperator(c) {
    return (c in operators);
}

//UNITS

function sameUnit(a, b) {
    for (let i = 0; i < 7; i++) {
        if (Math.abs(a[i] - b[i]) > 1e-6) {
            return false;
        }
    }
    return true;
}

function noUnit(a) {
    return sameUnit(a, units["1"][1]);
}

function multUnit(a, b) {
    res = Array(7);
    for (let i = 0; i < 7; i++) {
        res[i] = a[i] + b[i];
    }
    return res;
}

function divUnit(a, b) {
    res = Array(7);
    for (let i = 0; i < 7; i++) {
        res[i] = a[i] - b[i];
    }
    return res;
}

function expUnit(a, pow) {
    res = Array(7);
    for (let i = 0; i < 7; i++) {
        res[i] = a[i] * pow;
    }
    return res;
}

var units = {
    //Unit
    "1": [1, [0, 0, 0, 0, 0, 0, 0]],
    "deg": [3.1415926535897932 / 180.0, [0, 0, 0, 0, 0, 0, 0]],
    //SI base units
    //"kg": [1,[1,0,0,0,0,0,0]],
    "g": [1e-3, [1, 0, 0, 0, 0, 0, 0]],
    "m": [1, [0, 1, 0, 0, 0, 0, 0]],
    "s": [1, [0, 0, 1, 0, 0, 0, 0]],
    "A": [1, [0, 0, 0, 1, 0, 0, 0]],
    "K": [1, [0, 0, 0, 0, 1, 0, 0]],
    "cd": [1, [0, 0, 0, 0, 0, 1, 0]],
    "mol": [1, [0, 0, 0, 0, 0, 0, 1]],
    //Mechanics
    "N": [1, [1, 1, -2, 0, 0, 0, 0]],
    "J": [1, [1, 2, -2, 0, 0, 0, 0]],
    "W": [1, [1, 2, -3, 0, 0, 0, 0]],
    //EM
    "C": [1, [0, 0, 1, 1, 0, 0, 0]],
    "T": [1, [1, 0, -2, -1, 0, 0, 0]],
    //Electricity
    "ohm": [1, [1, 2, -3, -2, 0, 0, 0]],
    "V": [1, [1, 2, -3, -1, 0, 0, 0]],
    "F": [1, [-1, -2, 4, 2, 0, 0, 0]],
    "H": [1, [1, 2, -2, -2, 0, 0, 0]],
    //Particle physics
    "eV": [1.60217662e-19, [1, 2, -2, 0, 0, 0, 0]],
    "u": [1.66053906660e-27, [1, 0, 0, 0, 0, 0, 0]],
    //Particle
    "b": [1e-28, [0, 2, 0, 0, 0, 0, 0]],
};

var prefixes = {
    "f": 1e-15,
    "p": 1e-12,
    "n": 1e-9,
    "u": 1e-6,
    "\u03BC": 1e-6,
    "m": 1e-3,
    "c": 1e-2,
    "d": 1e-1,
    "": 1,
    "k": 1e3,
    "M": 1e6,
    "G": 1e9,
    "T": 1e12,
    "P": 1e15,
};

//VALUES

class Value {
    constructor(val = 0, err = 0, unit = units["1"][1]) {
        this._val = val;
        this._err = Math.abs(err);
        this._unit = unit;
        this._type = TokenTypes.object;
    }
    stringUnit() {
        let unitnames = ["kg", "m", "s", "A", "K", "cd", "mol"];
        let res = "";
        for (let i = 0; i < 7; i++) {
            if (Math.abs(this._unit[i]) > 1e-6) {
                res += " " + unitnames[i] + "^" + this._unit[i];
            }
        }
        return res;
    }
    stringAbs() {
        let exponent = (this._val != 0) ? Math.floor(0.01 + Math.log(this._val) / Math.log(10)) : 0;
        let errexponent = (this._err != 0) ? (Math.floor(0.01 + Math.log(this._err) / Math.log(10)) - 2) : (exponent - 9);
        if (Math.abs(exponent) < 6) {
            exponent = 0;
        }
        //return ((exponent == 0) ? "" : ("(")) + printNumber(this._val, exponent, errexponent) + " \u00B1 " + printNumber(this._err, exponent, errexponent) + ((exponent == 0) ? "" : (") e" + exponent)) + this.stringUnit();
        return printNumber(this._val, exponent, errexponent) + " \u00B1 " + printNumber(this._err, exponent, exponent - 1) + this.stringUnit();
    }
    stringPerc() {
        return this.stringAbs(); //TUDO
    }

    fromAbs(val, err, unit = units["1"][0]) {
        this._val = val;
        this._err = err;
        this._unit = unit;
    }
    fromPerc(val, perc, unit = units["1"][0]) {
        this._val = val;
        this._err = perc / 100.0 * val;
        this._unit = unit;
    }
    getValue(context = undefined) {
        return this;
    }
}

function readVal(str, i) {
    var main = 0;
    var err = 0;
    var v = new Value();

    i = skipWhitespaces(str, i);

    [i, main, unit] = readNum(str, i, true, true);
    if (i < str.length && ('#' == str[i] || '\u00B1' == str[i])) { //has error
        [i, err] = readNum(str, i + 1, true, false);
        if (i < str.length && '%' == str[i]) {
            ++i;
            v.fromPerc(main, err, unit);
        } else {
            v.fromAbs(main, err, unit);
        }
    } else {
        v.fromAbs(main, err, unit);
    }
    return [i, v];
}

//LITERALS

var init_literals = {
    "pi": new Value(3.1415926535897932, 0, [0, 0, 0, 0, 0, 0, 0]),
    "\u03C0": new Value(3.1415926535897932, 0, [0, 0, 0, 0, 0, 0, 0]),
    "E": new Value(2.71828182845904523536, 0, [0, 0, 0, 0, 0, 0, 0])
};

var literal_packs = {
    "physics": {
        "c": new Value(299792458, 0, [0, 1, -1, 0, 0, 0, 0]),
        "h": new Value(6.62607004e-34, 0, [1, 2, -1, 0, 0, 0, 0]),
        "hbar": new Value(1.054571817e-34, 0, [1, 2, -1, 0, 0, 0, 0]),
        "kb": new Value(1.38064852e-23, 0, [1, 2, -2, 0, -1, 0, 0]),
        "G": new Value(6.67408e-11, 0, [-1, 3, -2, 0, 0, 0, 0]),
        "k": new Value(8987551788.7, 0, [1, 3, -4, -2, 0, 0, 0]),
        "e0": new Value(8.8541878128e-12, 0, [-1, -3, 4, 2, 0, 0, 0]),
        "mu0": new Value(1.25663706212e-6, 0, [1, 1, -2, -2, 0, 0, 0]),
        "Na": new Value(6.02214086e23, 0, [0, 0, 0, 0, 0, 0, -1]),
    },
    "astronomy": {
        "M_S": new Value(1.989e30, 0, [1, 0, 0, 0, 0, 0, 0]),
        "R_S": new Value(696340e3, 0, [0, 1, 0, 0, 0, 0, 0]),

        "M_E": new Value(5.98e24, 0, [1, 0, 0, 0, 0, 0, 0]),
        "w_E": new Value(7.27220522e-5, 0, [0, 0, -1, 0, 0, 0, 0]),
        "R_E": new Value(6.38e6, 0, [0, 1, 0, 0, 0, 0, 0]),
        "D_ES": new Value(1.5e11, 0, [0, 1, 0, 0, 0, 0, 0]),

        "M_M": new Value(7.35e22, 0, [1, 0, 0, 0, 0, 0, 0]),
        "R_M": new Value(1.74e6, 0, [0, 1, 0, 0, 0, 0, 0]),
        "D_ME": new Value(0.38e9, 0, [0, 1, 0, 0, 0, 0, 0]),
    },
    "particle": {
        "e": new Value(1.60217662e-19, 0, [0, 0, 1, 1, 0, 0, 0]),
        "m_e": new Value(9.10938356e-31, 0, [1, 0, 0, 0, 0, 0, 0]),
        "m_p": new Value(1.6726219e-27, 0, [1, 0, 0, 0, 0, 0, 0]),
        "m_n": new Value(1.67492749804e-27, 0, [1, 0, 0, 0, 0, 0, 0]),
        "mub": new Value(9.274009994e-24, 0, [0, 2, 0, 1, 0, 0, 0]),
    }
}

var literals = init_literals;

function resetLiterals() {
    literals = init_literals;
}

function loadLiteralPack(pack) {
    Object.assign(literals, literal_packs[pack]);
}

//FUNCTIONS

function o_cat(v) {
    return v;
}

function o_add(v) {
    if (!sameUnit(v[0]._unit, v[1]._unit)) {
        throw "Dimension error";
    }
    return new Value(
        v[0]._val + v[1]._val,
        Math.sqrt(Math.pow(v[0]._err, 2) + Math.pow(v[1]._err, 2)),
        v[0]._unit); //sqrt sa^2 + sb^2
}

function o_sub(v) {
    if (v.length > 1) {
        if (!sameUnit(v[0]._unit, v[1]._unit)) {
            throw "Dimension error";
        }
        return new Value(
            v[0]._val - v[1]._val,
            Math.sqrt(Math.pow(v[0]._err, 2) + Math.pow(v[1]._err, 2)),
            v[0]._unit); //sqrt sa^2 + sb^2
    } else {
        return new Value(-v[0]._val,
            Math.abs(v[0]._err),
            v[0]._unit); //sqrt sa^2 + sb^2
    }
}

function o_mul(v) {
    return new Value(
        v[0]._val * v[1]._val,
        Math.sqrt(Math.pow(v[0]._err * v[1]._val, 2) + Math.pow(v[1]._err * v[0]._val, 2)),
        multUnit(v[0]._unit, v[1]._unit)); //f sqrt sa/a ^2 + sb/b ^2
}

function o_div(v) {
    return new Value(
        v[0]._val / v[1]._val,
        1 / v[1]._val * Math.sqrt(Math.pow(v[0]._err, 2) + Math.pow(v[0]._val * v[1]._err / v[1]._val, 2)),
        divUnit(v[0]._unit, v[1]._unit)); //f sqrt sa/a ^2 + sb/b ^2
}

function o_exp(v) {
    if (v.length > 1) { //exponentiation
        if (!noUnit(v[1]._unit)) {
            throw "Cant exponentiate units";
        }
        return new Value(
            Math.pow(v[0]._val, v[1]._val),
            Math.pow(v[0]._val, v[1]._val) * Math.sqrt(
                Math.pow(v[1]._val * v[0]._err / v[0]._val, 2) +
                Math.pow(Math.log(Math.abs(v[0]._val)) * v[1]._err, 2)),
            expUnit(v[0]._unit, v[1]._val)); //f sqrt (B sa/A)^2 + (ln(A)sb)^2
    } else { //exp() function
        if (!noUnit(v[0]._unit)) {
            throw "Cant exponentiate units";
        }
        return new Value(
            Math.exp(v[0]._val),
            Math.exp(v[0]._val) * v[0]._err);
    }
}

function f_sqrt(v) {
    return new Value(
        Math.sqrt(v[0]._val),
        Math.sqrt(v[0]._val) * 0.5 * v[0]._err / v[0]._val,
        expUnit(v[0]._unit, 0.5));
}

function f_sin(v) {
    if (!noUnit(v[0]._unit)) {
        throw "Cant trig units";
    }
    return new Value(
        Math.sin(v[0]._val),
        Math.cos(v[0]._val) * v[0]._err);
}

function f_cos(v) {
    if (!noUnit(v[0]._unit)) {
        throw "Cant trig units";
    }
    return new Value(
        Math.cos(v[0]._val),
        Math.sin(v[0]._val) * v[0]._err);
}

function f_tan(v) {
    if (!noUnit(v[0]._unit)) {
        throw "Cant trig units";
    }
    return o_div([f_sin([v[0]]), f_cos([v[0]])]);
}

function f_cot(v) {
    if (!noUnit(v[0]._unit)) {
        throw "Cant trig units";
    }
    return o_div([f_cos([v[0]]), f_sin([v[0]])]);
}

function f_asin(v) {
    if (!noUnit(v[0]._unit)) {
        throw "Cant trig units";
    }
    return new Value(
        Math.asin(v[0]._val),
        v[0]._err / Math.sqrt(1 - Math.pow(v[0]._val, 2)));
}

function f_acos(v) {
    if (!noUnit(v[0]._unit)) {
        throw "Cant trig units";
    }
    return new Value(
        Math.acos(v[0]._val), -v[0]._err / Math.sqrt(1 - Math.pow(v[0]._val, 2)));
}

function f_atan(v) {
    if (!noUnit(v[0]._unit)) {
        throw "Cant trig units";
    }
    return new Value(
        Math.atan(v[0]._val),
        v[0]._err / (1 + Math.pow(v[0]._val, 2)));
}

function f_acot(v) {
    if (!noUnit(v[0]._unit)) {
        throw "Cant trig units";
    }
    return new Value(
        Math.atan(1 / v[0]._val), -v[0]._err / (1 + Math.pow(v[0]._val, 2)));
}

function f_log(v) {
    if (!noUnit(v[0]._unit)) {
        throw "Cant log units";
    }
    if (v.length > 1) { //logarithm
        if (!noUnit(v[1]._unit)) {
            throw "Cant log units";
        }
        return o_div([f_ln([v[0]]), f_ln([v[1]])])
    } else { //base 10
        return f_ln([v[0]], new Value(10, 0));
    }
}

function f_ln(v) {
    if (!noUnit(v[0]._unit)) {
        throw "Cant ln units";
    }
    return new Value(
        Math.log(v[0]._val),
        v[0]._err / v[0]._val);
}

var functions = {
    "cat": o_cat,
    "add": o_add,
    "sub": o_sub,
    "mul": o_mul,
    "div": o_div,
    "exp": o_exp,

    "sqrt": f_sqrt,
    "\u221A": f_sqrt,

    "sin": f_sin,
    "cos": f_cos,
    "tan": f_tan,
    "cot": f_cot,
    "ctg": f_cot,
    "asin": f_asin,
    "acos": f_acos,
    "atan": f_atan,
    "acot": f_acot,
    "actg": f_acot,

    "log": f_log,
    "ln": f_ln
};

var operators = {
    ",": [0, "cat"],
    "+": [1, "add"],
    "-": [1, "sub"],
    "*": [2, "mul"],
    "/": [2, "div"],
    "^": [3, "exp"]
}


//TOKENS

class Token {
    constructor() {
        this._func = "";
        this._args = [];
        this._type = 0;
    }
    getValue(context = undefined) {
        if (context != undefined) {
            if (this._func in context) {
                return context[this._func];
            }
        }

        if (this._func in literals) {
            return literals[this._func];
        }
        if (this._func in functions) {
            var newVals = [];
            for (var i = 0; i < this._args.length; ++i) {
                newVals = newVals.concat(this._args[i].getValue(context));
            }
            return functions[this._func](newVals);
        }
        throw Error("Unknown symbol " + this._func);
    }

}

//get literal name
function readLiteral(str, i) {
    var res = "";
    while (i < str.length && isLiteral(str[i], true)) {
        res += str[i];
        ++i;
    }
    return [i, res];
}

function readUnit(str, i) {
    if (i < str.length && isLiteral(str[i], false)) {
        return readLiteral(str, i);
    }
    return [i, ""];
}

//read next object
function readNextObject(str, i) {
    i = skipWhitespaces(str, i);
    var newObj;
    if (i < str.length) {
        if (str[i] == '(') { //read bracket
            [i, newObj] = readBrackets(str, i + 1);
            return [i + 1, newObj];
        }
        if (isLiteral(str[i])) { //read name
            var name;
            [i, name] = readLiteral(str, i);
            i = skipWhitespaces(str, i);

            newObj = new Token();
            newObj._func = name;
            newObj._type = TokenTypes.object;

            if (name in functions) { //if functon read args
                [i, newObj._args] = readNextObject(str, i);
                if (!Array.isArray(newObj._args)) {
                    newObj._args = [newObj._args];
                }
            }
            return [i, newObj];
        }
        if (isOperator(str[i])) {
            newObj = new Token();
            newObj._func = str[i];
            newObj._type = TokenTypes.operator;
            ++i;
            return [i, newObj];
        }
        [i, newObj] = readVal(str, i);

        return [i, newObj];
    }

}

//Read bracket environment
function readBrackets(str, i) {
    var parts = [];
    var newObj;
    i = skipWhitespaces(str, i);

    while (i < str.length && str[i] != ')') {
        var oldi = i;
        [i, newObj] = readNextObject(str, i);
        if (oldi == i) {
            throw new Error("Invalid token at " + i + "!");
        }
        parts.push(newObj);
        i = skipWhitespaces(str, i);
    }
    //++i;

    /*if(parts[0]._type == TokenTypes.operator) {
    	//Add zero, operators are binary.
    	parts.unshift(new Value(0, 0))
    }*/

    //To postfix
    var result = [];
    var stack = [];

    parts.push()

    var p = 0;
    while (p < parts.length) {
        if (parts[p]._type == TokenTypes.object) {
            result.push(parts[p]);
        }
        if (parts[p]._type == TokenTypes.operator) {
            var newOp = parts[p]._func;
            while (stack.length && operators[stack[stack.length - 1]][0] >= operators[newOp][0]) {
                var rhs = result[result.length - 1];
                result.pop();
                var lhs = null;
                if (result.length > 0) {
                    lhs = result[result.length - 1];
                    result.pop();
                }
                var combined = new Token();
                combined._func = operators[stack[stack.length - 1]][1];
                combined._args = (lhs == null) ? [rhs] : [lhs, rhs];
                combined._type = TokenTypes.object;
                result.push(combined);
                stack.pop();
            }
            stack.push(newOp);
        }
        ++p;
    }

    while (stack.length) {
        var rhs = result[result.length - 1];
        result.pop();
        var lhs = null;
        if (result.length > 0) {
            lhs = result[result.length - 1];
            result.pop();
        }
        var combined = new Token();
        combined._func = operators[stack[stack.length - 1]][1];
        combined._args = (lhs == null) ? [rhs] : [lhs, rhs];
        combined._type = TokenTypes.object;
        result.push(combined);
        stack.pop();
    }

    if (result.length > 1) {
        throw Error("Failed to read whole expresison");
    }

    //console.log(result.length);
    return [i, result[0]];
}