const { Calculator, MAXIMUM_STACK, MINIMUM_STACK } = require('./calculator.js');

// bring in fast-check. This is only needed if fact-check is used otherwise
// remove the require() and just use jest alone. Fast-check is used within
// jest test() so they are complimentary if the need be. Don't know much
// more than that as yet. Fast-check code at the end of the file

const fc = require('fast-check');

describe('RPN Calculator Class', () => {
  describe('Testing newly constructed object', () => {
    test('Initial Pop test', () => {
      const calc = new Calculator();
      expect(calc.pop()).toBe(0);
    });

    test('Fresh Size test', () => {
      const calc = new Calculator();
      expect(calc.depth()).toBe(MINIMUM_STACK);
    });
  });

  describe('Missing Operands', () => {
    test('Missing Plus Operand', () => {
      const calc = new Calculator();
      calc.plus();
      expect(calc.value()).toBe(0);
    });
    test('Missing Minus Operand', () => {
      const calc = new Calculator();
      calc.minus();
      expect(calc.value()).toBe(0);
    });
    test('Missing Times Operand', () => {
      const calc = new Calculator();
      calc.times();
      expect(calc.value()).toBe(0);
    });
    test('Missing Divide Operand', () => {
      const calc = new Calculator();
      expect(() => calc.divide()).toThrow(Error);
    });
    test('Missing Factorial Operand', () => {
      const calc = new Calculator();
      calc.factorial();
      expect(calc.value()).toBe(1);
    });
    test('Missing Times Operand', () => {
      const calc = new Calculator();
      calc.sqrt();
      expect(calc.value()).toBe(0);
    });
  });

  describe('Single Operators', () => {
    const calc = new Calculator();

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
      calc.enter(10.1);
      calc.enter(5.0);
      calc.times();
      expect(calc.pop()).toBe(10.1 * 5.0);
    });

    test('Divide Positives', () => {
      calc.enter(50.5);
      calc.enter(5.0);
      calc.divide();
      expect(calc.pop()).toBe(50.5 / 5.0);
    });

    test('Divide by Zero', () => {
      calc.clX();
      calc.enter(123);
      calc.enter(0.0);
      const stackDepth = calc.depth();
      expect(() => calc.divide()).toThrow(Error);
      expect(calc.depth()).toBe(stackDepth - 1);
    });
  });

  describe('Function Operators', () => {
    const calc = new Calculator();
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

    test('Factorial - Negative Value', () => {
      calc.enter(-8);
      expect(() => calc.factorial()).toThrow(Error);
    });

    test('Factorial - Float Value', () => {
      calc.enter(5.1234);
      calc.factorial();
      expect(calc.pop()).toBe(120);
    });

    test('Factorial - Fractional Number Value', () => {
      calc.clX();
      calc.enter(0.567);
      calc.factorial();
      expect(calc.pop()).toBe(1);
    });

    test('Square Root Perfect Square', () => {
      calc.enter(9);
      calc.sqrt();
      expect(calc.pop()).toBe(3);
    });

    test('Square Root Not Perfect Square', () => {
      calc.enter(7);
      calc.sqrt();
      expect(calc.pop()).toBe(Math.sqrt(7));
    });

    test('Square Root Negative', () => {
      calc.enter(-7);
      expect(() => calc.sqrt()).toThrow(Error);
      expect(calc.lastX()).toBe(-7);
    });

    test('Change Sign', () => {
      calc.enter(-7);
      calc.chs();
      expect(calc.value()).toBe(7);
      calc.chs();
      expect(calc.value()).toBe(-7);
    });

    test('Change Sign 0', () => {
      calc.enter(0);
      calc.chs();
      expect(calc.value()).toBe(0);
      calc.chs();
      expect(calc.value()).toBe(0);
    });
  });

  describe('Stack Check', () => {
    test('Constructor Initial Stack', () => {
      const calc = new Calculator();
      expect(calc.depth()).toBe(MINIMUM_STACK);
      expect(calc.pop()).toBe(0);
    });

    test('Empty Stack - By clearing (clearAll)', () => {
      const calc = new Calculator();
      calc.enter(123);
      calc.enter(456);
      calc.clearAll();
      expect(calc.pop()).toBe(0);
      expect(calc.depth()).toBe(MINIMUM_STACK);
    });

    test('Pop To Empty Stack', () => {
      const calc = new Calculator();
      expect(calc.depth()).toBe(MINIMUM_STACK);
      for (let i = 0; i < MINIMUM_STACK + 1; i++) {
        expect(calc.pop()).toBe(0);
      }

      expect(calc.depth()).toBe(MINIMUM_STACK);
    });

    test('Check Stack Overflow', () => {
      const calc = new Calculator();

      // Fill Stack 100%
      for (let i = 0; i < MAXIMUM_STACK - MINIMUM_STACK; i++) {
        calc.enter(i);
      }

      // Break the camels back
      expect(calc.depth()).toBe(MAXIMUM_STACK);
      expect(() => calc.enter(9999)).toThrow(Error);
    });

    test('Stack Correct (pop)', () => {
      const calc = new Calculator();
      calc.enter(123);
      calc.enter(456);
      calc.enter(789);
      expect(calc.depth()).toBe(MINIMUM_STACK + 3);
      expect(calc.pop()).toBe(789);
      expect(calc.depth()).toBe(MINIMUM_STACK + 2);
      expect(calc.pop()).toBe(456);
      expect(calc.depth()).toBe(MINIMUM_STACK + 1);
      expect(calc.pop()).toBe(123);
      expect(calc.depth()).toBe(MINIMUM_STACK);
      expect(calc.pop()).toBe(0);
      expect(calc.depth()).toBe(MINIMUM_STACK);
    });
  });

  describe('Enter Checks', () => {
    test('Valid Number Entered', () => {
      const calc = new Calculator();
      calc.enter(123);
      expect(calc.pop()).toBe(123);
    });

    test('Invalid Number Entered', () => {
      const calc = new Calculator();
      expect(() => calc.enter(NaN)).toThrow(Error);
    });

    test('Invalid String Number Entered', () => {
      const calc = new Calculator();
      expect(() => calc.enter('abc10')).toThrow(Error);
    });

    test('Invalid Number String Entered', () => {
      const calc = new Calculator();
      expect(() => calc.enter('10abc')).toThrow(Error);
    });
    test('Empty String Entered', () => {
      const calc = new Calculator();
      expect(() => calc.enter('')).toThrow(Error);
    });
  });

  describe('lastX Checks', () => {
    test('Initial State', () => {
      const calc = new Calculator();
      expect(calc.lastX()).toBe(0);
    });

    test('Enter Causes No Change', () => {
      const calc = new Calculator();
      calc.enter(1);
      calc.enter(2);
      calc.enter(3);
      expect(calc.lastX()).toBe(0);
    });

    test('Operators lastX Check', () => {
      const calc = new Calculator();
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
      const calc = new Calculator();
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
      const calc = new Calculator();
      for (let i = 0; i < calc._memory.length; i++) {
        expect(calc.rcl(i)).toBe(0);
      }
    });

    test('Store and Recall Memory Values', () => {
      const calc = new Calculator();
      // set them all sequentially
      for (let i = 0; i < calc._memory.length; i++) {
        calc.enter(i);
        calc.sto(i);
      }

      // check sequentially
      for (let i = 0; i < calc._memory.length; i++) {
        expect(calc.rcl(i)).toBe(i);
      }
    });

    test('Ensure ClearAll Resets', () => {
      const calc = new Calculator();
      for (let i = 0; i < calc._memory.length; i++) {
        calc.enter(i);
        calc.sto(i);
      }

      calc.clearAll();

      for (let i = 0; i < calc._memory.length; i++) {
        expect(calc.rcl(i)).toBe(0);
      }
    });

    test("Ensure clX Doesn't Reset", () => {
      const calc = new Calculator();
      for (let i = 0; i < calc._memory.length; i++) {
        calc.enter(i);
        calc.sto(i);
      }

      calc.clX();

      for (let i = 0; i < calc._memory.length; i++) {
        expect(calc.rcl(i)).toBe(i);
      }
    });

    test('Recall Invalid Register - Index Too Large', () => {
      const calc = new Calculator();
      expect(() => calc.rcl(1000)).toThrow(Error);
    });

    test('Store Invalid Register - Index Too Large', () => {
      const calc = new Calculator();
      expect(() => calc.sto(1000)).toThrow(Error);
    });
  });

  // here are the fast-check property based tests will overlap
  // with some of the above but the idea is to try these out too!

  describe('Fast-Check', () => {
    test('FC Zero Result if operands the Same', () => {
      const calc = new Calculator();
      fc.assert(
        fc.property(fc.integer(), a => {
          calc.clearAll(); // will avoid any stack overflow issues
          calc.enter(a);
          calc.enter(a);
          calc.minus();
          return calc.value() == 0;
        }),
      );
    });

    test('FC Adding positive Numbers for both operands always a positive number', () => {
      const calc = new Calculator();
      fc.assert(
        fc.property(fc.float(0.001, 100), fc.float(0.0, 100), (a, b) => {
          calc.clearAll();
          calc.enter(a);
          calc.enter(b);
          calc.plus();
          return calc.value() > 0.0;
        }),
        { verbose: true },
      );
    });

    test('FC Test chs() operator (change sign of X reg)', () => {
      const calc = new Calculator();
      fc.assert(
        fc.property(fc.float(), a => {
          calc.clearAll();
          calc.enter(a);
          calc.chs();

          // not sure if this is a good way to test but lets see
          // since the range can but from negative, 0 to positive.
          // Seems like their might be a better way to do this as the
          // case here is just like 3 simple unit tests!

          if (a < 0) {
            return calc.value() > 0.0;
          } else if (a > 0) {
            return calc.value() < 0.0;
          } else return a == 0;
        }),
        { verbose: true },
      );
    });
  });
});
