const photoGrid = document.getElementById('photoGrid');
const messageEl = document.getElementById('message');

const role = localStorage.getItem('role');

if (!role || role !== 'admin') {
  window.location.replace('/index.html');
}


// --- Cargar fotos pendientes ---
async function loadPendingPhotos() {
  try {
    const res = await fetch('/api/gallery/pending');
    const photos = await res.json();
    photoGrid.innerHTML = '';
    if(!photos.length) {
      photoGrid.innerHTML = '<p style="grid-column:1/-1;text-align:center;">No hay fotos pendientes.</p>';
      return;
    }

    photos.forEach(photo=>{
      const card = document.createElement('div');
      card.className='photo-card';

      const img = document.createElement('img');
      img.src = photo.url;
      card.appendChild(img);

      const btnContainer = document.createElement('div');
      btnContainer.className='btn-container';

      const approveBtn = document.createElement('button');
      approveBtn.className='btn btn-approve';
      approveBtn.textContent='Aprobar';
      approveBtn.addEventListener('click', ()=>handleApprove(photo._id,card));

      const rejectBtn = document.createElement('button');
      rejectBtn.className='btn btn-reject';
      rejectBtn.textContent='Rechazar';
      rejectBtn.addEventListener('click', ()=>handleReject(photo._id,card));

      btnContainer.appendChild(approveBtn);
      btnContainer.appendChild(rejectBtn);
      card.appendChild(btnContainer);

      photoGrid.appendChild(card);
    });

  } catch(err){
    console.error(err);
    messageEl.textContent='Error al cargar las fotos.';
    messageEl.style.color='red';
    messageEl.style.display='block';
  }
}

async function handleApprove(id,card){
  try{
    const res = await fetch(`/api/gallery/approve/${id}`, {method:'POST'});
    const data = await res.json();
    if(data.success){
      messageEl.textContent='Foto aprobada.';
      messageEl.style.color='green';
      messageEl.style.display='block';
      photoGrid.removeChild(card);
    } else throw new Error(data.message || 'Error al aprobar');
  } catch(err){
    console.error(err);
    messageEl.textContent='Error al aprobar la foto.';
    messageEl.style.color='red';
    messageEl.style.display='block';
  }
}

async function handleReject(id,card){
  try{
    const res = await fetch(`/api/gallery/reject/${id}`, {method:'POST'});
    const data = await res.json();
    if(data.success){
      messageEl.textContent='Foto enviada a papelera.';
      messageEl.style.color='orange';
      messageEl.style.display='block';
      photoGrid.removeChild(card);
    } else throw new Error(data.message || 'Error al rechazar');
  } catch(err){
    console.error(err);
    messageEl.textContent='Error al rechazar la foto.';
    messageEl.style.color='red';
    messageEl.style.display='block';
  }
}

// --- Inicializar ---
loadPendingPhotos();

// --- Papelera ---
const trashBtn = document.getElementById('trashBtn');
const trashModal = document.getElementById('trashModal');
const closeTrashModal = document.getElementById('closeTrashModal');
const trashGrid = document.getElementById('trashGrid');

trashBtn.addEventListener('click', ()=>{
  trashModal.style.display='flex';
  loadTrashPhotos();
});

closeTrashModal.addEventListener('click', ()=> trashModal.style.display='none');
trashModal.addEventListener('click', e=>{ if(e.target===trashModal) trashModal.style.display='none'; });

async function loadTrashPhotos(){
  try{
    const res = await fetch('/api/gallery/trash');
    const photos = await res.json();

    trashGrid.innerHTML='';
    if(!photos.length){
      trashGrid.innerHTML='<p>No hay fotos en la papelera.</p>';
      return;
    }

    photos.forEach(photo=>{
      const card = document.createElement('div');
      card.className='trash-card';

      const img=document.createElement('img');
      img.src=photo.url;
      card.appendChild(img);

      const acceptBtn=document.createElement('button');
      acceptBtn.textContent='Aceptar';
      acceptBtn.className='restore-btn';
      acceptBtn.addEventListener('click', ()=> handleRestorePhoto(photo._id,card));

      card.appendChild(acceptBtn);
      trashGrid.appendChild(card);
    });

  } catch(err){
    console.error(err);
    trashGrid.innerHTML='<p style="color:red;">Error al cargar la papelera.</p>';
  }
}

async function handleRestorePhoto(id,card){
  try{
    const res = await fetch(`/api/gallery/restore/${id}`, {method:'POST'});
    const data = await res.json();
    if(data.success){
      trashGrid.removeChild(card); // se elimina inmediatamente del modal
    } else throw new Error(data.message || 'Error al restaurar foto');
  } catch(err){
    console.error(err);
    alert('Error al restaurar foto.');
  }
}
