// ===== Battery charging animation =====
const level = document.getElementById('batteryLevel');
const levelText = document.getElementById('batteryText');
let charge = 0;
setInterval(() => {
  charge = charge >= 100 ? 0 : charge + 1;
  level.style.width = charge + '%';
  levelText.textContent = charge + '%';
}, 80);

// ===== Models (illustrative, fictional) =====
const models = {
  scooter: [
    { name: 'Zippy S1', emoji: '🛵', range: '120 km', charge: '5 hrs', top: '80 km/h', price: '₹1.1 L' },
    { name: 'Urban Glide', emoji: '🛴', range: '90 km', charge: '4 hrs', top: '65 km/h', price: '₹85 K' },
    { name: 'Spark Pro', emoji: '🛵', range: '150 km', charge: '6 hrs', top: '95 km/h', price: '₹1.4 L' },
  ],
  bike: [
    { name: 'Thunder R', emoji: '🏍️', range: '180 km', charge: '6 hrs', top: '120 km/h', price: '₹2.2 L' },
    { name: 'Volt Cruiser', emoji: '🏍️', range: '210 km', charge: '7 hrs', top: '110 km/h', price: '₹2.6 L' },
    { name: 'Street Arc', emoji: '🏍️', range: '140 km', charge: '5 hrs', top: '100 km/h', price: '₹1.7 L' },
  ],
  car: [
    { name: 'Nova City', emoji: '🚗', range: '320 km', charge: '50 min (DC)', top: '140 km/h', price: '₹11 L' },
    { name: 'Terra SUV', emoji: '🚙', range: '450 km', charge: '45 min (DC)', top: '160 km/h', price: '₹19 L' },
    { name: 'Aero GT', emoji: '🏎️', range: '520 km', charge: '35 min (DC)', top: '200 km/h', price: '₹42 L' },
  ],
};

const modelGrid = document.getElementById('modelGrid');
function renderModels(type) {
  modelGrid.innerHTML = models[type].map((m, i) => `
    <div class="col-md-4">
      <div class="model-card" style="animation-delay:${i * 80}ms">
        <div class="model-emoji mb-2">${m.emoji}</div>
        <h4 class="fw-bold">${m.name}</h4>
        <p class="fs-5 fw-semibold mb-3">from ${m.price}</p>
        <div class="spec"><span>Range</span><span>${m.range}</span></div>
        <div class="spec"><span>Charge time</span><span>${m.charge}</span></div>
        <div class="spec"><span>Top speed</span><span>${m.top}</span></div>
      </div>
    </div>`).join('');
}
renderModels('scooter');

document.getElementById('modelTabs').addEventListener('click', e => {
  if (!e.target.matches('.nav-link')) return;
  document.querySelectorAll('#modelTabs .nav-link').forEach(b => b.classList.remove('active'));
  e.target.classList.add('active');
  renderModels(e.target.dataset.type);
});

// ===== Savings calculator =====
const ids = ['km', 'petrol', 'mileage', 'elec', 'eff'];
const inputs = Object.fromEntries(ids.map(id => [id, document.getElementById(id)]));
const rupee = n => '₹' + Math.round(n).toLocaleString('en-IN');

function calculate() {
  const v = Object.fromEntries(ids.map(id => [id, +inputs[id].value]));
  ids.forEach(id => (document.getElementById(id + 'Val').textContent = v[id]));

  const monthlyKm = v.km * 30;
  const litres = monthlyKm / v.mileage;
  const units = monthlyKm / v.eff;
  const petrolCost = litres * v.petrol;
  const evCost = units * v.elec;
  const save = Math.max(petrolCost - evCost, 0);

  // ~2.3 kg CO2 per litre petrol; ~0.7 kg CO2 per kWh grid electricity (rough)
  const co2 = Math.max((litres * 2.3 - units * 0.7) * 12, 0);

  document.getElementById('petrolCost').textContent = rupee(petrolCost);
  document.getElementById('evCost').textContent = rupee(evCost);
  document.getElementById('yearly').textContent = rupee(save * 12);
  document.getElementById('co2').textContent = Math.round(co2).toLocaleString('en-IN') + ' kg';
  animateNumber(document.getElementById('savings'), save);
}

let animFrame;
function animateNumber(el, target) {
  cancelAnimationFrame(animFrame);
  const start = parseInt(el.textContent.replace(/[^\d]/g, '')) || 0;
  const t0 = performance.now();
  const tick = now => {
    const p = Math.min((now - t0) / 400, 1);
    el.textContent = rupee(start + (target - start) * p);
    if (p < 1) animFrame = requestAnimationFrame(tick);
  };
  animFrame = requestAnimationFrame(tick);
}

ids.forEach(id => inputs[id].addEventListener('input', calculate));
calculate();
