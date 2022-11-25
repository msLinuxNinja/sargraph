import readFile from "../../Utils/readFile";
import { callParse } from "../../Utils/callParse";
import { useState } from "react";
import { useDataContext } from "../Contexts/DataContext";

import { InboxOutlined } from '@ant-design/icons';
import { message, Upload } from 'antd';
import data from "../env/data";

const { Dragger } = Upload;

export function DropBox() {

  
  // Dropbox component
  const [dragClass, setdragClass] = useState(false);
  const { setCpuData, setMemoryData, setBlockData, hasData } = useDataContext();

  const props = { // props for antd upload component
    multiple: false,
    customRequest: handleCustomRequest,
    showUploadList: false,
  }

  async function handleCustomRequest({onError, onSuccess, file}) {
    if(file) {
      
      const fileContent = await readFile(file);
      const dataObj = callParse(fileContent); // Object containing more objects (inception! 🤯)

      // Save data in context
      setCpuData(dataObj.cpuObject);
      setMemoryData(dataObj.memoryObject);
      setBlockData(dataObj.blockObject);

      onSuccess()
    }
  }


  function getStyles() {
    return hasData ? "hidden" : "centered antd-dropzone";
  }

  return (
    <div className={getStyles()}>
      <Dragger {...props}>
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">Click or drag file to this area to upload</p>
        <p className="ant-upload-hint">

          Select a sar file that contains the text output from systat (sa files are binary and won’t be read).
          
        </p>
      </Dragger>
    </div>
  );
}
