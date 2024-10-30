export async function checkIfLoggedIn() {
    try {
      const response = await fetch('/api/protected/user', {
        method: 'GET',
        credentials: 'include',
      });
      if (!response.ok) {
        // Redirect to Home or login if the user is not logged in
        window.location.href = '/';
        return false;
      }
      return true;
    } catch (error) {
      console.error("User is not logged in:", error);
      // Redirect to Home or login in case of any error
      window.location.href = '/';
      return false;
    }
}