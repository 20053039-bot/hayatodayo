const SUPABASE_URL = "https://ajilqmhulukgnljjklwz.supabase.co";
const SUPABASE_KEY = "YOUR_PUBLIC_ANON_KEY"; // ← anon public keyにしてね

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
  const nameInput = document.getElementById("name");
  const messageInput = document.getElementById("message");

  const name = nameInput.value.trim();
  const comment = messageInput.value.trim();

  if (!name || !comment) return;

  const { error } = await supabase
    .from("comments")
    .insert([{ name, comment }]);

  if (error) {
    console.error("送信エラー:", error);
    return;
  }

  messageInput.value = "";
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
