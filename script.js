const SUPABASE_URL = "https://ajilqmhulukgnljjklwz.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqaWxxbWh1bHVrZ25samprbHd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMzgxOTIsImV4cCI6MjA4NTcxNDE5Mn0.iLRmyMyuDSsTQO2WZpZ4tCPYtY5vEmLS9-CT4ai-508";
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const chatDiv = document.getElementById("chat");

async function loadMessages() {
  const { data, error } = await supabaseClient
    .from("chat")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    alert(error.message);
    return;
  }

  chatDiv.innerHTML = "";

  data.forEach(msg => {
    const div = document.createElement("div");
    div.className = "message";

    div.innerHTML = `
      <strong>${escapeHTML(msg.name)}</strong>: 
      ${escapeHTML(msg.message)}
      <br>
      <button onclick="deleteMessage(${msg.id})">削除</button>
    `;

    chatDiv.appendChild(div);
  });
}

async function sendMessage() {
  const name = document.getElementById("name").value.trim();
  const message = document.getElementById("message").value.trim();

  if (!name || !message) {
    alert("空欄があります");
    return;
  }

  const { error } = await supabaseClient
    .from("chat")
    .insert([{ name, message }]);

  if (error) {
    alert(error.message);
    return;
  }

  document.getElementById("message").value = "";
  loadMessages();
}

async function deleteMessage(id) {
  const { error } = await supabaseClient
    .from("chat")
    .delete()
    .eq("id", id);

  if (error) {
    alert(error.message);
    return;
  }

  loadMessages();
}

function escapeHTML(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

window.sendMessage = sendMessage;
window.deleteMessage = deleteMessage;

loadMessages();
