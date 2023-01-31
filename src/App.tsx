import "./Components/Styles/styles.css";
import { DataContextProvider } from "./Components/Contexts/DataContext";
import { ConfigProvider, theme } from "antd";

import { HomePage } from "./pages";

export default function App() {

  return (
    <DataContextProvider>
      <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm
      }}
      >
        <HomePage />
      </ConfigProvider>
    </DataContextProvider>
  );
}
