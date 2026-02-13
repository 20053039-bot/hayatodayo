const SUPABASE_URL = "https://ajilqmhulukgnljjklwz.supabase.co";
const SUPABASE_KEY = "sb_publishable_4iQaavGyaW6GSEjQdwCLKw_skhKUv6T";

const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

function addMessage(msg) {
  const chat = document.getElementById("chat");

  chat.innerHTML += `
    <div class="message">
      <strong>${msg.name}</strong>: ${msg.message}
    </div>
  `;
}

async function loadMessages() {
  const { data, error } = await supabase
    .from("chat")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    console.error(error);
    return;
  }

  const chat = document.getElementById("chat");
  chat.innerHTML = "";

  data.forEach(addMessage);
}

async function sendMessage() {
  const name = document.getElementById("name").value;
  const message = document.getElementById("message").value;

  if (!name || !message) return;

  const { error } = await supabase
    .from("chat")
    .insert([{ name, message }]);

  if (error) {
    console.error(error);
  }

  document.getElementById("message").value = "";
}

// 初期読み込み
loadMessages();

// 🔥 リアルタイム購読
supabase
  .channel("chat-room")
  .on(
    "postgres_changes",
    { event: "INSERT", schema: "public", table: "chat" },
    payload => {
      addMessage(payload.new);
    }
  )
  .subscribe();
