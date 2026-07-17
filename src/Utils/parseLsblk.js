/**
 * Parses lsblk -o NAME,MAJ:MIN output into a mapping of
 * devMAJOR-MINOR → NAME for human-readable device labels.
 *
 * Expected input format (from `lsblk -o NAME,MAJ:MIN`):
 *   NAME    MAJ:MIN
 *   vda     253:0
 *   ├─vda1  253:1
 *   └─vda2  253:2
 *   sda     8:0
 *
 * Also handles lsblk output with additional columns
 * (lsblk -o NAME,MAJ:MIN,TYPE,SIZE,MOUNTPOINT):
 *   NAME    MAJ:MIN TYPE  SIZE MOUNTPOINT
 *   vda     253:0   disk   64G
 *   ├─vda1  253:1   part    1M /boot
 *
 * Also handles multi-level nesting (e.g. LVM volumes on a partition on a
 * disk), where deeper rows use a tree prefix made of multiple
 * space-separated box-drawing characters, such as:
 *   ├─nvme0n1p2   259:2   0  63G  0 part
 *   │ ├─rootvg-tmplv 253:13 0  7G  0 lvm  /var/tmp
 *
 * Returns: { "dev253-0": "vda", "dev253-1": "vda1", ... }
 *
 * Error handling: returns an empty object if parsing fails completely,
 * or a partial mapping if some lines parse and others don't.
 */
export function parseLsblkOutput(rawText) {
  if (!rawText || typeof rawText !== "string") return {};

  const lines = rawText.trim().split("\n");
  if (lines.length < 2) return {}; // need at least header + one data line

  const mapping = {};

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Strip the tree-drawing prefix from the whole line first. Nested rows
    // (e.g. LVM volumes under a partition under a disk) use a prefix made
    // of multiple box-drawing characters separated by spaces, such as
    // "│ ├─rootvg-tmplv" — stripping only the first whitespace-split
    // token would leave the NAME/MAJ:MIN columns misaligned.
    const cleanedLine = line.replace(/^[\s│├└╰─]+/, "");
    if (!cleanedLine) continue;

    // Split on whitespace. lsblk columns are separated by one or more spaces.
    const columns = cleanedLine.split(/\s+/);

    // We need at least NAME and MAJ:MIN (2 columns)
    if (columns.length < 2) {
      continue;
    }

    const name = columns[0].trim();
    if (!name) continue;

    // Second column is MAJ:MIN
    const majMin = columns[1].trim();

    // Validate MAJ:MIN format: digits:digits
    const majMinMatch = majMin.match(/^(\d+):(\d+)$/);
    if (!majMinMatch) {
      continue;
    }

    const [, major, minor] = majMinMatch;
    const devKey = `dev${major}-${minor}`;

    // If there's already a mapping for this MAJ:MIN, prefer the shorter
    // name (the disk, not a partition alias — though this is rare)
    if (!mapping[devKey] || name.length < mapping[devKey].length) {
      mapping[devKey] = name;
    }
  }

  return mapping;
}

/**
 * Validates lsblk output and returns a structured result
 * that the UI can use to show feedback.
 *
 * Returns:
 *   { valid: boolean, mapping: {}, deviceCount: number, errors: string[] }
 */
export function validateLsblkOutput(rawText) {
  if (!rawText || typeof rawText !== "string" || rawText.trim().length === 0) {
    return { valid: false, mapping: {}, deviceCount: 0, errors: ["Input is empty"] };
  }

  const lines = rawText.trim().split("\n");

  // Check for header
  const header = lines[0].toLowerCase();
  if (!header.includes("name") || !header.includes("maj:min")) {
    return {
      valid: false,
      mapping: {},
      deviceCount: 0,
      errors: [
        'Header row must contain "NAME" and "MAJ:MIN" columns. ' +
        'Expected output from: lsblk -o NAME,MAJ:MIN'
      ],
    };
  }

  const mapping = parseLsblkOutput(rawText);
  const deviceCount = Object.keys(mapping).length;

  if (deviceCount === 0) {
    return {
      valid: false,
      mapping: {},
      deviceCount: 0,
      errors: [
        "No valid device entries found. " +
        "Each data line must have a device name and MAJ:MIN pair (e.g., vda 253:0)."
      ],
    };
  }

  return {
    valid: true,
    mapping,
    deviceCount,
    errors: [],
  };
}
