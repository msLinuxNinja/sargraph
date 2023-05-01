import readFile from "../../Utils/readFile";
import { callParse } from "../../Utils/callParse";
import { useDataContext } from "../Contexts/DataContext";

import { InboxOutlined } from '@ant-design/icons';
import { Upload } from 'antd';


const { Dragger } = Upload;

export function DropBox() {
  const { setCpuData, setMemoryData, setBlockData, setFileDetails, setDataLoaded } = useDataContext();
  

  const props = { // props for antd upload component
    multiple: false,
    customRequest: handleCustomRequest,
    showUploadList: false,
  }

  async function handleCustomRequest({onError, onSuccess, file}) {
    setDataLoaded(true) // Set dataLoaded to true to show loading spin
    const fileContent = await readFile(file); // Read file and return content as string

    try{
      if(fileContent.includes("Linux") && fileContent.includes("all")) { // Check if file is a sar file has the correct content
      
      
        const dataObj = callParse(fileContent); // Object containing more objects (inception! 🤯)
        // Save data in context
        setCpuData(dataObj.cpuObject);
        setMemoryData(dataObj.memoryObject);
        setBlockData(dataObj.blockObject);
        setFileDetails(dataObj.fileDetails);
        setFileDetails(prev => {
          return {
            ...prev,
            fileName: file.name,
          }
        });
        onSuccess()
  
      } else { // If file is not a sar file add error message and set dataLoaded to false
        throw new Error("Incorrect file loaded \nPlease select a sar## file containing the text output from sysstat (sa files are binary and won’t be read).")
      }

    } catch (error) {
      onError()
      alert(error.message)
      setDataLoaded(false)
    }
  }


  return (
    <div className="w-1/2 m-auto content-center ">
      <Dragger {...props}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">Click or drag file to this area to upload</p>
        <p className="ant-upload-hint">

          Select a sar file that contains the text output from sysstat (sa files are binary and won’t be read).
          
        </p>
      </Dragger>
    </div>
  );
}
