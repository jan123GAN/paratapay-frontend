import {
  Sidebar as SideBar,
  SidebarInset,
  SidebarProvider,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarTrigger,
  SidebarFooter,
} from "../ui/sidebar";
import * as Icons from "lucide-react";
import Icon from "../shared/Icon";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ThemeToggler } from "../shared/theme-toggler";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useUser } from "@/hooks/useUser";

type SidebarItem = {
  title: string;
  url: string;
  icon: keyof typeof Icons;
};

const items: SidebarItem[] = [
  { title: "Dashboard", url: "/dashboard/userdashboard", icon: "User" },
  { title: "Group", url: "/dashboard/group", icon: "UserCircle" },
  { title: "Expense", url: "/dashboard/expense", icon: "Wallet" },
  // { title: "Balance", url: "/dashboard/balance", icon: "DollarSign" },
  // { title: "Settlement", url: "/dashboard/settlement", icon: "CheckCircle" },
  // { title: "Analytics", url: "/dashboard/analytic", icon: "LineChart" },
 
];

const Sidebar = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
 const { displayName, email, avatarUrl, logout } = useUser();


  return (
    <SidebarProvider>
      <SideBar>
        <SidebarHeader className="flex flex-row justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold flex items-center text-green-600">
            <img src="/logo.png" alt="Logo" className="h-9 w-10 rounded-full" />
            Parta Pay
          </h2>
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => {
                  const isHome = item.url === "/dashboard";
                  const isActive = isHome
                    ? location.pathname === item.url
                    : location.pathname.startsWith(item.url);
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        className={isActive ? "bg-primary text-black" : ""}
                      >
                        <Link to={item.url}>
                          <Icon name={item.icon} className="w-4 h-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <ThemeToggler variant="full-width" />
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </SideBar>
      <SidebarInset>
        <header className="flex h-16 justify-between items-center gap-2 border-b px-4">
          <SidebarTrigger className="-ml-1" />
          <h1 className="text-lg font-semibold flex-1">Admin Panel</h1>

          {/* Dropdown Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-muted">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={avatarUrl} alt={displayName} />
                  <AvatarFallback>
                    {displayName
                      .split(" ")
                      .map((word) => word[0]?.toUpperCase())
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-sm font-medium">{displayName}</span>
                  <span className="text-xs text-muted-foreground">{email}</span>
                </div>
                <Icons.ChevronDown className="w-4 h-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => navigate("/dashboard/profile")}>
                <Icons.User className="mr-2 h-4 w-4" />
                Edit Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/settings")}>
                <Icons.Settings className="mr-2 h-4 w-4" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  logout();
                  navigate("/signin");
                }}
              >
                <Icons.LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex-1 px-2 pt-4">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Sidebar;
