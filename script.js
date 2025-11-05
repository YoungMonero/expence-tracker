// DOM Elements
const balanceEl = document.querySelector(".tbal h1")
const incomeEl = document.querySelector(".income h2")
const expenseEl = document.querySelector(".expences h2")
const transactionListEl = document.querySelector(".transactions-history")
const formEl = document.getElementById("transaction-form")
const descriptionEl = document.getElementById("description")
const amountEl = document.getElementById("amount")
const dateEl = document.getElementById("date")
const incomeRadio = document.getElementById("income")
const expenseRadio = document.getElementById("expenses")
const dashBoard = document.getElementById("dashboard")
const addTransactionButton = document.getElementById("addtransaction")
const totalTransact = document.getElementById("totaltransact")
const homePage = document.getElementById("homepage")
const expences = document.getElementById("totalexpences")
const transaction = document.getElementById("totaltransaction")
const add = document.getElementById("add")
const totalBalanceEl = document.querySelector(".totaltransact .tbal h1")
const totalIncomeEl = document.querySelector(".totaltransact .income h2")
const totalExpenseEl = document.querySelector(".totaltransact .expences h2")
const monthlyIncomeList = document.querySelector(".monthly-income")
const monthlyExpenseList = document.querySelector(".monthly-expense")

// Set default date to today
if (dateEl) {
  dateEl.valueAsDate = new Date()
}

// Load transactions from localStorage
let transactions = loadTransactions()

// Initialize app
function init() {
  // Clear transaction lists
  if (transactionListEl) {
    // Keep the header
    const header = transactionListEl.querySelector(".tra-p")
    transactionListEl.innerHTML = ""
    if (header) {
      transactionListEl.appendChild(header)
    } else {
      // Create header if it doesn't exist
      const headerDiv = document.createElement("div")
      headerDiv.className = "tra-p"
      headerDiv.innerHTML = `
        <h2>Transaction History</h2>
        <p>see all</p>
      `
      transactionListEl.appendChild(headerDiv)
    }
  }

  // Clear monthly income and expense lists
  if (monthlyIncomeList) {
    // Keep the header
    const header = monthlyIncomeList.querySelector("h2")
    monthlyIncomeList.innerHTML = ""
    if (header) {
      monthlyIncomeList.appendChild(header)
    } else {
      const headerEl = document.createElement("h2")
      headerEl.textContent = "This monthly income"
      monthlyIncomeList.appendChild(headerEl)
    }
  }

  if (monthlyExpenseList) {
    // Keep the header
    const header = monthlyExpenseList.querySelector("h2")
    monthlyExpenseList.innerHTML = ""
    if (header) {
      monthlyExpenseList.appendChild(header)
    } else {
      const headerEl = document.createElement("h2")
      headerEl.textContent = "Total monthly Expenses"
      monthlyExpenseList.appendChild(headerEl)
    }
  }

  // Add transactions to DOM
  transactions.forEach((transaction) => {
    // Add to main dashboard
    addTransactionDOM(transaction)

    // Add to monthly lists
    if (transaction.amount > 0) {
      addMonthlyTransactionDOM(transaction, monthlyIncomeList)
    } else {
      addMonthlyTransactionDOM(transaction, monthlyExpenseList)
    }
  })

  // Update balance, income and expense
  updateValues()

  // Create charts if the container exists
  if (document.getElementById("totaltransact")) {
    // Add all transactions section to totaltransact
    createAllTransactionsSection()

    // Create charts
    createIncomeExpenseChart()
    createMonthlySpendingChart()
  }
}

