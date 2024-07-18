
const baseUrl = 'http://localhost:3000';
const tableBody = document.querySelector('.customerTable');
const inputName = document.querySelector('#inputName');
const inputAmount = document.querySelector('#inputAmount');
let customerId;
// ########################################################################
async function fetchCustomerData() {
    try {
        const response = await fetch(`${baseUrl}/customers`);
        if (!response.ok) {
            throw new Error('Failed to fetch customer data');
        }
        const data = await response.json();
        console.log('Customer data:', data); // تحقق من البيانات المسترجعة
        return data;
    } catch (error) {
        console.error('Error fetching customer data:', error);
        return null;
    }
}

async function fetchTransactions() {
    try {
        const response = await fetch(`${baseUrl}/transactions`);
        if (!response.ok) {
            throw new Error('Failed to fetch transactions');
        }
        const data = await response.json();
        console.log('Transaction data:', data); // تحقق من البيانات المسترجعة
        return data;
    } catch (error) {
        console.error('Error fetching transaction data:', error);
        return null;
    }
}

async function displayData() {
    try {
        const customerData = await fetchCustomerData();
        const transactionData = await fetchTransactions();

        if (!customerData || !transactionData) {
            throw new Error('Failed to fetch data');
        }

        // Clear existing table rows
        tableBody.innerHTML = '';

        customerData.forEach(customer => {
            transactionData.forEach(transaction => {
                if (customer.id == transaction.customer_id) {
                    const row = document.createElement('tr');
                    row.dataset.id = customer.id;
                    row.innerHTML = `
                        <td class="border">${customer.id}</td>
                        <td class="border">${customer.name}</td>
                        <td class="border">${transaction.date}</td>
                        <td class="border">${transaction.amount}</td>
                    `;
                    tableBody.appendChild(row);
                }
            });
        });

        // Add click event listener to each row
        clickOnCustomer();
    } catch (error) {
        console.error('Error displaying data:', error);
    }
}

async function drawChartForCustomer(customerId) {
    try {
        const transactionData = await fetchTransactions();
        const customerTransactions = transactionData.filter(transaction => transaction.customer_id == customerId);

        const dates = customerTransactions.map(transaction => transaction.date);
        const amounts = customerTransactions.map(transaction => transaction.amount);
        const ctx = document.getElementById('myChart').getContext('2d');

        // تدمير الرسم البياني القديم إن وجد
        if (window.myChart && typeof window.myChart.destroy === 'function') {
            window.myChart.destroy();
        }

        // استخدام Chart.js لرسم الرسم البياني
        window.myChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: dates,
                datasets: [{
                    label: `Transactions for Customer ${customerId}`,
                    data: amounts,
                    borderColor: 'blue',
                    backgroundColor: 'rgba(0, 0, 255, 0.1)',
                }]
            },
            options: {
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error fetching transactions or drawing chart:', error);
    }
}

function clickOnCustomer() {
    const rows = document.querySelectorAll('.customerTable tr');
    rows.forEach(row => {
        row.addEventListener('click', () => {
            const customerId = row.getAttribute('data-id');
            drawChartForCustomer(customerId);
        });
    });
}

displayData();
// #########################3
// filteration

inputName.addEventListener('input', async function () {
    await filterTable();
});
inputAmount.addEventListener('input', async function () {
    await filterTable();
});

async function filterTable() {
    const customerNameFilter = inputName.value.trim().toLowerCase(); // inputName value
    const customerAmountFilter = parseFloat(inputAmount.value.trim()); // input Mount value
    const customerData = await fetchCustomerData(); //Array customers
    const transactionData = await fetchTransactions(); // array transactions
    // if no data come
    if (!customerData || !transactionData) {
        console.error('Failed to fetch data');
        return;
    }
    // make the table empty
    tableBody.innerHTML = '';
    customerData.forEach(customer => {
        transactionData.forEach(transaction => {
            if (customer.id == transaction.customer_id) {
                const customerName = customer.name.toLowerCase();
                const amount = transaction.amount;
                // if the name is equal to the input name
                if ((!customerNameFilter || customerName.includes(customerNameFilter)) && (!customerAmountFilter || amount === customerAmountFilter)) {
                    const row = document.createElement('tr');
                    row.dataset.id = customer.id;
                    row.innerHTML = `
                        <td class="border">${customer.id}</td>
                        <td class="border">${customer.name}</td>
                        <td class="border">${transaction.date}</td>
                        <td class="border">${transaction.amount}</td>
                    `;
                    tableBody.appendChild(row);
                }
            }
        })
    })
    clickOnCustomer();
}
