import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
 DropdownMenuTrigger } from "../ui/dropdown-menu";

interface ThemeTogglerProps {
  variant?: "dropdown" | "icon" | "with-label" | "full-width" | "compact";
  showLabel?: boolean;
}

export function ThemeToggler({
  variant = "dropdown",
  showLabel = false,
}: ThemeTogglerProps) {
  const { setTheme, theme } = useTheme();

  if (variant === "icon") {
    return (
      <Button
        variant="outline"
        size="icon"
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      >
        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        <span className="sr-only">Toggle theme</span>
      </Button>
    );
  }

  if (variant === "with-label") {
    return (
      <Button
        variant="outline"
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
        className="flex items-center gap-2"
      >
        <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        {showLabel && <span>{theme === "light" ? "Dark" : "Light"} Mode</span>}
      </Button>
    );
  }

  if (variant === "full-width") {
    return (
      <div className="w-full space-y-2">
        {showLabel && <p className="text-sm font-medium">Theme</p>}
        <div className="grid grid-cols-3 gap-2">
          <Button
            variant={theme === "light" ? "default" : "outline"}
            size="sm"
            onClick={() => setTheme("light")}
            className="flex flex-col items-center gap-1 h-auto py-2"
          >
            <Sun className="h-4 w-4" />
            <span className="text-xs">Light</span>
          </Button>
          <Button
            variant={theme === "dark" ? "default" : "outline"}
            size="sm"
            onClick={() => setTheme("dark")}
            className="flex flex-col items-center gap-1 h-auto py-2"
          >
            <Moon className="h-4 w-4" />
            <span className="text-xs">Dark</span>
          </Button>
          <Button
            variant={theme === "system" ? "default" : "outline"}
            size="sm"
            onClick={() => setTheme("system")}
            className="flex flex-col items-center gap-1 h-auto py-2"
          >
            <Monitor className="h-4 w-4" />
            <span className="text-xs">System</span>
          </Button>
        </div>
      </div>
    );
  }

  if (variant === "compact") {
    return (
      <div className="space-y-2">
        {showLabel && <p className="text-sm font-medium">Theme</p>}
        <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
          <Button
            variant={theme === "light" ? "default" : "ghost"}
            size="sm"
            onClick={() => setTheme("light")}
            className="h-8 w-8 p-0"
          >
            <Sun className="h-4 w-4" />
            <span className="sr-only">Light mode</span>
          </Button>
          <Button
            variant={theme === "dark" ? "default" : "ghost"}
            size="sm"
            onClick={() => setTheme("dark")}
            className="h-8 w-8 p-0"
          >
            <Moon className="h-4 w-4" />
            <span className="sr-only">Dark mode</span>
          </Button>
          <Button
            variant={theme === "system" ? "default" : "ghost"}
            size="sm"
            onClick={() => setTheme("system")}
            className="h-8 w-8 p-0"
          >
            <Monitor className="h-4 w-4" />
            <span className="sr-only">System mode</span>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className="flex items-center gap-2"
        >
          <Sun className="h-4 w-4" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className="flex items-center gap-2"
        >
          <Moon className="h-4 w-4" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className="flex items-center gap-2"
        >
          <Monitor className="h-4 w-4" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}