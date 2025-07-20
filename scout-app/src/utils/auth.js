export async function checkIfLoggedIn() {
    try {
      const response = await fetch('/api/protected/user', {
        method: 'GET',
        credentials: 'include',
      });
      if (!response.ok) {
        window.location.href = '/';
        return false;
      }
      return true;
    } catch (error) {
      console.error("User is not logged in:", error);
      window.location.href = '/';
      return false;
    }
}