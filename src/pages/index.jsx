import { DropBox } from "../Components/Atoms/DropBox";
import ChartContainer from "../Components/Molecules/ChartContainer";
import { Tabs, Layout, Space, FloatButton } from "antd";

//Chart components imports
import MemoryChart from "../Components/Organisms/MemoryChart";
import MemoryPercntChart from "../Components/Organisms/MemoryPercntChart";
import BlockIOChart from "../Components/Organisms/BlockIOChart";
import BlockTimelineChart from "../Components/Organisms/BlockTimelineChart";
import CpuChart from "../Components/Organisms/CpuChart";
import NetworkChart from "../Components/Organisms/NetworkChart";
import NetworkErrChart from "../Components/Organisms/NetworkErrChart";
import PagingChart from "../Components/Organisms/PagingChart";

import FileDetails from "../Components/Molecules/FileDetails";
import { useDataContext } from "../Components/Contexts/DataContext";
import { useEffect, useState } from "react";
import FooterDetails from "../Components/Atoms/FooterDetails";
import LoadingSpin from "../Components/Atoms/LoadingSpin";
import TabsContainer from "../Components/Molecules/TabsContainer";
import UsageDrawer, {
  BLOCK_IO_TAB_KEY,
  BLOCK_TIMELINE_TAB_KEY,
} from "../Components/Molecules/UsageDrawer";
import { ReloadOutlined, QuestionOutlined } from "@ant-design/icons";
const { Footer, Content } = Layout;

export const HomePage = () => {
  const { hasData, fileDetails, isLoading, dataLoaded } = useDataContext();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeTabKey, setActiveTabKey] = useState("1");

  function realoadPage() {
    window.location.reload();
  }

  function handleUsage() {
    setDrawerOpen(true);
  }

  const tabItems = [
    {
      label: "CPU",
      key: "1",
      children: (
        <ChartContainer>
          <CpuChart />
        </ChartContainer>
      ),
    },
    {
      label: "Memory",
      key: "2",
      children: (
        <ChartContainer>
          <MemoryChart />
        </ChartContainer>
      ),
    },
    {
      label: "Memory %",
      key: "3",
      children: (
        <ChartContainer>
          <MemoryPercntChart />
        </ChartContainer>
      ),
    },
    {
      label: "Paging",
      key: "7",
      children: (
        <ChartContainer>
          <PagingChart />
        </ChartContainer>
      ),
    },
    {
      label: "IO",
      key: BLOCK_IO_TAB_KEY,
      children: (
        <ChartContainer>
          <BlockIOChart />
        </ChartContainer>
      ),
    },
    {
      label: "Block Timeline",
      key: BLOCK_TIMELINE_TAB_KEY,
      children: (
        <ChartContainer>
          <BlockTimelineChart />
        </ChartContainer>
      ),
    },
    {
      label: "Network",
      key: "5",
      children: (
        <ChartContainer>
          <NetworkChart />
        </ChartContainer>
      ),
    },
    {
      label: "Network Errors",
      key: "6",
      children: (
        <ChartContainer>
          <NetworkErrChart />
        </ChartContainer>
      ),
    },
    {
      label: "System Details",
      key: "8",
      children: (
        <ChartContainer>
          <FileDetails />
        </ChartContainer>
      ),
    },
  ];
  useEffect(() => {
    {
      hasData
        ? (document.title = `${fileDetails.hostname} | ${fileDetails.date} | ${fileDetails.fileName}`)
        : (document.title = "SarGRAPH");
    }
  }, [fileDetails]);

  const contentStyle = {
    backgroundColor: "rgb(50, 50, 50)",
  };

  const footerStyle = {
    background:
      "linear-gradient(90deg, rgba(0,21,41,1) 0%, rgba(0,22,43,1) 50%, rgba(0,21,41,1) 100%)",
  };

  return (
    <Space direction="vertical" className="h-screen w-screen" size={[48, 48]}>
      <Layout className="h-screen w-screen">
        <Content
          style={contentStyle}
          className="overflow-y-auto h-full w-full justify-center items-center flex-col flex"
        >
          {!dataLoaded && <DropBox />}
          {isLoading && dataLoaded && <LoadingSpin />}
          {hasData && (
            <>
              <TabsContainer>
                <Tabs
                  className="h-full"
                  type="card"
                  items={tabItems}
                  activeKey={activeTabKey}
                  onChange={setActiveTabKey}
                />
              </TabsContainer>
              <FloatButton.Group
                trigger="hover"
                style={{
                  right: 50,
                  bottom: 120,
                }}
                type="primary"
                icon={<QuestionOutlined />}
              >
                <FloatButton tooltip="Usage" onClick={handleUsage} />
                <FloatButton
                  icon={<ReloadOutlined />}
                  tooltip={<div>Load New File</div>}
                  onClick={realoadPage}
                />
              </FloatButton.Group>
            </>
          )}
        </Content>
        <UsageDrawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          activeTabKey={activeTabKey}
        />
        <Footer
          style={footerStyle}
          className="z-30 flex justify-start content-center rounded-b-lg"
        >
          <FooterDetails />
        </Footer>
      </Layout>
    </Space>
  );
};
