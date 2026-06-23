import { useAuthStore } from "../store/store";
import type { User } from "../store/store";
export const useUser = () => {
  const {
    user,
    token,
    isAuthenticated,
    setUser,
    setToken,
    setAuthenticated,
    logout,
  } = useAuthStore();

  const login = (userData: User, authToken?: string) => {
    setUser(userData);
    setAuthenticated(true);
    if (authToken) {
      setToken(authToken);
    }
  };

  return {
    user,
    token,
    setUser,
    isAuthenticated,
    login,
    logout,
    displayName: user?.displayName ?? "Guest User",
    email: user?.email ?? "",
    avatarUrl: user?.avatarUrl ?? "",
    userId: user?.id,
    mobileNumber: user?.mobileNumber,
    contact_list: user?.contact_list || [],


  };
};
