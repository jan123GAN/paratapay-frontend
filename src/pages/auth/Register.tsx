import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateAccount } from "./api";
import { createUserSchema } from "@/validations/createUserSchema";
import DynamicFields from "@/components/ui/DynamicFields";
import { z } from "zod";
import { useState, useRef, useEffect } from "react";
import Icon from "../../components/shared/Icon";
import { useUser } from "@/hooks/useUser";
import { ROUTES } from "@/constants/routes";
import { Label } from "@/components/ui/label";
import toast from "react-hot-toast";
import { extractUserAndLogin } from "@/lib/auth";
export default function Register() {
  type FormData = z.infer<typeof createUserSchema>;
  const navigate = useNavigate();
  const { mutateAsync: createUser, isPending } = useCreateAccount();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isAuthenticated, login } = useUser();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    control,
    trigger,
  } = useForm<FormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      displayName: "",
      email: "",
      password: "",
      social_login_provider: "GOOGLE",
      avatarUrl: "",
      contact_list: [{ name: "", number: "" }],
    },
  });

  useEffect(() => {
    console.log('Current auth state:', isAuthenticated);

    if (isAuthenticated) {
      navigate(ROUTES.DASHBOARD);
    }
  }, [isAuthenticated, navigate]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const previewUrl = URL.createObjectURL(file);
      setAvatarPreview(previewUrl);
      setValue("avatarUrl", "file_uploaded");
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setAvatarPreview(null);
    setValue("avatarUrl", "");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const nextStep = async () => {
    const fieldsToValidate: Array<keyof FormData> = ["displayName", "email", "password", "mobileNumber"];
    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep(2);
    }
  };

  const prevStep = () => {
    setCurrentStep(1);
  };

  const onSubmit = async (data: FormData) => {
    const formData = new FormData();


    Object.keys(data).forEach((key) => {
      const value = (data as any)[key];
      if (key !== "avatarUrl" && key !== "contact_list" && value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });
    if (selectedFile) {
      formData.append("avatar", selectedFile);
    } else {

      formData.append("avatarUrl", data.avatarUrl || "");
    }

    formData.append("contact_list", JSON.stringify(data.contact_list || []));

    console.log("Sending FormData for Registration:");
    for (const [key, value] of formData.entries()) {
      console.log(`${key}:`, value);
    }

    try {
      const response = await createUser(formData);
      const rawUser = response?.data?.user;
      const token = response?.data?.token;
      if (rawUser && token) {
        extractUserAndLogin(rawUser, token, login)
        toast.success("Account created successfully!");
        navigate(ROUTES.DASHBOARD);
      } else {
        console.error("Registration successful, but user data or token missing in response:", response);
        toast.error("Registration successful, but login failed. Please try to sign in.");
      }
    } catch (error: any) {
      console.error("Registration failed:", error);
      toast.error(error.response?.data?.message || "Registration failed. Please try again.");
    }
  };

  const StepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4">
        <div className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= 1
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
              }`}
          >
            1
          </div>
          <span className="ml-2 text-sm font-medium">Basic Info</span>
        </div>
        <div className={`w-12 h-0.5 ${currentStep >= 2 ? "bg-primary" : "bg-muted"}`} />
        <div className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${currentStep >= 2
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground"
              }`}
          >
            2
          </div>
          <span className="ml-2 text-sm font-medium">Additional Details</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center bg-background dark:bg-background">
      <div className="max-w-md w-full space-y-8 p-6 bg-card rounded-lg shadow-md">
        <div className="flex items-center">
          <div className="bg-primary rounded-full p-2 ">
            <Icon name="ArrowLeft" size={20} />
          </div>

          <h2 className=" text-center lg:ml-4  text-3xl font-extrabold text-foreground">
            Create your account
          </h2>
        </div>
        <div>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Join ParataPay to start managing your expenses
          </p>
        </div>
        <StepIndicator />
        <form
          className="mt-8 space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar"
          encType="multipart/form-data"
          onSubmit={handleSubmit(onSubmit)}
        >
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="displayName" className="block text-sm font-medium mb-1">
                  Full name
                </Label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder="John Doe"
                  {...register("displayName")}
                />
                {errors.displayName && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.displayName.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="email" className="block text-sm font-medium mb-1">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="password" className="block text-sm font-medium mb-1">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.password.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="mobileNumber" className="block text-sm font-medium mb-1">
                  Mobile Number
                </Label>
                <Input
                  id="mobileNumber"
                  type="text"
                  placeholder="+1234567890"
                  {...register("mobileNumber")}
                />
                {errors.mobileNumber && (
                  <p className="mt-1 text-sm text-destructive">
                    {errors.mobileNumber.message}
                  </p>
                )}
              </div>
              <Button
                type="button"
                onClick={nextStep}
                className="w-full mt-6"
              >
                Next Step
                <Icon name="ChevronRight" size={20} className="" />
              </Button>
            </div>
          )}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="avatar" className="block text-sm font-medium mb-1">
                  Profile Picture
                </Label>
                <div className="space-y-3">
                  <Input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  {!avatarPreview ? (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
                    >
                      <Icon name="Upload" size={20} className="mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Click to upload profile picture
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PNG, JPG, GIF up to 10MB
                      </p>
                    </div>
                  ) : (
                    <div className="relative">
                      <img
                        src={avatarPreview}
                        alt="Avatar preview"
                        className="w-24 h-24 rounded-full object-cover mx-auto"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={removeFile}
                        className="absolute top-0 right-1/2 transform translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full p-0"
                      >
                        <Icon name="X" size={20} className="text-primary" />
                      </Button>
                      <div className="text-center mt-2">
                        <p className="text-sm font-medium">{selectedFile?.name}</p>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          className="mt-2"
                        >
                          Change Photo
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div>
                <Label className="block text-sm font-medium mb-1">
                  Contacts
                </Label>
                <Controller
                  name="contact_list"
                  control={control}
                  render={({ field }) => (
                    <DynamicFields
                      value={field.value}
                      onChange={field.onChange}
                    />
                  )}
                />
              </div>
              <div className="flex space-x-4 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  className="flex-1"
                >
                  <Icon name="ChevronLeft" size={20} className="" />
                  Previous
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={isPending}
                >
                  {isPending ? "Creating account..." : "Create account"}
                </Button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}