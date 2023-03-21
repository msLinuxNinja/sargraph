import { Divider, Table } from 'antd';

export default function TableDetails(props) {
  return (
    <>
      <Divider>Middle size table</Divider>
      <Table columns={props.columns} dataSource={props.data} size="middle" />
    </>
  );
}

