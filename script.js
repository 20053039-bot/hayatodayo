const SUPABASE_URL = "あなたのURL";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqaWxxbWh1bHVrZ25samprbHd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMzgxOTIsImV4cCI6MjA4NTcxNDE5Mn0.iLRmyMyuDSsTQO2WZpZ4tCPYtY5vEmLS9-CT4ai-508";
const { createClient } = supabase;
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const chatBox = document.getElementById("chat");
const currentUserDiv = document.getElementById("currentUser");
const changeNameBtn = document.getElementById("changeNameBtn");

let currentUser = localStorage.getItem("username");

if (!currentUser) {
  currentUser = "user_" + Math.random().toString(36).substring(2, 8);
  localStorage.setItem("username", currentUser);
}

currentUserDiv.textContent = "名前: " + currentUser;

changeNameBtn.addEventListener("click", () => {
  const newName = prompt("新しい名前を入力");
  if (!newName) return;

  currentUser = newName.trim();
  localStorage.setItem("username", currentUser);
  currentUserDiv.textContent = "名前: " + currentUser;
});

async function loadMessages() {
  const { data } = await supabaseClient
    .from("chat")
    .select("*")
    .order("id", { ascending: true });

  chatBox.innerHTML = "";

  data.forEach(msg => {
    const div = document.createElement("div");
    div.className = "message " + 
      (msg.user_id === currentUser ? "my-message" : "other-message");

    div.innerHTML = `
      <strong>${msg.name}</strong><br>
      ${msg.message}
      ${
        msg.user_id === currentUser
          ? `<br><button class="small-btn" onclick="deleteMessage(${msg.id})">削除</button>`
          : ""
      }
    `;

    chatBox.appendChild(div);
  });

  chatBox.scrollTop = chatBox.scrollHeight;
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

loadMessages();
