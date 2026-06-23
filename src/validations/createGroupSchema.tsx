
import { z } from "zod";

export const createGroupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  groupAvatar: z
    .instanceof(FileList)
    .refine((files) => files.length > 0, "Avatar is required"),
  groupType: z.enum(["CUSTOM_SPLIT", "EQUAL_SPLIT"], {
    required_error: "Group type is required",
  }),
});
