import { DropBox } from "../Components/Atoms/DropBox";
import ChartContainer from "../Components/Molecules/ChartContainer";
import {
  Tabs,
  Layout,
  Space,
  FloatButton,
  Drawer,
  Typography,
  Button,
} from "antd";
import MemoryChart from "../Components/Organisms/MemoryChart";
import MemoryPercntChart from "../Components/Organisms/MemoryPercntChart";
import BlockIOChart from "../Components/Organisms/BlockIOChart";
import CpuChart from "../Components/Organisms/CpuChart";
import FileDetails from "../Components/Molecules/FileDetails";
import { useDataContext } from "../Components/Contexts/DataContext";
import { useEffect, useState } from "react";
import FooterDetails from "../Components/Atoms/FooterDetails";
import LoadingSpin from "../Components/Atoms/LoadingSpin";
import TabsContainer from "../Components/Molecules/TabsContainer";
import { ReloadOutlined, QuestionOutlined } from "@ant-design/icons";
const { Footer, Content } = Layout;

export const HomePage = () => {
  const { hasData, fileDetails, isLoading, dataLoaded } = useDataContext();

  const [drawerOpen, setDrawerOpen] = useState(false);

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
          className="overflow-y-auto h-full w-full justify-center items-center flex-col flex"
        >
          {!dataLoaded && <DropBox />}
          {isLoading && dataLoaded && <LoadingSpin />}
          {hasData && (
            <>
              <TabsContainer>
                <Tabs type="card" items={tabItems} />
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
        <Drawer
          title="Usage"
          placement="right"
          closable={true}
          onClose={() => setDrawerOpen(false)}
          open={drawerOpen}
          width={800}
        >
          <Typography.Title level={1}>Zoom</Typography.Title>
          <Typography.Paragraph>
            There are two ways to zoom in and out of the chart, mouse wheel and
            click and drag.
          </Typography.Paragraph>
          <Typography.Title level={2}>Mouse Wheel</Typography.Title>
          <Typography.Paragraph>
            To zoom in using the mouse wheel simply hover the mouse on top of
            the chart and scroll up to zoom in and scroll down to zoom out.
          </Typography.Paragraph>
          <Typography.Title level={2}>Click and Drag</Typography.Title>
          <Typography.Paragraph>
            To zoom in using click and drag, first press the control key and
            while holding, click and drag the section to zoom in on the chart.{" "}
          </Typography.Paragraph>
          <Typography.Title level={2}>Reset Zoom</Typography.Title>
          <Typography.Paragraph>
            Use the Reset Zoom button to reset the zoom level back to default.
          </Typography.Paragraph>
          <Typography.Title level={1}>Pan</Typography.Title>
          <Typography.Paragraph>
            To pan, click and drag on the chart to move on to the horizontal
            axis. (Note, if not zoomed it, the chart will not pan)
          </Typography.Paragraph>
          <Button
            type="primary"
            onClick={() => setDrawerOpen(false)}
            className="mt-3"
          >
            Close
          </Button>
        </Drawer>
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
