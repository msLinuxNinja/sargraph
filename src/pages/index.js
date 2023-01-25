import { DropBox } from "../Components/Atoms/DropBox";
import ChartContainer from "../Components/Molecules/ChartContainer";
import Btn from "../Components/Atoms/Btn";
import { Tabs } from "antd";
import HeadingOne from "../Components/Atoms/HeadingOne";
import MemoryChart from "../Components/Organisms/MemoryChart";
import MemoryPercntChart from "../Components/Organisms/MemoryPercntChart";
import BlockIOChart from "../Components/Organisms/BlockIOChart";
import CpuChart from "../Components/Organisms/CpuChart";
import FileDetails from "../Components/Molecules/FileDetails";
import { useDataContext } from "../Components/Contexts/DataContext";
import { useEffect } from "react";







export const HomePage = () => {
  const { hasData, fileDetails } = useDataContext();
  

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


  return (
    <>
      <DropBox />
      <ChartContainer>
        <Btn />
        { hasData ? <Tabs type="card" items={tabItems} /> : null}         
      </ChartContainer>
    </>
  );
};