// Create all transactions section
function createAllTransactionsSection() {
  // Check if the section already exists
  const existingSection = document.querySelector(".all-transactions-section")
  if (existingSection) {
    existingSection.remove()
  }

  // Create container
  const allTransactionsSection = document.createElement("div")
  allTransactionsSection.className = "monthly-income all-transactions-section"
  allTransactionsSection.style.marginTop = "20px"

  // Add title
  const title = document.createElement("h2")
  title.textContent = "All Transactions"
  allTransactionsSection.appendChild(title)

  // Sort transactions by date (newest first)
  const sortedTransactions = [...transactions].sort((a, b) => {
    return new Date(b.date) - new Date(a.date)
  })

  // Add transactions
  if (sortedTransactions.length === 0) {
    const emptyMessage = document.createElement("div")
    emptyMessage.className = "transactions trans"
    emptyMessage.innerHTML = `
      <div class="stuffs">
        <h3>No transactions found</h3>
        <p>Add some transactions to get started</p>
      </div>
    `
    allTransactionsSection.appendChild(emptyMessage)
  } else {
    sortedTransactions.forEach((transaction) => {
      const isIncome = transaction.amount > 0

      // Format date
      const date = new Date(transaction.date)
      const formattedDate = date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })

      // Create transaction element
      const transactionDiv = document.createElement("div")
      transactionDiv.className = "transactions trans"
      transactionDiv.setAttribute("data-id", transaction.id)

      transactionDiv.innerHTML = `
        <div class="stuffs">
          <h3>${transaction.description}</h3>
          <p>${formattedDate}</p>
        </div>
        <div class="amount ${isIncome ? "" : "neg"}">
          ${isIncome ? "+" : "-"}$${Math.abs(transaction.amount).toFixed(2)}
        </div>
      `

      // Add delete functionality on click
      transactionDiv.addEventListener("click", () => {
        removeTransaction(transaction.id)
      })

      allTransactionsSection.appendChild(transactionDiv)
    })
  }

  // Add to page - insert before the first chart
  const firstChart = document.querySelector("#totaltransact .monthly-income:not(.monthly-expense)")
  if (firstChart) {
    document.getElementById("totaltransact").insertBefore(allTransactionsSection, firstChart)
  } else {
    document.getElementById("totaltransact").appendChild(allTransactionsSection)
  }
}

// Add transaction
function addTransaction(e) {
  e.preventDefault()

  if (!descriptionEl.value.trim() || !amountEl.value.trim()) {
    alert("Please add a description and amount")
    return
  }

  // Get transaction type (income or expense)
  const isIncome = incomeRadio.checked

  // Convert amount to positive or negative based on type
  let amount = Number.parseFloat(amountEl.value)
  if (!isIncome) {
    amount = -Math.abs(amount)
  } else {
    amount = Math.abs(amount)
  }

  const transaction = {
    id: generateID(),
    description: descriptionEl.value,
    amount: amount,
    date: dateEl.value,
  }

  transactions.push(transaction)

  addTransactionDOM(transaction)
  updateValues()
  saveTransactions(transactions)

  // Reset form
  formEl.reset()
  dateEl.valueAsDate = new Date()

  // Switch back to dashboard
  dashBoard.style.display = "block"
  addTransactionButton.style.display = "none"
}

// Generate random ID
function generateID() {
  return Math.floor(Math.random() * 1000000000)
}

// Add transaction to DOM list
function addTransactionDOM(transaction) {
  const isIncome = transaction.amount > 0

  // Format date
  const date = new Date(transaction.date)
  const formattedDate = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

  // Create transaction element
  const transactionDiv = document.createElement("div")
  transactionDiv.className = "transactions"
  transactionDiv.setAttribute("data-id", transaction.id)

  transactionDiv.innerHTML = `
    <div class="stuffs">
      <h3>${transaction.description}</h3>
      <p>${formattedDate}</p>
    </div>
    <div class="amount ${isIncome ? "" : "neg"}">
      ${isIncome ? "+" : "-"}$${Math.abs(transaction.amount).toFixed(2)}
    </div>
  `

  // Add delete functionality on click
  transactionDiv.addEventListener("click", () => {
    removeTransaction(transaction.id)
  })

  // Add to transaction history
  if (transactionListEl) {
    transactionListEl.appendChild(transactionDiv)
  }
}

// Add transaction to monthly lists
function addMonthlyTransactionDOM(transaction, container) {
  if (!container) return

  const isIncome = transaction.amount > 0

  // Format date
  const date = new Date(transaction.date)
  const formattedDate = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })

  // Create transaction element
  const transactionDiv = document.createElement("div")
  transactionDiv.className = "transactions trans"
  transactionDiv.setAttribute("data-id", transaction.id)

  transactionDiv.innerHTML = `
    <div class="stuffs">
      <h3>${transaction.description}</h3>
      <p>${formattedDate}</p>
    </div>
    <div class="amount ${isIncome ? "" : "neg"}">
      ${isIncome ? "+" : "-"}$${Math.abs(transaction.amount).toFixed(2)}
    </div>
  `

  // Add delete functionality on click
  transactionDiv.addEventListener("click", () => {
    removeTransaction(transaction.id)
  })

  // Add to container
  container.appendChild(transactionDiv)
}

