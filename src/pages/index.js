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
const { Header, Footer, Content } = Layout;



export const HomePage = () => {
  const { hasData, fileDetails, isLoading, dataLoaded } = useDataContext();  

  const tabItems = [
    {
      label: "CPU",
      key: "1",
      children: (
        <>
          <HeadingOne heading="CPU" />
          <CpuChart />
        </>
      ),
    },
    {
      label: "Memory",
      key: "2",
      children: (
        <>
          <HeadingOne heading="Memory" />
          <MemoryChart />
        </>
      ),
    },
    {
      label: "Memory %",
      key: "3",
      children: (
        <>
          <HeadingOne heading="Memory%" />
          <MemoryPercntChart />
        </>
      ),
    },
    {
      label: "IO",
      key: "4",
      children: (
        <>
          <HeadingOne heading="IO" />
          <BlockIOChart />
        </>
      ),
    },
    {
      label: "System Details",
      key: "5",
      children: (
        <>
          <HeadingOne heading="System Details" />
          <FileDetails />
        </>
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
    justifyContent: 'left',
    alignItems: 'center'
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

        <Header />
        <Content style={contentStyle}>
          
          {!dataLoaded && <DropBox />}
          {isLoading && dataLoaded && <LoadingSpin />}
          { hasData && <ChartContainer>
            
            <Btn />
            <Tabs type="card" items={tabItems} /> 
            
          </ChartContainer> }
             

        </Content>
        <Footer style={footerStyle}>
          <FooterDetails />
        </Footer>
        
      </Layout>
    </Space>
  );
};
