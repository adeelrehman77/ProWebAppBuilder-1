import { SiFacebook, SiInstagram } from "react-icons/si";

export default function WelcomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Main content */}
      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Left side - Logo and Image */}
            <div className="space-y-4">
              <img
                src="/uploads/Oodles of Noodles Celebration.png"
                alt="Fun Adventure Kitchen"
                className="max-w-full h-auto rounded-lg shadow-lg"
              />
            </div>
            
            {/* Right side - Text content */}
            <div className="space-y-6">
              <h1 className="text-4xl font-bold text-emerald-900">Fun Adventure Kitchen</h1>
              <div className="space-y-4 text-lg text-gray-700">
                <p className="font-semibold">Homely Tiffin Service</p>
                <p>
                  North Indian cuisine is known for its vibrant flavors and diverse dishes.
                  Signature items include butter chicken, biryani, and dal makhani, typically served
                  with naan or roti.
                </p>
                <p>
                  Ingredients such as ghee and paneer enrich the taste, while
                  cooking methods like slow-cooking and tandoor baking contribute to its unique
                  culinary experience.
                </p>
              </div>
              <div className="space-y-4">
                <p className="font-semibold text-emerald-800">Contact Us:</p>
                <p>Phone: 0551686600</p>
                <p>Landline: 04-4484610</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-emerald-900 text-white py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="text-sm">
              © 2024 Fun Adventure Kitchen. All rights reserved.
            </div>
            <div className="flex space-x-6">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-emerald-300 transition-colors"
              >
                <SiFacebook className="h-6 w-6" />
              </a>
              <a
                href="https://instagram.com"
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
