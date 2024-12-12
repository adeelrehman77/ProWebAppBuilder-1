import { SiFacebook, SiInstagram } from "react-icons/si";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function WelcomePage() {
  const [_, setLocation] = useLocation();
  
  const { data: settings = {} } = useQuery({
    queryKey: ["/api/settings"],
    queryFn: async () => {
      const response = await fetch("/api/settings");
      if (!response.ok) throw new Error("Failed to fetch settings");
      return response.json();
    }
  });

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-emerald-50 to-emerald-100">
      {/* Main content */}
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Header Section */}
          <div className="flex justify-between items-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-emerald-800">
              Welcome to Fun Adventure Kitchen
            </h1>
            <Button 
              onClick={() => setLocation("/customers")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-6 rounded-full shadow-lg transform hover:scale-105 transition-all"
            >
              Subscribe Now
            </Button>
          </div>

          {/* Promotional Boxes */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <Card className="bg-white shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl text-emerald-700">
                  {settings.promo_box_1_title || "Special Offer"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  {settings.promo_box_1_content || "Check out our latest promotions and special offers!"}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl text-emerald-700">
                  {settings.promo_box_2_title || "Today's Special"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">
                  {settings.promo_box_2_content || "Discover our chef's special dishes for today!"}
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-emerald-900 text-white py-6 relative z-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm">
              © 2024 Fun Adventure Kitchen. All rights reserved.
            </div>
            <div className="flex space-x-6">
              <a
                href={settings.facebook_url || "https://www.facebook.com/share/19jNU4YSoA/?mibextid=wwXIfr"}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-emerald-300 transition-colors"
              >
                <SiFacebook className="h-6 w-6" />
              </a>
              <a
                href={settings.instagram_url || "https://www.instagram.com/funadventurekitchen/profilecard/?igsh=OTBtNGJkdWJtZ2E3"}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-emerald-300 transition-colors"
              >
                <SiInstagram className="h-6 w-6" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}