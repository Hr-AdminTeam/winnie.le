// Dữ liệu người dùng và lịch sử (localStorage)
let currentUser = null;
let users = JSON.parse(localStorage.getItem("users")) || [
  {email: "test@gmail.com", password: "123456", name: "Test User"}
];
let requests = JSON.parse(localStorage.getItem("requests")) || [];

const categories = [
  "Benefits", "Health check up", "Heath Insurance", "HRM system", "Learning & Development",
  "NPP", "Payroll", "Recruitment", "Social Insurance", "Stationery", "Others", "Event"
];

function saveData() {
  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("requests", JSON.stringify(requests));
}

// Khi đăng nhập, KHÔNG gọi loadButtons() nữa, chỉ để hiện nút Menu:
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
  // loadButtons();
  loadHistory();
}

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
  saveData();
  document.getElementById("changePassMsg").innerText = "Đã đổi mật khẩu thành công!";
  setTimeout(() => {
    document.getElementById("changePasswordBox").style.display = "none";
    document.getElementById("mainContent").style.display = "block";
  }, 1200);
}

function loadButtons() {
  const btns = categories.map(cat =>
    `<button onclick="openChat('${cat}')">${cat}</button>`
     `<button class="menu-btn" onclick="openChat('${cat}')">${cat}</button>`                         
  ).join('');
  document.getElementById("buttons").innerHTML = btns;
}

function toggleMenu() {
  const btnsDiv = document.getElementById("buttons");
  if (btnsDiv.style.display === "none" || btnsDiv.style.display === "") {
    loadButtons();
    btnsDiv.style.display = "block";
     btnsDiv.style.display = "flex";
  } else {
    btnsDiv.style.display = "none";
  }
}
function openChat(category) {
  document.getElementById("chatBox").innerHTML = `
    <div class="card">
      <h4>${category}</h4>
      <input type="text" id="requestName" placeholder="Tên người yêu cầu hỗ trợ" value="${currentUser ? currentUser.name : ''}" />
      <textarea id="requestContent" placeholder="Nội dung cần hỗ trợ"></textarea>
      <input type="file" id="requestFile"/>
      <button onclick="submitRequest('${category}')">Submit</button>
      <button onclick="closeChat()">Đóng</button>
    </div>
  `;
}

function closeChat() {
  document.getElementById("chatBox").innerHTML = "";
}

// Lưu file gốc dạng base64 để HR có thể tải lại
function submitRequest(category) {
  const name = document.getElementById("requestName").value || (currentUser ? currentUser.name : "");
  const content = document.getElementById("requestContent").value;
  const fileInput = document.getElementById("requestFile");
  const file = fileInput.files[0];
  const time = new Date().toLocaleString();

  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      requests.push({
        user: currentUser.name,
        category,
        content,
        fileName: file.name,
        fileData: e.target.result, // base64
        time,
        history: []
      });
      saveData();
      alert("Đã gửi yêu cầu! (HR sẽ nhận được thông báo nội bộ)");
      closeChat();
      loadHistory();
    };
    reader.readAsDataURL(file);
  } else {
    requests.push({
      user: currentUser.name,
      category,
      content,
      fileName: "",
      fileData: "",
      time,
      history: []
    });
    saveData();
    alert("Đã gửi yêu cầu! (HR sẽ nhận được thông báo nội bộ)");
    closeChat();
    loadHistory();
  }
}

// Hiển thị lịch sử với link tải file đính kèm nếu có
function loadHistory() {
  let html = "<h4>Lịch sử yêu cầu</h4>";
  const myRequests = requests.filter(r => r.user === currentUser.name);
  if (myRequests.length === 0) {
    html += "<p>Chưa có yêu cầu nào.</p>";
  } else {
    html += "<ul>";
    myRequests.forEach((r, idx) => {
      const fileLink = r.fileData
        ? `<a href="${r.fileData}" download="${r.fileName}" style="color:#dba600;">Tải file: ${r.fileName}</a>`
        : "Không có file";
      html += `<li>
        <b>${r.category}</b>: ${r.content} <br/>
        ${fileLink} <br/>
        Thời gian: ${r.time}
        <button onclick="replyChat(${requests.indexOf(r)})">Phản hồi</button>
        <ul>
          ${r.history.map(h => `<li>${h.from}: ${h.message} (${h.time})</li>`).join('')}
        </ul>
      </li>`;
    });
    html += "</ul>";
  }
  document.getElementById("history").innerHTML = html;
}

// HR phản hồi từng yêu cầu
function replyChat(idx) {
  const msg = prompt("HR phản hồi nội dung:");
  if (msg) {
    requests[idx].history.push({
      from: "HR",
      message: msg,
      time: new Date().toLocaleString()
    });
    saveData();
    loadHistory();
  }
}

// Xóa toàn bộ lịch sử yêu cầu của currentUser
function clearHistory() {
  if (confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử yêu cầu?")) {
    requests = requests.filter(r => r.user !== currentUser.name);
    saveData();
    loadHistory();
    alert("Đã xóa lịch sử yêu cầu của bạn!");
  }
}
