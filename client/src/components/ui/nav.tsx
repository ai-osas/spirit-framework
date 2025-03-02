import { Link } from "wouter";

export function Nav() {
  return (
    <header className="border-b bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          <div className="flex items-center">
            <Link href="/">
              <img src="/spirit-logo.svg" alt="Spirit" className="h-8 w-8 cursor-pointer" />
            </Link>
          </div>
          <nav className="flex items-center space-x-6">
            <Link href="/blog">
              <span className="text-gray-700 hover:text-gray-900 cursor-pointer">Blog</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}