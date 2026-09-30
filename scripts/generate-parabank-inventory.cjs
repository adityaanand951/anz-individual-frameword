const fs = require('node:fs');
const path = require('node:path');
const ExcelJS = require('exceljs');

const root = path.resolve(__dirname, '..');
const sourcePath = path.join(root, 'docs', 'parabank-test-inventory.md');
const outputPath = path.join(root, 'docs', 'parabank-test-inventory.xlsx');
require('dotenv').config({ path: path.join(root, '.env') });
const markdown = fs.readFileSync(sourcePath, 'utf8');
const tableLines = markdown.split(/\r?\n/).filter((line) => /^\| TC-/.test(line));

const columns = [
  'Test Case ID',
  'Module',
  'Scenario Description',
  'Test Type',
  'Priority',
  'Complexity',
  'Day Assigned',
  'Day Completed',
  'Automation Status',
  'Execution Result',
  'Reusable Component (Y/N)',
  'Defect Raised (Y/N)',
  'Defect ID / Link',
  'Notes',
  'Execution Scope'
];

const sourceColumnCount = columns.length - 1;
const apiOnlyCaseIds = new Set([
  'TC-ACC-001',
  'TC-ACC-012',
  'TC-ACC-013',
  'TC-ACC-014',
  'TC-ACC-015',
  'TC-TRF-018'
]);
const androidDeviceUdids = Array.from(new Set(
  (process.env.PARABANK_ANDROID_DEVICE_UDIDS ??
    process.env.ANDROID_DEVICE_UDIDS ??
    'emulator-5554,emulator-5556,emulator-5558')
    .split(',')
    .map((device) => device.trim())
    .filter(Boolean)
));
const androidDeviceNames = (process.env.ANDROID_AVD_NAMES ??
  'Pixel_10_Pro_Fold,Pixel_10_Pro,Pixel_6')
  .split(',')
  .map((name) => name.trim());
const mobileViewportNames = [
  'mobile-iphone-13',
  'mobile-pixel-5',
  'mobile-galaxy-s9',
  'mobile-iphone-12',
  'mobile-pixel-7'
];

const rows = tableLines.map((line) => {
  const values = line.slice(1, -1).split('|').map((value) => value.trim());
  if (values.length !== sourceColumnCount) {
    throw new Error(`Inventory row has ${values.length} columns; expected ${sourceColumnCount}: ${line}`);
  }
  return [
    ...values,
    apiOnlyCaseIds.has(values[0])
      ? 'API only - run once'
      : 'UI + API - desktop and mobile targets'
  ];
});

if (rows.length !== 77) {
  throw new Error(`Expected 77 test case rows in ${sourcePath}; found ${rows.length}`);
}

const apiOnlyRows = rows.filter((row) => apiOnlyCaseIds.has(row[0]));
if (apiOnlyRows.length !== apiOnlyCaseIds.size) {
  throw new Error(`Expected ${apiOnlyCaseIds.size} API-only case rows; found ${apiOnlyRows.length}`);
}

const uiCaseCount = rows.length - apiOnlyRows.length;
const totalProjectExecutions = rows.length + uiCaseCount * (
  mobileViewportNames.length + androidDeviceUdids.length
);

