import { useDataContext } from "../Contexts/DataContext";

export default function TabsContainer({ children }) {
  const { hasData } = useDataContext();

  const containerStyles = {
    width: '100%',
    margin: '0 auto',
    top: '0',
    alignItems: 'center',
    alignContent: 'center',
    JustifyContent: 'center',
    position: 'fixed',
    padding: '20px 20px',
  };

  return (
    <div style={containerStyles}>
      {children}
    </div>
  );
}