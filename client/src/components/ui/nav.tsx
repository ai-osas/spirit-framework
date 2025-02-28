import { Link, useLocation } from "wouter";
import { Button } from "./button";

export function Nav() {
  const [location] = useLocation();

  return (
    <header className="border-b bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex items-center gap-2">
              <svg
                viewBox="0 0 100 100"
                className="h-8 w-8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Central node */}
                <circle cx="50" cy="50" r="6" fill="currentColor" className="text-gray-900" />

                {/* Outer nodes */}
                <circle cx="30" cy="30" r="4" fill="currentColor" className="text-gray-900" />
                <circle cx="70" cy="30" r="4" fill="currentColor" className="text-gray-900" />
                <circle cx="30" cy="70" r="4" fill="currentColor" className="text-gray-900" />
                <circle cx="70" cy="70" r="4" fill="currentColor" className="text-gray-900" />

                {/* Connecting lines */}
                <line x1="50" y1="50" x2="30" y2="30" stroke="currentColor" strokeWidth="2" />
                <line x1="50" y1="50" x2="70" y2="30" stroke="currentColor" strokeWidth="2" />
                <line x1="50" y1="50" x2="30" y2="70" stroke="currentColor" strokeWidth="2" />
                <line x1="50" y1="50" x2="70" y2="70" stroke="currentColor" strokeWidth="2" />

                {/* Cross connections */}
                <line x1="30" y1="30" x2="70" y2="30" stroke="currentColor" strokeWidth="2" />
                <line x1="30" y1="70" x2="70" y2="70" stroke="currentColor" strokeWidth="2" />
                <line x1="30" y1="30" x2="30" y2="70" stroke="currentColor" strokeWidth="2" />
                <line x1="70" y1="30" x2="70" y2="70" stroke="currentColor" strokeWidth="2" />
              </svg>
              <span className="text-xl font-semibold text-gray-900">Spirit Framework</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className={`text-gray-600 hover:text-gray-900 ${location === "/" ? "text-gray-900" : ""}`}>
              Home
            </Link>
            <Link href="/documentation" className={`text-gray-600 hover:text-gray-900 ${location === "/documentation" ? "text-gray-900" : ""}`}>
              Documentation
            </Link>
            <Link href="/community" className={`text-gray-600 hover:text-gray-900 ${location === "/community" ? "text-gray-900" : ""}`}>
              Community
            </Link>
            <Link href="/blog" className={`text-gray-600 hover:text-gray-900 ${location === "/blog" ? "text-gray-900" : ""}`}>
              Blog
            </Link>
            <Link href="/journal" className={`text-gray-600 hover:text-gray-900 ${location === "/journal" ? "text-gray-900" : ""}`}>
              Journal
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              asChild
            >
              <Link href="/sign-in">Sign in</Link>
            </Button>
            <Button
              size="sm"
              asChild
            >
              <Link href="/sign-up">Sign up</Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}