async function sendMessage() {
  const name = document.getElementById("name").value;
  const message = document.getElementById("message").value;

  const { data, error } = await supabase
    .from("chat")
    .insert([{ name, message }]);

  if (error) {
    console.error(error);
    alert("エラー: " + error.message);
    return;
  }

  document.getElementById("message").value = "";
  loadMessages();
}
