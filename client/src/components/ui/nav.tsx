import { Link } from "wouter";

export function Nav() {
  return (
    <header className="border-b bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16">
          <div className="flex items-center">
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
        </div>
      </div>
    </header>
  );
}