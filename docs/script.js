// Dữ liệu người dùng
let currentUser = null;
let users = JSON.parse(localStorage.getItem("users")) || [
  {email: "test@gmail.com", password: "123456", name: "Test User"},
  {email: "hr@gmail.com", password: "123456", name: "HR"}
 ];

const categories = [
  "Benefits", "Health check up", "Heath Insurance", "HRM system", "Learning & Development",
  "NPP", "Payroll", "Recruitment", "Social Insurance", "Stationery", "Others", "Event"
];

// Hàm lấy key lịch sử theo ngày
function getDateKey(date = null) {
  let d = date ? new Date(date) : new Date();
  // Định dạng dd-mm-yyyy
  let dd = String(d.getDate()).padStart(2, '0');
  let mm = String(d.getMonth() + 1).padStart(2, '0');
  let yyyy = d.getFullYear();
  return `requests_${dd}-${mm}-${yyyy}`;
}

// Hàm lấy lịch sử của ngày (mặc định là hôm nay)
function loadRequests(date = null) {
  const key = getDateKey(date);
  return JSON.parse(localStorage.getItem(key)) || [];
}

// Hàm lưu lịch sử của ngày (mặc định là hôm nay)
function saveRequests(requests, date = null) {
  const key = getDateKey(date);
  localStorage.setItem(key, JSON.stringify(requests));
}

// Lưu dữ liệu người dùng
function saveUsers() {
  localStorage.setItem("users", JSON.stringify(users));
}

// Đăng nhập
function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    document.getElementById("loginError").innerText = "Sai email hoặc mật khẩu!";
    return;
  }
  currentUser = user;
  document.getElementById("loginBox").style.display = "none";
  document.getElementById("mainContent").style.display = "block";
  loadHistory();
}

// Đổi mật khẩu
function showChangePassword() {
  document.getElementById("mainContent").style.display = "none";
  document.getElementById("changePasswordBox").style.display = "block";
}

function changePassword() {
  const newPassword = document.getElementById("newPassword").value;
  if (newPassword.length < 6) {
    document.getElementById("changePassMsg").innerText = "Mật khẩu phải từ 6 ký tự!";
    return;
  }
  currentUser.password = newPassword;
  users = users.map(u => u.email === currentUser.email ? currentUser : u);
  saveUsers();
  document.getElementById("changePassMsg").innerText = "Đã đổi mật khẩu thành công!";
  setTimeout(() => {
    document.getElementById("changePasswordBox").style.display = "none";
    document.getElementById("mainContent").style.display = "block";
  }, 1200);
}

// Hiển thị nút chức năng
function loadButtons() {
  const btns = categories.map(cat =>
    `<button class="menu-btn" onclick="openChat('${cat}')">${cat}</button>`
  ).join('');
  document.getElementById("buttons").innerHTML = btns;
}

// Hiện/ẩn danh sách chức năng
function toggleMenu() {
  const btnsDiv = document.getElementById("buttons");
  if (btnsDiv.style.display === "none" || btnsDiv.style.display === "") {
    loadButtons();
    btnsDiv.style.display = "flex";
  } else {
    btnsDiv.style.display = "none";
  }
}

// Mở form gửi yêu cầu
function openChat(category) {
  document.getElementById("chatBox").innerHTML = `
    <div class="card">
      <h4>${category}</h4>
      <input type="text" id="requestName" placeholder="Tên người yêu cầu hỗ trợ" value="${currentUser ? currentUser.name : ''}" />
      <textarea id="requestContent" placeholder="Nội dung cần hỗ trợ"></textarea>
      <input type="file" id="requestFile"/>
      <button onclick="submitRequest('${category}')">Gửi yêu cầu</button>
      <button onclick="closeChat()">Đóng</button>
    </div>
  `;
}

// Đóng form yêu cầu
function closeChat() {
  document.getElementById("chatBox").innerHTML = "";
}

