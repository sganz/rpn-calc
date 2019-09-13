/**
 * @class
 * @classdesc Basic RPN calculator functionality. Supports the basic
 * operators and a few specialized functions. Most all methods can
 * throw an Error exception and possibly a RangeError based on user
 * input.
 */
class Calculator {
  /**
   * This is the crazy complex constructor for the calculator.
   * Basically just sets up an array which stuffed with an initial value(s).
   * The array is later treated as a stack for most operations.
   *
   * In the HP realm you may see the term registers. This implementation
   * always keeps the notion of these registers valid, so stack positions
   * 0-2 are really the X, Y, and T registers respectively. In no circumstances
   * will these registers ever be invalid (NaN) or missing from the stack.
   *
   * @property _minStack {number} The minimum number of elements in the stack
   * before back filling with 0 elements.
   * @property _stack {array} An array used as a stack data structure
   * @property _lastX is the last X register value. Typically saved off before being
   * popped but an operator.
   * @property _memory is the 10 register memory array
   */
  constructor() {
    this._minStack = 3;
    this._stack = [0, 0, 0];
    this._lastX = 0;
    this._memory = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  }

  /**
   * Check to see if this is a number. Catches
   * a lot of odd cases but puts it into a tuneable method if needed
   * @private
   * @param {any} n The number in question
   * @return {boolean}
   */
  _isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }

  /**
   * Internal Helper to clear out all STO memory registers
   * @private
   */
  _clearMemory() {
    for (let i = 0; i < this._memory.length; i++) {
      this._memory[i] = 0;
    }
  }

  /**
   * Returns the depth of the stack. This is
   * really the size of the array, not much more.
   */
  depth() {
    return this._stack.length;
  }

  /**
   * Gets the newest (calling that the top) of the stack.
   * This does not change the contents of the stack like pop().
   *
   * @returns {number} The top of the stack
   */
  value() {
    return this._stack[this._stack.length - 1];
  }

  /**
   * This pushes the numeric value on to the stack. Coerces the
   * value into a numeric value. Keeps the stack clean. Does not
   * affect lastX
   *
   * @param {number} value The number to be pushed onto the stack
   * @throws {Error} Will throw if not a number
   */
  enter(value) {
    if (!this._isNumeric(value)) {
      throw new Error('You have entered an invalid number');
    }

    this._stack.push(+value);
  }

  /**
   * Pops the topmost (most recently pushed) number from the
   * stack. If the stack is empty it will throw an Error exception
   * otherwise return the value.
   *
   * @returns {number} Number at the top of the stack
   * @throws {Error}
   */
  pop() {
    let xReg = this._stack.pop();

    // now we need to check the stack size. Since we always
    // want the stack to have at least 3 (x register, y register, t register)
    // we will append one IF we have a stack depth of 2 after the
    // pop

    if (this.depth() == 2) {
      this._stack.unshift(0);
    }

    return xReg;
  }

  /**
   * Store the current stack top into the specified
   * memory register. Does NOT alter the stack
   *
   * @param {number} mem The memory register number to store into
   * @throws {Error} Invalid memory register number
   */
  sto(mem) {
    if (!this._isNumeric(mem) || mem < 0 || mem > this._memory.length) {
      throw new Error('Invalid Memory Register');
    }

    this._memory[mem] = this.value();
  }

  /**
   * Recall a specific memory register and returns it. Does NOT alter
   * the stack.
   *
   * @param {number} mem The memory register number to recall from
   * @returns {number} The contents of the specified memory register
   * @throws {Error} Invalid memory register number
   */
  rcl(mem) {
    if (!this._isNumeric(mem) || mem < 0 || mem > this._memory.length) {
      throw new Error('Invalid Memory Register');
    }

    return this._memory[mem];
  }

  /**
   * Returns the value of the _lastX register.
   *
   * @returns {number} The current value of the lastX register
   */
  lastX() {
    return this._lastX;
  }
  /**
   * Clears the top element of the stack to 0 (x register).  Does not mess with lastX
   */
  clX() {
    this._stack.pop();
    this._stack.push(0);
  }

  /**
   * Clears out the stack and any related registers.
   */
  clearAll() {
    this._stack.length = 0;

    // stuff the stack to mimic always needed registers
    for (let i = 0; i < this._minStack; i++) {
      this._stack.push(0);
    }

    this._lastX = 0;
    this._clearMemory();
  }

  /**
   * Addition operator
   * Takes the top 2 entries in the stack
   * and adds them together. Pushes results back on the stack
   */
  plus() {
    this._lastX = this.pop();
    this._stack.push(this.pop() + this._lastX);
  }

  /**
   * Subtraction operator
   * Takes the top 2 entries in the stack
   * and subtracts them together. This is a little
   * different because operand order on the stack matters!
   * Pushes results back on the stack
   */
  minus() {
    this._lastX = this.pop();
    let first = this.pop();
    this._stack.push(first - this._lastX);
  }

  /**
   * Multiply operator
   * Takes the top 2 entries in the stack
   * and multiplies them together. Pushes results back on the stack
   */
  times() {
    this._lastX = this.pop();
    let first = this.pop();
    this._stack.push(first * this._lastX);
  }

  /**
   * Divide operator
   * Takes the 2 top entries in the stack
   * and divides them together. Pushes the results back on the stack
   *
   * @throws {Error} Invalid dividend due to 0, NaN etc
   */
  divide() {
    let xReg = this.pop();
    xReg = +xReg; // Coerce to number

    if (!xReg) {
      // Matches +0, -0, NaN
      throw new Error('Invalid dividend ' + xReg);
    }

    this._lastX = xReg;
    this._stack.push(this.pop() / this._lastX);
  }

  /**
   * Private helper function to perform a recursive
   * factorial. Assumes input is in order. If used
   * incorrectly can cause a stack overflow (RangeError).
   *
   * Note : this is just to do recursion, an iterative approach
   * can work just as well here.
   *
   * @private
   * @param {number} n The number we want the factorial of
   */
  _factorial(n) {
    if (n === 0) {
      return 1;
    }
    return n * this._factorial(n - 1);
  }

  /**
   * Performs the factorial (x!) the top of the stack. This calls
   * an 'private' function that does the factorial. Pushes the
   * results back on the stack. Note that this is INTEGER factorial
   * and we try to take the integral part of the real.
   *
   * Odd case here for lastX when a user error happens and
   * intVal was a NaN. This gets assigned to the lastX which
   * is NOT a valid state. In this case it's reset to 0
   *
   * @throws {Error} Will throw if number is NaN, negative
   */
  factorial() {
    const intVal = parseInt(this.pop(), 10);

    // always set the lastX in case of exception (HP11C)

    this._lastX = intVal;

    // check for some reasonable values (could put and upper cap too)

    if (intVal < 0) {
      throw new Error('Negative numbers invalid for Factorial');
    }

    this._stack.push(this._factorial(intVal));
  }

  /**
   * Performs the square root to the top of the stack. Pushes the
   * results back on the stack. Will let Math.sqrt() handle the
   * errors such as negative numbers, etc. Math.sqrt() returns a NaN for
   * those conditions. We will throw on it. lastX gets set even if
   * an error as per HP11C
   */
  sqrt() {
    let xReg = this.pop();

    // always sets the lastX even if sqrt fails

    this._lastX = xReg;
    let sq = Math.sqrt(xReg);

    // catches negative and other bad things

    if (xReg < 0 || isNaN(sq)) {
      throw new Error('Negative numbers invalid for Square Root');
    }

    this._stack.push(sq);
  }
}

console.log('abc', 'dab', 'acc');
module.exports = Calculator;
