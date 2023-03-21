import { DataContextProvider } from "./Components/Contexts/DataContext";
import { HomePage } from "./pages";

export default function Appz() {
  return (
    
      
        <DataContextProvider>
          <HomePage />
        </DataContextProvider>
  );
}
