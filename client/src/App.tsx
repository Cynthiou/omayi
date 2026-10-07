import Logo from "./components/Logo";
import Home from "./pages/Home";

function App() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-line">
        <div className="mx-auto flex w-full max-w-5xl items-center px-4 py-3">
          <Logo className="h-7 w-auto" />
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8">
        <Home />
      </main>

      <footer className="border-t border-line">
        <p className="mx-auto w-full max-w-5xl px-4 py-4 text-petit text-muted">
          US00 — initialisation du monorepo
        </p>
      </footer>
    </div>
  );
}

export default App;
