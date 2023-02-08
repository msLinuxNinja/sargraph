import { useDataContext } from "../Contexts/DataContext";

export default function ChartContainer({ children }) {
  const { hasData } = useDataContext();

  const containerStyles = {
    width: '75vw',
    margin: '0 auto',
    overflow: 'scroll',
    alignItems: 'center',
    alignContent: 'center',
    position: 'relative',
  };

  return (
    <div style={containerStyles}>
      {hasData ? children : null}
    </div>
  );
}
