import { useDataContext } from "../Contexts/DataContext";

export default function ChartContainer({ children }) {
  const { hasData } = useDataContext();

  function getStyle() {
    return hasData ? "block" : "none";
  }

  return (
    <div
      className="chart-container"
      id="chart-container"
      style={{
        width: "80vw",
        textAlign: "center",
        margin: "auto",
        display: getStyle(),
      }}
    >
      {children}
    </div>
  );
}
