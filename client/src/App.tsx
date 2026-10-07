import "./App.css";

import Home from "./pages/Home";

function App() {
  return (
    <>
      <header className="entete">
        <h1>OMAYI</h1>
      </header>

      <main className="contenu">
        <Home />
      </main>

      <footer className="pied">US00 — initialisation du monorepo</footer>
    </>
  );
}

export default App;
