const Calculator = require('./calculator.js');

describe('RPN Calculator Class', () => {
    describe('Testing newly constructed object', () => {

        test('Initial Pop test', () => {
            const calc = new Calculator;
            expect(calc.pop()).toBe(0);
        });

        test('Empty exception test', () => {
            const calc = new Calculator;
            calc.pop();
            expect(() => calc.pop()).toThrow(Error);
        });
    });

    describe('Missing Operands', () => {
        test('Missing Plus Operand', () => {
            const calc = new Calculator;
            expect(() => calc.plus()).toThrow(Error);
        });
        test('Missing Minus Operand', () => {
            const calc = new Calculator;
            expect(() => calc.minus()).toThrow(Error);
        });
        test('Missing Times Operand', () => {
            const calc = new Calculator;
            expect(() => calc.times()).toThrow(Error);
        });
        test('Missing Divide Operand', () => {
            const calc = new Calculator;
            expect(() => calc.divide()).toThrow(Error);
        });
    });

    describe('Operators', () => {
        const calc = new Calculator;

        test('Plus Positives', () => {
            calc.enter(1);
            calc.enter(5);
            calc.plus();
            expect(calc.pop()).toBe(6);
        });

        test('Plus Floating Point Positives', () => {
            calc.enter(1.2345);
            calc.enter(5.4321);
            calc.plus();
            expect(calc.pop()).toBe(1.2345 + 5.4321);
        });

        test('Plus Mixed Signs', () => {
            calc.enter(-10);
            calc.enter(5);
            calc.plus();
            expect(calc.pop()).toBe(-5);
        });

        test('Plus Negatives', () => {
            calc.enter(-10);
            calc.enter(-5);
            calc.plus();
            expect(calc.pop()).toBe(-15);
        });

        test('Minus Positives', () => {
            calc.enter(1);
            calc.enter(5);
            calc.minus();
            expect(calc.pop()).toBe(-4);
        });

        test('Minus Mixed Signs', () => {
            calc.enter(-10);
            calc.enter(5);
            calc.minus();
            expect(calc.pop()).toBe(-15);
        });

        test('Minus Negatives', () => {
            calc.enter(-10);
            calc.enter(-5);
            calc.minus();
            expect(calc.pop()).toBe(-5);
        });

        test('Multiply Positives', () => {
            calc.enter(10.10);
            calc.enter(5.0);
            calc.times();
            expect(calc.pop()).toBe(10.10 * 5.0);
        });

        test('Divide Positives', () => {
            calc.enter(50.50);
            calc.enter(5.0);
            calc.divide();
            expect(calc.pop()).toBe(50.50 / 5.0);
        });

        test('Divide by Zero', () => {
            calc.clX();
            calc.enter(123)
            calc.enter(0.0000);
            const stackDepth = calc.depth();
            expect(() => calc.divide()).toThrow(Error);
            expect(calc.depth()).toBe(stackDepth - 1);
        });

        test('Divide by nan', () => {
            calc.clX();
            calc.pop(); // empty stack
            expect(() => calc.divide()).toThrow(Error);
            expect(calc.depth()).toBe(0);
        });

        test('Factorial', () => {
            calc.enter(5);
            calc.factorial();
            expect(calc.pop()).toBe(120);
        });

        test('Factorial - 0 Value', () => {
            calc.enter(0);
            calc.factorial();
            expect(calc.pop()).toBe(1);
        });

        test('Factorial - Float Value', () => {
            calc.enter(5.1234);
            calc.factorial();
            expect(calc.pop()).toBe(120);
        });

        test('Factorial - nan Value', () => {
            calc.clX();
            calc.pop();
            expect(() => calc.factorial()).toThrow(Error);
        });

        test('Factorial - Fractional Number Value', () => {
            calc.clX();
            calc.enter(0.567);
            calc.factorial();
            expect(calc.pop()).toBe(1);
        });

    });

    describe('Stack Check', () => {
        test('Constructor Initial Stack', () => {
            const calc = new Calculator;
            expect(calc.depth()).toBe(1);
            expect(calc.pop()).toBe(0);
        });

        test('Empty Stack - By clearing (clX)', () => {
            const calc = new Calculator;
            calc.enter(123);
            calc.enter(456);
            calc.clX();
            expect(calc.pop()).toBe(0);
            expect(calc.depth()).toBe(0);
        });

        test('Stack Correct (pop)', () => {
            const calc = new Calculator;
            calc.enter(123);
            calc.enter(456);
            calc.enter(789);
            expect(calc.depth()).toBe(4);
            expect(calc.pop()).toBe(789);
            expect(calc.depth()).toBe(3);
            expect(calc.pop()).toBe(456);
            expect(calc.depth()).toBe(2);
            expect(calc.pop()).toBe(123);
            expect(calc.depth()).toBe(1);
            expect(calc.pop()).toBe(0);
            expect(calc.depth()).toBe(0);
        });
    });

    describe('Enter Checks', () => {
        test('Valid Number Entered', () => {
            const calc = new Calculator;
            calc.enter(123);
            expect(calc.pop()).toBe(123);
        });

        test('Invalid Number Entered', () => {
            const calc = new Calculator;
            expect(() => calc.enter(NaN)).toThrow(Error);
        });

        test('Invalid String Number Entered', () => {
            const calc = new Calculator;
            expect(() => calc.enter('abc10')).toThrow(Error);
        });

        test('Invalid Number String Entered', () => {
            const calc = new Calculator;
            expect(() => calc.enter('10abc')).toThrow(Error);
        });
        test('Empty String Entered', () => {
            const calc = new Calculator;
            expect(() => calc.enter('')).toThrow(Error);
        });
    });

    describe('lastX Checks', () => {
        test('Initial State', () => {
            const calc = new Calculator;
            expect(calc.lastX()).toBe(0);
        });

        test('Enter Causes No Change', () => {
            const calc = new Calculator;
            calc.enter(1);
            calc.enter(2);
            calc.enter(3);
            expect(calc.lastX()).toBe(0);
        });

        test('Operators lastX Check', () => {
            const calc = new Calculator;
            calc.enter(1);
            calc.enter(2);
            calc.plus();
            expect(calc.lastX()).toBe(2);
            calc.enter(3);
            calc.minus();
            expect(calc.lastX()).toBe(3);
            calc.enter(4);
            calc.minus();
            expect(calc.lastX()).toBe(4);
            calc.enter(5);
            calc.times();
            expect(calc.lastX()).toBe(5);
            calc.enter(6);
            calc.divide();
            expect(calc.lastX()).toBe(6);
            calc.enter(7);
            calc.factorial();
            expect(calc.lastX()).toBe(7);
        });

        test('Clear Checks', () => {
            const calc = new Calculator;
            calc.enter(1);
            calc.enter(2);
            calc.plus();
            calc.clX();
            expect(calc.lastX()).toBe(2);
            calc.clearAll();
            expect(calc.lastX()).toBe(0);
        });
    });

    describe('Memory Register Checks', () => {
        test('Initial State', () => {
            const calc = new Calculator;
            for(let i = 0; i < calc._memory.length; i++){
                expect(calc.rcl(i)).toBe(0);
            }
        });

        test('Store and Recall Memory Values', () => {
            const calc = new Calculator;
            // set them all sequentially
            for(let i = 0; i < calc._memory.length; i++){
                calc.enter(i);
                calc.sto(i);
            }

            // check sequentially
            for(let i = 0; i < calc._memory.length; i++){
                expect(calc.rcl(i)).toBe(i);
            }
        });

        test('Ensure ClearAll Resets', () => {
            const calc = new Calculator;
            for(let i = 0; i < calc._memory.length; i++){
                calc.enter(i);
                calc.sto(i);
            }
            
            calc.clearAll();

            for(let i = 0; i < calc._memory.length; i++){
                expect(calc.rcl(i)).toBe(0);
            }
        });

        test('Ensure clX Doesn\'t Reset', () => {
            const calc = new Calculator;
            for(let i = 0; i < calc._memory.length; i++){
                calc.enter(i);
                calc.sto(i);
            }

            calc.clX();

            for(let i = 0; i < calc._memory.length; i++){
                expect(calc.rcl(i)).toBe(i);
            }
        });
    });
});
