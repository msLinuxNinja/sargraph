export default function TabsContainer({ children }) {

  return (
    <div  className="w-full h-full my-auto top-0 content-center items-center justify-center absolute p-3 overflow-y-auto ">
      {children}
    </div>
  );
}

// style={containerStyles}