// Gửi yêu cầu (lưu vào lịch sử của ngày)
function submitRequest(category) {
  const name = document.getElementById("requestName").value || (currentUser ? currentUser.name : "");
  const content = document.getElementById("requestContent").value;
  const fileInput = document.getElementById("requestFile");
  const file = fileInput.files[0];
  const time = new Date().toLocaleString();
  const todayRequests = loadRequests();

  const reqObj = {
    user: name,
    category,
    content,
    fileName: file ? file.name : "",
    fileData: "",
    time,
    history: [],
    done: false // trạng thái xử lý
  };

  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      reqObj.fileData = e.target.result;
      todayRequests.push(reqObj);
      saveRequests(todayRequests);
      alert("Đã gửi yêu cầu! (HR sẽ nhận được thông báo nội bộ)");
      closeChat();
      loadHistory();
    };
    reader.readAsDataURL(file);
  } else {
    todayRequests.push(reqObj);
    saveRequests(todayRequests);
    alert("Đã gửi yêu cầu! (HR sẽ nhận được thông báo nội bộ)");
    closeChat();
    loadHistory();
  }
}

// Hiển thị lịch sử yêu cầu của ngày được chọn (mặc định là hôm nay)
function loadHistory() {
  let dateVal = document.getElementById("historyDate") ? document.getElementById("historyDate").value : "";
  let requestsArr = [];
  let dateLabel = "";

  if (dateVal) {
    const [yyyy, mm, dd] = dateVal.split("-");
    dateLabel = `${dd}-${mm}-${yyyy}`;
    requestsArr = loadRequests(dateLabel);
  } else {
    const today = new Date();
    dateLabel = getDateKey().replace("requests_", "");
    requestsArr = loadRequests();
  }

  let html = `<h4>Lịch sử yêu cầu ngày ${dateLabel}</h4>`;
  if (requestsArr.length === 0) {
    html += "<p>Chưa có yêu cầu nào.</p>";
  } else {
    html += "<ul>";
    requestsArr.forEach((r, idx) => {
      const fileLink = r.fileData
        ? `<a href="${r.fileData}" download="${r.fileName}" style="color:#dba600;">Tải file: ${r.fileName}</a>`
        : "Không có file";

      const itemColor = r.done ? "#169c23" : "#e12929";
      const statusText = r.done ? "Đã xử lý (Done)" : "Chưa xử lý";

      html += `
        <li style="border-left:6px solid ${itemColor}; padding:10px; margin-bottom:10px;" class="message-card">
          <div class="action-buttons">
            <button onclick="replyChat(${idx})">Phản hồi</button>
            ${!r.done ? `<button onclick="markDone(${idx})">Đánh dấu Done</button>` : ""}
          </div>
          <div>
            <b>${r.category}</b> - <i>Người gửi: ${r.user}</i><br/>
            Nội dung: ${r.content} <br/>
            ${fileLink} <br/>
            Thời gian: ${r.time} <br/>
            <span style="color:${itemColor}; font-weight:bold;">${statusText}</span>
            <ul>
              ${r.history.map(h => `<li>${h.from}: ${h.message} (${h.time})</li>`).join('')}
            </ul>
          </div>
        </li>
      `;
    });
    html += "</ul>";
  }

  document.getElementById("history").innerHTML = html;
}


// Đánh dấu yêu cầu là Done (HR bấm)
function markDone(idx) {
  let dateVal = document.getElementById("historyDate") ? document.getElementById("historyDate").value : "";
  let requestsArr = [];
  if (dateVal) {
    const [yyyy, mm, dd] = dateVal.split("-");
    const dateLabel = `${dd}-${mm}-${yyyy}`;
    requestsArr = loadRequests(dateLabel);
    requestsArr[idx].done = true;
    saveRequests(requestsArr, dateLabel);
  } else {
    requestsArr = loadRequests();
    requestsArr[idx].done = true;
    saveRequests(requestsArr);
  }
  loadHistory();
}

// Phản hồi yêu cầu: bất kỳ ai đăng nhập đều phản hồi được
function replyChat(idx) {
  let dateVal = document.getElementById("historyDate") ? document.getElementById("historyDate").value : "";
  let requestsArr = [];
  if (dateVal) {
    const [yyyy, mm, dd] = dateVal.split("-");
    const dateLabel = `${dd}-${mm}-${yyyy}`;
    requestsArr = loadRequests(dateLabel);
  } else {
    requestsArr = loadRequests();
  }
  const msg = prompt("Nhập nội dung phản hồi:");
  if (msg) {
    const responder = currentUser && currentUser.name ? currentUser.name : "Người dùng";
    requestsArr[idx].history.push({
      from: responder,
      message: msg,
      time: new Date().toLocaleString()
    });
    if (dateVal) {
      const [yyyy, mm, dd] = dateVal.split("-");
      const dateLabel = `${dd}-${mm}-${yyyy}`;
      saveRequests(requestsArr, dateLabel);
    } else {
      saveRequests(requestsArr);
    }
    loadHistory();
  }
}

