import { useMutation } from "@tanstack/react-query";
import { apiInstance } from "@/lib/api";

import { queryClient } from "@/providers/query.provider";

export interface UpdateData {
  message?: string;
  data: {
    user(user: any): unknown;
    formatUser: {
      id: string;
      displayName?: string;
      mobileNumber?: string;
      email: string;
      avatarUrl?: string;
      contact_list?: {
        name: string;
        number: string;
      }[];
    };
    token: string;
  };
}
export interface DeleteUserResponse {
  message: string;
}

export const useUpdateUser = (userId: string) => {
  return useMutation<UpdateData, Error, globalThis.FormData>({
    mutationFn: async (formData: globalThis.FormData) => {
      const res = await apiInstance.patch(`/user/${userId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data;
    },
    onSuccess: () => {

      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (error) => {
      console.error("Update User API error:", error);
    },
  });
};

const deleteUser = async (userId: string): Promise<DeleteUserResponse> => {
  try {
    const response = await apiInstance.delete(`/user/${userId}`);
    return response.data;
  } catch (error: any) {
    console.error("Delete user API error:", error);
    throw error;
  }
};

export const useDeleteUser = () => {
  return useMutation<DeleteUserResponse, Error, string>({
    mutationFn: deleteUser,
    onSuccess: (data, variables) => {

      queryClient.invalidateQueries({ queryKey: ["users"] });

      console.log(`User with ID ${variables} deleted successfully:`, data.message);
    },
    onError: (error, variables) => {
      console.error(`Failed to delete user ${variables}:`, error);

    },
  });
};