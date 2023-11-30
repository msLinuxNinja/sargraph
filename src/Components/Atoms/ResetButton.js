import { Button } from "antd";

export default function ResetButton(props) {
  function handleResetZoom() {
    if (props.chartRef && props.chartRef.current) {
      props.chartRef.current.resetZoom();
    }
  }
  return (
    <Button type="primary" onClick={handleResetZoom}>
      Reset Zoom
    </Button>
  );
}
