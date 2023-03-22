import React from 'react';
import ReactDOM from 'react-dom/client';
import 'antd/dist/reset.css';
import './Components/Styles/styles.css';
import Appz from './App';
import { ConfigProvider, theme, App } from "antd";

const { defaultAlgorithm, darkAlgorithm } = theme;



const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <ConfigProvider
      theme={{
        algorithm: darkAlgorithm,
        token: {
          colorPrimary: "#006FB4",
          colorPrimaryHover: "#21AAFF",
          colorPrimaryActive: "#1DA57A",
          colorBgContainer: "#1E1E1E",
        },
        components: {
          Button: {
            colorPrimary: "#006FB4",
            colorPrimaryHover: "#21AAFF",
            colorBgContainerDisabled: "#006FB4",
            colorBgContainer: "#21AAFF",
          },
        },
      }}
    >
      <App>
        <Appz />
      </App>
    </ConfigProvider>
  </React.StrictMode>
);

