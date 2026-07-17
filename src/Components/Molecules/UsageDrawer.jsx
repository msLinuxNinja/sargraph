import { Drawer, Typography, Button } from "antd";

export const BLOCK_TIMELINE_TAB_KEY = "9";

export default function UsageDrawer({ open, onClose, activeTabKey }) {
  const isTimelineTab = activeTabKey === BLOCK_TIMELINE_TAB_KEY;

  return (
    <Drawer
      title="Usage"
      placement="right"
      closable={true}
      onClose={onClose}
      open={open}
      width={800}
    >
      <Typography.Title level={1}>Zoom</Typography.Title>
      <Typography.Paragraph>
        There are two ways to zoom in and out of the chart, mouse wheel and
        click and drag.
      </Typography.Paragraph>
      <Typography.Title level={2}>Mouse Wheel</Typography.Title>
      <Typography.Paragraph>
        To zoom in using the mouse wheel simply hover the mouse on top of
        the chart and scroll up to zoom in and scroll down to zoom out.
      </Typography.Paragraph>
      <Typography.Title level={2}>Click and Drag</Typography.Title>
      <Typography.Paragraph>
        To zoom in using click and drag, first press the control key and
        while holding, click and drag the section to zoom in on the chart.{" "}
      </Typography.Paragraph>
      <Typography.Title level={2}>Reset Zoom</Typography.Title>
      <Typography.Paragraph>
        Use the Reset Zoom button to reset the zoom level back to default.
      </Typography.Paragraph>
      <Typography.Title level={1}>Pan</Typography.Title>
      <Typography.Paragraph>
        To pan, click and drag on the chart to move on to the horizontal
        axis. (Note, if not zoomed it, the chart will not pan)
      </Typography.Paragraph>

      {isTimelineTab && (
        <>
          <Typography.Title level={1}>Block Timeline</Typography.Title>
          <Typography.Paragraph>
            The Block Timeline tab plots every block device on the same
            chart at once, one line per device, so you can compare I/O
            activity across all disks at a glance.
          </Typography.Paragraph>
          <Typography.Title level={2}>Selecting a Metric</Typography.Title>
          <Typography.Paragraph>
            Use the metric dropdown below the chart to switch between
            Transfers/s, Read MB/s, Write MB/s, Average Request Size,
            Average Queue Size, and Latency.
          </Typography.Paragraph>
          <Typography.Title level={2}>Isolating a Device</Typography.Title>
          <Typography.Paragraph>
            Click a device name in the legend to hide every other device and
            isolate just that one. Click the same legend entry again to
            restore all devices.
          </Typography.Paragraph>
          <Typography.Title level={2}>
            Selecting Multiple Devices
          </Typography.Title>
          <Typography.Paragraph>
            Hold Ctrl (or Cmd on Mac) and click legend entries to toggle
            individual devices on or off, building up a custom selection of
            multiple devices to compare.
          </Typography.Paragraph>
        </>
      )}

      <Button type="primary" onClick={onClose} className="mt-3">
        Close
      </Button>
    </Drawer>
  );
}
