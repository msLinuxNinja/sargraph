import { useDataContext } from "../Contexts/DataContext";

export default function ChartContainer({ children }) {
  const { hasData } = useDataContext();

  function getStyle() {
    return hasData ? "block" : "none";
  }

  return (
    <div
      id="chart-container"
      style={{
        width: "80vw",
        height: "94vh",
        textAlign: "center",
        // margin: "auto",
        display: getStyle(),
        position: 'fixed'
      }}
    >
      {children}
    </div>
  );
}