async function generate() {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Automation Team';
  workbook.subject = 'ParaBank Days 1-5 automated test case inventory';
  workbook.title = 'ParaBank Test Case Inventory';
  workbook.created = new Date();
  workbook.modified = new Date();

  const summary = workbook.addWorksheet('Summary', {
    properties: { tabColor: { argb: 'FF00A3E0' } },
    views: [{ state: 'frozen', ySplit: 1 }]
  });
  summary.columns = [
    { header: 'Metric', key: 'metric', width: 38 },
    { header: 'Value', key: 'value', width: 26 }
  ];
  summary.addRows([
    ['Scope', 'Days 1-5 (provided plan)'],
    ['Unique test cases', rows.length],
    ['API-only cases (desktop project)', apiOnlyRows.length],
    ['Cross-platform UI cases', uiCaseCount],
    ['Total project executions', totalProjectExecutions],
    ['Execution rule', 'API-only cases run once; UI cases run on every configured target.'],
    ['Public demo note', 'Full-suite execution was throttled (HTTP 429); use an approved isolated target.'],
    [],
    ['Executions by target', 'Cases'],
    ['desktop-chromium', rows.length],
    ...mobileViewportNames.map((name) => [name, uiCaseCount]),
    ...androidDeviceUdids.map((udid, index) => [
      `android-${androidDeviceNames[index] || udid}`,
      uiCaseCount
    ]),
    [],
    ['Cases by assigned day', 'Count'],
    ...[1, 2, 3, 4, 5].map((day) => [
      `Day ${day}`,
      rows.filter((row) => Number(row[6]) === day).length
    ]),
    [],
    ['Cases by module', 'Count'],
    ...[...new Set(rows.map((row) => row[1]))].sort().map((module) => [
      module,
      rows.filter((row) => row[1] === module).length
    ]),
    [],
    ['Public demo observations', 'Expected-failure checks track observed gaps: blank phone registration and account opening from zero balance.'],
    ['Status definitions', 'Automation Status describes implementation; Execution Result describes runtime verification.']
  ]);
  styleHeader(summary.getRow(1));
  summary.getColumn(1).font = { bold: true, color: { argb: 'FF1F2937' } };
  summary.eachRow((row, rowNumber) => {
    if (rowNumber > 1 && ['Executions by target', 'Cases by assigned day', 'Cases by module'].includes(row.getCell(1).value)) {
      styleHeader(row);
    }
    row.alignment = { vertical: 'top', wrapText: true };
  });

  const inventory = workbook.addWorksheet('Test Cases', {
    properties: { tabColor: { argb: 'FF2563EB' } },
    views: [{ state: 'frozen', ySplit: 1, xSplit: 2, showGridLines: false }]
  });
  inventory.columns = [
    { header: columns[0], key: 'id', width: 17 },
    { header: columns[1], key: 'module', width: 19 },
    { header: columns[2], key: 'scenario', width: 76 },
    { header: columns[3], key: 'type', width: 19 },
    { header: columns[4], key: 'priority', width: 12 },
    { header: columns[5], key: 'complexity', width: 13 },
    { header: columns[6], key: 'dayAssigned', width: 13 },
    { header: columns[7], key: 'dayCompleted', width: 15 },
    { header: columns[8], key: 'automation', width: 19 },
    { header: columns[9], key: 'execution', width: 23 },
    { header: columns[10], key: 'reusable', width: 23 },
    { header: columns[11], key: 'defectRaised', width: 19 },
    { header: columns[12], key: 'defectLink', width: 20 },
    { header: columns[13], key: 'notes', width: 52 },
    { header: columns[14], key: 'executionScope', width: 43 }
  ];
  inventory.addRows(rows);
  inventory.autoFilter = { from: 'A1', to: `O${rows.length + 1}` };
  styleHeader(inventory.getRow(1));

  inventory.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    row.height = 35;
    row.alignment = { vertical: 'top', wrapText: true };
    if (rowNumber % 2 === 1) {
      row.eachCell((cell) => {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F7FC' } };
      });
    }
    const priorityCell = row.getCell(5);
    priorityCell.font = {
      bold: true,
      color: { argb: priorityCell.value === 'High' ? 'FFB91C1C' : 'FF92400E' }
    };
    const executionCell = row.getCell(10);
    executionCell.font = { color: { argb: 'FF7C2D12' } };
    if (String(row.getCell(14).value).includes('Expected failure')) {
      row.getCell(14).font = { color: { argb: 'FFB91C1C' }, italic: true };
    }
    row.getCell(15).font = { color: { argb: 'FF1F4E78' } };
  });

  await workbook.xlsx.writeFile(outputPath);
  console.log(
    `Wrote ${rows.length} test cases and ${totalProjectExecutions} platform executions to ${path.relative(root, outputPath)}`
  );
}

function styleHeader(row) {
  row.height = 28;
  row.eachCell((cell) => {
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF12304A' } };
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.alignment = { vertical: 'middle', wrapText: true };
    cell.border = { bottom: { style: 'medium', color: { argb: 'FF00A3E0' } } };
  });
}

generate().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
