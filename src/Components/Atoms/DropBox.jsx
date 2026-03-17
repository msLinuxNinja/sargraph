import readFile from "../../Utils/readFile";
import { callParse } from "../../Utils/callParse";
import { useDataContext } from "../Contexts/DataContext";

import { InboxOutlined } from '@ant-design/icons';
import { Upload, message } from 'antd';


const { Dragger } = Upload;

export function DropBox() {
  const { setCpuData, setMemoryData, setSwapData, setBlockData, setNetData, setNetErrData, setPagingData, setFileDetails, setDataLoaded } = useDataContext();

  const props = { // props for antd upload component
    multiple: false,
    customRequest: handleCustomRequest,
    showUploadList: false,
  }

  async function handleCustomRequest({onError, onSuccess, file}) {
    setDataLoaded(true) // Set dataLoaded to true to show loading spin
    const fileContent = await readFile(file);

    try{
      const dataObj = await callParse(fileContent);
      // Save data in context
      setCpuData(dataObj.cpuObject);
      setMemoryData(dataObj.memoryObject);
      setSwapData(dataObj.swapObject);
      setBlockData(dataObj.blockObject);
      setNetData(dataObj.networkObject);
      setNetErrData(dataObj.networkErrObject);
      setPagingData(dataObj.pagingObject);
      setFileDetails(dataObj.fileDetails);
      setFileDetails(prev => {
        return {
          ...prev,
          fileName: file.name,
        }
      });
      onSuccess()

    } catch (error) {
      onError()
      message.error({
        content: error.message,
        duration: 8,
      });
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
          Select a sar file that contains the text output from sysstat (sa files are binary and won't be read).
        </p>
      </Dragger>
    </div>
  );
}
