# GitHub 連線與上傳

儲存庫公開只改變可讀性，不會授予 ChatGPT 寫入權限。

## 正確的連線

使用 ChatGPT 已安裝的 GitHub 外掛。GitHub Marketplace 中標示 Action 的 ChatGPT Reviewer、Butler 等項目不是此連線，不需安裝。GitHub Enterprise 不適用於一般 github.com 個人儲存庫。

從 ChatGPT GitHub 外掛的 Connected 選單查看連線管理；若提供重新連線或重新驗證，使用官方流程，以 HangOnStill 帳號登入並選取 Yuliya-X-Chih-hsing-website。不要把 token 貼到對話。

在 GitHub Settings → Applications → Installed GitHub Apps 檢查該流程安裝的應用，點 Configure，確認 Repository access 包含此儲存庫。[GitHub 官方說明](https://docs.github.com/en/apps/using-github-apps/reviewing-and-modifying-installed-github-apps)

## 為何沒有 Contents 下拉選單

Installed GitHub Apps 的權限由應用要求；使用者通常只能檢視、批准新增要求及調整儲存庫範圍，不能自行把 Contents 改為 Read and write。不要為此建立自己的 GitHub App，或更改不相關的 Actions Workflow permissions。

如果該連線僅提供讀取權限，必須改用支援寫入的官方連線流程。顯示 Connected 不代表已有儲存庫安裝授權。ChatGPT 的 Allow low-risk actions 是動作審核設定，不會提升 GitHub 權限。[OpenAI 外掛說明](https://learn.chatgpt.com/docs/plugins)

## 連線已修復（2026-09-10）

已確認 HangOnStill 的 ChatGPT Codex Connector 安裝，並成功寫入 README。網站原始碼使用 GitHub API 提交，無須新增 GPTCodex.yml 或安裝 Marketplace Actions。

公開網址與兩人存取限制，請參閱 README 的 Access and hosting 及 Restrict to two people later。
