const SUPABASE_URL = "https://ajilqmhulukgnljjklwz.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqaWxxbWh1bHVrZ25samprbHd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMzgxOTIsImV4cCI6MjA4NTcxNDE5Mn0.iLRmyMyuDSsTQO2WZpZ4tCPYtY5vEmLS9-CT4ai-508";
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const chatDiv = document.getElementById("comments");

let userId = localStorage.getItem("user_id");
let userName = localStorage.getItem("username");

// 一意ID生成
if (!userId) {
  userId = crypto.randomUUID();
  localStorage.setItem("user_id", userId);
}

// 名前設定
async function initUser() {
  if (!userName) {
    while (true) {
      const input = prompt("名前を入力してください");
      if (!input) continue;

      const name = input.trim();

      // 同じ名前が既にあるか確認
      const { data } = await supabaseClient
        .from("chat")
        .select("name")
        .eq("name", name)
        .limit(1);

      if (data.length > 0) {
        alert("その名前は使われています");
      } else {
        userName = name;
        localStorage.setItem("username", userName);
        break;
      }
    }
  }
}

async function loadMessages() {
  const { data } = await supabaseClient
    .from("chat")
    .select("*")
    .order("created_at", { ascending: true });

  chatDiv.innerHTML = "";

  data.forEach(msg => {
    const isMe = msg.user_id === userId;

    const div = document.createElement("div");
    div.className = isMe ? "msg me" : "msg other";

    div.innerHTML = `
      <div class="name">${isMe ? "あなた" : escapeHTML(msg.name)}</div>
      <div class="text">${escapeHTML(msg.comment)}</div>
      ${
        isMe
          ? `<button class="delete" onclick="deleteMessage(${msg.id})">削除</button>`
          : ""
      }
    `;

    chatDiv.appendChild(div);
  });

  chatDiv.scrollTop = chatDiv.scrollHeight;
}

async function sendMessage() {
  const text = document.getElementById("message").value.trim();
  if (!text) return;

  await supabaseClient.from("chat").insert([
    {
      user_id: userId,
      name: userName,
      comment: text,
      created_at: new Date()
    }
  ]);

  document.getElementById("message").value = "";
}

async function deleteMessage(id) {
  await supabaseClient
    .from("chat")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  loadMessages();
}

function escapeHTML(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// リアルタイム
supabaseClient
  .channel("realtime-chat")
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "chat" },
    () => loadMessages()
  )
  .subscribe();

(async () => {
  await initUser();
  loadMessages();
})();
