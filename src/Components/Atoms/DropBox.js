import readFile from "../../Utils/readFile";
import { callParse } from "../../Utils/callParse";
import { useContext, useState } from "react";
import { DataContext, useDataContext } from "../Contexts/DataContext";

export function DropBox() {
  // Dropbox component
  const [dragClass, setdragClass] = useState(false);
  const { setCpuData, setMemoryData, setBlockData } = useDataContext();

  function handleDragOver(e) {
    e.stopPropagation();
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
  }

  function handleDragEnter(e) {
    // drag enter event to add classes/css
    e.preventDefault();
    setdragClass(true);
    // document.getElementById('drop_zone').classList.add('dragging');
    // document.getElementById('main-html').classList.add('darker');
  }

  function handleDragLeave(e) {
    // drag leave event to remove classes/css
    e.preventDefault();
    setdragClass(false);
  }

  function handleClick(e) {
    // Task #259
    console.log(e);
  }

  async function handleFileSelect(e) {
    // function to handle file selection and calling other functions
    e.stopPropagation();
    e.preventDefault();

    let files = e.dataTransfer.files; // FileList object.
    if (files.length > 1) {
      // check if more than one file
      alert("Only one file can be processed at a time.");
    }
    const fileContent = await readFile(files[0]);
    const dataObj = callParse(fileContent); // Object containing more objects (inception! 🤯)

    // Save data in context
    setCpuData(dataObj.cpuObject);
    setMemoryData(dataObj.memoryObject);
    setBlockData(dataObj.blockObject);
  }

  function getStyles() {
    return sarData ? "hidden" : "centered drop_zone";
  }

  return (
    <div
      className={`${dragClass ? "dragging" : ""} ${getStyles()}`}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleFileSelect}
      onClick={handleClick}
    >
      Drop file here...
    </div>
  );
}
