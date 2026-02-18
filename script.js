document.addEventListener("DOMContentLoaded", () => {

  const SUPABASE_URL = "https://ajilqmhulukgnljjklwz.supabase.co";
  const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqaWxxbWh1bHVrZ25samprbHd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMzgxOTIsImV4cCI6MjA4NTcxNDE5Mn0.iLRmyMyuDSsTQO2WZpZ4tCPYtY5vEmLS9-CT4ai-508";
";

  const supabase = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
  );

  const chatBox = document.getElementById("chat");

  async function loadMessages() {
    const { data, error } = await supabase
      .from("chat")   // ← 前と同じにする
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      alert(error.message);
      return;
    }

    chatBox.innerHTML = "";

    data.forEach(msg => {
      chatBox.innerHTML += `
        <div class="message">
          <strong>${msg.name}</strong>: ${msg.comment}
        </div>
      `;
    });
  }

  window.sendMessage = async function() {
    const name = document.getElementById("name").value;
    const message = document.getElementById("message").value;

    if (!name || !message) return;

    const { error } = await supabase
      .from("chat")   // ← ここも統一
      .insert([{ name, comment: message }]);

    if (error) {
      alert(error.message);
      return;
    }

    document.getElementById("message").value = "";
    loadMessages();
  };

  loadMessages();

});
