import { DataContext } from "../Contexts/DataContext";
import  { useContext } from "react";

export default function ChartContainer ({children}) {
    const { sarData } = useContext(DataContext);

    function getStyle () {
        return sarData ? "block" : "none";
    }

    return (
        <div className='chart-container' id='chart-container' style={{ width: "80vw", textAlign: "center", margin: "auto", display: getStyle() }}>
            {children}
        </div>
    )
}