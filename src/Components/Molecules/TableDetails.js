import { Divider, Table } from 'antd';

export default function TableDetails(props) {
  return (
    <>
      <Divider>Core with highest usage</Divider>
      <Table columns={props.columns} dataSource={props.data} size="middle" pagination={false} />
    </>
  );
}

