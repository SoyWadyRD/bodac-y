const role = localStorage.getItem('role');

if (!role || role !== 'admin') {
  window.location.replace('/index.html');
}

 
 
 const paymentsMap = {};

document.addEventListener('DOMContentLoaded', async () => {
  const container = document.getElementById('paymentsContainer');

  // Asistencias
  const attendanceRes = await fetch('/api/attendance');
  const attendanceData = await attendanceRes.json();

  // Pagos
  const paymentsRes = await fetch('/api/payments');
  const paymentsData = await paymentsRes.json();


paymentsData.data.forEach(p => {
  if (!p || !p.attendanceId) return;
  paymentsMap[p.attendanceId.toString()] = p;
});


attendanceData.data.forEach(item => {
  if (!item || !item.id) return;
  if (item.asistencia !== 'Sí') return;

 let payment = paymentsMap[item.id] || {
  attendanceId: item.id,
  total: 0,
  movimientos: []
};

paymentsMap[item.id] = payment;




    const totalPagado = payment ? payment.total : 0;

    // Acompañantes
    let acompanantesHTML = '<div class="acompanantes">—</div>';
    if (item.acompanantes && item.acompanantes.length) {
      acompanantesHTML = `
        <ul class="acompanantes">
          ${item.acompanantes.map(a =>
            `<li>
              ${a.tipo === 'niño'
                ? `Niño: ${a.nombre} (${a.edad} años)`
                : `Adulto: ${a.nombre}`
              }
            </li>`
          ).join('')}
        </ul>
      `;
    }

    const card = document.createElement('div');
    card.className = 'payment-card';

    card.innerHTML = `
      <div class="card-header">
  <div>
    <i class="fa-solid fa-user"></i>
    ${item.nombre} ${item.apellido}
  </div>

  <button class="btn-history" title="Ver historial">
    <i class="fa-solid fa-clock-rotate-left"></i>
  </button>
</div>


      <div class="info">
        <i class="fa-solid fa-users"></i>
        Personas: ${item.totalPersonas}
      </div>

      <div class="info">
        <i class="fa-solid fa-bed"></i>
        Habitaciones: ${item.habitaciones}
      </div>

      <div class="info">
        <i class="fa-solid fa-people-group"></i>
        Acompañantes:
      </div>

      ${acompanantesHTML}

      <div class="total">
        RD$ <span>${totalPagado}</span>
      </div>

      <div class="buttons">
        <button class="btn-add">
          <i class="fa-solid fa-plus"></i> Agregar
        </button>
        <button class="btn-remove">
          <i class="fa-solid fa-minus"></i> Quitar
        </button>
      </div>
    `;

    // ➕
    // ➕ AGREGAR
  card.querySelector('.btn-add').addEventListener('click', () => {
    openModal({
      title: 'Agregar monto',
      onConfirm: async (monto) => {
        const res = await fetch('/api/payments/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            attendanceId: item.id,
            tipo: 'agregar',
            monto
          })
        });

        const result = await res.json();
        if (result.success) {
          card.querySelector('.total span').textContent = result.total;
          payment.total = result.total;
          payment.movimientos.push(result.movimiento);
        }
      }
    });
  });

  // ➖ QUITAR
  card.querySelector('.btn-remove').addEventListener('click', () => {
    openModal({
      title: 'Quitar monto',
      onConfirm: async (monto) => {
        const res = await fetch('/api/payments/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            attendanceId: item.id,
            tipo: 'quitar',
            monto
          })
        });

        const result = await res.json();
        if (result.success) {
          card.querySelector('.total span').textContent = result.total;
          payment.total = result.total;
          payment.movimientos.push(result.movimiento);
        }
      }
    });
  });

   const historyBtn = card.querySelector('.btn-history');

historyBtn.addEventListener('click', () => {
  openHistoryModal(
    `${item.nombre} ${item.apellido}`,
    item.id
  );
});



    container.appendChild(card);



   

  });
});




const modal = document.getElementById('paymentModal');
const modalTitle = document.getElementById('modalTitle');
const modalAmount = document.getElementById('modalAmount');
const modalCancel = document.getElementById('modalCancel');
const modalConfirm = document.getElementById('modalConfirm');

let currentAction = null;

function openModal({ title, onConfirm }) {
  modalTitle.innerHTML = `<i class="fa-solid fa-coins"></i> ${title}`;
  modalAmount.value = '';
  modal.classList.remove('hidden');

  currentAction = onConfirm;
}

modalCancel.addEventListener('click', () => {
  modal.classList.add('hidden');
});

modalConfirm.addEventListener('click', () => {
  const monto = Number(modalAmount.value);
  if (!monto || monto <= 0) return;

  currentAction(monto);
  modal.classList.add('hidden');
});






const historyModal = document.getElementById('historyModal');
const historyList = document.getElementById('historyList');
const closeHistory = document.getElementById('closeHistory');

closeHistory.addEventListener('click', () => {
  historyModal.classList.add('hidden');
});

function openHistoryModal(nombre, attendanceId) {
  const payment = paymentsMap[attendanceId];
  const movimientos = payment?.movimientos || [];

  document.getElementById('historyTitle').innerHTML = `
    <i class="fa-solid fa-clock-rotate-left"></i>
    Historial de ${nombre}
  `;

  if (!movimientos.length) {
    historyList.innerHTML =
      '<p style="text-align:center;opacity:.7">Sin movimientos</p>';
  } else {
    historyList.innerHTML = movimientos.map(m => `
      <div class="history-item ${m.tipo}">
        <div>
          ${m.tipo === 'agregar' ? '<i class="fa-solid fa-plus"></i> Agregado' : '<i class="fa-solid fa-minus"></i> Quitado'}
          <div class="history-date" style="margin-top:5px;">
            ${new Date(m.fecha).toLocaleString('es-DO', {
              timeZone: 'America/Santo_Domingo',
              hour12: true
            })}
          </div>
        </div>
        <strong>RD$ ${m.monto}</strong>
      </div>
    `).join('');
  }

  historyModal.classList.remove('hidden');
}


