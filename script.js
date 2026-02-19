// =========================
// Supabase 初期設定
// =========================
const SUPABASE_URL = "https://ajilqmhulukgnljjklwz.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqaWxxbWh1bHVrZ25samprbHd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMzgxOTIsImV4cCI6MjA4NTcxNDE5Mn0.iLRmyMyuDSsTQO2WZpZ4tCPYtY5vEmLS9-CT4ai-508";
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// =========================
// DOM
// =========================
const chatDiv = document.getElementById("chat");
const messageInput = document.getElementById("message");
const sendBtn = document.getElementById("sendBtn");
const loginBtn = document.getElementById("loginBtn");
const logoutBtn = document.getElementById("logoutBtn");
const usernameSpan = document.getElementById("username");

// =========================
// 認証
// =========================
async function signInWithGoogle() {
  await supabaseClient.auth.signInWithOAuth({
    provider: "google",
  });
}

async function signOut() {
  await supabaseClient.auth.signOut();
  location.reload();
}

loginBtn.onclick = signInWithGoogle;
logoutBtn.onclick = signOut;

// =========================
// セッション確認
// =========================
async function checkUser() {
  const { data } = await supabaseClient.auth.getUser();

  if (!data.user) {
    usernameSpan.textContent = "未ログイン";
    sendBtn.disabled = true;
    return null;
  }

  usernameSpan.textContent = data.user.user_metadata.full_name || "ユーザー";
  sendBtn.disabled = false;
  return data.user;
}

// =========================
// メッセージ送信
// =========================
async function sendMessage() {
  const user = await checkUser();
  if (!user) return;

  const text = messageInput.value.trim();
  if (!text) return;

  await supabaseClient.from("chat").insert([
    {
      name: user.user_metadata.full_name,
      message: text,
      user_id: user.id
    }
  ]);

  messageInput.value = "";
}

sendBtn.onclick = sendMessage;

// Enterキー送信
messageInput.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    sendMessage();
  }
});

// =========================
// メッセージ取得
// =========================
async function loadMessages() {
  const { data } = await supabaseClient
    .from("chat")
    .select("*")
    .order("created_at", { ascending: true });

  chatDiv.innerHTML = "";

  const { data: userData } = await supabaseClient.auth.getUser();
  const currentUser = userData.user;

  data.forEach(msg => {
    const div = document.createElement("div");
    div.className = "message";

    const isMine = currentUser && msg.user_id === currentUser.id;
    if (isMine) div.classList.add("mine");

    div.innerHTML = `
      <div class="message-header">
        <span class="name">${escapeHTML(msg.name)}</span>
        ${isMine ? `<button class="delete-btn" onclick="deleteMessage(${msg.id})">削除</button>` : ""}
      </div>
      <div class="message-content">
        ${escapeHTML(msg.message)}
      </div>
    `;

    chatDiv.appendChild(div);
  });

  chatDiv.scrollTop = chatDiv.scrollHeight;
}

// =========================
// 削除（本人のみ）
// =========================
async function deleteMessage(id) {
  const { data } = await supabaseClient.auth.getUser();
  if (!data.user) return;

  await supabaseClient
    .from("chat")
    .delete()
    .eq("id", id)
    .eq("user_id", data.user.id);

  loadMessages();
}

// =========================
// XSS対策
// =========================
function escapeHTML(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// =========================
// リアルタイム更新
// =========================
supabaseClient
  .channel("realtime-chat")
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "chat" },
    () => loadMessages()
  )
  .subscribe();

// =========================
// 起動
// =========================
checkUser();
loadMessages();
