import { Switch, Route, useLocation } from "wouter";
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
import SpiritJournalPage from "@/pages/spirit-journal";

function Router() {
  const [location] = useLocation();
  const showNav = location.startsWith("/journal");

  return (
    <div className="min-h-screen bg-background">
      {showNav && <Nav />}
      <main className={!showNav ? "" : "container mx-auto px-4 py-8"}>
        <Switch>
          <Route path="/" component={HomePage} />
          <Route path="/spirit-journal" component={SpiritJournalPage} />
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