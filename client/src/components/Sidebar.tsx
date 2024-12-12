import { Link } from "wouter";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Package,
  Grid,
  Users,
  CreditCard,
  FileText,
  Settings,
  LogOut,
  Truck,
  Map,
  UserCog,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useUser } from "@/hooks/use-user";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Package, label: "Orders", href: "/orders" },
  { icon: Package, label: "Products", href: "/products" },
  { icon: Grid, label: "Categories", href: "/categories" },
  { icon: Users, label: "Subscriptions", href: "/customers" },
  // Delivery Management
  { 
    icon: Truck, 
    label: "Deliveries", 
    href: "/deliveries",
    submenu: [
      { icon: Map, label: "Routes", href: "/deliveries/routes" },
      { icon: UserCog, label: "Drivers", href: "/deliveries/drivers" }
    ]
  },
  { icon: CreditCard, label: "Payments", href: "/payments" },
  { icon: FileText, label: "Reports", href: "/reports" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function Sidebar() {
  const [location] = useLocation();
  const { logout } = useUser();

  return (
    <div className="flex flex-col h-screen w-64 bg-teal-700 text-white">
      <div className="p-4 border-b border-teal-600">
        <h1 className="text-xl font-bold">Fun Adventure Kitchen</h1>
      </div>
      
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link href={item.href}>
                  <a
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                      location === item.href
                        ? "bg-teal-800 text-white"
                        : "hover:bg-teal-600"
                    )}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </a>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-teal-600">
        <Button
          variant="ghost"
          className="w-full justify-start text-white hover:bg-teal-600"
          onClick={() => logout()}
        >
          <LogOut className="mr-2 h-5 w-5" />
          Logout
        </Button>
      </div>
    </div>
  );
}
