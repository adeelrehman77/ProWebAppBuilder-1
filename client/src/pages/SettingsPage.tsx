import { Sidebar } from "@/components/Sidebar";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/hooks/use-user";

export default function SettingsPage() {
  const { toast } = useToast();
  const { user } = useUser();
  
  const handleSave = () => {
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated successfully."
    });
  };

  return (
    <>
      <Sidebar />
      <div className="flex-1 p-8">
        <div className="grid gap-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Settings</h1>
            <Button onClick={handleSave}>Save Changes</Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" defaultValue={user?.username} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input id="phone" type="tel" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input id="current-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input id="new-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input id="confirm-password" type="password" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Sub-Admin Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium">Add New Sub-Admin</h3>
                    <Button variant="outline" size="sm">Add Sub-Admin</Button>
                  </div>
                  <div className="border rounded-md p-4">
                    <div className="space-y-2">
                      <Label htmlFor="subadmin-name">Name</Label>
                      <Input id="subadmin-name" placeholder="Enter name" />
                    </div>
                    <div className="space-y-2 mt-2">
                      <Label htmlFor="subadmin-email">Email</Label>
                      <Input id="subadmin-email" type="email" placeholder="Enter email" />
                    </div>
                    <div className="space-y-2 mt-2">
                      <Label htmlFor="subadmin-role">Role</Label>
                      <Input id="subadmin-role" placeholder="Enter role title" />
                    </div>
                    <div className="mt-4">
                      <Label className="text-sm font-medium">Permissions</Label>
                      <div className="grid gap-2 mt-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="manage-orders">Manage Orders</Label>
                          <Switch id="manage-orders" />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="manage-products">Manage Products</Label>
                          <Switch id="manage-products" />
                        </div>
                        <div className="flex items-center justify-between">
                          <Label htmlFor="manage-customers">Manage Customers</Label>
                          <Switch id="manage-customers" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-notifications">Email Notifications</Label>
                  <Switch id="email-notifications" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="order-updates">Order Updates</Label>
                  <Switch id="order-updates" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="subscription-reminders">Subscription Reminders</Label>
                  <Switch id="subscription-reminders" defaultChecked />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="dark-mode">Dark Mode</Label>
                  <Switch id="dark-mode" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Input id="language" defaultValue="English" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Input id="timezone" defaultValue="UTC+4" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
}
