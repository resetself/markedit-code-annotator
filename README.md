# MarkEdit Code Annotator
为 [MarkEdit](http://tiny.cc/markedit)预览增强脚本 —— 通过行尾注释标记（如 `// SOURCE`、`// IMPORTANT`、`// WARNING` 等）自动高亮对应代码行。  
适用于**污点跟踪分析**、代码审查、教学标注、安全审计等场景。

## ✨ 特性

- ✅ **完全可配置**：关键词、背景色、文字色、加粗、是否隐藏标记均可自定义  
- ✅ **保留语法高亮**：不破坏原有 highlight.js 高亮样式  
- ✅ **单文件注入**：只有一个 `markedit-code-annotator.js`，即插即用  
- ✅ **自动监听**：预览区内容变化实时生效，无需刷新  
- ✅ **支持多套标记**：可同时使用通用标记（`IMPORTANT`/`WARNING`/`ERROR`）和污点跟踪标记（`SOURCE`/`PROP`/`SINK`）

## 📦 一键安装

在终端执行以下命令：

```bash
curl -o ~/Library/Containers/app.cyan.markedit/Data/Documents/scripts/markedit-code-annotator.js https://raw.githubusercontent.com/resetself/markedit-code-annotator/main/index.js
```
重启 MarkEdit 即可。


## 🚀 快速示例
在代码行尾添加标记，预览时整行就会高亮：

示例一：通用标注（IMPORTANT 、 WARNING 、ERROR）
```javascript
function initSystem(configPath) {
  // 必须使用绝对路径，否则无法加载
  const absPath = path.resolve(configPath);       // IMPORTANT

  if (!fs.existsSync(absPath)) {
    // 配置文件不存在，系统无法启动
    throw new Error(`Config not found: ${absPath}`);  // ERROR
  }

  let config;
  try {
    config = JSON.parse(fs.readFileSync(absPath, 'utf8'));
  } catch (err) {
    // JSON 解析失败，属于严重错误
    logger.fatal('配置解析错误', err);            // ERROR
    process.exit(1);
  }

  //未设置 API 密钥，可能影响外部服务调用
  if (!config.apiKey) {
    console.warn('Missing API key, some features may fail');  // WARNING
  }

  // 生产环境必须开启 HTTPS
  if (process.env.NODE_ENV === 'production' && !config.https) {
    throw new Error('Production requires HTTPS');     // IMPORTANT
  }

  // 使用默认密码强度配置，存在安全风险
  if (config.passwordStrength === 'weak') {           // WARNING
    console.warn('Weak password policy is not recommended');
  }

  return config;
}
````
![taint](/images/01.png)

示例二：污点跟踪（SOURCE → PROP → SINK）
```javascript
app.post('/profile', (req, res) => {
  let userId = req.body.id;                 // SOURCE
  let option = req.body.opt;                // SOURCE（多源）

  // 经过字符串拼接（污点传播）
  let query = "SELECT * FROM users WHERE id = " + userId;   // PROP
  let cmd = "echo " + option;                               // PROP

  // 条件分支中的继续传播
  if (userId !== 'admin') {
    query += " AND status = 1";             // PROP
  }

  // 执行 SQL 查询（危险汇聚点）
  db.exec(query, (err, rows) => {           // SINK
    if (err) throw err;
    res.json(rows);
  });

  // 执行系统命令（另一个危险汇聚点）
  exec(cmd, (err, stdout) => {              // SINK
    console.log(stdout);
  });
});
```
![taint](/images/02.png)


## ⚙️ 配置方法
编辑 custom.js 顶部的 CONFIG 对象：
```javascript
const CONFIG = {
  rules: [
    {
      keyword: "SOURCE",           // 行内标记（例如 "// SOURCE"）
      className: "line-source",    // CSS 类名
      background: "#cfe4ff",       // 背景色
      color: "#1a3e6f",            // 文字色
      bold: false,                 // 是否加粗
      hideMarker: true,            // 是否隐藏标记本身
    },
    // 添加更多规则...
  ],
};
```
你可以：

* 修改现有规则的颜色、文字、粗细

* 删除不需要的规则

* 新增任意关键词（例如 TODO、FIXME、REVIEW）

* 修改后保存文件并重启 MarkEdit 即可生效。

## License

[MIT](LICENSE) ©resetself