// Xóa toàn bộ lịch sử yêu cầu của currentUser trong ngày đang xem
function clearHistory() {
  if (confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử yêu cầu của bạn trong ngày đang xem?")) {
    let dateVal = document.getElementById("historyDate") ? document.getElementById("historyDate").value : "";
    let requestsArr = [];
    if (dateVal) {
      const [yyyy, mm, dd] = dateVal.split("-");
      const dateLabel = `${dd}-${mm}-${yyyy}`;
      requestsArr = loadRequests(dateLabel);
      requestsArr = requestsArr.filter(r => r.user !== (currentUser ? currentUser.name : ""));
      saveRequests(requestsArr, dateLabel);
    } else {
      requestsArr = loadRequests();
      requestsArr = requestsArr.filter(r => r.user !== (currentUser ? currentUser.name : ""));
      saveRequests(requestsArr);
    }
    loadHistory();
    alert("Đã xóa lịch sử yêu cầu của bạn trong ngày đang xem!");
  }
}

// Xem lịch sử theo ngày chọn
function onChangeHistoryDate() {
  loadHistory();
  searchRequests(); //Khi thay đổi ngày, gọi cả searchRequests() để kết quả tìm kiếm cập nhật theo ngày mới:
}

function searchRequests() {
  let dateVal = document.getElementById("historyDate") ? document.getElementById("historyDate").value : "";
  let requestsArr = [];
  let dateLabel = "";
  if (dateVal) {
    const [yyyy, mm, dd] = dateVal.split("-");
    dateLabel = `${dd}-${mm}-${yyyy}`;
    requestsArr = loadRequests(dateLabel);
  } else {
    dateLabel = getDateKey().replace("requests_", "");
    requestsArr = loadRequests();
  }
  const searchUser = document.getElementById("searchUser").value.toLowerCase();
  const searchCategory = document.getElementById("searchCategory").value.toLowerCase();
  let filtered = requestsArr;

  // Lọc theo tên người gửi
  if (searchUser) {
    filtered = filtered.filter(r => r.user.toLowerCase().includes(searchUser));
  }

  // Lọc theo chức năng
  if (searchCategory) {
    filtered = filtered.filter(r => r.category.toLowerCase().includes(searchCategory));
  }

  let html = `<h4>Kết quả tìm kiếm yêu cầu ngày ${dateLabel}</h4>`;
  if (filtered.length === 0) {
    html += "<p>Không tìm thấy yêu cầu phù hợp.</p>";
  } else {
    html += "<ul>";
    filtered.forEach((r, idx) => {
      const fileLink = r.fileData
        ? `<a href="${r.fileData}" download="${r.fileName}" style="color:#dba600;">Tải file: ${r.fileName}</a>`
        : "Không có file";
      const itemColor = r.done ? "#169c23" : "#e12929";
      const statusText = r.done ? "Đã xử lý (Done)" : "Chưa xử lý";
      html += `<li style="border-left:6px solid ${itemColor};padding-left:8px; margin-bottom:8px;">
        <b>${r.category}</b> - <i>Người gửi: ${r.user}</i><br/>
        Nội dung: ${r.content} <br/>
        ${fileLink} <br/>
        Thời gian: ${r.time} <br/>
        <span style="color:${itemColor};font-weight:bold;">${statusText}</span>
        <button onclick="replyChat(${idx})">Phản hồi</button>
        ${!r.done ? `<button onclick="markDone(${idx})">Đánh dấu Done</button>` : ""}
        <ul>
          ${r.history.map(h => `<li>${h.from}: ${h.message} (${h.time})</li>`).join('')}
        </ul>
      </li>`;
    });
    html += "</ul>";
  }
  document.getElementById("history").innerHTML = html;
}
