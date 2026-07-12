# 專案工程規則

## PDF 與資料模型

- PDF／AcroForm 是欄位資料的唯一持久化與交換格式。不得新增、恢復或依賴 JSON sidecar 匯入／匯出流程。
- 本專案建立的欄位名稱必須使用 `pdfEditor.*` 前綴，並統一透過欄位名稱 codec 建立與解析；不得在 UI、reader 或 writer 中自行拼接名稱。
- 第三方 AcroForm 欄位可由 Signer 填寫支援的值，但 Designer 不得修改其 geometry、名稱、flags、widget structure 或其他結構性設定。
- 除非使用者明確選擇「扁平化定稿」，不得呼叫 flatten 或將可編輯欄位轉為頁面內容。Designer 與一般 Signer 匯出結果都必須保持可編輯。

## 簽名與安全

- 手寫簽名只代表視覺外觀，不得描述為數位簽章、憑證簽章或具有密碼學驗證能力。
- `certificateSignature` placeholder 與 CMS／PAdES 簽署是兩個獨立階段；建立欄位不得宣稱簽署已完成。
- 私鑰不得儲存、匯入或處理於瀏覽器端。憑證簽署必須經由後端或遠端簽章服務完成。
- 修改已簽署 PDF 可能破壞既有簽章。讀取到數位簽章時，任何會變更 PDF 的操作都必須警告使用者。

## 相容性與驗證

- XFA 不在支援範圍內。偵測到 XFA 時須顯示明確且可採取行動的錯誤，不得靜默轉換、刪除或覆寫。
- 不支援或無法辨識的 AcroForm 欄位必須原樣保留，不得讓 UI 誤示其可安全編輯或已成功填寫。
- 所有座標轉換異動都必須包含頁面 rotation 與 CropBox 非原點情境的測試，並驗證 PDF 座標與 Canvas 座標可雙向轉換。
- reader、writer 或 appearance 產生邏輯的異動，必須通過 round-trip 測試：讀取 PDF → 修改／填寫 → 匯出 → 重新讀取，並確認欄位名稱、種類、頁面、座標、值、flags 與可編輯性符合預期。
- writer 異動至少驗證本專案欄位、第三方欄位保留、中文內容、多頁文件及旋轉頁；涉及簽章時另驗證簽章狀態與警告流程。
