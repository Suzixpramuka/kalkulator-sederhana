document.addEventListener("DOMContentLoaded", () => {
  // --- Elemen Umum (Login & Kalkulator) ---
  const usernameInput = document.getElementById("username");
  const loginButton = document.getElementById("loginButton");
  const loggedInUserDisplay = document.getElementById("loggedInUser");
  const logoutButton = document.getElementById("logoutButton");

  // --- Elemen Kalkulator (hanya akan ditemukan di calculator.html) ---
  const historyDisplay = document.getElementById("historyDisplay");
  const mainDisplay = document.getElementById("mainDisplay");
  const buttons = document.querySelectorAll(".button");

  // --- Variabel Kalkulator ---
  let currentInput = "0";
  let previousInput = "";
  let operator = null;
  let calculationHistory = "";
  let isNewCalculation = true;
  let waitingForSecondOperand = false;

  // --- Fungsi Navigasi & Login/Logout ---

  // Fungsi untuk menyimpan nama user ke localStorage
  function saveUser(username) {
    localStorage.setItem("loggedInUsername", username);
  }

  // Fungsi untuk mendapatkan nama user dari localStorage
  function getUser() {
    return localStorage.getItem("loggedInUsername");
  }

  // Fungsi untuk menghapus user dari localStorage
  function removeUser() {
    localStorage.removeItem("loggedInUsername");
  }

  // --- Logika Halaman Login (index.html) ---
  // Memeriksa apakah elemen-elemen login ada di halaman ini
  if (loginButton && usernameInput) {
    loginButton.addEventListener("click", () => {
      const username = usernameInput.value.trim();
      if (username) {
        saveUser(username);
        // Arahkan ke halaman kalkulator
        window.location.href = `calculator.html`;
      } else {
        alert("Nama tidak boleh kosong!");
        usernameInput.focus();
      }
    });

    // Memungkinkan login dengan Enter
    usernameInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") {
        loginButton.click();
      }
    });
  }

  // --- Logika Halaman Kalkulator (calculator.html) ---
  // Memeriksa apakah elemen-elemen kalkulator ada di halaman ini
  if (mainDisplay && historyDisplay) {
    const username = getUser();
    if (username) {
      loggedInUserDisplay.textContent = username;
    } else {
      // Jika tidak ada user login, arahkan kembali ke login page
      window.location.href = `index.html`; // Langsung redirect jika tidak ada user
      return; // Hentikan eksekusi script kalkulator
    }

    // Event Listener untuk tombol Logout
    if (logoutButton) {
      logoutButton.addEventListener("click", () => {
        removeUser();
        window.location.href = `index.html`; // Kembali ke halaman login
      });
    }

    // Event Listener untuk semua tombol kalkulator
    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const value = button.dataset.value; // dataset.value akan selalu string atau undefined
        handleButtonClick(value);
      });
    });

    // Event Listener untuk keyboard
    document.addEventListener("keydown", (e) => {
      const key = e.key;
      const keyMap = {
        0: "0",
        1: "1",
        2: "2",
        3: "3",
        4: "4",
        5: "5",
        6: "6",
        7: "7",
        8: "8",
        9: "9",
        ".": "decimal",
        "+": "add",
        "-": "subtract",
        "*": "multiply",
        "/": "divide",
        Enter: "equals",
        "=": "equals",
        Backspace: "backspace",
        Escape: "clear", // Esc key for All Clear
        "%": "percentage",
      };

      if (keyMap[key]) {
        e.preventDefault();
        handleButtonClick(keyMap[key]);
      } else if (key === "^") {
        e.preventDefault();
        handleButtonClick("power");
      } else if (key.toLowerCase() === "s" && e.altKey) {
        e.preventDefault();
        handleButtonClick("sin");
      } else if (key.toLowerCase() === "c" && e.altKey) {
        e.preventDefault();
        handleButtonClick("cos");
      } else if (key.toLowerCase() === "t" && e.altKey) {
        e.preventDefault();
        handleButtonClick("tan");
      } else if (key.toLowerCase() === "q" && e.altKey) {
        e.preventDefault();
        handleButtonClick("sqrt");
      } else if (key.toLowerCase() === "l" && e.altKey) {
        e.preventDefault();
        handleButtonClick("log");
      } else if (key.toLowerCase() === "p" && e.altKey) {
        e.preventDefault();
        handleButtonClick("pi");
      } else if (key.toLowerCase() === "e" && e.altKey) {
        e.preventDefault();
        handleButtonClick("e");
      }
    });

    // Fungsi Utama untuk Menangani Klik Tombol
    function handleButtonClick(value) {
      if (value === undefined || value === null) return;

      if (["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].includes(value)) {
        handleNumber(value);
      } else if (value === "decimal") {
        handleDecimal();
      } else if (["add", "subtract", "multiply", "divide"].includes(value)) {
        handleOperator(value);
      } else if (value === "equals") {
        handleEquals();
      } else if (value === "clear") {
        clearDisplay();
      } else if (value === "backspace") {
        backspace();
      } else if (value === "percentage") {
        handlePercentage();
      } else if (value === "pm") {
        // Plus/Minus
        handlePlusMinus();
      } else if (
        ["sqrt", "power", "log", "sin", "cos", "tan", "pi", "e"].includes(value)
      ) {
        handleScientific(value);
      }
      updateDisplay();
    }

    function handleNumber(num) {
      if (
        isNewCalculation ||
        currentInput === "0" ||
        mainDisplay.textContent.includes("Error")
      ) {
        // Reset jika ada error
        currentInput = num;
        isNewCalculation = false;
        waitingForSecondOperand = false;
      } else {
        currentInput += num;
      }
    }

    function handleDecimal() {
      if (isNewCalculation || mainDisplay.textContent.includes("Error")) {
        // Reset jika ada error
        currentInput = "0.";
        isNewCalculation = false;
        waitingForSecondOperand = false;
      } else if (!currentInput.includes(".")) {
        currentInput += ".";
      }
    }

    function handleOperator(nextOperator) {
      if (mainDisplay.textContent.includes("Error")) {
        // Jika display menunjukkan error, reset
        clearDisplay();
        currentInput = "0"; // Mulai dari 0
      }

      if (operator && waitingForSecondOperand) {
        // Mengganti operator jika belum ada angka kedua
        operator = nextOperator;
        calculationHistory = `${previousInput} ${getOperatorSymbol(operator)}`;
        return;
      }

      if (previousInput === "") {
        // Jika ini operasi pertama
        previousInput = currentInput;
      } else if (operator) {
        // Jika ada operasi sebelumnya yang belum dihitung
        calculate();
        previousInput = currentInput; // Hasil perhitungan menjadi previousInput baru
      }

      operator = nextOperator;
      calculationHistory = `${previousInput} ${getOperatorSymbol(operator)}`;
      waitingForSecondOperand = true;
      isNewCalculation = true;
    }

    function handleEquals() {
      if (mainDisplay.textContent.includes("Error")) {
        // Jika display menunjukkan error, reset
        clearDisplay();
        return;
      }

      if (!operator) {
        // Tidak ada operator yang dipilih, hanya tampilkan angka saat ini
        calculationHistory = currentInput + " =";
        isNewCalculation = true;
        return;
      }
      if (waitingForSecondOperand) {
        // Operator dipilih tapi angka kedua belum ada
        currentInput = previousInput; // Tampilkan previousInput
        calculationHistory = `${previousInput} ${getOperatorSymbol(
          operator
        )} =`;
        operator = null;
        isNewCalculation = true;
        waitingForSecondOperand = false;
        updateDisplay();
        return;
      }

      const currentOperand = currentInput; // Simpan operand saat ini sebelum calculate mengubah currentInput
      const operatorSymbol = getOperatorSymbol(operator);

      calculate(); // Melakukan perhitungan

      // Setelah calculate, currentInput sudah berisi hasil
      calculationHistory = `${previousInput} ${operatorSymbol} ${currentOperand} =`; // History lengkap
      operator = null; // Reset operator
      waitingForSecondOperand = false;
      isNewCalculation = true;
      previousInput = ""; // Clear previous input after equals
    }

    function calculate() {
      let prev = parseFloat(previousInput);
      let curr = parseFloat(currentInput);

      if (isNaN(prev) || isNaN(curr)) {
        currentInput = "Error";
        previousInput = "";
        operator = null;
        calculationHistory = "";
        isNewCalculation = true;
        waitingForSecondOperand = false;
        return;
      }

      let calculatedResult;
      switch (operator) {
        case "add":
          calculatedResult = prev + curr;
          break;
        case "subtract":
          calculatedResult = prev - curr;
          break;
        case "multiply":
          calculatedResult = prev * curr;
          break;
        case "divide":
          if (curr === 0) {
            calculatedResult = "Error: Nol";
            break;
          }
          calculatedResult = prev / curr;
          break;
        default:
          currentInput = "Error"; // Operator tidak dikenal
          return;
      }

      if (
        typeof calculatedResult === "number" &&
        !isNaN(calculatedResult) &&
        isFinite(calculatedResult)
      ) {
        currentInput = String(parseFloat(calculatedResult.toFixed(10)));
      } else {
        currentInput = String(calculatedResult);
      }
      // previousInput tidak direset di sini, hanya di handleOperator atau handleEquals
    }

    function clearDisplay() {
      currentInput = "0";
      previousInput = "";
      operator = null;
      calculationHistory = "";
      isNewCalculation = true;
      waitingForSecondOperand = false;
    }

    function backspace() {
      if (
        mainDisplay.textContent.includes("Error") ||
        currentInput === "Error"
      ) {
        // Jika ada error, langsung clear
        clearDisplay();
        return;
      }
      if (isNewCalculation && currentInput !== "0") {
        currentInput = "0";
        isNewCalculation = false;
      } else if (
        currentInput.length === 1 ||
        (currentInput.length === 2 && currentInput[0] === "-")
      ) {
        currentInput = "0";
      } else {
        currentInput = currentInput.slice(0, -1);
      }
    }

    function handlePercentage() {
      if (mainDisplay.textContent.includes("Error")) {
        clearDisplay();
        return;
      }
      let num = parseFloat(currentInput);
      if (isNaN(num)) return;
      currentInput = String(parseFloat((num / 100).toFixed(10)));
      isNewCalculation = true;
      waitingForSecondOperand = false;
    }

    function handlePlusMinus() {
      if (mainDisplay.textContent.includes("Error")) {
        clearDisplay();
        return;
      }
      let num = parseFloat(currentInput);
      if (isNaN(num)) return;
      currentInput = String(-num);
    }

    function handleScientific(func) {
      if (mainDisplay.textContent.includes("Error")) {
        clearDisplay();
        return;
      }
      let num = parseFloat(currentInput);

      let scientificResult;
      switch (func) {
        case "sqrt":
          if (num < 0) {
            scientificResult = "Error: Negatif";
          } else {
            scientificResult = Math.sqrt(num);
          }
          break;
        case "power":
          scientificResult = Math.pow(num, 2);
          break;
        case "log":
          if (num <= 0) {
            scientificResult = "Error: Invalid";
          } else {
            scientificResult = Math.log10(num);
          }
          break;
        case "sin":
          scientificResult = Math.sin(num * (Math.PI / 180));
          break;
        case "cos":
          scientificResult = Math.cos(num * (Math.PI / 180));
          break;
        case "tan":
          // Tangen untuk 90 + k*180 adalah tak terdefinisi
          // Menggunakan modulo 180 dan membandingkan dengan 90 untuk akurasi floating point
          let angleMod180 = Math.abs(num % 180);
          if (angleMod180 > 89.999999999 && angleMod180 < 90.000000001) {
            scientificResult = "Error: Undefined";
          } else {
            scientificResult = Math.tan(num * (Math.PI / 180));
          }
          break;
        case "pi":
          scientificResult = Math.PI;
          break;
        case "e":
          scientificResult = Math.E;
          break;
        default:
          return;
      }

      if (
        typeof scientificResult === "number" &&
        !isNaN(scientificResult) &&
        isFinite(scientificResult)
      ) {
        currentInput = String(parseFloat(scientificResult.toFixed(10)));
      } else {
        currentInput = String(scientificResult);
      }

      previousInput = "";
      operator = null;
      calculationHistory = "";
      isNewCalculation = true;
      waitingForSecondOperand = false;
    }

    function getOperatorSymbol(op) {
      switch (op) {
        case "add":
          return "+";
        case "subtract":
          return "−";
        case "multiply":
          return "×";
        case "divide":
          return "÷";
        default:
          return "";
      }
    }

    function updateDisplay() {
      mainDisplay.textContent = currentInput;
      historyDisplay.textContent = calculationHistory;
    }

    // Inisialisasi tampilan saat pertama kali masuk halaman
    updateDisplay();
  }
});
