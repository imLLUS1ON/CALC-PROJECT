const display = document.getElementById("display");
let shouldResetDisplay = false;
let lastOperator = '';
let operatorPressed = false;

// Initialize display
function initializeCalculator() {
    if (display.value === "" || display.value === "0") {
        display.value = "0";
    }
}

function appendToDisplay(input) {
    // Reset display if needed
    if (shouldResetDisplay) {
        display.value = "";
        shouldResetDisplay = false;
    }
    
    // Handle initial zero
    if (display.value === "0" && input !== ".") {
        display.value = input;
    } else if (display.value === "0" && input === ".") {
        display.value = "0.";
    } else {
        // Prevent multiple decimal points
        if (input === "." && display.value.includes(".")) {
            return;
        }
        
        // Prevent multiple operators in a row
        if (isOperator(input) && isOperator(display.value.slice(-1))) {
            display.value = display.value.slice(0, -1) + input;
        } else {
            display.value += input;
        }
    }
    
    // Track operator usage
    if (isOperator(input)) {
        lastOperator = input;
        operatorPressed = true;
    } else {
        operatorPressed = false;
    }
    
    animateDisplay();
}

function isOperator(char) {
    return ['+', '-', '×', '÷', '*', '/'].includes(char);
}

function clearDisplay() {
    display.value = "0";
    shouldResetDisplay = false;
    lastOperator = '';
    operatorPressed = false;
    animateDisplay();
    
    // Clear animation effect
    display.style.background = "rgba(122, 132, 113, 0.3)";
    setTimeout(() => {
        display.style.background = "rgba(74, 64, 53, 0.4)";
    }, 200);
}

function deleteLast() {
    if (display.value.length > 1) {
        display.value = display.value.slice(0, -1);
    } else {
        display.value = "0";
    }
    
    // Reset operator tracking if we deleted an operator
    if (!display.value.match(/[+\-×÷*/]$/)) {
        operatorPressed = false;
    }
    
    animateDisplay();
}

function calculate() {
    try {
        // Store original for potential error recovery
        const originalValue = display.value;
        
        // Replace display symbols with actual operators
        let expression = display.value
            .replace(/×/g, '*')
            .replace(/÷/g, '/')
            .replace(/−/g, '-');
        
        // Remove trailing operators
        expression = expression.replace(/[+\-*/]$/, '');
        
        // Validate expression
        if (expression === "" || expression === "0") {
            return;
        }
        
        // Check for division by zero
        if (expression.includes('/0')) {
            throw new Error("Division by zero");
        }
        
        const result = eval(expression);
        
        // Check if result is valid
        if (!isFinite(result)) {
            throw new Error("Invalid calculation");
        }
        
        // Format result to avoid floating point issues
        const formattedResult = parseFloat(result.toPrecision(12));
        display.value = formattedResult.toString();
        shouldResetDisplay = true;
        operatorPressed = false;
        
        // Success animation
        display.style.transform = "scale(1.03)";
        display.style.background = "rgba(122, 132, 113, 0.4)";
        setTimeout(() => {
            display.style.transform = "scale(1)";
            display.style.background = "rgba(74, 64, 53, 0.4)";
        }, 200);
        
    } catch (error) {
        // Error handling
        display.value = "Error";
        shouldResetDisplay = true;
        operatorPressed = false;
        
        // Error animation
        display.style.background = "rgba(160, 113, 79, 0.4)";
        display.style.transform = "scale(1.02)";
        
        // Shake animation
        let shakeCount = 0;
        const shakeInterval = setInterval(() => {
            if (shakeCount < 6) {
                display.style.transform = `translateX(${shakeCount % 2 === 0 ? '3px' : '-3px'}) scale(1.02)`;
                shakeCount++;
            } else {
                clearInterval(shakeInterval);
                setTimeout(() => {
                    display.style.background = "rgba(74, 64, 53, 0.4)";
                    display.style.transform = "scale(1)";
                }, 500);
            }
        }, 100);
    }
}

function animateDisplay() {
    display.style.transform = "scale(1.01)";
    setTimeout(() => {
        display.style.transform = "scale(1)";
    }, 150);
}

// Enhanced ripple effect
function createRipple(button, e) {
    const ripple = document.createElement('span');
    ripple.classList.add('ripple');
    
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 0.6;
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    
    button.appendChild(ripple);
    
    setTimeout(() => {
        if (ripple.parentNode) {
            ripple.remove();
        }
    }, 600);
}

// Add event listeners to all buttons
document.addEventListener('DOMContentLoaded', function() {
    // Initialize calculator
    initializeCalculator();
    
    // Add ripple effect to all buttons
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', function(e) {
            createRipple(this, e);
        });
        
        // Add touch feedback for mobile
        button.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.96)';
        });
        
        button.addEventListener('touchend', function() {
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    });
});

// Enhanced keyboard support
document.addEventListener('keydown', function(e) {
    const key = e.key;
    
    // Prevent default for certain keys
    if (['/', 'Enter', '='].includes(key)) {
        e.preventDefault();
    }
    
    if (key >= '0' && key <= '9' || key === '.') {
        appendToDisplay(key);
    } else if (key === '+') {
        appendToDisplay('+');
    } else if (key === '-') {
        appendToDisplay('−');
    } else if (key === '*') {
        appendToDisplay('×');
    } else if (key === '/') {
        appendToDisplay('÷');
    } else if (key === 'Enter' || key === '=') {
        calculate();
    } else if (key === 'Escape' || key.toLowerCase() === 'c') {
        clearDisplay();
    } else if (key === 'Backspace' || key === 'Delete') {
        deleteLast();
    }
});

// Prevent context menu on long press (mobile)
document.addEventListener('contextmenu', function(e) {
    if (e.target.tagName === 'BUTTON') {
        e.preventDefault();
    }
});

// Handle window focus for display updates
window.addEventListener('focus', function() {
    if (display.value === "") {
        display.value = "0";
    }
});
