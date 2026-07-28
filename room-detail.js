function formatPrice(n) {
  return '฿' + n.toLocaleString('th-TH');
}

function renderNotFound(root) {
  root.innerHTML = `
    <div class="detail-error">
      <h2>ไม่พบห้องพักนี้</h2>
      <p>ห้องที่คุณกำลังมองหาอาจถูกลบหรือลิงก์ไม่ถูกต้อง</p>
      <a href="index.html#rooms" class="search-btn">กลับไปดูห้องพักทั้งหมด</a>
    </div>
  `;
}

function renderRoom(room) {
  const root = document.getElementById('detail-root');
  document.title = `${room.name} — เรือนริมธาร`;

  root.innerHTML = `
    <a href="index.html#rooms" class="back-link">← ห้องพักทั้งหมด</a>

    <div class="detail-grid">
      <div class="detail-image">
        ${room.image ? `<img src="${room.image}" alt="${room.name}" onerror="this.parentElement.classList.add('${room.sceneClass || ''}')">` : `<div class="${room.sceneClass || ''}" style="width:100%;height:100%;"></div>`}
        ${room.available ? '' : '<span class="room-badge">เต็มแล้ว</span>'}
      </div>

      <div class="detail-info">
        <span class="room-num" style="color:var(--clay);">${room.number} · ${room.categoryLabel}</span>
        <h1>${room.name}</h1>
        <p class="detail-desc">${room.description}</p>

        <div class="detail-facts">
          <div class="fact">
            <span class="fact-label">ราคา</span>
            <span class="fact-value">${formatPrice(room.price)} <small>/คืน</small></span>
          </div>
          <div class="fact">
            <span class="fact-label">รองรับ</span>
            <span class="fact-value">${room.capacity} ท่าน</span>
          </div>
          <div class="fact">
            <span class="fact-label">สถานะ</span>
            <span class="fact-value">${room.available ? 'ว่าง' : 'เต็ม'}</span>
          </div>
        </div>

        <a href="index.html#book" class="search-btn detail-cta">
          ${room.available ? 'จองห้องนี้' : 'แจ้งเตือนเมื่อว่าง'}
        </a>
      </div>
    </div>
  `;
}

async function init() {
  const root = document.getElementById('detail-root');
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');

  if (!id) {
    renderNotFound(root);
    return;
  }

  try {
    const res = await fetch('rooms.json');
    if (!res.ok) throw new Error('โหลดข้อมูลห้องพักไม่สำเร็จ');
    const rooms = await res.json();
    const room = rooms.find(r => r.id === id);

    if (!room) {
      renderNotFound(root);
      return;
    }

    renderRoom(room);
  } catch (err) {
    root.innerHTML = '<p class="detail-loading">ไม่สามารถโหลดข้อมูลห้องพักได้ในขณะนี้</p>';
    console.error(err);
  }
}

init();
