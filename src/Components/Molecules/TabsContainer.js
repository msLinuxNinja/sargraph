export default function TabsContainer({ children }) {

  return (
    <div  className="w-full my-auto top-0 content-center items-center justify-center absolute p-2 overflow-y-auto">
      {children}
    </div>
  );
}

// style={containerStyles}