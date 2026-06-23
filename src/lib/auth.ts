import type { User } from "@/store/store";
import { toast } from "react-hot-toast";

export function extractUserAndLogin(
  rawUser: any,
  token: string,
  login: (user: User, token: string) => void
) {
  if (!rawUser || !token) {
    toast.error("Invalid user data or token. Login failed.");
    return;
  }
const validUser: User = {
  id: rawUser.id,
  displayName: rawUser.displayName,
  email: rawUser.email,
  password: "",
  social_login_provider: rawUser.social_login_provider ?? "GOOGLE",
  avatarUrl: rawUser.avatarUrl ?? "",
  mobileNumber: rawUser.mobileNumber ?? "",
  contact_list: Array.isArray(rawUser.contact_list) ? rawUser.contact_list : [],
  user: rawUser.user ?? {},                 
  name: rawUser.name ?? rawUser.displayName ?? "Unknown",
  data: rawUser.data ?? undefined,
};

  login(validUser, token);
}
