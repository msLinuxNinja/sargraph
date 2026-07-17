# Timeline View — Implementation Guide

## Feature Summary

Add a new "Timeline" tab that shows all block devices simultaneously in a
vertical heatmap-style view — one row per disk, time on the x-axis, and
color intensity showing the value of a user-selectable metric. This lets
operators quickly identify which disks were active when, spot I/O storms,
and correlate across devices visually.

---

## Architecture Overview (what exists today)

Understanding the current architecture is essential because the timeline
feature should follow the same patterns.

### Data Flow

```
sar text file
    │
    ▼
DropBox.jsx → readFile() → callParse()
    │
    ├── readDataParallel()  — splits raw lines into typed arrays in workers
    └── parseAllParallel()  — spawns 8 workers, one per section
         │
         ├── parseWorker.js → parseData.js
         │      parseCPUData()       → { cpuArray[], uniqCPU[] }
         │      parseDiskIO()        → { diskArray[], uniqDev[] }
         │      parseMemoryData()    → { kbMemFree[], ... }
         │      parseSwapData()      → { kbSwapFree[], ... }
         │      parseNetworkData()   → { netArray[], uniqIFACE[] }
         │      parseNetErrorData()  → { netErrArray[], uniqIFACE[] }
         │      parsePagingData()    → { pgpgin[], ... }
         │      parseFileDetails()   → { kernel, hostname, ... }
         │
         ▼
    callParse() returns all objects → DataContext provider
```

### Data Shapes (relevant excerpts)

**blockData** (in context):
```js
{
  diskArray: [
    {
      tps:      [{ x: timestamp, y: number }, ...],
      readSec:  [{ x: timestamp, y: number }, ...],
      writeSec: [{ x: timestamp, y: number }, ...],
      avgRQz:   [{ x: timestamp, y: number }, ...],
      avgQz:    [{ x: timestamp, y: number }, ...],
      awaitMS:  [{ x: timestamp, y: number }, ...],
    },
    // ... one entry per unique block device
  ],
  uniqDev: ["dev8-0", "dev8-16", "sda", ...]  // sorted naturally
}
```

The index in `diskArray` matches the index in `uniqDev`.

### Component Tree (pages/index.jsx)

```
DataContextProvider
  └── HomePage
       ├── DropBox          (shows before data is loaded)
       ├── LoadingSpin      (shows during parsing)
       ├── TabsContainer
       │    └── <Tabs items={tabItems}>
       │         ├── CPU         → CpuChart
       │         ├── Memory      → MemoryChart
       │         ├── Memory %    → MemoryPercntChart
       │         ├── Paging      → PagingChart
       │         ├── IO          → BlockIOChart      ← current block view
       │         ├── Network     → NetworkChart
       │         ├── Net Errors  → NetworkErrChart
       │         └── Sys Details → FileDetails
       └── Footer → FooterDetails
```

### Current BlockIOChart Behavior

BlockIOChart shows **one device at a time** via a `<Select>` dropdown
(`ItemList`). The user picks a device name from `blockData.uniqDev`, and
`selectedBlock` (an integer index) updates the datasets. All six metrics
are plotted as separate line datasets on the same chart.

Key patterns in BlockIOChart:
- Uses `chart.js` time scale with `{ x: timestamp, y: value }` data points
- Registers `chartjs-plugin-zoom` and `Decimation` for performance
- Disables chart.js animations when data > ~1800 points (`perfOptions`)
- Maintains `chartRef` for programmatic zoom/update/reset
- Calculates per-metric averages over the visible zoom window via `fetchData()`
- Memoizes chart data/options via `useMemo`

---

## Implementation Plan

### 1. New Component: `BlockTimelineChart.jsx`

**Location:** `src/Components/Organisms/BlockTimelineChart.jsx`

This is the main deliverable. Unlike BlockIOChart (one device, all metrics),
the timeline shows **all devices, one metric at a time**.

#### Data Restructuring

The `diskArray` is indexed by device. We need it indexed by metric:

