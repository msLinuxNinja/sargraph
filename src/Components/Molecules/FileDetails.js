import { useDataContext } from "../Contexts/DataContext";
import {  Card, Col, Row, Statistic } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLinux } from "@fortawesome/free-brands-svg-icons";
import { faMicrochip, faCalendarDay, faServer } from "@fortawesome/free-solid-svg-icons";




//Component to show the file details.
export default function FileDetails() {
    const { fileDetails, cpuData } = useDataContext();
    return (
        <>
        <Row gutter={[24, 48]}>
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
                            color: '#cf1322',
                        }}
                        prefix={<FontAwesomeIcon icon={faLinux}/>}

                    />
                </Card>
            </Col>
        </Row>
        <Row gutter={[24, 48]}>
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
                        value={cpuData.uniqCPU.length -1}
                        valueStyle={{
                            color: '#cf1322',
                        }}
                        prefix={<FontAwesomeIcon icon={faMicrochip} />}

                    />
                </Card>
            </Col>
        </Row>
        
        <Row gutter={[24, 248]}>
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
                        value={cpuData.uniqCPU.length -1}
                        valueStyle={{
                            color: '#cf1322',
                        }}
                        prefix={<FontAwesomeIcon icon={faMicrochip} />}

                    />
                </Card>
            </Col>
        </Row>
        </>

    )
};
