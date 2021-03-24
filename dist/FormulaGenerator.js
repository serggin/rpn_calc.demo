/**
 * Formulas Generator for testing RPN
 */
export class FormulaGenerator {
    constructor(maxOperands = 4, maxDepth = 3, maxNumber = 10, fixedDigits = 0) {
        this.maxOperands = maxOperands;
        this.maxDepth = maxDepth;
        this.maxNumber = maxNumber;
        this.fixedDigits = fixedDigits;
        this.generate = (depth = 0) => {
            if (depth >= this.maxDepth) {
                return this.generateNumber();
            }
            let formula;
            const type = this.randomType(depth);
            if (type === FormulaGenerator.NUMBER) {
                formula = (depth === 0 ? this.generateInfixSign() : '') + this.generateNumber();
            }
            else if (type === FormulaGenerator.ARITHMETIC) {
                formula = this.generateArithmetic(depth);
            }
            else {
                formula = this.generateParenthesis(depth);
            }
            ;
            return formula;
        };
        this.generateNumber = () => {
            const random = Math.random();
            return (random * this.maxNumber).toFixed(this.fixedDigits);
        };
        this.randomType = (depth) => {
            const random = Math.random();
            const thresholds = depth === 0 ? FormulaGenerator.THRESHOLDS.depth0 : FormulaGenerator.THRESHOLDS.depth;
            if (random < thresholds.number) {
                return FormulaGenerator.NUMBER;
            }
            else if (random < thresholds.arithmetic) {
                return FormulaGenerator.ARITHMETIC;
            }
            else {
                return FormulaGenerator.PARENTHESIS;
            }
        };
        this.generateInfixSign = () => {
            const random = Math.random();
            if (random < .5) {
                return '-';
            }
            else if (random < .6) {
                return '+';
            }
            return '';
        };
        this.generateArithmetic = (depth) => {
            const random = Math.random();
            const operands = 2 + Math.floor(random * (this.maxOperands - 1));
            let formula = (depth > 0 ? '(' : '') + this.generateInfixSign();
            for (let i = 0; i < operands; i += 1) {
                if (i) {
                    formula += this.generateOperation();
                }
                formula += this.generate(depth + 1);
            }
            if (depth > 0) {
                formula += ')';
            }
            return formula;
        };
        this.generateOperation = () => {
            const random = Math.random();
            let index;
            if (random < .3) {
                index = 0;
            }
            else if (random < .6) {
                index = 1;
            }
            else if (random < .8) {
                index = 2;
            }
            else {
                index = 3;
            }
            return FormulaGenerator.OPERATIONS[index];
        };
        this.generateParenthesis = (depth) => {
            let formula = '(' + this.generateInfixSign() + this.generate(depth + 1) + ')';
            return formula;
        };
    }
}
FormulaGenerator.THRESHOLDS = {
    infixSign: .2,
    depth0: {
        number: .1,
        arithmetic: .9,
        parenthesis: 1,
    },
    depth: {
        number: .5,
        arithmetic: 1,
        parenthesis: 1,
    },
};
FormulaGenerator.NUMBER = 1;
FormulaGenerator.ARITHMETIC = 2;
FormulaGenerator.PARENTHESIS = 3;
FormulaGenerator.OPERATIONS = ['+', '-', '*', '/'];