```js
function buildTimelineDataset(diskArray, uniqDev, selectedMetric) {
  // selectedMetric is one of: 'tps', 'readSec', 'writeSec', 'avgRQz', 'avgQz', 'awaitMS'

  return {
    labels: diskArray[0][selectedMetric].map(d => d.x),  // shared x-axis
    datasets: uniqDev.map((devName, idx) => ({
      label: devName,
      data: diskArray[idx][selectedMetric].map(d => d.y),
      // Use a color palette with N distinct colors
      borderColor: getPaletteColor(idx, uniqDev.length),
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      pointRadius: 0,      // no dots for performance
      tension: 0,          // straight lines for heatmap-like clarity
    }))
  }
}
```

**Alternative: true heatmap**

A line-per-disk approach is simpler and built entirely on chart.js.
A true heatmap (matrix chart) would require `chartjs-chart-matrix` or a
custom canvas renderer. Recommendation: start with the multi-line approach;
it reuses existing ChartJS registrations and keeps the codebase consistent.

#### Component Structure

```
BlockTimelineChart (new Organism)
  │
  ├── chartRef (useRef)         — for zoom/reset programmatic control
  ├── selectedMetric (useState) — 'tps' | 'readSec' | 'writeSec' | 'avgRQz' | 'avgQz' | 'awaitMS'
  ├── zoomLevel (useState)      — mirrors existing pattern
  ├── metricAvg (useState)      — average over visible zoom window
  │
  ├── Chart: <Line /> with chart.js
  │    ├── Use TimeScale on x-axis
  │    ├── N datasets (one per device)
  │    ├── Zoom/pan plugin (inherit from BlockIOChart)
  │    ├── Decimation plugin for large datasets
  │    └── verticalHoverLine plugin (import from CpuChart)
  │
  └── Controls:
       ├── <Select> for metric picker (replaces device picker)
       ├── <ResetButton>
       ├── <CopyClipboardButton>
       └── Zoom level + average display
```

#### Color Palette

For N devices, generate distinguishable colors. chart.js can take a
function, or precompute an array. Two options:

**Option A — Use a perceptually uniform library** (no new dependency):
Precompute an array of HSL colors by varying hue:

```js
function generatePalette(n) {
  return Array.from({ length: n }, (_, i) => {
    const hue = (i * 360 / n) % 360;
    return `hsla(${hue}, 70%, 55%, 1)`;
  });
}
```

**Option B — Import a colormap**: `@antv/color-util` or similar (adds dep).
Not recommended unless we anticipate needing this elsewhere.

#### Performance Considerations

The timeline could have many lines (e.g., 20+ block devices) with
thousands of points each. Mitigations:

1. **Decimation plugin** (already registered): set `samples: 100` per
   dataset, `threshold: 1000` — this reduces drawn points but not
   underlying data.
2. **Disable animations** when `datasets.length > 5` or `dataPoints > 1000`.
3. **`pointRadius: 0`** — avoids drawing point elements for every data
   point, which is the main bottleneck with many datasets.
4. **`parsing: false`** — already standard in the codebase, critical here.
5. **Legend scrolling**: chart.js legend can become unwieldy with 20+
   items. Solutions:
   - Use chart.js `legend.labels.filter` to let users toggle lines
   - Or place the legend in a scrollable sidebar (antd `List`)
   - **Recommended**: filter callback + compact legend at top

#### Interaction: Click-to-Highlight

When the user clicks a legend item, the chart filters other datasets
to be less visible (alpha 0.1). Standard chart.js behavior handles toggle,
but we can enhance: clicking a device name highlights that line and
dims others. Implementation uses legend `onClick` callback.

### 2. Metric Picker Atom (new or inline)

**Option A — Reuse `ItemList`**: The existing `ItemList.jsx` component
wraps antd `<Select>` and calls `setValue(index)`. For the timeline,
the metric picker needs a string value directly — not an index. Either:
- Add a new atom `MetricPicker` that calls `setSelectedMetric(string)`
- Or modify `ItemList` to support a string-value mode

