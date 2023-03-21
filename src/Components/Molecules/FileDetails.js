import { useDataContext } from "../Contexts/DataContext";
import { Card, Col, Row, Statistic } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLinux, faFedora, faRedhat } from "@fortawesome/free-brands-svg-icons";
import { faMicrochip, faCalendarDay, faServer, faHardDrive, faFileArrowUp } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";




//Component to show the file details.
export default function FileDetails() {
  const { fileDetails, cpuData, blockData } = useDataContext();
  const [icon, setIcon] = useState(<FontAwesomeIcon icon={faLinux} />);
  const [textColor, setTextColor] = useState("");


  function returnDistroIcon() { // detect ditro type
    if (fileDetails.kernel.includes("fc")) {
      setTextColor("#0B57A4")
      return <FontAwesomeIcon icon={faFedora} />
    } else if (fileDetails.kernel.includes("el")) {
      setTextColor("#CC0000")
      return <FontAwesomeIcon icon={faRedhat} />
    } else {
      setTextColor("#CC0000")
      return <FontAwesomeIcon icon={faLinux} />
    }
  }

  useEffect(() => {
    setIcon(returnDistroIcon());

  }, [])
  return (
    <>
      <Row gutter={[16, 24]}>
        <Col span={12}>
          <Card bordered={false}>
            <Statistic
              title="Hostname"
              value={fileDetails.hostname}
              valueStyle={{
                color: '#3f8600',
              }}
              prefix={<FontAwesomeIcon icon={faServer} />}
            />
          </Card>
        </Col>
        <Col span={12} >
          <Card bordered={false}>
            <Statistic
              title="Kernel Version"
              value={fileDetails.kernel}
              precision={2}
              valueStyle={{
                color: textColor,
              }}
              prefix={icon}

            />
          </Card>
        </Col>
        <Col span={12}>
          <Card bordered={false}>
            <Statistic
              title="File Name"
              value={fileDetails.fileName}
              valueStyle={{
                color: '#3f8600',
              }}
              prefix={<FontAwesomeIcon icon={faFileArrowUp} />}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card bordered={false}>
            <Statistic
              title="Total Block Devices (including logical)"
              value={blockData.uniqDev.length}
              valueStyle={{
                color: textColor,
              }}
              prefix={<FontAwesomeIcon icon={faHardDrive} />}

            />
          </Card>
        </Col>
        <Col span={12}>
          <Card bordered={false}>
            <Statistic
              title="File Date"
              value={fileDetails.date}
              valueStyle={{
                color: '#3f8600',
              }}
              prefix={<FontAwesomeIcon icon={faCalendarDay} />}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card bordered={false}>
            <Statistic
              title="Total CPUs"
              value={cpuData.uniqCPU.length - 1}
              valueStyle={{
                color: textColor,
              }}
              prefix={<FontAwesomeIcon icon={faMicrochip} />}

            />
          </Card>
        </Col>
      </Row>
    </>

  )
};
