import { apiInstance } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";
import { loginSchema } from "@/validations/createUserSchema";
import {z} from "zod"

export interface LoginData {
  message?: string;
  data: {
    user: any;
    formatUser: {
      id: string;
      displayName?: string;
      mobileNumber?: string;
      email: string;
      avatarUrl?: string;
    };
    token: string;
  };
}


const signin = async ( params: z.infer<typeof loginSchema>): Promise<LoginData> => {
  try {
    const response = await apiInstance.post(`/user/login`, params);
    return response.data;
  } catch (error: any) {

    console.error("API error:", error);
    throw error; 
  }
};

export const useAuthSigninMutation = () => {
  return useMutation<LoginData, Error, z.infer<typeof loginSchema>>({
    mutationFn: signin,
    onSuccess: (data) => {
     
      sessionStorage.setItem("token", (data?.data?.token ?? ""))
    
    },
    onError: (error) => {
      console.error("Login API error:", error);
    },
  });
};
const createUser = async (params: FormData): Promise<LoginData> => {
  try {
    const response = await apiInstance.post(`/user`, params, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error: any) {
    console.error("API error:", error);
    throw error;
  }
};

export const useCreateAccount = () => {
  return useMutation<LoginData, Error, FormData>({
    mutationFn: createUser,
    onSuccess: (data) => {
      sessionStorage.setItem("token", (data?.data?.token ?? ""))
     
    },
    onError: (error) => {
      console.error("Create User API error:", error);
    },
  });
};

