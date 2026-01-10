const role = localStorage.getItem('role');
const PRIVATE_FOLDER = 'private_photos';

const sliderSection = document.getElementById('sliderSection');
const sliderContainer = document.getElementById('sliderContainer');

if(role==='admin') document.getElementById('uploadContainer').style.display='flex';

let sliderImages = []; // Cada item: { url: '', public_id: '' }
let currentIndex = 0;
let sliderInterval;

// --- Cargar fotos ---
async function loadSliderPhotos(){
  try{
    const res = await fetch(`/api/cloudinary/list?folder=${PRIVATE_FOLDER}`);
    const data = await res.json();

    if(Array.isArray(data) && data.length>0){
      sliderImages = data.map(img => ({ url: img.secure_url, public_id: img.public_id }));
      currentIndex = 0;
      sliderSection.style.display='block'; // siempre mostrar si hay fotos
      renderSlider();
      startSlider();
    } else {
      sliderImages = [];
      renderSlider();
      // Mostrar sección solo si eres admin
      sliderSection.style.display = role==='admin' ? 'block' : 'none';
    }
  } catch(err){ 
    console.error(err); 
    sliderSection.style.display = role==='admin' ? 'block' : 'none';
  }
}

// --- Render Slider 3 fotos ---
function renderSlider(){
  sliderContainer.innerHTML='';
  if(sliderImages.length === 0) return;

  const total = sliderImages.length;
  const prevIndex = (currentIndex-1+total)%total;
  const nextIndex = (currentIndex+1)%total;

  const leftImg = document.createElement('img');
  leftImg.src = sliderImages[prevIndex].url;
  leftImg.className='left';
  leftImg.addEventListener('click',()=>{ currentIndex=prevIndex; renderSlider(); resetSliderInterval(); });
  sliderContainer.appendChild(leftImg);

  const centerImg = document.createElement('img');
  centerImg.src = sliderImages[currentIndex].url;
  centerImg.className='center';
  centerImg.addEventListener('click',()=>{ resetSliderInterval(); });
  sliderContainer.appendChild(centerImg);

  const rightImg = document.createElement('img');
  rightImg.src = sliderImages[nextIndex].url;
  rightImg.className='right';
  rightImg.addEventListener('click',()=>{ currentIndex=nextIndex; renderSlider(); resetSliderInterval(); });
  sliderContainer.appendChild(rightImg);
}

// --- Slider automático ---
function startSlider(){ 
  if(sliderImages.length === 0) return;
  sliderInterval = setInterval(()=>{ 
    currentIndex = (currentIndex+1)%sliderImages.length; 
    renderSlider(); 
  }, 4000);
}
function resetSliderInterval(){ 
  clearInterval(sliderInterval); 
  startSlider(); 
}

// --- Admin subir fotos ---
if(role==='admin'){
  const uploadBtn = document.getElementById('uploadBtn');
  const photoInput = document.getElementById('photoInput');

  uploadBtn.addEventListener('click', ()=> photoInput.click());

  photoInput.addEventListener('change', async ()=>{
    const file = photoInput.files[0];
    if(!file) return;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', PRIVATE_FOLDER);

    try{
      const res = await fetch('/api/cloudinary/upload',{ method:'POST', body:formData });
      const data = await res.json();

      if(data.secure_url && data.public_id){
        sliderImages.push({ url: data.secure_url, public_id: data.public_id });
        renderSlider();
        sliderSection.style.display='block'; // mostrar si era admin y estaba vacío
      }
    }catch(err){ console.error(err); }
  });

  // --- Modal revisar/eliminar fotos ---
  const reviewBtn = document.getElementById('reviewBtn');
  const reviewModal = document.getElementById('reviewModal');
  const closeModal = document.getElementById('closeModal');
  const reviewContainer = document.getElementById('reviewPhotosContainer');

  reviewBtn.addEventListener('click', ()=>{
  reviewModal.style.display='flex';
  reviewContainer.innerHTML='';

  const listDiv = document.createElement('div');
  listDiv.className='review-photos-list';
  listDiv.style.display='flex';
  listDiv.style.flexDirection='column';
  listDiv.style.gap='15px';
  listDiv.style.maxHeight='70vh';
  listDiv.style.overflowY='auto';
  listDiv.style.width = '100%';

  sliderImages.forEach((imgObj,index)=>{
    const item = document.createElement('div');
    item.style.display='flex';
    item.style.alignItems='center';
    item.style.gap='10px';
    item.style.padding = '5px';
    item.style.borderBottom = '1px solid #ccc';

    const img = document.createElement('img');
    img.src = imgObj.url;

    // Fotos completas, proporcional
    img.style.width = '200px'; // ancho fijo para la miniatura
    img.style.height = 'auto';
    img.style.objectFit = 'contain';
    img.style.borderRadius = '8px';
    img.style.cursor = 'pointer';

    const btn = document.createElement('button');
    btn.textContent='Eliminar foto';
    btn.style.padding='5px 10px';
    btn.style.border='none';
    btn.style.borderRadius='8px';
    btn.style.background='#c53939';
    btn.style.color='#fff';
    btn.style.cursor='pointer';

    btn.addEventListener('click', async ()=>{
      try{
        const res = await fetch('/api/cloudinary/delete',{
          method:'DELETE',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify({public_id: imgObj.public_id})
        });
        const data = await res.json();
        if(data.result==='ok' || data.result==='not found'){
          sliderImages.splice(index,1);
          if(currentIndex >= sliderImages.length) currentIndex = 0;
          renderSlider();
          listDiv.removeChild(item);
          sliderSection.style.display = sliderImages.length>0 || role==='admin' ? 'block' : 'none';
        } else alert('Error al eliminar foto');
      }catch(err){ console.error(err); alert('Error al eliminar foto'); }
    });

    item.appendChild(img);
    item.appendChild(btn);
    listDiv.appendChild(item);
  });

  reviewContainer.appendChild(listDiv);
});


  closeModal.addEventListener('click', ()=> reviewModal.style.display='none');
}

// --- Inicializar ---
loadSliderPhotos();
