import { DropBox } from "../Components/Atoms/DropBox";
import ChartContainer from "../Components/Molecules/ChartContainer";
import Btn from "../Components/Atoms/Btn";
import { Tabs } from "antd";
import HeadingOne from "../Components/Atoms/HeadingOne";
import MemoryChart from "../Components/Organisms/MemoryChart";
import MemoryPercntChart from "../Components/Organisms/MemoryPercntChart";
import BlockIOChart from "../Components/Organisms/BlockIOChart";
import CpuChart from "../Components/Organisms/CpuChart";

import { useDataContext } from "../Components/Contexts/DataContext";





export const HomePage = () => {
  const { fileDetails, hasData } = useDataContext();

  const tabItems = [
    {
      label: "CPU",
      key: "1",
      children: (
        <>
          <HeadingOne heading="CPU" />
          { hasData ?
          <div> 
            <p>Kernel:{fileDetails.kernel}</p> 
            <p>Hostname:{fileDetails.hostname}</p> 
            <p>Date:{fileDetails.date}</p>
          </div> 
          : null}
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
  ];
  
  return (
    <>
      <DropBox />
      <ChartContainer>
        <Btn />
        <Tabs type="card" items={tabItems} />        
      </ChartContainer>
    </>
  );
};
