import { Spin } from 'antd';

export default function LoadingSpin() {

    return (
        <div style={{
            position: 'absolute',
            zIndex: 999,
            margin: 'auto',

        }}>
            <Spin tip="Loading" size="large"></Spin>
        </div>
    )
}
