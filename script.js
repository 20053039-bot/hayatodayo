const SUPABASE_URL = "https://ajilqmhulukgnljjklwz.supabase.co";
const SUPABASE_KEY = "sb_publishable_4iQaavGyaW6GSEjQdwCLKw_skhKUv6T";

const supabase = window.supabase.createClient(
  SUPABASE_URL,
  SUPABASE_KEY
);

async function loadMessages() {
  const { data } = await supabase
    .from("chat")
    .select("*")
    .order("id", { ascending: true });

  const chat = document.getElementById("chat");
  chat.innerHTML = "";

  data.forEach(msg => {
    chat.innerHTML += `
      <div class="message">
        <strong>${msg.name}</strong>: ${msg.message}
      </div>
    `;
  });
}

async function sendMessage() {
  const name = document.getElementById("name").value;
  const message = document.getElementById("message").value;

  await supabase.from("chat").insert([
    { name, message }
  ]);

  document.getElementById("message").value = "";
  loadMessages();
}

loadMessages();

setInterval(loadMessages, 2000);
