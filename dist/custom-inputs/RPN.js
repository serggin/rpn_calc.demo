/**
 * Arithmetic formula calculator
 * Based on Reverse Polish notation Algorithm
 * See https://en.wikipedia.org/wiki/Reverse_Polish_notation
 *
 * Restictions:
 * Allowed numbers, operators "+", "-", "*", "/" (included infix "+", "-") and parentheses
 *
 * Usage:
 * const rpn = new RPN();
 * const formula = "-2*(3+4)+5/6";
 * rpn.change(formula);
 * const value = rpn.value; //value of the calculation
 *
 * @author serggin <serggin1@yandex.ru>
 */
export class RPN {
    constructor() {
        this.stack = [];
        this.out = [];
        this.tokens = [];
        this.error = false;
        this.text = '';
        this._value = undefined;
        this.index = 0;
        this.clear = () => {
            this.stack = [];
            this.out = [];
            this.error = false;
            this.tokens = [];
        };
        /**
         * Provide formula for calculation
         *
         * @param text  formula
         */
        this.change = (text) => {
            this.clear();
            this.text = text;
            this.parse();
        };
        this.parse = () => {
            this._value = undefined;
            this.index = 0;
            let token;
            try {
                do {
                    token = this.getToken();
                    if (token || token === 0) {
                        this.tokens.push(token);
                    }
                } while (token || token === 0);
                this.parseInfix();
                this.calculate();
                if (this.stack.length === 1 && !Number.isNaN(this.stack[0])) {
                    if (typeof this.stack[0] === 'number') {
                        this._value = this.stack[0];
                    }
                    else {
                        // option impossible
                    }
                }
            }
            catch (err) {
                //    console.log('tokens=', this.tokens);
                //    console.error(err);
            }
        };
        this.getToken = () => {
            if (this.index > this.text.length - 1) {
                return false;
            }
            let lexeme = '';
            let lexemeClosed = false;
            let opChar = '';
            do {
                const char = this.text[this.index];
                switch (char) {
                    case ' ':
                        lexemeClosed = lexeme.length > 0;
                        this.index += 1;
                        break;
                    default:
                        if (RPN.isNumChar(char)) {
                            lexeme += char;
                            this.index += 1;
                        }
                        else if (RPN.isOpChar(char)) {
                            if (lexeme.length > 0) {
                                lexemeClosed = true;
                            }
                            else {
                                opChar = char;
                                this.index += 1;
                            }
                        }
                        else {
                            throw new SyntaxError(`Invalid character "${char}"`);
                        }
                }
                if (lexemeClosed || opChar.length > 0) {
                    break;
                }
            } while (this.index < this.text.length);
            if (lexeme.length > 0) {
                const num = Number(lexeme);
                if (Number.isNaN(num)) {
                    throw new SyntaxError(`Invalid number "${lexeme}"`);
                }
                return num;
            }
            if (opChar.length > 0) {
                return opChar;
            }
            else {
                return false;
            }
        };
        this.parseInfix = () => {
            let prevToken = undefined;
            let token;
            for (let i = 0; i < this.tokens.length; i += 1) {
                token = this.tokens[i];
                if (typeof token === 'number') {
                    this.out.push(token);
                }
                else if (token === '(') {
                    this.stack.push(token);
                }
                else if (token === ')') {
                    let valid = false;
                    do {
                        const top = this.stack.pop();
                        if (top === '(') {
                            valid = true;
                            break;
                        }
                        this.out.push(top);
                    } while (this.stack.length > 0);
                    if (!valid) {
                        throw new SyntaxError('"(" has not previos "("');
                    }
                }
                else if (RPN.isBinOpChar(token)) {
                    // test if operation is unary
                    let opToken = undefined;
                    if (prevToken === undefined || prevToken === '(') {
                        if (token === '-') {
                            opToken = '='; // unary "-"
                        }
                        else if (token === '+') { // ignore unary "+"
                        }
                        else {
                            throw new SyntaxError(`Invalid unary ${token}`);
                        }
                    }
                    else {
                        opToken = token;
                        do {
                            const top = this.stack[this.stack.length - 1];
                            if (top === '=' || RPN.getPriority(top) >= RPN.getPriority(token)) {
                                this.stack.pop();
                                this.out.push(top);
                            }
                            else {
                                break;
                            }
                        } while (this.stack.length > 0);
                    }
                    if (opToken) {
                        this.stack.push(opToken);
                    }
                }
                prevToken = token;
            }
            if (this.stack.length > 0) {
                for (let i = this.stack.length - 1; i >= 0; i -= 1) {
                    token = this.stack[i];
                    if (RPN.isBinOpChar(token) || token === '=') {
                        this.out.push(token);
                    }
                    else {
                        throw new SyntaxError(`Invalid ${token}`);
                    }
                }
                this.stack = [];
            }
        };
        this.calculate = () => {
            this.stack = [];
            let token;
            let operand1;
            let operand2;
            for (let i = 0; i < this.out.length; i += 1) {
                token = this.out[i];
                if (typeof token === 'number') {
                    this.stack.push(token);
                }
                else if (token === '=') {
                    operand1 = this.stack.pop();
                    this.stack.push(-operand1);
                }
                else {
                    operand2 = this.stack.pop();
                    operand1 = this.stack.pop();
                    this.stack.push(RPN.getOperatorFunction(token)(operand1, operand2));
                }
            }
        };
    }
    /**
     * Get calculation result
     *
     * @return {number | undefined}     undefined in case of invalid formula
     */
    get value() {
        return this._value;
    }
}
RPN.getOperatorFunction = (char) => {
    switch (char) {
        case '+':
            return (x, y) => x + y;
        case '-':
            return (x, y) => x - y;
        case '*':
            return (x, y) => x * y;
        case '/':
            return (x, y) => x / y;
        default: // "never" option
            return (x, y) => 0;
    }
};
RPN.getPriority = (char) => {
    switch (char) {
        case '(':
        case ')':
            return 1;
        case '+':
        case '-':
        case '=':
            return 2;
        case '*':
        case '/':
            return 3;
        default: // "never" option
            return 0;
    }
};
RPN.numChars = '.0123456789';
RPN.opChars = '-+*/()';
RPN.binopChars = '-+*/';
RPN.isNumChar = (char) => char.length === 1 && RPN.numChars.indexOf(char) > -1;
RPN.isOpChar = (char) => char.length === 1 && RPN.opChars.indexOf(char) > -1;
RPN.isBinOpChar = (char) => char.length === 1 && RPN.binopChars.indexOf(char) > -1;
