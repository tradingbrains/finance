document.addEventListener('DOMContentLoaded', () => {

    // --- Global: Mobile Menu Logic ---
    const hamburger = document.querySelector('.hamburger');
    const mobileMenu = document.querySelector('.mobile-menu');
    const overlay = document.querySelector('.mobile-menu-overlay');
    const closeBtn = document.querySelector('.close-menu');

    function toggleMenu() {
        mobileMenu.classList.toggle('open');
        overlay.classList.toggle('open');
        document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
    }

    if (hamburger) {
        hamburger.addEventListener('click', toggleMenu);
        closeBtn.addEventListener('click', toggleMenu);
        overlay.addEventListener('click', toggleMenu);
    }

    // --- Utilities ---
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 2
        }).format(amount);
    };

    const displayResult = (html) => {
        const box = document.getElementById('result-box');
        if (box) {
            box.innerHTML = html;
            box.classList.remove('show'); // Reset animation
            void box.offsetWidth; // Trigger reflow
            box.classList.add('show');
        }
    };

    // --- 1. Stock Average Logic (index.html) ---
    const btnAvg = document.getElementById('btn-calculate'); // Keeping reference if needed, or removing listener later
    const btnAddRow = document.getElementById('btn-add-row');
    const entriesContainer = document.getElementById('entries-container');

    // Main Calculation Function
    const calculateStockAverage = () => {
        let totalQty = 0;
        let totalCost = 0;

        const rows = document.querySelectorAll('.stock-row');

        rows.forEach(row => {
            const q = parseFloat(row.querySelector('.qty-input').value) || 0;
            const p = parseFloat(row.querySelector('.price-input').value) || 0;

            if (q > 0 && p > 0) {
                totalQty += q;
                totalCost += (q * p);
            }
        });

        if (totalQty === 0) {
            const box = document.getElementById('result-box');
            if (box) box.classList.remove('show');
            return;
        }

        const averagePrice = totalCost / totalQty;

        displayResult(`
            <div class="result-row">
                <span>Total Units</span>
                <strong>${totalQty}</strong>
            </div>
            <div class="result-row">
                <span>Total Cost</span>
                <strong>${formatCurrency(totalCost)}</strong>
            </div>
            <div class="result-row total">
                <span>Average Price</span>
                <strong>${formatCurrency(averagePrice)}</strong>
            </div>
        `);
    };

    // Helper to calculate row total AND trigger main calculation
    const updateRowTotal = (row) => {
        const qty = parseFloat(row.querySelector('.qty-input').value) || 0;
        const price = parseFloat(row.querySelector('.price-input').value) || 0;
        const investedDisplay = row.querySelector('.row-invested-display');

        if (investedDisplay) {
            const total = qty * price;
            // Format number with commas (en-IN for Indian checks 1,00,000 etc, or standard en-US 100,000)
            const formattedTotal = total.toLocaleString('en-IN', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            });

            // Set innerHTML to allow span for color
            investedDisplay.innerHTML = `Invested: <span>${formattedTotal}</span>`;
        }

        // Auto-calculate logic
        calculateStockAverage();
    };

    // Helper to attach listeners to a row
    const attachRowListeners = (row) => {
        const inputs = row.querySelectorAll('input');
        inputs.forEach(input => {
            input.addEventListener('input', () => updateRowTotal(row));
        });
    };

    // Add Row Functionality
    if (btnAddRow && entriesContainer) {
        // Attach listeners to existing rows first
        document.querySelectorAll('.stock-row').forEach(row => attachRowListeners(row));
        // Initial calculation for existing rows
        calculateStockAverage();

        btnAddRow.addEventListener('click', () => {
            const rowCount = entriesContainer.querySelectorAll('.stock-row').length + 1;
            const newRow = document.createElement('div');
            newRow.classList.add('input-group', 'stock-row');
            newRow.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <label>Entry ${rowCount}</label>
                    ${rowCount > 2 ? '<span class="remove-row" style="color:var(--secondary); cursor:pointer; font-size:0.8rem;">Remove</span>' : ''}
                </div>
                <div class="two-col">
                    <input type="number" class="qty-input" placeholder="Qty">
                    <input type="number" class="price-input" placeholder="Price">
                </div>
                <!-- Invested Amount Display -->
                <div class="row-invested-display">Invested: 0.00</div>
            `;
            entriesContainer.appendChild(newRow);

            // Attach listeners to new row
            attachRowListeners(newRow);

            // Trigger calculation after adding a new row (even if empty)
            calculateStockAverage();

            // Add remove listener
            const removeBtn = newRow.querySelector('.remove-row');
            if (removeBtn) {
                removeBtn.addEventListener('click', () => {
                    newRow.remove();
                    calculateStockAverage(); // Recalculate on remove
                });
            }
        });
    }

    // Manual button listener (optional now, but kept if user wants to force it or if logic fails)
    if (btnAvg) {
        btnAvg.style.display = 'none'; // Hide the button as per request for "automatic"
        btnAvg.addEventListener('click', calculateStockAverage);
    }

    // --- 2. ROI Logic (roi.html) ---
    const btnRoi = document.getElementById('btn-calculate-roi');
    const roiInputs = ['roi-invested', 'roi-current'];

    const calculateROI = () => {
        const investedInput = document.getElementById('roi-invested');
        const currentInput = document.getElementById('roi-current');

        // Strict check: Ensure both inputs have values
        if (!investedInput.value || !currentInput.value) {
            const box = document.getElementById('result-box');
            if (box) box.classList.remove('show');
            return;
        }

        const invested = parseFloat(investedInput.value) || 0;
        const current = parseFloat(currentInput.value) || 0;

        const profit = current - invested;
        const roi = (profit / invested) * 100;
        const isLoss = profit < 0;
        const colorClass = isLoss ? 'loss' : 'profit';

        displayResult(`
            <div class="result-row">
                <span>Invested Amount</span>
                <strong>${formatCurrency(invested)}</strong>
            </div>
            <div class="result-row">
                <span>Final Value</span>
                <strong>${formatCurrency(current)}</strong>
            </div>
            <div class="result-row total">
                <span>Profit / Loss</span>
                <strong class="${colorClass}">${formatCurrency(profit)}</strong>
            </div>
            <div class="result-row total" style="border:none; padding-top:0;">
                <span>ROI</span>
                <strong class="${colorClass}">${roi.toFixed(2)}%</strong>
            </div>
        `);
    };

    // Attach ROI Listeners
    if (document.getElementById('roi-invested')) {
        roiInputs.forEach(id => {
            document.getElementById(id).addEventListener('input', calculateROI);
        });
        if (btnRoi) btnRoi.style.display = 'none'; // Hide manual button
    }


    // --- 3. EMI Logic (emi.html) ---
    const btnEmi = document.getElementById('btn-calculate-emi');
    const emiInputs = ['emi-principal', 'emi-rate', 'emi-tenure'];

    const calculateEMI = () => {
        const P = parseFloat(document.getElementById('emi-principal').value) || 0;
        const R = parseFloat(document.getElementById('emi-rate').value) || 0;
        const N = parseFloat(document.getElementById('emi-tenure').value) || 0;

        if (P === 0 || R === 0 || N === 0) return;

        const r = R / 12 / 100;
        const emi = (P * r * Math.pow(1 + r, N)) / (Math.pow(1 + r, N) - 1);
        const totalAmount = emi * N;
        const totalInterest = totalAmount - P;

        displayResult(`
            <div class="result-row">
                <span>Principal Amount</span>
                <strong>${formatCurrency(P)}</strong>
            </div>
            <div class="result-row">
                <span>Total Interest</span>
                <strong>${formatCurrency(totalInterest)}</strong>
            </div>
            <div class="result-row">
                <span>Total Amount</span>
                <strong>${formatCurrency(totalAmount)}</strong>
            </div>
            <div class="result-row total">
                <span>Monthly EMI</span>
                <strong>${formatCurrency(emi)}</strong>
            </div>
        `);
    };

    // Attach EMI Listeners
    if (document.getElementById('emi-principal')) {
        emiInputs.forEach(id => {
            document.getElementById(id).addEventListener('input', calculateEMI);
        });
        if (btnEmi) btnEmi.style.display = 'none';
    }


    // --- 4. Percentage Logic (percentage.html) ---
    const btnPerc = document.getElementById('btn-calculate-perc');
    const percInputs = ['perc-value', 'perc-total'];

    const calculatePercentage = () => {
        const valInput = document.getElementById('perc-value');
        const totalInput = document.getElementById('perc-total'); // Note: ID in HTML is perc-total

        // Strict check: Ensure both inputs have values
        if (!valInput.value || !totalInput.value) {
            const box = document.getElementById('result-box');
            if (box) box.classList.remove('show');
            return;
        }

        const val = parseFloat(valInput.value) || 0;
        const total = parseFloat(totalInput.value) || 0;

        // Simple logic for now: X% of Y
        // Avoid division by zero issues if logic changes
        const result = (val / 100) * total;
        const totalValue = total + result;

        displayResult(`
            <div class="result-row total" style="display:block; text-align:center;">
                <span style="font-size:1rem; opacity:0.8;">${val}% of ${total} is</span>
                <br>
                <strong style="font-size: 1.5rem; margin-top: 10px; display:inline-block;">${result.toFixed(2)}</strong>
                <div style="font-size: 0.85rem; color: var(--text-muted); margin-top: 5px; font-weight: 300;">
                    (Total value is ${formatCurrency(totalValue)})
                </div>
            </div>
        `);
    };

    // Attach Percentage Listeners
    if (document.getElementById('perc-value')) {
        percInputs.forEach(id => {
            document.getElementById(id).addEventListener('input', calculatePercentage);
        });
        if (btnPerc) btnPerc.style.display = 'none';
    }

    // --- 5. Wealth Calculators (invest.html) ---
    // Tab Logic
    const tabs = document.querySelectorAll('.tab-btn');
    if (tabs.length > 0) {
        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active class from all tabs
                tabs.forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

                // Add active to clicked
                tab.classList.add('active');
                const target = document.getElementById(`tab-${tab.dataset.tab}`);
                if (target) target.classList.add('active');
            });
        });
    }

    // Calculation Helper for Invest Mode
    const displayWealthResult = (boxId, invested, finalVal, profit) => {
        const box = document.getElementById(boxId);
        if (!box) return;

        if (!invested || !finalVal) {
            box.classList.remove('show');
            box.innerHTML = '';
            return;
        }

        box.innerHTML = `
            <div class="result-row">
                <span>Invested Amount</span>
                <strong style="color: var(--primary); font-weight: 200;">${formatCurrency(invested)}</strong>
            </div>
            <div class="result-row">
                <span>Est. Returns</span>
                <strong class="profit">${formatCurrency(profit)}</strong>
            </div>
            <div class="result-row total">
                <span>Total Value</span>
                <strong>${formatCurrency(finalVal)}</strong>
            </div>
        `;
        box.classList.add('show');
    };

    // SIP Logic
    const calculateSIP = () => {
        const pInput = document.getElementById('sip-amount');
        const rInput = document.getElementById('sip-rate');
        const tInput = document.getElementById('sip-years');

        if (!pInput || !rInput || !tInput) return;

        const p = parseFloat(pInput.value);
        const r = parseFloat(rInput.value);
        const t = parseFloat(tInput.value);

        if (!p || !r || !t) {
            displayWealthResult('result-box-sip', 0, 0, 0);
            return;
        }

        const monthlyRate = r / 12 / 100;
        const months = t * 12;

        // SIP Formula (End of period)
        const futureValue = p * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate); // Start of month
        // The above formula is for "SIP" usually.
        // Let's stick to standard P * ...

        const investedAmount = p * months;
        const wealthGain = futureValue - investedAmount;

        displayWealthResult('result-box-sip', investedAmount, futureValue, wealthGain);
    };

    // Lumpsum Logic
    const calculateLumpsum = () => {
        const pInput = document.getElementById('lump-amount');
        const rInput = document.getElementById('lump-rate');
        const tInput = document.getElementById('lump-years');

        if (!pInput || !rInput || !tInput) return;

        const p = parseFloat(pInput.value);
        const r = parseFloat(rInput.value);
        const t = parseFloat(tInput.value);

        if (!p || !r || !t) {
            displayWealthResult('result-box-lump', 0, 0, 0);
            return;
        }

        // Formula: P * (1 + r/100)^t
        const futureValue = p * Math.pow(1 + r / 100, t);
        const wealthGain = futureValue - p;

        displayWealthResult('result-box-lump', p, futureValue, wealthGain);
    };

    // SWP Logic
    const calculateSWP = () => {
        const initialCorpusInput = document.getElementById('swp-corpus');
        const withdrawalInput = document.getElementById('swp-withdrawal');
        const rInput = document.getElementById('swp-rate');
        const tInput = document.getElementById('swp-years');

        if (!initialCorpusInput) return;

        const initialCorpus = parseFloat(initialCorpusInput.value);
        const withdrawal = parseFloat(withdrawalInput.value);
        const r = parseFloat(rInput.value);
        const t = parseFloat(tInput.value);

        const box = document.getElementById('result-box-swp');

        if (!initialCorpus || !withdrawal || !r || !t) {
            if (box) box.classList.remove('show');
            return;
        }

        const months = t * 12;
        const monthlyRate = r / 12 / 100;

        let balance = initialCorpus;
        let totalWithdrawn = 0;

        for (let i = 0; i < months; i++) {
            // Add interest for the month
            const interest = balance * monthlyRate;
            balance += interest;
            // Withdraw amount
            balance -= withdrawal;
            totalWithdrawn += withdrawal;

            if (balance < 0) {
                balance = 0;
                break; // Corpus exhausted
            }
        }

        if (box) {
            box.innerHTML = `
                <div class="result-row">
                    <span>Total Investment</span>
                    <strong style="font-weight: 200;">${formatCurrency(initialCorpus)}</strong>
                </div>
                 <div class="result-row">
                    <span>Total Withdrawn</span>
                    <strong style="color: var(--primary);">${formatCurrency(totalWithdrawn)}</strong>
                </div>
                <div class="result-row total">
                    <span>Final Balance</span>
                    <strong>${formatCurrency(balance)}</strong>
                </div>
            `;
            box.classList.add('show');
        }
    };


    // Attach Wealth Listeners
    if (document.getElementById('sip-amount')) {
        ['sip-amount', 'sip-rate', 'sip-years'].forEach(id => {
            document.getElementById(id).addEventListener('input', calculateSIP);
        });
        ['lump-amount', 'lump-rate', 'lump-years'].forEach(id => {
            document.getElementById(id).addEventListener('input', calculateLumpsum);
        });
    }
    if (document.getElementById('swp-corpus')) {
        ['swp-corpus', 'swp-withdrawal', 'swp-rate', 'swp-years'].forEach(id => {
            document.getElementById(id).addEventListener('input', calculateSWP);
        });
    }

    // --- 6. Profit Calculators (profit.html) ---
    // Advanced ROI Logic
    const calculateROIAdv = () => {
        const investedInput = document.getElementById('roi-adv-invested');
        const currentInput = document.getElementById('roi-adv-current');
        const taxPercInput = document.getElementById('roi-adv-tax-perc');
        const taxFlatInput = document.getElementById('roi-adv-tax-flat');

        if (!investedInput || !currentInput) return;

        const invested = parseFloat(investedInput.value) || 0;
        const current = parseFloat(currentInput.value) || 0;
        const taxPerc = parseFloat(taxPercInput.value) || 0;
        const taxFlat = parseFloat(taxFlatInput.value) || 0;

        if (!invested || !current) {
            const box = document.getElementById('result-box-roi-adv');
            if (box) box.classList.remove('show');
            return;
        }

        const grossProfit = current - invested;
        // Calculation: Taxes are arguably on the turnover or profit.
        // Simple View: Tax on total Current Value (typical for brokerage 0.1% on turnover) + Flat fees.
        // Let's assume user inputs total estimated charges.
        // Or if they put "%", we apply it to (Invested + Current) turnover?
        // Let's keep it simple: % applied to Total Turnover (Buy + Sell).
        const turnover = invested + current;
        const taxAmount = (turnover * (taxPerc / 100)) + taxFlat;

        const netProfit = grossProfit - taxAmount;
        const netRoi = (netProfit / invested) * 100;
        const isLoss = netProfit < 0;
        const colorClass = isLoss ? 'loss' : 'profit';

        displayResultHTML('result-box-roi-adv', `
            <div class="result-row">
                <span>Gross P/L</span>
                <strong>${formatCurrency(grossProfit)}</strong>
            </div>
            <div class="result-row">
                <span>Est. Charges</span>
                <strong style="color: #ef4444;">-${formatCurrency(taxAmount)}</strong>
            </div>
            <div class="result-row total">
                <span>Net P/L</span>
                <strong class="${colorClass}">${formatCurrency(netProfit)}</strong>
            </div>
             <div class="result-row total" style="border:none; padding-top:0;">
                <span>Net ROI</span>
                <strong class="${colorClass}">${netRoi.toFixed(2)}%</strong>
            </div>
        `);
    };

    // CAGR Logic
    const calculateCAGR = () => {
        const startValInput = document.getElementById('cagr-initial');
        const endValInput = document.getElementById('cagr-final');
        const yearsInput = document.getElementById('cagr-years');

        if (!startValInput) return;

        const startVal = parseFloat(startValInput.value) || 0;
        const endVal = parseFloat(endValInput.value) || 0;
        const years = parseFloat(yearsInput.value) || 0;

        if (!startVal || !endVal || !years) {
            const box = document.getElementById('result-box-cagr');
            if (box) box.classList.remove('show');
            return;
        }

        // CAGR = (End / Start)^(1/n) - 1
        const cagr = (Math.pow(endVal / startVal, 1 / years) - 1) * 100;
        const absoluteReturn = ((endVal - startVal) / startVal) * 100;
        const colorClass = cagr < 0 ? 'loss' : 'profit';

        displayResultHTML('result-box-cagr', `
             <div class="result-row">
                <span>Absolute Return</span>
                <strong>${absoluteReturn.toFixed(2)}%</strong>
            </div>
            <div class="result-row total">
                <span>CAGR</span>
                <strong class="${colorClass}">${cagr.toFixed(2)}%</strong>
            </div>
             <div class="result-row" style="font-size:0.8rem; justify-content:center; color: var(--text-muted);">
                (Avg Annual Growth Rate)
            </div>
        `);
    };

    // Helper to display generic result box
    const displayResultHTML = (boxId, html) => {
        const box = document.getElementById(boxId);
        if (box) {
            box.innerHTML = html;
            box.classList.add('show');
        }
    };

    // Attach Profit & Risk Listeners
    if (document.getElementById('roi-adv-invested')) {
        ['roi-adv-invested', 'roi-adv-current', 'roi-adv-tax-perc', 'roi-adv-tax-flat'].forEach(id => {
            document.getElementById(id).addEventListener('input', calculateROIAdv);
        });
        ['cagr-initial', 'cagr-final', 'cagr-years'].forEach(id => {
            document.getElementById(id).addEventListener('input', calculateCAGR);
        });
    }

    if (document.getElementById('risk-capital')) {
        // Risk Listeners Removed
    }

});
