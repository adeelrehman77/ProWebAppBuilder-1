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
      <div className="fixed inset-0 z-0 bg-emerald-900">
        <div className="container mx-auto px-4 py-8">
          <div className="mt-20 text-white">
            <h1 className="text-5xl font-bold mb-6">Fun Adventure Kitchen</h1>
            <div className="space-y-4 text-xl">
              <p className="font-semibold">Homely Tiffin Service</p>
              <p className="text-emerald-100">
                North Indian cuisine is known for its vibrant flavors and diverse dishes.
                Signature items include butter chicken, biryani, and dal makhani, typically served
                with naan or roti.
              </p>
              <p className="text-emerald-100">
                Ingredients such as ghee and paneer enrich the taste, while
                cooking methods like slow-cooking and tandoor baking contribute to its unique
                culinary experience.
              </p>
              <div className="mt-8 space-y-4">
                <p className="font-semibold text-emerald-300">Contact Us:</p>
                <p className="text-emerald-100">Phone: 0551686600</p>
                <p className="text-emerald-100">Landline: 04-4484610</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content with transparent image overlay */}
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

          <div className="mt-20 flex justify-center items-center">
            {/* Semi-transparent image overlay */}
            <div className="relative w-full max-w-4xl">
              <img
                src="/uploads/Oodles of Noodles Celebration.png"
                alt="Fun Adventure Kitchen"
                className="w-full h-auto"
                style={{
                  opacity: '0.65'
                }}
              />
            </div>
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
                href={settings.facebook_url || "https://facebook.com"}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-emerald-300 transition-colors"
              >
                <SiFacebook className="h-6 w-6" />
              </a>
              <a
                href={settings.instagram_url || "https://instagram.com"}
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