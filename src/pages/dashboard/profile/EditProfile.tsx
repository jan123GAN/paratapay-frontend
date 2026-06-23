import { useUser } from "@/hooks/useUser";
import { updateUser } from "@/validations/createUserSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import toast from "react-hot-toast";
import { useState, useRef, useEffect } from "react";
import Icon from "../../../components/shared/Icon";
import DynamicFields from "@/components/ui/DynamicFields";
import { useForm, Controller } from "react-hook-form";
import { useDeleteUser, useUpdateUser } from "./api";
import type { User } from "../../../store/store"

export default function Profile() {
  type FormData = z.infer<typeof updateUser>;

  const {
    displayName,
    email,
    avatarUrl,
    userId,
    logout,
    mobileNumber,
    contact_list
  } = useUser();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState(false);

  const { mutateAsync: updateUserMutation } = useUpdateUser(userId ?? "");
  const { mutateAsync: deleteUserMutation } = useDeleteUser();

  const { setUser } = useUser();
  const {
    register,
    handleSubmit,
    setValue,
    control,
    reset,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(updateUser),
    defaultValues: {
      displayName: displayName || "",
      email: email || "",
      avatarUrl: avatarUrl || "",
      password: "",
      mobileNumber: mobileNumber || "",
      contact_list: contact_list || [],
    },
  });

  useEffect(() => {
    reset({
      displayName: displayName || "",
      email: email || "",
      avatarUrl: avatarUrl || "",
      password: "",
      mobileNumber: mobileNumber || "",
      contact_list: contact_list || [],
    });
    setAvatarPreview(avatarUrl || null);

  }, [displayName, email, avatarUrl, mobileNumber, reset]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
      setValue("avatarUrl", "file_uploaded");
    }
  };

  const handleDeleteAccount = async (userId: string) => {
    if (!userId) return toast.error("User ID not found.");
    try {
      await deleteUserMutation(userId);
      toast.success("Account deleted successfully!");
      logout();
    } catch (error) {
      toast.error("Failed to delete account");
    }
  };


  const mergedContacts = (
    oldContacts: { name: string; number: string }[],
    newContacts: { name: string; number: string }[]
  ) => {
    const map = new Map();
    [...oldContacts, ...newContacts].forEach((c) => {
      map.set(`${c.name}-${c.number}`, c);
    });
    return Array.from(map.values());
  };
  const handleCancelEdit = () => {
    setIsEditing(false);
    reset({
      displayName: displayName || "",
      email: email || "",
      avatarUrl: avatarUrl || "",
      password: "",
      mobileNumber: mobileNumber || "",
      contact_list: contact_list || [],
    });
    setAvatarPreview(avatarUrl || null);
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };


  const onSubmit = async (data: FormData) => {
    const formData = new FormData();


    if (data.displayName !== displayName && data.displayName !== undefined) {
      formData.append("displayName", data.displayName ?? "");
    }

    if (data.email !== email && data.email !== undefined) {
      formData.append("email", data.email ?? "");
    }

    if (data.mobileNumber !== mobileNumber && data.mobileNumber !== undefined) {
      formData.append("mobileNumber", data.mobileNumber ?? "");
    }

    if (data.password && data.password.length >= 6) {
      formData.append("password", data.password);
    }

    if (selectedFile) {
      formData.append("avatar", selectedFile);
    }

    const merged = mergedContacts(
      contact_list,
      (data.contact_list || []).filter(
        (c): c is { name: string; number: string } => c !== undefined
      )
    );
    formData.append("contact_list", JSON.stringify(merged));

    const response = await updateUserMutation(formData);

    const editeduser = response.data.user as unknown as User;

    const editedUser: User = {
      ...editeduser,
      password: "",
    } as User;


    if (editedUser) {
      setUser(editedUser);
      toast.success("Profile updated successfully!");
      setIsEditing(false);
    } else {
      toast.error("Failed to update profile. Please try again.");
    }

  };

  return (
    <div className="flex flex-col items-center justify-start pt-6 pb-4">

      <div className="flex flex-col lg:flex-row gap-8 w-full max-w-6xl items-start ">

        <div className="flex flex-col p-8 bg-card border border-border rounded-lg w-full lg:w-96 space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="relative">
              <Avatar className="w-24 h-24">
                <AvatarImage src={avatarPreview || avatarUrl} />
                <AvatarFallback className="text-xl">
                  {displayName
                    ?.split(" ")
                    .map((word) => word[0]?.toUpperCase())
                    .join("")}
                </AvatarFallback>
              </Avatar>
              {isEditing && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="absolute -bottom-1 -right-1 h-8 w-8 rounded-full p-0"
                  onClick={() => fileInputRef.current?.click()}
                >
               
                   <Icon name="Edit" size={20} className="text-primary" />
                </Button>
              )}
              <Input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-semibold">{displayName}</h2>
              <p className="text-muted-foreground text-sm">{email}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex justify-center space-x-8 py-4 border-t border-border">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">5</p>
              <p className="text-sm text-muted-foreground">Active Groups</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-chart-2">$245.50</p>
              <p className="text-sm text-muted-foreground">Net Balance</p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => logout()}
          >
            Logout
          </Button>
        </div>
        <div className="flex-1 bg-card border border-border rounded-lg w-full">
          <div className="flex items-center justify-between p-6 border-b border-border ">
            <div>
              <h3 className="text-lg font-semibold">Personal Information</h3>
              <p className="text-sm text-muted-foreground">Manage your account settings and preferences</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? "Cancel" : "Edit"}
            </Button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="displayName" className="mb-2">Full Name</Label>
                <Input
                  id="displayName"
                  {...register("displayName")}
                  placeholder="John Doe"
                  disabled={!isEditing}
                  className={!isEditing ? "bg-muted" : ""}
                />
                {errors.displayName && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.displayName.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="email" className="mb-2">Email Address</Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="john.doe@example.com"
                disabled={!isEditing}
                className={!isEditing ? "bg-muted" : ""}
              />
              {errors.email && (
                <p className="text-sm text-destructive mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="mobileNumber" className="mb-2">Phone Number</Label>
              <Input
                id="mobileNumber"
                type="tel"
                {...register("mobileNumber")}
                placeholder="+91 928 658 8567"
                disabled={!isEditing}
                className={!isEditing ? "bg-muted" : ""}
              />
              {errors.mobileNumber && (
                <p className="text-sm text-destructive mt-1">
                  {errors.mobileNumber.message}
                </p>
              )}
            </div>
            {isEditing ? (



              <div className="flex justify-end space-x-3 pt-4">
                <Button type="button" variant="outline" onClick={handleCancelEdit}>
                  Cancel
                </Button>
                <Button type="submit" >
                  Save Changes
                </Button>
              </div>
            )
              : ""}

          </form>
        </div>
      </div>


      <div className="flex flex-col lg:flex-row gap-8 w-full max-w-6xl items-start mt-8">

        <div className="hidden lg:flex flex-col p-8 w-full lg:w-96 space-y-6 ">

        </div>

        <div className="flex-1 bg-card border border-border rounded-lg w-full">
          <div className="flex items-center justify-between p-6 border-b border-border ">
            <div>
              <h3 className="text-lg font-semibold">Contact Information</h3>
              <p className="text-sm text-muted-foreground">Manage your additional contacts.</p>
            </div>
          </div>
          <div className="p-4">
            <label className="block text-sm font-medium mb-1 ">
              Contacts
            </label>
            <Controller
              name="contact_list"
              control={control}
              render={({ field }) => (
                <DynamicFields
                  value={(field.value || []).filter((c): c is { name: string; number: string } => c !== undefined)}
                  onChange={field.onChange}
                  disabled={!isEditing}
                />
              )}
            />
            {errors.contact_list && (
              <p className="text-sm text-destructive mt-1">
                {errors.contact_list.message}
              </p>
            )}
          </div>
        </div>
      </div>


      <div className="flex flex-col lg:flex-row gap-8 w-full max-w-6xl items-start mt-8">

        <div className="hidden lg:flex flex-col p-8 w-full lg:w-96 space-y-6 ">

        </div>

        <div className="flex-1 bg-card border border-border rounded-lg w-full">
          <div className="flex items-center justify-between p-6 border-b border-border ">
            <div>
              <h3 className="text-lg font-semibold">Security</h3>
              <p className="text-sm text-muted-foreground">Manage your Password.</p>
            </div>
          </div>
          <div className="p-6 ">
            <div>
              <Label htmlFor="password" className="mb-2">New Password (Leave blank to keep current)</Label>
              <Input
                id="password"
                type="password"
                {...register("password")}
                placeholder="••••••••"
                disabled={!isEditing}
                className={!isEditing ? "bg-muted" : ""}
              />
              {errors.password && (
                <p className="text-sm text-destructive mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>
          </div>
        </div>

      </div>
      <div className="flex flex-col lg:flex-row gap-8 w-full max-w-6xl items-start mt-8">

        <div className="hidden lg:flex flex-col p-8 w-full lg:w-96 space-y-6 ">

        </div>

        <div className="flex-1 bg-destructive/15 border border-border rounded-lg w-full ">
          <div className="flex items-center justify-between p-6 border-b border-border ">
            <div>
              <h3 className="text-lg font-semibold">Denger Zone</h3>
              <p className="text-sm text-muted-foreground">Manage your Account.</p>
            </div>
          </div>
          <div className="p-6 ">
            <div className="flex items-center justify-between ">
              <div>
                <h3 className="text-sm font-semibold  text-foreground">Delete Account Permanently</h3>
                <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
              </div>
              <Button onClick={() => userId && handleDeleteAccount(userId)} className="bg-red-600 hover:bg-red-700">Delete Account</Button>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}







