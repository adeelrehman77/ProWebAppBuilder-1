import { SiFacebook, SiInstagram } from "react-icons/si";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";

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
    <div className="flex flex-col min-h-screen relative">
      {/* Background with high contrast text content */}
      <div className="fixed inset-0 z-0">
        <img
          src="/uploads/Oodles of Noodles Celebration.png"
          alt="Fun Adventure Kitchen Background"
          className="w-full h-full object-cover object-center scale-70"
        />
        <div className="absolute inset-0 bg-black/30"></div>
      </div>

      {/* Main content with welcome text */}
      <main className="flex-1 relative z-10">
        <div className="container mx-auto px-4 py-8">
          {/* Subscribe Now Button */}
          <div className="absolute top-4 left-4">
            <Button 
              onClick={() => setLocation("/auth")}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-6 rounded-full shadow-lg transform hover:scale-105 transition-all"
            >
              Subscribe Now
            </Button>
          </div>

          {/* Welcome Text */}
          <div className="text-center mt-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
              Welcome to Fun Adventure Kitchen
            </h1>
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