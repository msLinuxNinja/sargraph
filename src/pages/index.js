import { DropBox } from "../Components/Atoms/DropBox";
import ChartContainer from "../Components/Molecules/ChartContainer";
import { Tabs, Layout, Space, FloatButton } from "antd";
import MemoryChart from "../Components/Organisms/MemoryChart";
import MemoryPercntChart from "../Components/Organisms/MemoryPercntChart";
import BlockIOChart from "../Components/Organisms/BlockIOChart";
import CpuChart from "../Components/Organisms/CpuChart";
import FileDetails from "../Components/Molecules/FileDetails";
import { useDataContext } from "../Components/Contexts/DataContext";
import { useEffect } from "react";
import FooterDetails from "../Components/Atoms/FooterDetails";
import LoadingSpin from "../Components/Atoms/LoadingSpin";
import TabsContainer from "../Components/Molecules/TabsContainer";
import { ReloadOutlined } from "@ant-design/icons";
const { Footer, Content } = Layout;

export const HomePage = () => {
  const { hasData, fileDetails, isLoading, dataLoaded } = useDataContext();

  function realoadPage() {
    window.location.reload();
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
      label: "IO",
      key: "4",
      children: (
        <ChartContainer>
          <BlockIOChart />
        </ChartContainer>
      ),
    },
    {
      label: "System Details",
      key: "5",
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
        ? (document.title = `${fileDetails.date}|${fileDetails.fileName}`)
        : (document.title = "SarGRAPH");
    }
  }, [fileDetails]);

  const contentStyle = {
    backgroundColor: "rgb(66, 66, 66)",
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
          className="overflow-y-auto h-full w-full  justify-center items-center flex-col flex"
        >
          {!dataLoaded && <DropBox />}
          {isLoading && dataLoaded && <LoadingSpin />}
          {hasData && (
            <>
              <TabsContainer>
                <Tabs type="card" items={tabItems} />
              </TabsContainer>

              <FloatButton
                icon={<ReloadOutlined />}
                tooltip={<div>Load New File</div>}
                onClick={realoadPage}
                style={{
                  right: 50,
                  bottom: 120,
                }}
                type="primary"
              />
            </>
          )}
        </Content>

        <Footer
          style={footerStyle}
          className="z-30 flex justify-start items-center content-center"
        >
          <FooterDetails />
        </Footer>
      </Layout>
    </Space>
  );
};
