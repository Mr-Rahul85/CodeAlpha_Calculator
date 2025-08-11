const display = document.getElementById("display");
const historyList = document.getElementById("history-list");
let currentInput = "0";
let lastResult = null;
let resetNext = false;
let history = [];

function formatNumber(num) {
  return String(
    Number(num).toLocaleString(undefined, { maximumFractionDigits: 8 })
  );
}

function renderDisplay() {
  display.textContent = currentInput.length < 1 ? "0" : currentInput;
}

function addToHistory(expr, result) {
  const item = document.createElement("li");
  item.textContent = `${expr} = ${result}`;
  historyList.insertBefore(item, historyList.firstChild);

  if (historyList.children.length > 20)
    historyList.removeChild(historyList.lastChild);
}

function input(value) {
  if (resetNext && "0123456789.".includes(value)) {
    currentInput = value === "." ? "0." : value;
    resetNext = false;
    renderDisplay();
    return;
  }

  if (value >= "0" && value <= "9") {
    if (currentInput === "0") currentInput = value;
    else currentInput += value;
  } else if (value === ".") {
    let tokens = currentInput.split(/[\+\-\*\/]/);
    let lastToken = tokens[tokens.length - 1];
    if (!lastToken.includes(".")) {
      currentInput += ".";
    }
  } else if ("+-*/".includes(value)) {
    if (/[\+\-\*\/]$/.test(currentInput)) {
      currentInput = currentInput.slice(0, -1) + value;
    } else if (currentInput.length > 0) {
      currentInput += value;
    }
    resetNext = false;
  } else if (value === "%") {
    let tokens = currentInput.match(/(.+?)([\d.]+)$/);
    if (tokens) {
      let before = tokens[1] || "";
      let num = tokens[2];
      let result = String(Number(num) / 100);
      currentInput = before + result;
    }
  }
  renderDisplay();
}

function evaluate() {
  try {
    let expr = currentInput.replace(/÷/g, "/").replace(/×/g, "*");

    let exprForHistory = currentInput.replace(/\*/g, "×").replace(/\//g, "÷");

    if (/[^0-9+\-*/.()%]/.test(expr)) {
      throw Error("Invalid expression");
    }
    let result = Function('"use strict";return (' + expr + ")")();
    if (result === Infinity || isNaN(result)) throw Error("Math Error");
    result = formatNumber(result);
    addToHistory(exprForHistory, result);
    currentInput = result;
    resetNext = true;
    renderDisplay();
  } catch (e) {
    currentInput = "Error";
    renderDisplay();
    resetNext = true;
  }
}

function clearDisplay() {
  currentInput = "0";
  renderDisplay();
}

function backspace() {
  if (resetNext) {
    currentInput = "0";
    resetNext = false;
  } else {
    currentInput = currentInput.length > 1 ? currentInput.slice(0, -1) : "0";
  }
  renderDisplay();
}

document.querySelectorAll(".btn").forEach((btn) => {
  btn.addEventListener("click", function () {
    const act = this.getAttribute("data-action");
    switch (act) {
      case "clear":
        clearDisplay();
        break;
      case "back":
        backspace();
        break;
      case "=":
        evaluate();
        break;
      default:
        input(act);
    }
  });
});

window.addEventListener("keydown", (e) => {
  if (e.key >= "0" && e.key <= "9") input(e.key);
  else if (e.key === "." || e.key === ",") input(".");
  else if (e.key === "+" || e.key === "-" || e.key === "*" || e.key === "/")
    input(e.key);
  else if (e.key === "Enter" || e.key === "=") {
    evaluate();
    e.preventDefault();
  } else if (e.key === "Backspace") backspace();
  else if (e.key.toLowerCase() === "c") clearDisplay();
  else if (e.key === "%") input("%");

  let btn = Array.from(document.querySelectorAll(".btn")).find(
    (b) => b.getAttribute("data-action") === e.key
  );
  if (btn) {
    btn.classList.add("active");
    setTimeout(() => btn.classList.remove("active"), 100);
  }
});

renderDisplay();
