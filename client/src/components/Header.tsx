import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUser } from "@/hooks/use-user";
import { ChevronDown, LogOut, Settings, User, Home } from "lucide-react";
import { Link } from "wouter";

export function Header() {
  const { user, logout } = useUser();

  return (
    <header className="border-b bg-white">
      <div className="flex h-16 items-center px-4 sm:px-6">
        <div className="flex items-center space-x-4">
          <h2 className="text-lg font-semibold">Fun Adventure Kitchen</h2>
        </div>

        <div className="ml-auto flex items-center space-x-4">
          <Link href="/">
            <Button variant="ghost" className="flex items-center gap-2">
              <Home className="h-5 w-5" />
              Home
            </Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <User className="h-5 w-5" />
                <span>{user?.username}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => logout()}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
