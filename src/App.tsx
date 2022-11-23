import { useState } from 'react';
import { DropBox} from './Components/Atoms/DropBox';
import HeadingOne from './Components/Atoms/HeadingOne';
import Btn from './Components/Atoms/Btn'

import "./Components/Styles/styles.css"
import CpuChart from './Components/Organisms/CpuChart';
import { DataContext } from './Components/Contexts/DataContext';
import MemoryChart from './Components/Organisms/MemoryChart';
import MemoryPercntChart from './Components/Organisms/MemoryPercntChart';
import BlockIOChart from './Components/Organisms/BlockIOChart';
import ChartContainer from './Components/Molecules/ChartContainer';
import { Tabs } from 'antd';




export default function App () { 
  const [sarData, setSarData ] = useState();
  const [selectedOption, setSelectedOption] = useState();
  const tabItems = [
    {
      label: "CPU",
      key: "1",
      children: (
        <>
        <HeadingOne heading="CPU"/>
        <CpuChart />
        </>
      )
    },
    {
      label: "Memory",
      key: "2",
      children: (
        <>
        <HeadingOne heading="Memory" />
        <MemoryChart />
        </>
      )
    },
    {
      label: "Memory %",
      key: "3",
      children: (
        <>
        <HeadingOne heading="Memory%" />
        <MemoryPercntChart />
        </>
      )
    },
    {
      label: "IO",
      key: "4",
      children: (
        <>
        <HeadingOne heading="IO" />
        <BlockIOChart />
        </>
      )
    },
  ];
  return (
    <div>
      <DataContext.Provider value={{sarData, setSarData, selectedOption, setSelectedOption}}>
      <DropBox />
      <ChartContainer>
        <Btn />
        <Tabs type="card" items={tabItems} />
      </ChartContainer>
      </DataContext.Provider>
    </div>  
  );
}