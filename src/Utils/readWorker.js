function parseRow(row) {
  if (row.includes("RESTART")) return null;

  const emptySplit = row.split(" ");
  const commaSplit = emptySplit.toString().split(",");
  let filtered = commaSplit.filter((e) => e.trim() !== "");

  if (filtered[1] === "AM" || filtered[1] === "PM") {
    filtered[0] = filtered[0] + " " + filtered[1];
    filtered.splice(1, 1);
  }
  return filtered;
}

onmessage = function (e) {
  const rows = e.data;
  const parsed = rows.map(parseRow).filter((r) => r && String(r).trim());
  postMessage(parsed);
  // eslint-disable-next-line
  close();
};
