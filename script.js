console.log("JS読み込み成功");
const supabase = window.supabase.createClient(
  "https://ajilqmhulukgnljjklwz.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqaWxxbWh1bHVrZ25samprbHd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMzgxOTIsImV4cCI6MjA4NTcxNDE5Mn0.iLRmyMyuDSsTQO2WZpZ4tCPYtY5vEmLS9-CT4ai-508"
);

const chatContainer = document.getElementById("chat-container");
const messageInput = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");

let currentUser = null;
let displayName = localStorage.getItem("displayName") || "名無し";

// Googleログイン
document.getElementById("googleLoginBtn").onclick = async () => {
  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: window.location.href
    }
  });
};

// ログアウト
document.getElementById("logoutBtn").onclick = async () => {
  await supabase.auth.signOut();
  location.reload();
};

// 名前変更
document.getElementById("nameChangeBtn").onclick = () => {
  const newName = prompt("新しい名前を入力");
  if (newName) {
    displayName = newName;
    localStorage.setItem("displayName", newName);
  }
};

// ログイン状態確認
supabase.auth.getSession().then(({ data }) => {
  if (data.session) {
    currentUser = data.session.user;
    loadMessages();
  }
});

// メッセージ送信
sendBtn.onclick = async () => {
  if (!currentUser) {
    alert("ログインしてください");
    return;
  }

  const text = messageInput.value.trim();
  if (!text) return;

  await supabase.from("chat").insert([
    {
      name: displayName,
      message: text,
      user_id: currentUser.id
    }
  ]);

  messageInput.value = "";
  loadMessages();
};

// メッセージ読み込み
async function loadMessages() {
  const { data } = await supabase
    .from("chat")
    .select("*")
    .order("id", { ascending: true });

  chatContainer.innerHTML = "";

  data.forEach(msg => {
    const div = document.createElement("div");
    div.classList.add("message");

    if (msg.user_id === currentUser.id) {
      div.classList.add("own");
    }

    div.innerHTML = `
      <div class="name">${msg.name}</div>
      <div>${msg.message}</div>
      <button class="delete-btn">削除</button>
    `;

    // 削除ボタン
    div.querySelector(".delete-btn").onclick = async () => {
      await supabase
        .from("chat")
        .delete()
        .eq("id", msg.id)
        .eq("user_id", currentUser.id);

      loadMessages();
    };

    chatContainer.appendChild(div);
  });

  chatContainer.scrollTop = chatContainer.scrollHeight;
}
