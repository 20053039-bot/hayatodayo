const SUPABASE_URL = "https://ajilqmhulukgnljjklwz.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqaWxxbWh1bHVrZ25samprbHd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMzgxOTIsImV4cCI6MjA4NTcxNDE5Mn0.iLRmyMyuDSsTQO2WZpZ4tCPYtY5vEmLS9-CT4ai-508";

const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

const chatBox = document.getElementById("chat");

// ----------------------
// メッセージ読み込み
// ----------------------
async function loadMessages() {
  const { data, error } = await supabase
    .from("chat") // ← ここを chat に統一
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    document.body.innerHTML += "<p style='color:red'>" + error.message + "</p>";
    return;
  }

  chatBox.innerHTML = "";

  data.forEach(msg => {
    const div = document.createElement("div");
    div.className = "message";
    div.innerHTML = `<strong>${msg.name}</strong>: ${msg.message}`;
    chatBox.appendChild(div);
  });

  chatBox.scrollTop = chatBox.scrollHeight;
}

// ----------------------
// 送信
// ----------------------
async function sendMessage() {
  const name = document.getElementById("name").value;
  const message = document.getElementById("message").value;

  if (!name || !message) {
    alert("空欄があります");
    return;
  }

  const { data, error } = await supabase
    .from("chat")
    .insert([{ name, message }])
    .select();

  if (error) {
    alert("エラー: " + error.message);
    console.error(error);
    return;
  }

  alert("成功しました");
}

// ----------------------
// リアルタイム同期
// ----------------------
supabase
  .channel("realtime-chat")
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "chat" // ← ここも chat に
    },
    () => {
      loadMessages();
    }
  )
  .subscribe();

// 初回読み込み
loadMessages();
