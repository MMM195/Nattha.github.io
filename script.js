const nav = document.getElementById('mainnav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 40);
});

// ===== ห้องพัก: โหลดจาก rooms.json =====
let allRooms = [];
const roomsGrid = document.getElementById('rooms-grid');
const roomTypeFilter = document.getElementById('roomTypeFilter');
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
        ${room.quantity != null ? `<p class="qty-note">ภายในแบ่งเป็น ${room.quantity} ห้องย่อย · จุได้สูงสุด ${room.capacity * room.quantity} ท่าน</p>` : ''}
        <div class="room-price">
          <span class="amt">${formatPrice(room.price)} <span>/คืน</span></span>
          <a href="room.html?id=${encodeURIComponent(room.id)}" class="view-btn">${room.available ? 'ดูห้อง' : 'แจ้งเตือนเมื่อว่าง'}</a>
        </div>
      </div>
    </div>
  `).join('');
}

function applyFilter() {
  const selectedCategory = roomTypeFilter ? roomTypeFilter.value : 'ทั้งหมด';

  let filtered = allRooms;
  if (selectedCategory && selectedCategory !== 'ทั้งหมด') {
    filtered = filtered.filter(r => r.category === selectedCategory);
  }

  const wantRooms = guestState.rooms;
  const wantAdults = guestState.adults;

  filtered = filtered.filter(r => {
    const qty = r.quantity != null ? r.quantity : Infinity;
    const enoughRooms = qty >= wantRooms;
    const enoughCapacity = (r.capacity * wantRooms) >= wantAdults;
    return enoughRooms && enoughCapacity;
  });

  renderRooms(filtered);
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

// ===== ผู้เข้าพัก: dropdown เลือกจำนวนห้อง/ผู้ใหญ่/เด็ก =====
const guestField = document.getElementById('guestField');
const guestTrigger = document.getElementById('guestTrigger');
const guestSummary = document.getElementById('guestSummary');

const guestState = { rooms: 1, adults: 1 };
const guestLimits = {
  rooms:  { min: 1, max: 8 },
  adults: { min: 1, max: 16 }
};

function updateGuestUI() {
  document.getElementById('roomsValue').textContent = guestState.rooms;
  document.getElementById('adultsValue').textContent = guestState.adults;

  document.querySelectorAll('.step-btn').forEach(btn => {
    const target = btn.dataset.target;
    const action = btn.dataset.action;
    const { min, max } = guestLimits[target];
    if (action === 'minus') btn.disabled = guestState[target] <= min;
    if (action === 'plus') btn.disabled = guestState[target] >= max;
  });

  const summary = `${guestState.adults} คน · ${guestState.rooms} ห้อง`;
  guestSummary.textContent = summary;
}

if (guestField && guestTrigger) {
  guestTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    guestField.classList.toggle('open');
  });

  document.querySelectorAll('.step-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const target = btn.dataset.target;
      const action = btn.dataset.action;
      const { min, max } = guestLimits[target];
      if (action === 'plus' && guestState[target] < max) guestState[target]++;
      if (action === 'minus' && guestState[target] > min) guestState[target]--;
      updateGuestUI();
    });
  });

  document.addEventListener('click', (e) => {
    if (!guestField.contains(e.target)) {
      guestField.classList.remove('open');
    }
  });

  updateGuestUI();
}