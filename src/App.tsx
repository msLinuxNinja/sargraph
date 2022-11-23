import "./Components/Styles/styles.css";
import { DataContextProvider } from "./Components/Contexts/DataContext";

import { HomePage } from "./pages";

export default function App() {
  return (
    <DataContextProvider>
      <HomePage />
    </DataContextProvider>
  );
}
