export default function ChartContainer({ children }) {

  return (
    <div className=" w-5/6 m-auto overflow-y-auto overflow-x-hidden">
      {children}
    </div>
  );
}