// Update the balance, income and expense
function updateValues() {
  const amounts = transactions.map((transaction) => transaction.amount)

  const total = amounts.reduce((acc, item) => (acc += item), 0).toFixed(2)

  const income = amounts
    .filter((item) => item > 0)
    .reduce((acc, item) => (acc += item), 0)
    .toFixed(2)

  const expense = (amounts.filter((item) => item < 0).reduce((acc, item) => (acc += item), 0) * -1).toFixed(2)

  // Update main dashboard
  if (balanceEl) balanceEl.innerText = `$${total}`
  if (incomeEl) incomeEl.innerText = `$${income}`
  if (expenseEl) expenseEl.innerText = `$${expense}`

  // Update total transactions page
  if (totalBalanceEl) totalBalanceEl.innerText = `$${total}`
  if (totalIncomeEl) totalIncomeEl.innerText = `$${income}`
  if (totalExpenseEl) totalExpenseEl.innerText = `$${expense}`
}

// Create income vs expense chart
function createIncomeExpenseChart() {
  // Check if chart already exists
  const existingChart = document.getElementById("incomeExpenseChartContainer")
  if (existingChart) {
    existingChart.remove()
  }

  // Create chart container
  const chartContainer = document.createElement("div")
  chartContainer.className = "monthly-income"
  chartContainer.id = "incomeExpenseChartContainer"
  chartContainer.style.marginTop = "20px"

  const chartTitle = document.createElement("h2")
  chartTitle.textContent = "Income vs Expenses"
  chartContainer.appendChild(chartTitle)

  // Calculate totals
  const income = transactions.filter((t) => t.amount > 0).reduce((acc, t) => acc + t.amount, 0)

  const expense = transactions.filter((t) => t.amount < 0).reduce((acc, t) => acc + Math.abs(t.amount), 0)

  // Create chart
  const chartCanvas = document.createElement("canvas")
  chartCanvas.id = "incomeExpenseChart"
  chartCanvas.style.width = "100%"
  chartCanvas.style.height = "200px"
  chartCanvas.style.marginTop = "10px"
  chartContainer.appendChild(chartCanvas)

  // Add chart to page
  document.getElementById("totaltransact").appendChild(chartContainer)

  // Create chart using canvas
  const ctx = chartCanvas.getContext("2d")

  // Simple bar chart using canvas
  const chartWidth = chartCanvas.width
  const chartHeight = chartCanvas.height
  const total = income + expense

  if (total > 0) {
    // Income bar
    const incomeWidth = (income / total) * chartWidth * 0.8
    ctx.fillStyle = "#92f792" // Green
    ctx.fillRect(20, 30, incomeWidth, 40)
    ctx.fillStyle = "#ffffff"
    ctx.font = "14px Arial"
    ctx.fillText(`Income: $${income.toFixed(2)}`, 25, 55)

    // Expense bar
    const expenseWidth = (expense / total) * chartWidth * 0.8
    ctx.fillStyle = "#fa5f5f" // Red
    ctx.fillRect(20, 90, expenseWidth, 40)
    ctx.fillStyle = "#ffffff"
    ctx.font = "14px Arial"
    ctx.fillText(`Expenses: $${expense.toFixed(2)}`, 25, 115)
  } else {
    ctx.fillStyle = "#ffffff"
    ctx.font = "16px Arial"
    ctx.fillText("No transaction data available", 20, 80)
  }
}

