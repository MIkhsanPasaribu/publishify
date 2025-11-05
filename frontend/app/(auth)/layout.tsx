import Image from "next/image";
import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#d8e8e7] via-[#e5f0ef] to-[#f0f7f6]">
      {/* Header Navigation */}
      <header className="bg-[#d8e8e7] border-b border-[#14b8a6]/20">
        <nav className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <Image
                src="/logo.png"
                alt="Publishify Logo"
                width={40}
                height={40}
                className="w-10 h-10 transition-transform group-hover:scale-110"
              />
              <span className="text-2xl font-bold text-[#0d7377]">
                Publishify
              </span>
            </Link>

            {/* Navigation Links */}
            <div className="flex items-center gap-8">
              <Link
                href="/"
                className="text-gray-700 hover:text-[#0d7377] transition-colors font-medium"
              >
                Home
              </Link>
              <Link
                href="/about"
                className="text-gray-700 hover:text-[#0d7377] transition-colors font-medium"
              >
                About
              </Link>
              <Link
                href="/help"
                className="text-gray-700 hover:text-[#0d7377] transition-colors font-medium"
              >
                Help
              </Link>
              <Link
                href="/contact"
                className="text-gray-700 hover:text-[#0d7377] transition-colors font-medium"
              >
                Contact
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 py-12">
        {children}
      </main>
    </div>
  );
}
