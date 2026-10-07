import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router";

import App from "./App";

// Feuille de styles unique du client : tokens de la charte, polices, Tailwind.
import "./styles/index.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
]);

const rootElement = document.getElementById("root");
if (rootElement == null) {
  throw new Error(`Your HTML Document should contain a <div id="root"></div>`);
}

createRoot(rootElement).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
