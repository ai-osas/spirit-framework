import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import JournalPage from "@/pages/journal";
import NewJournalPage from "@/pages/journal/new";
import EditJournalPage from "@/pages/journal/[id]";

function Router() {
  return (
    <Switch>
      <Route path="/" component={JournalPage} />
      <Route path="/journal" component={JournalPage} />
      <Route path="/journal/new" component={NewJournalPage} />
      <Route path="/journal/:id" component={EditJournalPage} />
      <Route component={NotFound} />
    </Switch>
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
