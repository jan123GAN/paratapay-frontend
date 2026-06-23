import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuthSigninMutation } from './api';
import { useUser } from '../../hooks/useUser';
import { ROUTES } from '../../constants/routes';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { loginSchema } from '@/validations/createUserSchema';
import { extractUserAndLogin } from '@/lib/auth';
import Icon from "../../components/shared/Icon";

type FormData = z.infer<typeof loginSchema>;

export default function Signin() {
  const [generalError, setGeneralError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { isAuthenticated, login } = useUser();
  const { mutateAsync: signin, isPending } = useAuthSigninMutation();


  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: ''
    }
  });

  useEffect(() => {
    console.log('Current auth state:', isAuthenticated);


    if (isAuthenticated) {
      navigate(ROUTES.DASHBOARD);
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data: FormData) => {
    try {
      const loginData = {
        email: data.email,
        password: data.password,
      };

      const response = await signin(loginData);
      console.log("Login response:", response);

      const rawUser = (response as any)?.data?.user;
      const token = (response as any)?.data?.token;

      if (rawUser && token) {
        extractUserAndLogin(rawUser, token, login);

        setTimeout(() => {
          navigate(ROUTES.DASHBOARD);
        }, 100);
      } else {
        setGeneralError("Login failed - no user data found");
      }
    } catch (err: any) {
      setGeneralError(
        err.response?.data?.message || err.message || "Something went wrong"
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background dark:bg-background">
      <div className="max-w-md w-full space-y-8 p-6 bg-card rounded-lg shadow-md">
        <div className="flex items-center sm:p-2 ">
          <div className="bg-primary rounded-full p-2 ">
            <Icon name="ArrowLeft" size={20} />
          </div>
          <h2 className=" text-center lg:ml-4  text-3xl font-extrabold text-foreground">
            Sign in to Parata Pay
          </h2>
        </div>
        <div>
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Enter your credentials to access your account
          </p>
        </div>
        {generalError && (
          <div className="p-3 bg-destructive/10 border border-destructive rounded-md">
            <p className="text-sm text-destructive">{generalError}</p>
          </div>
        )}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1">
                Email address
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                aria-invalid={!!errors.email}
                placeholder="you@example.com"
                {...register('email')}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1">
                Password
              </label>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                aria-invalid={!!errors.password}
                placeholder="••••••••"
                {...register('password')}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary focus:ring-primary border-muted rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-muted-foreground">
                Remember me
              </label>
            </div>
            <div className="text-sm">
              <a href="#" className="font-medium text-primary hover:text-primary/80">
                Forgot your password?
              </a>
            </div>
          </div>
          <div>
            <Button
              type="submit"
              className="w-full"
              disabled={isPending}
            >
              {isPending ? "Signing in..." : "Sign in"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

