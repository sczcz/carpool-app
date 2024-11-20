export const fetchNotifications = async () => {
  try {
    const response = await fetch('/api/notifications', {
      method: 'GET',
      credentials: 'include', // Skickar cookies för autentisering
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Notifications fetched successfully:', data); // Loggar notifikationerna
      return {
        notifications: data.notifications,
        unreadCount: data.unreadCount,
      };
    } else {
      console.error('Failed to fetch notifications');
      return { notifications: [], unreadCount: 0 };
    }
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return { notifications: [], unreadCount: 0 };
  }
};
