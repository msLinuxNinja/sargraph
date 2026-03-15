import { Divider, Table } from 'antd';

export default function TableDetails(props) {
  return (
    <>
      <Divider>{props.title}</Divider>
      <Table columns={props.columns} dataSource={props.data} size="middle" pagination={false} />
    </>
  );
}

