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

    // --- 7. Pivot Calculator Logic (pivot.html) ---
    const pivotInputs = ['pivot-high', 'pivot-low', 'pivot-close', 'pivot-open'];
    const pivotRadios = document.getElementsByName('pivot-type');

    function calculatePivot() {
        const h = parseFloat(document.getElementById('pivot-high').value) || 0;
        const l = parseFloat(document.getElementById('pivot-low').value) || 0;
        const c = parseFloat(document.getElementById('pivot-close').value) || 0;
        const o = parseFloat(document.getElementById('pivot-open').value) || 0;

        if (!h || !l || !c) {
            const box = document.getElementById('result-box-pivot');
            if (box) box.classList.remove('show');
            return; // Need at least H, L, C
        }

        // Get select type
        let type = 'classic';
        for (const radio of pivotRadios) {
            if (radio.checked) {
                type = radio.value;
                break;
            }
        }

        let pp, r1, r2, r3, r4, s1, s2, s3, s4;
        const range = h - l;

        switch (type) {
            case 'woodie':
                pp = (h + l + 2 * c) / 4;
                r1 = (2 * pp) - l;
                r2 = pp + range;
                s1 = (2 * pp) - h;
                s2 = pp - range;
                break;

            case 'camarilla':
                pp = (h + l + c) / 3;
                r4 = c + (range * 1.1 / 2);
                r3 = c + (range * 1.1 / 4);
                r2 = c + (range * 1.1 / 6);
                r1 = c + (range * 1.1 / 12);
                s1 = c - (range * 1.1 / 12);
                s2 = c - (range * 1.1 / 6);
                s3 = c - (range * 1.1 / 4);
                s4 = c - (range * 1.1 / 2);
                break;

            case 'fibonacci':
                pp = (h + l + c) / 3;
                r1 = pp + (0.382 * range);
                r2 = pp + (0.618 * range);
                r3 = pp + (1.000 * range);
                s1 = pp - (0.382 * range);
                s2 = pp - (0.618 * range);
                s3 = pp - (1.000 * range);
                break;

            case 'classic':
            default:
                pp = (h + l + c) / 3;
                r1 = (2 * pp) - l;
                s1 = (2 * pp) - h;
                r2 = pp + (h - l);
                s2 = pp - (h - l);
                r3 = h + 2 * (pp - l);
                s3 = l - 2 * (h - pp);
                break;
        }

        // Build Table HTML
        let html = '<table class="pivot-table"><tbody>';

        // Rows Helper
        const row = (label, val, cls = '') => {
            if (val === undefined || isNaN(val)) return '';
            return `<tr class="${cls}"><td>${label}</td><td>${formatCurrency(val)}</td></tr>`;
        };

        if (type === 'camarilla') {
            html += row('Resistance 4', r4, 'res-row');
            html += row('Resistance 3', r3, 'res-row');
            html += row('Resistance 2', r2, 'res-row');
            html += row('Resistance 1', r1, 'res-row');
            html += row('Pivot Point', pp, 'pp-row');
            html += row('Support 1', s1, 'sup-row');
            html += row('Support 2', s2, 'sup-row');
            html += row('Support 3', s3, 'sup-row');
            html += row('Support 4', s4, 'sup-row');
        } else {
            if (r3) html += row('Resistance 3', r3, 'res-row');
            if (r2) html += row('Resistance 2', r2, 'res-row');
            if (r1) html += row('Resistance 1', r1, 'res-row');
            html += row('Pivot Point', pp, 'pp-row');
            if (s1) html += row('Support 1', s1, 'sup-row');
            if (s2) html += row('Support 2', s2, 'sup-row');
            if (s3) html += row('Support 3', s3, 'sup-row');
        }

        html += '</tbody></table>';
        displayResultHTML('result-box-pivot', html);
    }

    if (document.getElementById('pivot-high')) {
        pivotInputs.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.addEventListener('input', calculatePivot);
        });
        pivotRadios.forEach(radio => {
            radio.addEventListener('change', calculatePivot);
        });
    }

    // --- 8. Target Average Logic (index.html tab) ---
    const targetIds = ['target-qty', 'target-avg', 'target-new-price', 'target-desired'];

    function calculateTargetAverage() {
        const qty = parseFloat(document.getElementById('target-qty').value) || 0;
        const currentAvg = parseFloat(document.getElementById('target-avg').value) || 0;
        const newPrice = parseFloat(document.getElementById('target-new-price').value) || 0;
        const desiredAvg = parseFloat(document.getElementById('target-desired').value) || 0;

        const box = document.getElementById('result-box-target');
        if (!box) return;

        if (!qty || !currentAvg || !newPrice || !desiredAvg) {
            box.classList.remove('show');
            box.innerHTML = '';
            return;
        }

        // Formula Validity Check
        let possible = false;
        if (currentAvg > newPrice && desiredAvg < currentAvg && desiredAvg > newPrice) possible = true; // Averaging Down
        if (currentAvg < newPrice && desiredAvg > currentAvg && desiredAvg < newPrice) possible = true; // Averaging Up

        if (!possible) {
            const msg = (desiredAvg <= newPrice && currentAvg > newPrice) ? "Desired average must be higher than New Price." :
                (desiredAvg >= newPrice && currentAvg < newPrice) ? "Desired average must be lower than New Price." :
                    "Impossible to achieve this average with the current new price.";

            displayResultHTML('result-box-target', `<div style="color:var(--text-muted); text-align:center;">${msg}</div>`);
            return;
        }

        // Formula: Q2 = Q1 * (P1 - Target) / (Target - P2)
        let requiredQty = qty * (currentAvg - desiredAvg) / (desiredAvg - newPrice);
        requiredQty = Math.abs(requiredQty);

        // Round up to nearest integer for shares
        const finalQty = Math.ceil(requiredQty);
        const totalInvestment = finalQty * newPrice;

        displayResultHTML('result-box-target', `
            <div class="result-row">
                <span>Buy Quantity</span>
                <strong style="color:var(--primary);">${finalQty} Shares</strong>
            </div>
            <div class="result-row">
                <span>Investment Needed</span>
                <strong>${formatCurrency(totalInvestment)}</strong>
            </div>
            <div class="result-row" style="font-size:0.8rem; justify-content:center; color: var(--text-muted); margin-top:5px;">
                (Approximate to nearest share)
            </div>
        `);
    }

    if (document.getElementById('target-qty')) {
        targetIds.forEach(id => {
            document.getElementById(id).addEventListener('input', calculateTargetAverage);
        });
    }



    // --- 9. News System (Fresh Start v13) ---
    // --- 9. News System (Fresh Start v16 - Fast Load) ---
    const initNewsSystem = async () => {
        const tickerContainer = document.getElementById('ticker-content');
        const newsPageContainer = document.getElementById('news-feed-container');

        if (!tickerContainer && !newsPageContainer) return;

        // Verified Fresh Feeds
        const feeds = [
            { url: 'https://www.business-standard.com/rss/markets-106.rss', source: 'Business Standard' },
            { url: 'https://feeds.feedburner.com/ndtvprofit-latest', source: 'NDTV Profit' },
            { url: 'https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms', source: 'Economic Times' },
            { url: 'https://www.cnbc.com/id/10000664/device/rss/rss.html', source: 'CNBC World' }
        ];

        const renderNews = (newsItems) => {
            if (!newsItems || newsItems.length === 0) return;

            // 1. Render Ticker
            if (tickerContainer) {
                let html = newsItems.map(n =>
                    `<span class="ticker-item"><a href="${n.link}" target="_blank">${n.title}</a></span>`
                ).join('');
                // Duplicate for smooth loop
                tickerContainer.innerHTML = html + html;
            }

            // 2. Render News Page
            if (newsPageContainer) {
                newsPageContainer.innerHTML = newsItems.map(n => {
                    const d = new Date(n.pubDate);
                    let timeStr = "Just now";
                    if (!isNaN(d)) {
                        const diffMins = Math.floor((Date.now() - d) / 60000);
                        if (diffMins < 60) timeStr = `${diffMins}m ago`;
                        else timeStr = `${Math.floor(diffMins / 60)}h ${diffMins % 60}m ago`;
                    }

                    return `
                     <a href="${n.link}" target="_blank" class="news-card">
                        <div class="news-card-title">${n.title}</div>
                        <div class="news-card-summary">${n.description.substring(0, 140)}...</div>
                        <div class="news-card-meta">
                            <span>${timeStr}</span>
                            <span>—</span>
                            <span class="news-source-tag">${n.source}</span>
                        </div>
                     </a>`;
                }).join('');
            }
        };

        const fetchRawFeed = async (feed) => {
            try {
                // Using api.codetabs.com (Known for high reliability)
                const proxyUrl = `https://api.codetabs.com/v1/proxy/?quest=${encodeURIComponent(feed.url)}`;

                const response = await fetch(proxyUrl);
                if (!response.ok) return [];
                const text = await response.text();

                // Parse XML
                const parser = new DOMParser();
                const xml = parser.parseFromString(text, "text/xml");
                const items = Array.from(xml.querySelectorAll("item"));

                return items.map(item => {
                    const title = item.querySelector("title")?.textContent || "";
                    const link = item.querySelector("link")?.textContent || "#";
                    // Try pubDate, if missing try dc:date
                    let pubDateStr = item.querySelector("pubDate")?.textContent || item.querySelector("date")?.textContent || "";
                    let desc = item.querySelector("description")?.textContent || "";
                    const div = document.createElement("div");
                    div.innerHTML = desc;
                    desc = div.textContent || "";

                    return {
                        title: title,
                        link: link,
                        pubDate: pubDateStr,
                        description: desc,
                        source: feed.source
                    };
                });
            } catch (err) {
                console.warn(`Feed failed: ${feed.source}`, err);
                return [];
            }
        };

        const updateUI = async () => {
            // 1. Try Cache First (Instant Load)
            const cached = localStorage.getItem('marketNews_v1');
            if (cached) {
                try {
                    const parsed = JSON.parse(cached);
                    if (parsed && parsed.data && parsed.data.length > 0) {
                        console.log("Loaded news from cache");
                        renderNews(parsed.data);

                        // Check if cache is fresh (< 5 mins)
                        const cacheTime = parsed.timestamp || 0;
                        if (Date.now() - cacheTime < 300000) {
                            return; // Skip fetch if cache is fresh
                        }
                    }
                } catch (e) { }
            }

            if (tickerContainer && tickerContainer.innerHTML.includes('Loading')) {
                // Keep loading state if no cache
            }

            console.log("Fetching fresh news...");
            const results = await Promise.all(feeds.map(f => fetchRawFeed(f)));
            let allNews = results.flat();

            // Sort Newest First
            allNews.sort((a, b) => {
                const dA = new Date(a.pubDate);
                const dB = new Date(b.pubDate);
                return (isNaN(dB) ? 0 : dB) - (isNaN(dA) ? 0 : dA);
            });

            // Deduplicate
            const seen = new Set();
            allNews = allNews.filter(n => {
                if (seen.has(n.title)) return false;
                seen.add(n.title);
                return true;
            });

            const topNews = allNews.slice(0, 25);

            if (topNews.length > 0) {
                // Update UI
                renderNews(topNews);
                // Save to Cache
                localStorage.setItem('marketNews_v1', JSON.stringify({
                    timestamp: Date.now(),
                    data: topNews
                }));
            } else if (!cached && tickerContainer) {
                tickerContainer.innerHTML = '<span class="ticker-item">News temporarily unavailable</span>';
            }
        };

        // Initial Call
        updateUI();
        // Poll every 5 mins
        setInterval(updateUI, 300000);
    };

    // Run News System
    initNewsSystem();
});
