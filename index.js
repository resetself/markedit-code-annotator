const CONFIG = {
  rules: [
    // 通用标记（可选）
    {
      keyword: "IMPORTANT",
      className: "line-important",
      background: "#fff2b5",
      color: "#9c7e1c",
      bold: true,
      hideMarker: true,
    },
    {
      keyword: "WARNING",
      className: "line-warning",
      background: "#f9b953",
      color: "#5c2d00",
      bold: true,
      hideMarker: true,
    },
    {
      keyword: "ERROR",
      className: "line-error",
      background: "#fbe3e3",
      color: "#971212",
      bold: true,
      hideMarker: true,
    },
    // 污点跟踪专用（推荐）
    {
      keyword: "SOURCE",
      className: "line-source",
      background: "#cfe4ff",
      color: "#1a3e6f",
      bold: false,
      hideMarker: true,
    },
    {
      keyword: "PROP",
      className: "line-prop",
      background: "#fdf4bf",
      color: "#7a6603",
      bold: false,
      hideMarker: true,
    },
    {
      keyword: "SINK",
      className: "line-sink",
      background: "#fbe3e3",
      color: "#971212",
      bold: true,
      hideMarker: true,
    },
    // 示例：TODO / FIXME（取消注释即可启用）
    // {
    //   keyword: "TODO",
    //   className: "line-todo",
    //   background: "#e0e0e0",
    //   color: "#2c3e50",
    //   bold: false,
    //   hideMarker: true,
    // },
    // {
    //   keyword: "FIXME",
    //   className: "line-fixme",
    //   background: "#c39bd3",
    //   color: "#2e1a47",
    //   bold: true,
    //   hideMarker: true,
    // },
  ],
  additionalStyles: `
    /* 可选：调整行高、圆角等全局样式 */
  `,
};

(function injectStyles() {
  if (document.getElementById("code-annotator-styles")) return;
  const style = document.createElement("style");
  style.id = "code-annotator-styles";
  let css = `
    .code-line {
      display: block;
      white-space: pre-wrap;
      padding: 2px 8px;
      margin: 0 -8px;
      border-radius: 4px;
    }
  `;
  CONFIG.rules.forEach((rule) => {
    css += `
      .code-line.${rule.className} {
        background: ${rule.background} !important;
        color: ${rule.color} !important;
        ${rule.bold ? "font-weight: bold !important;" : ""}
      }
    `;
  });
  css += CONFIG.additionalStyles;
  style.textContent = css;
  document.head.appendChild(style);
})();

function markSpecialComments() {
  document.querySelectorAll(".markdown-body pre code").forEach((block) => {
    if (block.querySelector(".code-line")) return;
    let rawHtml = block.innerHTML;
    let lines = rawHtml.split(/\r?\n/);
    if (lines.length < 2) return;
    let wrappedHtml = "";
    for (let line of lines) {
      let matchedClass = "";
      let plainText = line.replace(/<[^>]*>/g, "");
      for (let rule of CONFIG.rules) {
        if (plainText.includes(`// ${rule.keyword}`)) {
          matchedClass = rule.className;
          if (rule.hideMarker) {
            const regex = new RegExp(`\\/\\/\\s*${rule.keyword}\\b`, "g");
            line = line.replace(regex, "");
            line = line.replace(/\/\/\s*$/, "");
          }
          break;
        }
      }
      wrappedHtml += `<span class="code-line ${matchedClass}">${line}</span>\n`;
    }
    block.innerHTML = wrappedHtml.trimEnd();
  });
}

new MutationObserver(() => markSpecialComments()).observe(document.body, {
  childList: true,
  subtree: true,
});
setTimeout(markSpecialComments, 300);
