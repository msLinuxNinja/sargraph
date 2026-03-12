# Sargraph – Copilot Instructions

## Project Overview

Sargraph is a client-side React application that visualizes Linux `sar` (System Activity Reporter) data. Users drag-and-drop SAR text files and the app renders interactive charts for CPU, memory, disk I/O, network, and error metrics. **All processing happens in the browser — no data ever leaves the client.**

Live at: https://sargraph.xyz

## Tech Stack

- **Framework**: React 18 with ReactDOM
- **Language**: TypeScript 4.9.5 (strict mode) + JavaScript (mixed codebase — `.tsx` for entry points, `.js` for components and utilities)
- **UI Library**: Ant Design (dark theme via ConfigProvider)
- **Styling**: Tailwind CSS + custom CSS (preflight disabled)
- **Charting**: Chart.js + react-chartjs-2, chartjs-plugin-zoom, chartjs-adapter-date-fns
- **Icons**: FontAwesome 6 (@fortawesome/react-fontawesome)
- **Routing**: react-router-dom v6
- **Build**: create-react-app (react-scripts), ESLint disabled in build
- **Deployment**: Cloudflare Workers (wrangler) and Docker (nginx)

## Architecture

### Atomic Design Pattern

Components are organized following Atomic Design:

- **Atoms** (`src/Components/Atoms/`): Small reusable UI elements — DropBox, CopyClipButton, LoadingSpin, ResetButton, List, FooterDetails
- **Molecules** (`src/Components/Molecules/`): Composed atoms — ChartContainer, LineChart, FileDetails, TableDetails, TabsContainer
- **Organisms** (`src/Components/Organisms/`): Feature-complete chart components — CpuChart, MemoryChart, MemoryPercntChart, BlockIOChart, NetworkChart, NetworkErrChart, PagingChart

### State Management

Global state uses React Context API via `DataContext.js`. Access state with the `useDataContext()` hook. State includes:
- Metric datasets: cpuData, memoryData, swapData, blockData, netData, netErrData, pagingData
- Selection state: selectedCPU, selectedBlock, selectedInterface
- File metadata: fileDetails (hostname, kernel, date, interval, arch, fileName)
- UI state: isLoading, dataLoaded, hasData

### Data Pipeline

1. File uploaded via DropBox (Ant Design Dragger)
2. Validated for SAR format ("Linux" and "all" keywords)
3. `callParse()` orchestrates two-tier parallel Web Worker parsing
4. **Tier 1** (`readDataParallel`): Chunks raw text, spawns workers based on `navigator.hardwareConcurrency`
5. **Tier 2** (`parseAllParallel`): One worker per metric type
6. `parseData.js` (~800 lines) contains all parsing logic with RHEL7/RHEL8+ version detection
7. Parsed data flows into Context, charts render via Chart.js

### Performance

- Multi-threaded parsing via Web Workers
- Adaptive downsampling based on SAR polling interval
- Chart.js decimation plugin for render-time reduction

## Code Conventions

- **File naming**: PascalCase for components (`CpuChart.js`), camelCase for utilities (`parseData.js`)
- **Exports**: Default exports for components, named exports for utilities
- **State setters**: `set{Metric}()` pattern (e.g., `setMemoryData`, `setCpuData`)
- **Hooks**: `use{Name}()` pattern (e.g., `useDataContext`)
- **Imports**: Absolute for packages, relative for local files
- **TypeScript**: Entry points (App.tsx, index.tsx, LoadingSpin.tsx) use TypeScript; components and utils are JavaScript
- **No tests exist** — testing libraries are installed but unused

## Build & Run

```bash
npm install -f          # Force install (handles dependency conflicts)
npm start               # Dev server on localhost:3000
npm run build           # Production build to /build
docker build -t sargraph .  # Docker image
```

## Key Implementation Notes

- Date parsing uses hardcoded `GMT-0600` timezone offset as sar does not provide timezone and timezone doesn't matter much as sar is 24hrs of data regardless of timezone
- Clipboard API (canvas copy) works in Chrome/Edge only; button hidden in Firefox
- Color palette defined in `src/Utils/colors.js` (7 color pairs)
- Custom `verticalHoverLine` Chart.js plugin draws a vertical line on hover
- Distro icons (Fedora, RedHat, generic Linux) detected from kernel string
- SAR format differences: RHEL7 memory section has 11 columns, RHEL8+ has 17
