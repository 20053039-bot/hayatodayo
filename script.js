const supabase = window.supabase.createClient(
  "https://あなたのproject-id.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqaWxxbWh1bHVrZ25samprbHd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAxMzgxOTIsImV4cCI6MjA4NTcxNDE5Mn0.iLRmyMyuDSsTQO2WZpZ4tCPYtY5vEmLS9-CT4ai-508";
);

// Googleログイン
async function loginWithGoogle() {
  await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: "https://20053039-bot.github.io/hayatoday/"
    }
  });
}

// ログイン状態監視
supabase.auth.onAuthStateChange((event, session) => {
  if (session) {
    console.log("ログイン成功", session.user);
  }
});
