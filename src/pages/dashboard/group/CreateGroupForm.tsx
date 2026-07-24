import  { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createGroupSchema } from "../../../validations/createGroupSchema"; // wherever your schema is
import type { z } from "zod";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Select, 
  SelectTrigger, 
  SelectValue, 
  SelectContent, 
  SelectItem 
} from "@/components/ui/select";

import { useCreateGroupMutation } from "./api";
import { useUser } from "@/hooks/useUser";

type GroupFormData = z.infer<typeof createGroupSchema>;

const groupTypes = ["CUSTOM_SPLIT", "EQUAL_SPLIT"] as const;

type Props = {
  onClose?: () => void;
};

function CreateGroupForm({ onClose }: Props) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm<GroupFormData>({
    resolver: zodResolver(createGroupSchema),
  });

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const { userId } = useUser();

  const createGroupMutation = useCreateGroupMutation();

  const avatarWatch = watch("groupAvatar");

  useEffect(() => {
    const file = avatarWatch?.[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
      return () => URL.revokeObjectURL(previewUrl);
    }
  }, [avatarWatch]);

  const onSubmit = (data: GroupFormData) => {
    const formData = new FormData();
    formData.append("name", data.name);
    if (data.description) {
      formData.append("description", data.description);
    }
    formData.append("groupType", data.groupType);
    formData.append("createdBy", userId ?? "");

    if (data.groupAvatar?.[0]) {
      formData.append("groupAvatar", data.groupAvatar[0]);
    }

    createGroupMutation.mutate(formData);
    onClose?.();
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-4 w-full max-w-md p-6 rounded-xl shadow-md"
    >
      <h2 className="text-lg font-semibold">Create Group</h2>

      <div className="flex justify-center">
        <Avatar className="h-16 w-16 rounded-full border-gray-300 shadow-sm">
          <AvatarImage src={avatarPreview || ""} />
          <AvatarFallback>GR</AvatarFallback>
        </Avatar>
      </div>

      <div>
        <Label className="mb-3">Name</Label>
        <Input placeholder="Group Name" {...register("name")} />
        {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
      </div>

      <div>
        <Label className="mb-3">Description</Label>
        <Input placeholder="Description" {...register("description")} />
        {errors.description && <p className="text-sm text-red-500">{errors.description.message}</p>}
      </div>

      <div>
        <Label className="mb-3">Group Type</Label>
        <Controller
          name="groupType"
          control={control}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select group type" />
              </SelectTrigger>
              <SelectContent>
                {groupTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.groupType && <p className="text-sm text-red-500">{errors.groupType.message}</p>}
      </div>

      <div>
        <Label className="mb-3">Profile Photo</Label>
        <Input type="file" accept="image/*" {...register("groupAvatar")} />
        {errors.groupAvatar && <p className="text-sm text-red-500">{errors.groupAvatar.message}</p>}
      </div>

      <div className="flex justify-end gap-2 pt-4">
        {onClose && (
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
        )}
        <Button type="submit">Create</Button>
      </div>
    </form>
  );
}

export default CreateGroupForm;
