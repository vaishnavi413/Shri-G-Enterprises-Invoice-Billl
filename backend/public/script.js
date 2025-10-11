// Basic client-side helper for index.html and history.html
function calcTotals(items, taxPercent) {
  const subtotal = items.reduce((s, it) => s + (Number(it.qty) * Number(it.rate)), 0);
  const taxAmount = subtotal * (Number(taxPercent) / 100);
  const total = subtotal + taxAmount;
  return { subtotal, taxAmount, total };
}

/* index.html logic */
const invoiceForm = document.getElementById("invoiceForm");
const itemsContainer = document.getElementById("items");
const addItemBtn = document.getElementById("addItemBtn");
const saveDraftBtn = document.getElementById("saveDraft");
const finalizeBtn = document.getElementById("finalize");

if (addItemBtn) {
  function addItemRow(item = { description: "", qty: 1, rate: 0 }) {
    const div = document.createElement("div");
    div.innerHTML = `
      <input name="desc" placeholder="Description" value="${item.description}" />
      <input name="qty" type="number" placeholder="Qty" value="${item.qty}" />
      <input name="rate" type="number" placeholder="Rate" value="${item.rate}" />
      <button type="button" class="remove">Remove</button>
    `;
    itemsContainer.appendChild(div);
    div.querySelector(".remove").addEventListener("click", () => div.remove());
    [...div.querySelectorAll("input")].forEach(i => i.addEventListener("input", updateTotals));
  }
  addItemBtn.addEventListener("click", () => addItemRow());
  addItemRow();
}

function readForm() {
  const form = invoiceForm;
  const customer = {
    name: form.customerName.value,
    address: form.customerAddress.value,
    phone: form.customerPhone.value
  };
  const items = Array.from(itemsContainer.children).map(div => ({
    description: div.querySelector('[name="desc"]').value,
    qty: Number(div.querySelector('[name="qty"]').value || 0),
    rate: Number(div.querySelector('[name="rate"]').value || 0),
    total: Number(div.querySelector('[name="qty"]').value || 0) * Number(div.querySelector('[name="rate"]').value || 0)
  }));
  const taxPercent = Number(form.taxPercent.value || 0);
  const totals = calcTotals(items, taxPercent);
  return { customer, items, subtotal: totals.subtotal, taxPercent, taxAmount: totals.taxAmount, total: totals.total };
}

function updateTotals() {
  if (!invoiceForm) return;
  const data = readForm();
  invoiceForm.total.value = data.total.toFixed(2);
}

if (saveDraftBtn) {
  saveDraftBtn.addEventListener("click", async () => {
    const data = readForm();
    const res = await fetch("/api/invoices/draft", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    const saved = await res.json();
    alert(`Draft saved (id: ${saved._id}). You can finalize later.`);
    localStorage.setItem("draftId", saved._id);
  });
}

if (finalizeBtn) {
  finalizeBtn.addEventListener("click", async () => {
    const data = readForm();
    const draftId = localStorage.getItem("draftId");
    const payload = draftId ? { draftId, invoiceData: data } : { invoiceData: data };
    const res = await fetch("/api/invoices/finalize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const invoice = await res.json();
    localStorage.removeItem("draftId");

    // Download PDF
    const dl = await fetch(`/api/invoices/${invoice._id}/download`);
    const blob = await dl.blob();
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${invoice.number || invoice._id}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  });
}

/* history.html logic */
const invoiceList = document.getElementById("invoiceList");
const searchInput = document.getElementById("search");
const searchBtn = document.getElementById("searchBtn");

async function loadHistory(q) {
  const url = q ? `/api/invoices?search=${encodeURIComponent(q)}` : `/api/invoices`;
  const res = await fetch(url);
  const data = await res.json();
  const invoices = data.invoices || data;
  if (!invoiceList) return;
  invoiceList.innerHTML = "";
  invoices.forEach(inv => {
    const li = document.createElement("li");
    li.innerHTML = `<strong>${inv.number || 'Draft'}</strong> - ${inv.customer?.name || ''} - ${inv.total || 0} 
      <a href="/api/invoices/${inv._id}/download">Download</a>`;
    invoiceList.appendChild(li);
  });
}

if (invoiceList) loadHistory();
if (searchBtn) searchBtn.addEventListener("click", () => loadHistory(searchInput.value));
