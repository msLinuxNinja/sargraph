import { DropBox } from "../Components/Atoms/DropBox";
import ChartContainer from "../Components/Molecules/ChartContainer";
import Btn from "../Components/Atoms/Btn";
import { Tabs, Layout, Space } from "antd";
import HeadingOne from "../Components/Atoms/HeadingOne";
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
const { Footer, Content } = Layout;



export const HomePage = () => {
  const { hasData, fileDetails, isLoading, dataLoaded } = useDataContext();  

  const tabItems = [
    {
      label: "CPU",
      key: "1",
      children: (
        <ChartContainer>
          <HeadingOne heading="CPU" />
          <CpuChart />
        </ ChartContainer>
      ),
    },
    {
      label: "Memory",
      key: "2",
      children: (
        <ChartContainer>
          <HeadingOne heading="Memory" />
          <MemoryChart />
        </ ChartContainer>
      ),
    },
    {
      label: "Memory %",
      key: "3",
      children: (
        <ChartContainer>
          <HeadingOne heading="Memory%" />
          <MemoryPercntChart />
        </ ChartContainer>
      ),
    },
    {
      label: "IO",
      key: "4",
      children: (
        <ChartContainer>
          <HeadingOne heading="IO" />
          <BlockIOChart />
        </ ChartContainer>
      ),
    },
    {
      label: "System Details",
      key: "5",
      children: (
        <ChartContainer>
          <HeadingOne heading="System Details" />
          <FileDetails />
        </ ChartContainer>
      ),
    },
  ];
  useEffect(() =>{
    {hasData ? document.title = `${fileDetails.date}|${fileDetails.fileName}` : document.title = "SarGRAPH"}
  }, [fileDetails]);

  const contentStyle = {
    display: 'flex',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    backgroundColor: 'rgb(66, 66, 66)',
    height: '100vh',
  };

  const footerStyle = {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
    background: 'linear-gradient(90deg, rgba(0,21,41,1) 0%, rgba(0,22,43,1) 50%, rgba(0,21,41,1) 100%)',
  }

  return (
    <Space
    direction="vertical"
    style={{
      width: '100vw',
      height: '100vh',      
    }}
    size={[0, 48]}
    >
      <Layout
      style={{
        height: '100vh'
      }}
      >

        <Content style={contentStyle}>
          
          {!dataLoaded && <DropBox />}
          {isLoading && dataLoaded && <LoadingSpin />}
          { hasData && 
            <TabsContainer>
            
              {/* <Btn /> */}
              <Tabs type="card" items={tabItems} /> 
            
            </TabsContainer> 
          }

        </Content>
        <Footer style={footerStyle}>
          <FooterDetails />
        </Footer>
        
      </Layout>
    </Space>
  );
};
