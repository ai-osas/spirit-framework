import { Switch, Route, useLocation, Link } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { Nav } from "@/components/ui/nav";
import NotFound from "@/pages/not-found";
import HomePage from "@/pages";
import JournalPage from "@/pages/journal";
import NewJournalPage from "@/pages/journal/new";
import EditJournalPage from "@/pages/journal/[id]";
import ExplorePatternPage from "@/pages/journal/pattern/[id]";
import FAQPage from "@/pages/faq";
import { useWallet } from "@/hooks/useWallet";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";


function Router() {
  const [location] = useLocation();
  const showNav = location.startsWith("/journal");
  const { account, connect, isConnecting } = useWallet();

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto flex items-center justify-between h-16 px-4">
          <nav className="flex items-center gap-6">
            <Link href="/">
              <a className="font-semibold">Spirit Journal</a>
            </Link>
            {account && (
              <Link href="/journal">
                <a className="text-gray-600 hover:text-gray-900">Journal</a>
              </Link>
            )}
            <a href="https://blog.spiritjournal.com" className="text-gray-600 hover:text-gray-900">Blog</a>
          </nav>
          <div>
            {!account ? (
              <Button onClick={connect} disabled={isConnecting}>
                {isConnecting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : null}
                Connect Wallet
              </Button>
            ) : (
              <div className="text-sm text-gray-600">
                Connected: {account.slice(0, 6)}...{account.slice(-4)}
              </div>
            )}
          </div>
        </div>
      </div>

      {showNav && <Nav />}
      <main className={!showNav ? "" : "container mx-auto px-4 py-8"}>
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/journal" component={JournalPage} />
          <Route path="/journal/new" component={NewJournalPage} />
          <Route path="/journal/:id" component={EditJournalPage} />
          <Route path="/journal/pattern/:id" component={ExplorePatternPage} />
          <Route path="/faq" component={FAQPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;