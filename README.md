# BeforeDawn

這個網站使用 Hexo 建置。請先安裝 Node.js 與 npm，並在專案根目錄執行以下指令。

## 安裝套件

```bash
npm install
```

## 本機執行

```bash
npm run server
```

啟動後開啟 http://localhost:3000/BeforeDawn/。按 `Ctrl+C` 停止伺服器。啟動伺服器時，Tailwind 也會自動監聽檔案變更並更新 `source/assets/css/app.css`；Tailwind 的來源檔為 `source/assets/css/tailwind.css`，請勿直接編輯產生的 `app.css`。

若 3000 埠無法使用，可以改用其他埠，例如：

```bash
npm run server -- -p 3001
```

然後開啟 http://localhost:3001/BeforeDawn/。

## 建置

```bash
npm run build
```

建置時會先更新 Tailwind CSS，產生的靜態網站位於 `public/` 目錄。

若需要將預設頁面複製到 `/zh-tw/` 路徑，可使用：

```bash
npm run build:zh
```

需要清除 Hexo 快取與已產生的檔案時，可先執行 `npm run clean`，再重新建置。
