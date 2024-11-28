import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@chakra-ui/react";
import { useUser } from "./UserContext";

const useRoleProtection = (allowedRoles) => {
  const { hasRole, isInitialized, fetchUserData } = useUser();
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const checkAccess = async () => {
      if (!isInitialized) {
        await fetchUserData();
      }

      const hasAccess = allowedRoles.some((role) => hasRole(role));
      if (!hasAccess) {
        navigate("/");
      }
    };

    checkAccess();
  }, [allowedRoles, hasRole, isInitialized, fetchUserData, navigate, toast]);
};

export default useRoleProtection;
