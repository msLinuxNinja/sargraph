import "./Components/Styles/styles.css";
import { DataContextProvider } from "./Components/Contexts/DataContext";
import { ConfigProvider, theme } from "antd";

import 'antd/dist/reset.css';

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
