# GitHub 寫入授權：Yuliya × Chih-hsing

上一輪可讀取儲存庫，但建立原始碼樹與更新 README 都回覆 `403 Resource not accessible by integration`。這代表所用的連線憑證權限不足；即使你的 GitHub 帳號是管理員，應用程式仍需要自己的存取授權。[GitHub 錯誤說明](https://docs.github.com/en/rest/using-the-rest-api/troubleshooting-the-rest-api#resource-not-accessible)

## 1. 確認這個 repo 已授權

在已登入 HangOnStill 的瀏覽器開啟 [Installed GitHub Apps](https://github.com/settings/installations)。也可以從 GitHub 頭像 → Settings → Applications → Installed GitHub Apps 進入。

找到這次 ChatGPT / OpenAI / Codex 連線所使用的應用程式，點 Configure。應用名稱以你的安裝清單為準。Repository access 若為 Only select repositories，就加入 `Yuliya-X-Chih-hsing-website` 並按 Save；不需要為此開放所有儲存庫。[官方操作說明](https://docs.github.com/en/apps/using-github-apps/reviewing-and-modifying-installed-github-apps)

## 2. 檢查 Contents 寫入權限

在同一頁的 Permissions 查看 Repository contents / Contents。上傳或修改程式碼需要 Contents 的 write 權限，畫面通常以 Read and write 表示。[檔案寫入 API 所需權限](https://docs.github.com/en/rest/repos/contents#create-or-update-file-contents)

如果應用提出新的權限要求，檢查 GitHub 通知或頁面中的權限更新提示，確認包含所需的 Contents 寫入權限後核准。沒有核准時，應用會繼續使用原來的權限。[批准應用權限更新](https://docs.github.com/en/apps/using-github-apps/approving-updated-permissions-for-a-github-app)

**若只有 Read-only 而沒有權限更新要求，不能保證重新登入就會變成 Read and write。** 安裝頁讓你選擇應用可存取的儲存庫；它授予的是應用本身已要求的權限，並非讓使用者自由新增任意 API 權限。這時需要支援寫入的連線，或由該應用提供權限升級。提供 Permissions 區塊的截圖即可協助判斷，不需要提供憑證。

## 3. 更新 ChatGPT 的連線

完成 GitHub 端授權後，回到 ChatGPT 的 Plugins → Installed → GitHub 查看連線設定；若介面提供重新連線或重新驗證，完成其官方登入流程，再回到此對話告知授權已更新。不同版本的連線控制位置可能不同。應用的登入授權和 ChatGPT 是否先詢問你再寫入，是不同層次；調整「允許所有動作」不會替 GitHub 憑證增加權限。[OpenAI：外掛與外部服務權限](https://learn.chatgpt.com/docs/plugins#how-permissions-and-data-sharing-work)

## 4. 原始碼上傳後啟用 Pages

GitHub 原始碼上傳成功後，儲存庫 Settings → Pages → Deploy from a branch → main → /docs → Save。這個專案的 GitHub Pages 只提供入口；有資料庫、照片、錄音及未來信件鎖定的完整版仍在 README 所列網站，並保留原有私人存取設定。
