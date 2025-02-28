import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { Nav } from "@/components/ui/nav";
import NotFound from "@/pages/not-found";
import JournalPage from "@/pages/journal";
import NewJournalPage from "@/pages/journal/new";
import EditJournalPage from "@/pages/journal/[id]";

function Router() {
  return (
    <div className="min-h-screen bg-background">
      <Nav />
      <main className="container mx-auto px-4 py-8">
        <Switch>
          <Route path="/" component={JournalPage} />
          <Route path="/journal" component={JournalPage} />
          <Route path="/journal/new" component={NewJournalPage} />
          <Route path="/journal/:id" component={EditJournalPage} />
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