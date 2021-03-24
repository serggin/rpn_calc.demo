import { BaseInput } from './BaseInput.js';
import { RPN } from './RPN.js';
/**
 * CalcInput widget class
 */
export class CalcInput extends BaseInput {
    constructor(parent) {
        super(parent);
        this._valueElement = null;
        this.rpn = new RPN();
        this.wrapperElement = null;
        /**
         * Create Widget elements
         * @param hostElement {DOM element}
         */
        this.createContent = (hostElement) => {
            let wrapperElement = document.createElement("DIV");
            wrapperElement.className = 'calc-input-wrapper';
            let inputElement = document.createElement("INPUT");
            inputElement.type = 'text';
            inputElement.placeholder = 'Formula value';
            inputElement.className = 'calc-input';
            inputElement.oninput = this.onTextChanged;
            inputElement.onfocus = this.onFocus;
            inputElement.onblur = this.onBlur;
            this._inputElement = inputElement;
            wrapperElement.appendChild(inputElement);
            const valueWrapper = document.createElement("DIV");
            valueWrapper.className = 'calc-value-wrapper';
            let valueElement = document.createElement("SPAN");
            valueElement.className = 'calc-value';
            this._valueElement = valueElement;
            valueWrapper.appendChild(valueElement);
            wrapperElement.appendChild(valueWrapper);
            hostElement.appendChild(wrapperElement);
            this.wrapperElement = wrapperElement;
        };
        this.getBorderedElement = () => {
            return this.wrapperElement;
        };
        this.calcValue = () => {
            let value;
            if (this.text.length === 0) {
                value = null;
            }
            else {
                this.rpn.change(this.text);
                value = this.rpn.value;
                if (value === Infinity || value === -Infinity) {
                    value = undefined;
                }
            }
            this.displayValue(value);
            return value;
        };
        this.displayValue = (value) => {
            const content = value || value === 0 ? value.toString() : (value === undefined ? '?' : '\u00A0');
            this._valueElement.textContent = content;
        };
        if (this._hostElement) {
            this.createContent(this._hostElement);
            this.rpn = new RPN();
        }
    }
    /**
     * Widget read/write property
     *
     * @return {number | null | undefined}     the evaluated result of the formula entered to Widget
     */
    get value() {
        return this._value;
    }
    set value(val) {
        if (typeof val === "number") {
            if (val !== this._value) {
                this.text = val.toString();
            }
        }
        else {
            throw new Error(`Invalid number value ${val}`);
        }
    }
}
