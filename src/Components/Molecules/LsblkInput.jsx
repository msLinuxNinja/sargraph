import { useState } from "react";
import { Button, Input, Modal, Space, Typography, Alert } from "antd";
import { useDataContext } from "../Contexts/DataContext";
import { validateLsblkOutput } from "../../Utils/parseLsblk";

const { TextArea } = Input;

// Check how many of the current devices can actually be mapped
function getCoverageStats(mapping, uniqDev) {
  if (!mapping || !uniqDev) return null;
  let mapped = 0;
  for (const dev of uniqDev) {
    if (mapping[dev]) mapped++;
  }
  return { mapped, total: uniqDev.length };
}

export default function LsblkInput({ open, onClose }) {
  const { deviceMap, setDeviceMap, blockData } = useDataContext();
  const [rawText, setRawText] = useState("");
  const [validation, setValidation] = useState(null);

  function handleValidate() {
    const result = validateLsblkOutput(rawText);

    if (result.valid) {
      const coverage = getCoverageStats(result.mapping, blockData?.uniqDev);
      setValidation({ ...result, coverage });
    } else {
      setValidation(result);
    }
  }

  function handleApply() {
    if (!validation?.valid) return;
    setDeviceMap(validation.mapping);
    onClose();
  }

  function handleClear() {
    setDeviceMap({});
    setRawText("");
    setValidation(null);
  }

  const activeMappingCount = Object.keys(deviceMap || {}).length;
  const activeCoverage = getCoverageStats(deviceMap, blockData?.uniqDev);

  return (
    <Modal
      title="Map Block Device Names"
      open={open}
      onCancel={onClose}
      footer={null}
      width={700}
    >
      <Space direction="vertical" style={{ width: "100%" }} size="middle">
        <Typography.Paragraph>
          Paste the output of{" "}
          <Typography.Text code>lsblk -o NAME,MAJ:MIN</Typography.Text> to
          replace <Typography.Text code>dev253-0</Typography.Text> with{" "}
          <Typography.Text code>vda</Typography.Text> across all charts.
        </Typography.Paragraph>

        <Alert
          type="info"
          message="How to get lsblk output"
          description={
            <Typography.Paragraph className="mb-0">
              From a terminal:{" "}
              <Typography.Text code>lsblk -o NAME,MAJ:MIN</Typography.Text>
              <br />
              From sos reports, check{" "}
              <Typography.Text code>
                sos_commands/block/lsblk
              </Typography.Text>
              <br />
              With extra columns:{" "}
              <Typography.Text code>
                lsblk -o NAME,MAJ:MIN,TYPE,SIZE
              </Typography.Text>{" "}
              also works — extra columns are ignored.
            </Typography.Paragraph>
          }
        />

        <TextArea
          rows={10}
          value={rawText}
          onChange={(e) => {
            setRawText(e.target.value);
            setValidation(null);
          }}
          placeholder={`NAME    MAJ:MIN\nvda     253:0\n├─vda1  253:1\nsda     8:0\nnvme0n1 259:0`}
          style={{ fontFamily: "monospace" }}
        />

        {validation && (
          <Alert
            type={validation.valid ? "success" : "error"}
            message={
              validation.valid
                ? `Parsed ${validation.deviceCount} device(s)${
                    validation.coverage
                      ? ` — ${validation.coverage.mapped}/${validation.coverage.total} sar devices can be mapped`
                      : ""
                  }`
                : "Parse Error"
            }
            description={
              !validation.valid
                ? validation.errors.join(", ")
                : validation.coverage &&
                  validation.coverage.mapped < validation.coverage.total
                ? `${
                    validation.coverage.total - validation.coverage.mapped
                  } device(s) from the sar file have no match in this lsblk output. They will keep their raw names.`
                : undefined
            }
          />
        )}

        <Space>
          <Button onClick={handleValidate}>Validate</Button>
          <Button
            type="primary"
            onClick={handleApply}
            disabled={!validation?.valid}
          >
            Apply Mapping
          </Button>
          {activeMappingCount > 0 && (
            <Button danger onClick={handleClear}>
              Clear Existing Mapping
            </Button>
          )}
        </Space>

        {activeMappingCount > 0 && (
          <Typography.Text type="secondary">
            Active mapping: {activeMappingCount} device(s) mapped.
            {activeCoverage &&
              ` (${activeCoverage.mapped}/${activeCoverage.total} sar devices)`}
          </Typography.Text>
        )}
      </Space>
    </Modal>
  );
}
