export default function ChartContainer({ children }) {

  return (
    <div className="h-full w-full md:w-11/12 lg:w-5/6 ultra:w-3/4 m-auto pb-16 overflow-y-auto overflow-x-hidden relative">
      {children}
    </div>
  );
}
