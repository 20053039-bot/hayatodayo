const SUPABASE_URL = "https://ajilqmhulukgnljjklwz.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqaWxxbWh1bHVrZ25samprbHd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMzgxOTIsImV4cCI6MjA4NTcxNDE5Mn0.iLRmyMyuDSsTQO2WZpZ4tCPYtY5vEmLS9-CT4ai-508";
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const chatDiv = document.getElementById("chat");

let currentUser = localStorage.getItem("username");

if (!currentUser) {
  currentUser = prompt("名前を入力してください") || "名無し";
  localStorage.setItem("username", currentUser);
}

async function loadMessages() {
  const { data } = await supabaseClient
    .from("chat")
    .select("*")
    .order("created_at", { ascending: true });

  chatDiv.innerHTML = "";

  data.forEach(msg => {
    const isMe = msg.user_id === currentUser;

    const div = document.createElement("div");
    div.className = isMe ? "message me" : "message";

    div.innerHTML = `
      <div class="name">${escapeHTML(msg.name)}</div>
      <div class="text">${escapeHTML(msg.message)}</div>
      ${isMe ? `<button onclick="deleteMessage(${msg.id})">削除</button>` : ""}
    `;

    chatDiv.appendChild(div);
  });

  chatDiv.scrollTop = chatDiv.scrollHeight;
}

async function sendMessage() {
  const messageInput = document.getElementById("message");
  const message = messageInput.value.trim();
  if (!message) return;

  await supabaseClient.from("chat").insert([
    {
      name: currentUser,
      message: message,
      user_id: currentUser,
      created_at: new Date()
    }
  ]);

  messageInput.value = "";
  loadMessages();
}

async function deleteMessage(id) {
  await supabaseClient
    .from("chat")
    .delete()
    .eq("id", id)
    .eq("user_id", currentUser);

  loadMessages();
}

function escapeHTML(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

loadMessages();

/* リアルタイム */
supabaseClient
  .channel("realtime-chat")
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "chat" },
    () => loadMessages()
  )
  .subscribe();
