const SUPABASE_URL = "https://ajilqmhulukgnljjklwz.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqaWxxbWh1bHVrZ25samprbHd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMzgxOTIsImV4cCI6MjA4NTcxNDE5Mn0.iLRmyMyuDSsTQO2WZpZ4tCPYtY5vEmLS9-CT4ai-508";
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let currentUserId = null;
let currentName = localStorage.getItem("chat_name");

async function initAuth() {
  let { data: { user } } = await supabaseClient.auth.getUser();

  if (!user) {
    const { data } = await supabaseClient.auth.signInAnonymously();
    user = data.user;
  }

  currentUserId = user.id;

  if (!currentName) {
    currentName = prompt("名前を入力") || "名無し";
    localStorage.setItem("chat_name", currentName);
  }

  loadMessages();
}

async function loadMessages() {
  const { data } = await supabaseClient
    .from("chat")
    .select("*")
    .order("id", { ascending: true });

  const chatBox = document.getElementById("chat");
  chatBox.innerHTML = "";

  data.forEach(msg => {
    const div = document.createElement("div");
    div.className = msg.user_id === currentUserId ? "message me" : "message";

    div.innerHTML = `
      <strong>${escapeHTML(msg.name)}</strong><br>
      ${escapeHTML(msg.message)}
      ${
        msg.user_id === currentUserId
          ? `<br><button onclick="deleteMessage(${msg.id})">削除</button>`
          : ""
      }
    `;

    chatBox.appendChild(div);
  });

  chatBox.scrollTop = chatBox.scrollHeight;
}

async function sendMessage() {
  const input = document.getElementById("message");
  const text = input.value.trim();
  if (!text) return;

  await supabaseClient.from("chat").insert([
    {
      name: currentName,
      message: text,
      user_id: currentUserId
    }
  ]);

  input.value = "";
}

async function deleteMessage(id) {
  await supabaseClient
    .from("chat")
    .delete()
    .eq("id", id)
    .eq("user_id", currentUserId);
}

function escapeHTML(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

supabaseClient
  .channel("realtime")
  .on(
    "postgres_changes",
    { event: "*", schema: "public", table: "chat" },
    () => loadMessages()
  )
  .subscribe();

initAuth();
