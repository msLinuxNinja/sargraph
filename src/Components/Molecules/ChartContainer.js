export default function ChartContainer({ children }) {

  return (
    <div className="h-screen w-5/6 ultra:w-3/5 m-auto overflow-y-auto overflow-x-hidden relative">
      {children}
    </div>
  );
}
