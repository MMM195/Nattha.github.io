const nav = document.getElementById('mainnav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
});

// ===== ห้องพัก: โหลดจาก rooms.json =====
let allRooms = [];
const roomsGrid = document.getElementById('rooms-grid');
const roomTypeSelect = document.querySelector('.field select:nth-of-type(1)');
// select ตัวที่สองใน booking-card คือ "ประเภทห้อง"
const roomTypeFilter = document.querySelectorAll('.booking-card select')[1];
const searchBtn = document.querySelector('.booking-card .search-btn');

function formatPrice(n) {
  return '฿' + n.toLocaleString('th-TH');
}

function renderRooms(rooms) {
  if (!roomsGrid) return;

  if (!rooms.length) {
    roomsGrid.innerHTML = '<p class="rooms-empty" style="grid-column:1/-1; text-align:center;">ไม่พบห้องพักตามเงื่อนไขที่เลือก ลองเปลี่ยนตัวกรองดูนะครับ</p>';
    return;
  }

  roomsGrid.innerHTML = rooms.map(room => `
    <div class="room-card ${room.available ? '' : 'is-full'}">
      ${room.available ? '' : '<span class="room-badge">เต็มแล้ว</span>'}
      <div class="scene ${room.sceneClass || ''}">
        ${room.image ? `<img src="${room.image}" alt="${room.name}" loading="lazy" onerror="this.remove()">` : ''}
      </div>
      <div class="room-content">
        <span class="room-num">${room.number} · ${room.categoryLabel}</span>
        <h3>${room.name}</h3>
        <p class="desc">${room.description}</p>
        <div class="room-price">
          <span class="amt">${formatPrice(room.price)} <span>/คืน</span></span>
          <a href="room.html?id=${encodeURIComponent(room.id)}" class="view-btn">${room.available ? 'ดูห้อง' : 'แจ้งเตือนเมื่อว่าง'}</a>
        </div>
      </div>
    </div>
  `).join('');
}

function applyFilter() {
  const selected = roomTypeFilter ? roomTypeFilter.value : 'ทั้งหมด';
  if (!selected || selected === 'ทั้งหมด') {
    renderRooms(allRooms);
  } else {
    renderRooms(allRooms.filter(r => r.category === selected));
  }
}

async function loadRooms() {
  if (!roomsGrid) return;
  try {
    const res = await fetch('rooms.json');
    if (!res.ok) throw new Error('โหลดข้อมูลห้องพักไม่สำเร็จ');
    allRooms = await res.json();
    renderRooms(allRooms);
  } catch (err) {
    roomsGrid.innerHTML = '<p class="rooms-empty" style="grid-column:1/-1; text-align:center;">ไม่สามารถโหลดข้อมูลห้องพักได้ในขณะนี้</p>';
    console.error(err);
  }
}

if (searchBtn) {
  searchBtn.addEventListener('click', (e) => {
    e.preventDefault();
    applyFilter();
    document.getElementById('rooms').scrollIntoView({ behavior: 'smooth' });
  });
}

loadRooms();