// Create monthly spending chart
function createMonthlySpendingChart() {
  // Check if chart already exists
  const existingChart = document.getElementById("monthlySpendingChartContainer")
  if (existingChart) {
    existingChart.remove()
  }

  // Create chart container
  const chartContainer = document.createElement("div")
  chartContainer.className = "monthly-income"
  chartContainer.id = "monthlySpendingChartContainer"
  chartContainer.style.marginTop = "20px"

  const chartTitle = document.createElement("h2")
  chartTitle.textContent = "Monthly Spending Overview"
  chartContainer.appendChild(chartTitle)

  // Group transactions by month
  const monthlyData = {}

  transactions.forEach((transaction) => {
    const date = new Date(transaction.date)
    const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`

    if (!monthlyData[monthYear]) {
      monthlyData[monthYear] = {
        income: 0,
        expense: 0,
      }
    }

    if (transaction.amount > 0) {
      monthlyData[monthYear].income += transaction.amount
    } else {
      monthlyData[monthYear].expense += Math.abs(transaction.amount)
    }
  })

  // Create chart
  const chartCanvas = document.createElement("canvas")
  chartCanvas.id = "monthlySpendingChart"
  chartCanvas.style.width = "100%"
  chartCanvas.style.height = "200px"
  chartCanvas.style.marginTop = "10px"
  chartContainer.appendChild(chartCanvas)

  // Add chart to page
  document.getElementById("totaltransact").appendChild(chartContainer)

  // Create chart using canvas
  const ctx = chartCanvas.getContext("2d")

  // Simple line chart using canvas
  const chartWidth = chartCanvas.width
  const chartHeight = chartCanvas.height

  const months = Object.keys(monthlyData)

  if (months.length > 0) {
    // Draw chart
    ctx.beginPath()
    ctx.strokeStyle = "#92f792" // Green for savings
    ctx.lineWidth = 3

    months.forEach((month, index) => {
      const x = 20 + index * ((chartWidth - 40) / (months.length - 1 || 1))
      const savings = monthlyData[month].income - monthlyData[month].expense
      const y = 150 - (savings / 100) * 50 // Scale to fit

      if (index === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }

      // Add data point
      ctx.fillStyle = savings >= 0 ? "#92f792" : "#fa5f5f"
      ctx.beginPath()
      ctx.arc(x, y, 5, 0, Math.PI * 2)
      ctx.fill()

      // Add label
      ctx.fillStyle = "#ffffff"
      ctx.font = "12px Arial"
      ctx.fillText(month, x - 15, 180)
      ctx.fillText(`$${savings.toFixed(0)}`, x - 15, y - 10)
    })

    ctx.stroke()

    // Add zero line
    ctx.beginPath()
    ctx.strokeStyle = "#ffffff"
    ctx.lineWidth = 1
    ctx.moveTo(20, 150)
    ctx.lineTo(chartWidth - 20, 150)
    ctx.stroke()

    // Add labels
    ctx.fillStyle = "#ffffff"
    ctx.font = "14px Arial"
    ctx.fillText("Savings (+) / Deficit (-)", 20, 20)
  } else {
    ctx.fillStyle = "#ffffff"
    ctx.font = "16px Arial"
    ctx.fillText("No monthly data available", 20, 80)
  }
}

// Remove transaction by ID
function removeTransaction(id) {
  transactions = transactions.filter((transaction) => transaction.id !== id)
  saveTransactions(transactions)
  init()
}

// Save transactions to localStorage
function saveTransactions(transactions) {
  localStorage.setItem("transactions", JSON.stringify(transactions))
}

// Load transactions from localStorage
function loadTransactions() {
  const transactionsJSON = localStorage.getItem("transactions")
  return transactionsJSON ? JSON.parse(transactionsJSON) : []
}

// Navigation event listeners
if (homePage) {
  homePage.addEventListener("click", () => {
    dashBoard.style.display = "block"
    addTransactionButton.style.display = "none"
    totalTransact.style.display = "none"
  })
}

if (expences) {
  expences.addEventListener("click", () => {
    dashBoard.style.display = "none"
    addTransactionButton.style.display = "none"
    totalTransact.style.display = "block"

    // Refresh the totaltransact page
    init()
  })
}

if (transaction) {
  transaction.addEventListener("click", () => {
    dashBoard.style.display = "none"
    addTransactionButton.style.display = "none"
    totalTransact.style.display = "block"

    // Refresh the totaltransact page
    init()
  })
}

if (add) {
  add.addEventListener("click", () => {
    dashBoard.style.display = "none"
    addTransactionButton.style.display = "block"
    totalTransact.style.display = "none"
  })
}

// Form event listener
if (formEl) {
  formEl.addEventListener("submit", addTransaction)
}

// Initialize the app
init()

// Landing page animation
setTimeout(() => {
  if (document.getElementById("landing1")) {
    document.getElementById("landing1").style.display = "none"
    document.getElementById("landing2").style.display = "flex"
  }
}, 5000)
