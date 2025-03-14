import React, { useState, useEffect } from "react";

const Calculator = () => {
  const [displayValue, setDisplayValue] = useState("0");
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  
  // Map keyboard keys to visual button ids
  const keyToButtonMap: Record<string, string> = {
    '0': 'digit-0',
    '1': 'digit-1',
    '2': 'digit-2',
    '3': 'digit-3',
    '4': 'digit-4',
    '5': 'digit-5',
    '6': 'digit-6',
    '7': 'digit-7',
    '8': 'digit-8',
    '9': 'digit-9',
    '+': 'op-add',
    '-': 'op-subtract',
    '*': 'op-multiply',
    'x': 'op-multiply',
    '×': 'op-multiply',
    '/': 'op-divide',
    '÷': 'op-divide',
    '=': 'op-equals',
    'Enter': 'op-equals',
    '.': 'digit-decimal',
    'Escape': 'func-clear',
    'Backspace': 'func-clear',
    'Delete': 'func-clear',
    '%': 'func-percent',
  };
  
  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Get button ID for this key
      const buttonId = keyToButtonMap[event.key];
      
      // Prevent default behavior for keys we're handling
      if (buttonId) {
        event.preventDefault();
        setActiveKey(buttonId);
      }
      
      // Handle numeric keys
      if (/[0-9]/.test(event.key)) {
        inputDigit(event.key);
      } 
      // Handle operators
      else if (event.key === '+') {
        handleOperator('+');
      } 
      else if (event.key === '-') {
        handleOperator('-');
      } 
      else if (event.key === '*' || event.key === 'x' || event.key === '×') {
        handleOperator('*');
      } 
      else if (event.key === '/' || event.key === '÷') {
        handleOperator('/');
      } 
      else if (event.key === '=' || event.key === 'Enter') {
        handleOperator('=');
      } 
      // Handle decimal point
      else if (event.key === '.') {
        inputDecimal();
      } 
      // Handle clear (Escape)
      else if (event.key === 'Escape') {
        clearDisplay();
      } 
      // Handle delete/backspace
      else if (event.key === 'Backspace' || event.key === 'Delete') {
        // Remove the last character
        if (displayValue.length > 1 && !waitingForOperand) {
          setDisplayValue(displayValue.slice(0, -1));
        } else {
          setDisplayValue('0');
        }
      }
      // Handle percent
      else if (event.key === '%') {
        handlePercent();
      }
    };
    
    const handleKeyUp = () => {
      // Clear active key
      setActiveKey(null);
    };

    // Add event listeners
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    // Cleanup function
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [displayValue, operator, prevValue, waitingForOperand]); // Dependencies

  const inputDigit = (digit: string) => {
    // Check if we're already at maximum reasonable length (prevent excessive input)
    if (displayValue.replace(/[^\d]/g, '').length >= 15 && !waitingForOperand) {
      return; // Don't add more digits if we're at max length
    }
    
    if (waitingForOperand) {
      setDisplayValue(digit);
      setWaitingForOperand(false);
    } else {
      setDisplayValue(displayValue === "0" ? digit : displayValue + digit);
    }
  };

  const inputDecimal = () => {
    if (waitingForOperand) {
      setDisplayValue("0.");
      setWaitingForOperand(false);
      return;
    }
    if (!displayValue.includes(".")) {
      setDisplayValue(displayValue + ".");
    }
  };

  const clearDisplay = () => {
    setDisplayValue("0");
    setPrevValue(null);
    setOperator(null);
    setWaitingForOperand(false);
  };

  const toggleSign = () => {
    const value = parseFloat(displayValue);
    setDisplayValue(String(value * -1));
  };

  const handlePercent = () => {
    const value = parseFloat(displayValue);
    setDisplayValue(String(value / 100));
  };

  const handleOperator = (nextOperator: string) => {
    const inputValue = parseFloat(displayValue);
    if (prevValue === null) {
      setPrevValue(inputValue);
    } else if (operator) {
      const result = calculate(prevValue, inputValue, operator);
      setPrevValue(result);
      setDisplayValue(String(result));
    }
    setWaitingForOperand(true);
    setOperator(nextOperator === "=" ? null : nextOperator);
  };

  // Helper function to handle large numbers and prevent floating point errors
  const formatResult = (num: number): number => {
    // Prevent overflow when reaching max safe integer
    if (Math.abs(num) > Number.MAX_SAFE_INTEGER) {
      return num > 0 ? Number.MAX_SAFE_INTEGER : -Number.MAX_SAFE_INTEGER;
    }
    
    // Fix floating point precision errors
    const numStr = num.toString();
    if (numStr.includes('.')) {
      const [intPart, decPart] = numStr.split('.');
      if (decPart.length > 10) {
        // Round to 10 decimal places to avoid excessive length
        return parseFloat(num.toFixed(10));
      }
    }
    
    return num;
  };

  const calculate = (prev: number, current: number, op: string): number => {
    let result;
    
    switch (op) {
      case "+":
        result = prev + current;
        break;
      case "-":
        result = prev - current;
        break;
      case "*":
        result = prev * current;
        break;
      case "/":
        result = prev / current;
        break;
      default:
        return current;
    }
    
    return formatResult(result);
  };

  // Format the display value to add commas for thousands and handle overflow
  const formattedDisplayValue = () => {
    const num = parseFloat(displayValue);
    
    // Format the number with commas
    let formatted;
    
    if (displayValue.includes('.')) {
      const [intPart, decPart] = displayValue.split('.');
      // Limit decimal places to avoid excessive length
      const limitedDecPart = decPart.slice(0, 8);
      formatted = Number(intPart).toLocaleString() + '.' + limitedDecPart;
    } else {
      formatted = Number(displayValue).toLocaleString();
    }
    
    // Handle overflow by reducing font size based on length
    const length = formatted.length;
    
    // Adjust font size based on length of the number
    if (length > 20) {
      document.documentElement.style.setProperty('--display-font-size', '14px');
    } else if (length > 16) {
      document.documentElement.style.setProperty('--display-font-size', '18px');
    } else if (length > 13) {
      document.documentElement.style.setProperty('--display-font-size', '22px');
    } else if (length > 10) {
      document.documentElement.style.setProperty('--display-font-size', '28px');
    } else if (length > 8) {
      document.documentElement.style.setProperty('--display-font-size', '35px');
    } else {
      document.documentElement.style.setProperty('--display-font-size', '48px');
    }
    
    return formatted;
  };

  return (
    <div className="w-72 bg-gray-900 rounded-xl shadow-2xl overflow-hidden calculator" tabIndex={0}>
      {/* Display */}
      <div className="flex justify-end items-center h-24 px-6 text-white calculator-display">
        <div className="font-light truncate w-full text-right whitespace-nowrap overflow-x-auto" style={{ fontSize: 'var(--display-font-size)' }}>
          {formattedDisplayValue()}
        </div>
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-4 gap-px calculator-buttons">
        {/* Row 1 */}
        <button 
          id="func-clear"
          onClick={clearDisplay}
          className={`h-16 text-xl font-medium ${activeKey === 'func-clear' ? 'bg-gray-300' : 'bg-gray-400'} text-black hover:bg-gray-300 calculator-button function-button`}>
          AC
        </button>
        <button 
          id="func-negate"
          onClick={toggleSign}
          className={`h-16 text-xl font-medium ${activeKey === 'func-negate' ? 'bg-gray-300' : 'bg-gray-400'} text-black hover:bg-gray-300 calculator-button function-button`}>
          +/-
        </button>
        <button 
          id="func-percent"
          onClick={handlePercent}
          className={`h-16 text-xl font-medium ${activeKey === 'func-percent' ? 'bg-gray-300' : 'bg-gray-400'} text-black hover:bg-gray-300 calculator-button function-button`}>
          %
        </button>
        <button 
          id="op-divide"
          onClick={() => handleOperator("/")}
          className={`h-16 text-xl font-medium ${activeKey === 'op-divide' ? 'bg-orange-400' : 'bg-orange-500'} text-white hover:bg-orange-400 calculator-button operator-button`}>
          ÷
        </button>

        {/* Row 2 */}
        <button 
          id="digit-7"
          onClick={() => inputDigit("7")}
          className={`h-16 text-xl font-medium ${activeKey === 'digit-7' ? 'bg-gray-600' : 'bg-gray-700'} text-white hover:bg-gray-600 calculator-button digit-button`}>
          7
        </button>
        <button 
          id="digit-8"
          onClick={() => inputDigit("8")}
          className={`h-16 text-xl font-medium ${activeKey === 'digit-8' ? 'bg-gray-600' : 'bg-gray-700'} text-white hover:bg-gray-600 calculator-button digit-button`}>
          8
        </button>
        <button 
          id="digit-9"
          onClick={() => inputDigit("9")}
          className={`h-16 text-xl font-medium ${activeKey === 'digit-9' ? 'bg-gray-600' : 'bg-gray-700'} text-white hover:bg-gray-600 calculator-button digit-button`}>
          9
        </button>
        <button 
          id="op-multiply"
          onClick={() => handleOperator("*")}
          className={`h-16 text-xl font-medium ${activeKey === 'op-multiply' ? 'bg-orange-400' : 'bg-orange-500'} text-white hover:bg-orange-400 calculator-button operator-button`}>
          ×
        </button>

        {/* Row 3 */}
        <button 
          id="digit-4"
          onClick={() => inputDigit("4")}
          className={`h-16 text-xl font-medium ${activeKey === 'digit-4' ? 'bg-gray-600' : 'bg-gray-700'} text-white hover:bg-gray-600 calculator-button digit-button`}>
          4
        </button>
        <button 
          id="digit-5"
          onClick={() => inputDigit("5")}
          className={`h-16 text-xl font-medium ${activeKey === 'digit-5' ? 'bg-gray-600' : 'bg-gray-700'} text-white hover:bg-gray-600 calculator-button digit-button`}>
          5
        </button>
        <button 
          id="digit-6"
          onClick={() => inputDigit("6")}
          className={`h-16 text-xl font-medium ${activeKey === 'digit-6' ? 'bg-gray-600' : 'bg-gray-700'} text-white hover:bg-gray-600 calculator-button digit-button`}>
          6
        </button>
        <button 
          id="op-subtract"
          onClick={() => handleOperator("-")}
          className={`h-16 text-xl font-medium ${activeKey === 'op-subtract' ? 'bg-orange-400' : 'bg-orange-500'} text-white hover:bg-orange-400 calculator-button operator-button`}>
          −
        </button>

        {/* Row 4 */}
        <button 
          id="digit-1"
          onClick={() => inputDigit("1")}
          className={`h-16 text-xl font-medium ${activeKey === 'digit-1' ? 'bg-gray-600' : 'bg-gray-700'} text-white hover:bg-gray-600 calculator-button digit-button`}>
          1
        </button>
        <button 
          id="digit-2"
          onClick={() => inputDigit("2")}
          className={`h-16 text-xl font-medium ${activeKey === 'digit-2' ? 'bg-gray-600' : 'bg-gray-700'} text-white hover:bg-gray-600 calculator-button digit-button`}>
          2
        </button>
        <button 
          id="digit-3"
          onClick={() => inputDigit("3")}
          className={`h-16 text-xl font-medium ${activeKey === 'digit-3' ? 'bg-gray-600' : 'bg-gray-700'} text-white hover:bg-gray-600 calculator-button digit-button`}>
          3
        </button>
        <button 
          id="op-add"
          onClick={() => handleOperator("+")}
          className={`h-16 text-xl font-medium ${activeKey === 'op-add' ? 'bg-orange-400' : 'bg-orange-500'} text-white hover:bg-orange-400 calculator-button operator-button`}>
          +
        </button>

        {/* Row 5 */}
        <button 
          id="digit-0"
          onClick={() => inputDigit("0")}
          className={`h-16 text-xl font-medium ${activeKey === 'digit-0' ? 'bg-gray-600' : 'bg-gray-700'} text-white hover:bg-gray-600 col-span-2 px-6 flex items-center justify-start calculator-button digit-button zero-button`}>
          0
        </button>
        <button 
          id="digit-decimal"
          onClick={inputDecimal}
          className={`h-16 text-xl font-medium ${activeKey === 'digit-decimal' ? 'bg-gray-600' : 'bg-gray-700'} text-white hover:bg-gray-600 calculator-button digit-button`}>
          .
        </button>
        <button 
          id="op-equals"
          onClick={() => handleOperator("=")}
          className={`h-16 text-xl font-medium ${activeKey === 'op-equals' ? 'bg-orange-400' : 'bg-orange-500'} text-white hover:bg-orange-400 calculator-button operator-button`}>
          =
        </button>
      </div>
    </div>
  );
};

export default Calculator;