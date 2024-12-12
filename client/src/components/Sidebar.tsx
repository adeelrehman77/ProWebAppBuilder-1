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

interface MenuItem {
  icon: any;
  label: string;
  href: string;
  submenu?: MenuItem[];
}

const menuItems: MenuItem[] = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/" },
  { icon: Package, label: "Orders", href: "/orders" },
  { icon: Package, label: "Products", href: "/products" },
  { icon: Grid, label: "Categories", href: "/categories" },
  { icon: Users, label: "Subscriptions", href: "/customers" },
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
            if (item.submenu) {
              return (
                <li key={item.href} className="space-y-1">
                  <div className="flex items-center gap-3 px-3 py-2 text-sm font-semibold">
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </div>
                  <ul className="pl-8 space-y-1">
                    {item.submenu.map((subItem) => {
                      const SubIcon = subItem.icon;
                      return (
                        <li key={subItem.href}>
                          <Link
                            href={subItem.href}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-sm",
                              location === subItem.href
                                ? "bg-teal-800 text-white"
                                : "hover:bg-teal-600"
                            )}
                          >
                            <SubIcon className="h-4 w-4" />
                            {subItem.label}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              );
            }
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md transition-colors",
                    location === item.href
                      ? "bg-teal-800 text-white"
                      : "hover:bg-teal-600"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
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
