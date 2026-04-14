
  import { createRoot } from "react-dom/client";
  import App from "./app/App.tsx";
  import "./styles/index.css";

  const savedMode = localStorage.getItem('darkMode');
  if (savedMode === 'false') {
    document.documentElement.classList.remove('dark');
  } else {
    document.documentElement.classList.add('dark');
  }

  createRoot(document.getElementById("root")!).render(<App />);
  