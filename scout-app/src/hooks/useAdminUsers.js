import { useState, useCallback } from 'react';

const useAdminUsers = (toast) => {
  const [unacceptedUsers, setUnacceptedUsers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const fetchUnacceptedUsers = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/unaccepted-users', {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();
      if (data.unaccepted_users) {
        setUnacceptedUsers(data.unaccepted_users);
      }
    } catch (err) {
      toast({
        title: 'Fel vid hämtning av användare',
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [toast]);

  const fetchAllUsers = useCallback(async () => {
    try {
      const response = await fetch('/api/users/all', {
        method: 'GET',
        credentials: 'include',
      });
      const data = await response.json();
      if (Array.isArray(data)) {
        setAllUsers(data);
      } else {
        console.error('Data från backend är inte en array:', data);
      }
    } catch (err) {
      toast({
        title: 'Fel vid hämtning av användare',
        description: err.message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  }, [toast]);

  const openDeleteDialog = useCallback((userId) => {
    setUserToDelete(userId);
    setIsDeleteDialogOpen(true);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setIsDeleteDialogOpen(false);
    setUserToDelete(null);
  }, []);

  const promoteToAdmin = useCallback((userId) => {
    fetch('/api/admin/make-admin', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ id: userId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.message) {
          setAllUsers((prevUsers) =>
            prevUsers.map((user) =>
              user.id === userId
                ? { ...user, roles: [...user.roles, 'admin'] }
                : user
            )
          );
          toast({
            title: 'Uppgradering lyckades',
            description: data.message,
            status: 'success',
            duration: 5000,
            isClosable: true,
          });
        } else if (data.error) {
          toast({
            title: 'Fel vid uppgradering',
            description: data.error,
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        }
      })
      .catch((err) =>
        toast({
          title: 'Serverfel',
          description: err.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      );
  }, [toast]);

  const acceptUser = useCallback((userId) => {
    fetch('/api/admin/accept-user', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ user_id: userId }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.message) {
          setUnacceptedUsers((prev) => prev.filter((user) => user.id !== userId));
          toast({
            title: 'Användare accepterad',
            description: data.message,
            status: 'success',
            duration: 5000,
            isClosable: true,
          });
        }
      })
      .catch((err) =>
        toast({
          title: 'Fel vid accepterande av användare',
          description: err.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      );
  }, [toast]);

  const confirmDeleteUser = useCallback((userId) => {
    fetch(`/api/admin/delete-user/${userId}`, {
      method: 'DELETE',
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.message) {
          setUnacceptedUsers((prev) =>
            prev.filter((user) => user.id !== userId)
          );
          setAllUsers((prev) =>
            prev.filter((user) => user.id !== userId)
          );
          toast({
            title: 'Användare borttagen',
            description: data.message,
            status: 'success',
            duration: 5000,
            isClosable: true,
          });
        }
        closeDeleteDialog();
      })
      .catch((err) =>
        toast({
          title: 'Fel vid borttagning av användare',
          description: err.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      );
  }, [toast, closeDeleteDialog]);

  const clearOldActivities = useCallback(() => {
    fetch('/api/admin/cleanup-activities', {
      method: 'DELETE',
      credentials: 'include',
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.message) {
          const { deleted_activities, deleted_carpools, deleted_passengers } = data;
          toast({
            title: 'Rensning klar',
            description: `${data.message}\nAktiviteter: ${deleted_activities}, Samåkningar: ${deleted_carpools}, Passagerare: ${deleted_passengers}`,
            status: 'success',
            duration: 5000,
            isClosable: true,
          });
        } else if (data.error) {
          toast({
            title: 'Fel vid rensning',
            description: data.error,
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        }
      })
      .catch((err) =>
        toast({
          title: 'Serverfel',
          description: err.message,
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      );
  }, [toast]);

  return {
    unacceptedUsers,
    allUsers,
    isDeleteDialogOpen,
    userToDelete,
    fetchUnacceptedUsers,
    fetchAllUsers,
    openDeleteDialog,
    closeDeleteDialog,
    promoteToAdmin,
    acceptUser,
    confirmDeleteUser,
    clearOldActivities,
  };
};

export default useAdminUsers;