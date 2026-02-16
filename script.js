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
    .from("comments")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    console.error("読み込みエラー:", error);
    return;
  }

  chatBox.innerHTML = "";

  data.forEach(msg => {
    const div = document.createElement("div");
    div.className = "message";
    div.innerHTML = `<strong>${msg.name}</strong>: ${msg.comment}`;
    chatBox.appendChild(div);
  });

  chatBox.scrollTop = chatBox.scrollHeight;
}

// ----------------------
// 送信
// ----------------------
async function sendMessage() {
  try {
    const name = document.getElementById("name").value;
    const message = document.getElementById("message").value;

    const { data, error } = await supabase
      .from("chat")
      .insert([{ name, message }]);

    if (error) {
      document.body.innerHTML += "<p style='color:red'>" + error.message + "</p>";
      return;
    }

    document.getElementById("message").value = "";
    loadMessages();

  } catch (e) {
    document.body.innerHTML += "<p style='color:red'>" + e + "</p>";
  }
}


// ----------------------
// リアルタイム同期
// ----------------------
supabase
  .channel("realtime-comments")
  .on(
    "postgres_changes",
    {
      event: "*",
      schema: "public",
      table: "comments"
    },
    () => {
      loadMessages();
    }
  )
  .subscribe();


// 初回読み込み
loadMessages();
