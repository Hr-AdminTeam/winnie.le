// Dữ liệu người dùng và lịch sử (localStorage)
let currentUser = null;
let users = JSON.parse(localStorage.getItem("users")) || [
  {email: "test@gmail.com", password: "123456", name: "Test User"}
];
let requests = JSON.parse(localStorage.getItem("requests")) || [];

const categories = [
  "Benefits", "Health check up", "Heath Insurance", "HRM system", "Learning & Development",
  "NPP", "Payroll", "Recruitment", "Social Insurance", "Stationery", "Event", "Others"
];

function saveData() {
  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("requests", JSON.stringify(requests));
}

function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    document.getElementById("loginError").innerText = "Sai email hoặc mật khẩu!";
    return;
  }
  currentUser = user;
  document.getElementById("loginBox").style.display = "none";
  document.getElementById("mainContent").style.display = "block";
  loadButtons();
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
  ).join('');
  document.getElementById("buttons").innerHTML = btns;
}

function openChat(category) {
  document.getElementById("chatBox").innerHTML = `
    <div class="card">
      <h4>${category}</h4>
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

function submitRequest(category) {
  const content = document.getElementById("requestContent").value;
  const fileInput = document.getElementById("requestFile");
  const file = fileInput.files[0];
  const time = new Date().toLocaleString();

  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      // Lưu file base64 vào lịch sử
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

function loadHistory() {
  let html = "<h4>Lịch sử yêu cầu</h4>";
  const myRequests = requests.filter(r => r.user === currentUser.name);
  if (myRequests.length === 0) {
    html += "<p>Chưa có yêu cầu nào.</p>";
  } else {
    html += "<ul>";
    myRequests.forEach((r, idx) => {
      html += `<li>
        <b>${r.category}</b>: ${r.content} <br/>
        File: ${r.file || "Không có"} <br/>
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