**Recommendation**: Keep `ItemList` unchanged (it's used in 3+ places).
Create an inline `<Select>` in BlockTimelineChart or a small `MetricPicker`
atom.

### 3. Integration into the Tab System

**File to modify:** `src/pages/index.jsx`

Add a new tab item:

```jsx
{
  label: "Block Timeline",
  key: "9",
  children: (
    <ChartContainer>
      <BlockTimelineChart />
    </ChartContainer>
  ),
}
```

No changes to `DataContext` — the timeline reads `blockData` directly
like BlockIOChart does.

### 4. Data Processing (No Changes Required)

The parser `parseDiskIO()` in `parseData.js` already produces the exact
shape needed. Each device entry has all six metrics as parallel arrays of
`{ x, y }` points. No parser changes needed.

If the timeline eventually needs **cumulative bytes** or **IOPS difference**
(rather than the per-second rates sar provides), that could be computed
in the component, but that's out of scope for v1.

### 5. Zoom Synchronization (Optional Enhancement)

If we want the IO tab and the Timeline tab to stay in sync when the user
zooms on one, we could add `timelineZoom` (min/max epoch) to DataContext
and have both charts read/write it. However, this adds cross-component
coupling. **Recommendation: defer this** — each chart maintains its own
zoom state independently (current behavior).

---

## Step-by-Step Implementation Checklist

### Phase 1 — Core Component

- [ ] **Create `src/Components/Organisms/BlockTimelineChart.jsx`**
  - Import chart.js + plugins (copy registrations from BlockIOChart)
  - Add `verticalHoverLine` plugin registration (copy from CpuChart)
  - Read `blockData` from `useDataContext()` (no new context needed)
  - Add `selectedMetric` state, default `'tps'`
  - Build `buildTimelineData()` function:
    - `labels`: shared x-axis from `diskArray[0][metric].map(d => d.x)`
    - `datasets`: one per device, colors from palette generator
    - Skip empty datasets (some devices may have no data)
  - Implement chart options:
    - TimeScale x, LinearScale y
    - Zoom/pan plugin (copy config from BlockIOChart)
    - Decimation plugin
    - Disable animations for large datasets
    - `parsing: false`, `normalized: true`
  - Add `chartRef` and `fetchData` for zoom-average calculation
  - Render `<Line>` component

- [ ] **Add controls row** (Flex, below the chart):
  - Metric picker `<Select>` with options: tps, readSec, writeSec, avgRQz, avgQz, awaitMS
  - Use human-readable labels: "Transfers/s", "Read MB/s", "Write MB/s", etc.
  - `<ResetButton chartRef={chartRef} />`
  - `<CopyClipboardButton chartRef={chartRef} />`
  - Zoom level + average display text

### Phase 2 — Integration

- [ ] **Register the new tab in `src/pages/index.jsx`**
  - Import `BlockTimelineChart`
  - Add `{ label: "Block Timeline", key: "9", children: <ChartContainer><BlockTimelineChart /></ChartContainer> }` to `tabItems`

### Phase 3 — Polish

- [ ] **Color palette**: implement deterministic HSL generator
- [ ] **Legend**: set legend position to `'top'`, add `onClick` filter logic
- [ ] **Handle empty state**: show "No block data found" if `diskArray.length === 0`
- [ ] **Handle single-device edge case**: still works as a single line chart
- [ ] **Performance test**: load a large sar file (24h+ of 1s polls) and verify
  scroll/zoom responsiveness. If sluggish, reduce decimation `samples` or
  skip datasets with all-zero values.
- [ ] **Tooltip**: chart.js default tooltip shows all datasets at hovered x.
  For many lines this is noisy. Consider showing only the top-3 by value,
  or config `interaction.mode: 'nearest'` with a vertical line indicator.

---

## Files Touched

| File | Action |
|------|--------|
| `src/Components/Organisms/BlockTimelineChart.jsx` | **Create** (new component) |
| `src/pages/index.jsx` | **Edit** — add tab entry + import |
| No other files | |

No changes to: DataContext, parseData.js, callParse.js, parseAllParallel.js,
DropBox.jsx, colors.js, or any existing Organism.

---

## Why Not a True Heatmap?

A true heatmap (matrix of colored cells: time × device × value) would
need `chartjs-chart-matrix` (community plugin, less proven) or a
custom canvas renderer. The multi-line approach:

- Uses the same chart.js + plugins already in the codebase
- Supports zoom/pan/decimation out of the box
- Leverages the existing `{ x, y }` data format
- Is familiar to users who already understand line charts
- Can be built entirely in ~200 lines of JSX

If heatmap visuals are desired later, it can be an alternative render
mode within the same component controlled by a toggle.

---

## Estimated Complexity

- **New lines of code**: ~250 (BlockTimelineChart.jsx) + ~5 (index.jsx)
- **New dependencies**: 0
- **Parser changes**: 0
- **Context changes**: 0
- **Risk**: Low — purely additive, no existing code paths modified