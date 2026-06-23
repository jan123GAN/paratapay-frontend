import {  z } from "zod"

export const createUserSchema = z.object({
    displayName: z.string(),
    email: z.string().email(),
    password:z.string(),
    social_login_provider: z.string(),
      avatarUrl: z.string(),
        mobileNumber: z.string(),
    contact_list: z.array(
        z.object({
            name: z.string(),
            number: z.string(),
        }),
    ),
})


export const loginSchema = createUserSchema.pick({
  email: true,
  password: true,
});



export const updateUser = z.object({
    displayName: z.string().optional(),
    email: z.string().email().optional(),
    password:z.string().optional(),
    social_login_provider: z.string().optional(),
      avatarUrl: z.string().optional(),
        mobileNumber: z.string().optional(),
    contact_list: z.array(
        z.object({
            name: z.string(),
            number: z.string(),
        }).optional(),
    ),
})