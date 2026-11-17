async function applyIpadMiniScreenshotAppearance(page) {
  await page.addStyleTag({ content: `
    select.form-control {
      -webkit-appearance: none !important;
      appearance: none !important;
      background-color: #0d1117 !important;
      color: #fff !important;
      border: 1px solid #30363d !important;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 8'%3E%3Cpath d='m1 1 5 5 5-5' fill='none' stroke='%23fff' stroke-width='2'/%3E%3C/svg%3E") !important;
      background-repeat: no-repeat !important;
      background-position: right 10px center !important;
      background-size: 12px 8px !important;
      padding-right: 30px !important;
    }
  ` });
}

module.exports = { applyIpadMiniScreenshotAppearance };
