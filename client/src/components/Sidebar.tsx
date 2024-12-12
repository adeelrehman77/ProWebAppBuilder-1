import { Link, useLocation } from "wouter";
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
  { icon: Map, label: "Zones", href: "/zones" },
  { icon: Map, label: "Routes", href: "/routes" },
  { icon: Truck, label: "Deliveries", href: "/deliveries" },
  { icon: UserCog, label: "Drivers", href: "/drivers" },
  { icon: CreditCard, label: "Payments", href: "/payments" },
  { icon: FileText, label: "Reports", href: "/reports" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export function Sidebar() {
  const [location] = useLocation();
  const { logout } = useUser();

  const linkClasses = "w-full flex items-center gap-3 px-3 py-2 rounded-md transition-colors text-white hover:bg-emerald-800";
  const activeClasses = "bg-emerald-800 text-white";

  return (
    <div className="flex flex-col h-screen w-64 bg-emerald-900">
      <div className="p-4 border-b border-emerald-800">
        <h1 className="text-xl font-bold text-white">Fun Adventure Kitchen</h1>
      </div>
      
      <nav className="flex-1 p-4">
        <div className="space-y-6">
          {/* Main Navigation */}
          <ul className="space-y-1">
            {menuItems.slice(0, 5).map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link href={item.href}>
                    <button
                      className={cn(
                        linkClasses,
                        location === item.href && activeClasses
                      )}
                    >
                      <Icon className="h-5 w-5 text-white" />
                      <span className="text-white">{item.label}</span>
                    </button>
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Delivery Management Section */}
          <div>
            <h2 className="mb-2 px-3 text-sm font-semibold text-white">
              Delivery Management
            </h2>
            <ul className="space-y-1">
              {menuItems.slice(5, 9).map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.href}>
                    <Link href={item.href}>
                      <button
                        className={cn(
                          linkClasses,
                          location === item.href && activeClasses
                        )}
                      >
                        <Icon className="h-5 w-5 text-white" />
                        <span className="text-white">{item.label}</span>
                      </button>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Settings & Reports */}
          <ul className="space-y-1">
            {menuItems.slice(9).map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link href={item.href}>
                    <button
                      className={cn(
                        linkClasses,
                        location === item.href && activeClasses
                      )}
                    >
                      <Icon className="h-5 w-5 text-white" />
                      <span className="text-white">{item.label}</span>
                    </button>
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>

      <div className="p-4 border-t border-emerald-800">
        <Button
          variant="ghost"
          className="w-full justify-start text-white hover:bg-emerald-800"
          onClick={() => logout()}
        >
          <LogOut className="mr-2 h-5 w-5 text-white" />
          <span className="text-white">Logout</span>
        </Button>
      </div>
    </div>
  );
}
