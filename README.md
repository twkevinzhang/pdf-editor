# PDF Editor

無伺服器的 PDF 表單設計與填寫工具。專案以標準 AcroForm 作為唯一的欄位儲存格式，不再使用 JSON sidecar。

## 文件流程

1. Designer 上傳 PDF、建立或編排本專案欄位，匯出仍可編輯的 AcroForm 範本。
2. Signer 只需上傳一個 PDF，填寫支援的 AcroForm 欄位，匯出仍可編輯的 PDF。
3. 只有使用者明確選擇「扁平化定稿」時，才將欄位內容轉為不可編輯的頁面內容。

本專案建立的欄位名稱一律使用 `pdfEditor.*` 前綴，並由欄位名稱 codec 建立及解析。

## V1 欄位

- 文字（text）
- 日期（date，以文字欄位搭配日期格式與驗證）
- 手寫簽名（handwrittenSignature）
- 憑證簽章欄位（certificateSignature）

手寫簽名只是簽名外觀，不具密碼學驗證能力。`certificateSignature` 所建立的欄位或 placeholder，也不等於已完成憑證簽署；CMS／PAdES 簽署是另一個步驟，必須由後端或遠端簽章服務安全地持有私鑰並完成簽署。瀏覽器端不得保存私鑰。

## 第三方 AcroForm 相容策略

Signer 可填寫外部 PDF 中 V1 支援的標準 AcroForm 欄位。Designer 會保留第三方欄位，但不允許修改其位置、名稱、flags 或 widget 結構。

這項限制的 trade-off 是：Designer 無法完整重編外部表單，但可降低破壞多 widget 關係、欄位計算、PDF JavaScript、既有 appearance 或閱讀器相容性的風險。若要完整管理欄位，應在 Designer 內建立帶有 `pdfEditor.*` 前綴的新欄位。

XFA 表單不在支援範圍內；偵測到 XFA 時應明確提示，且不得默默轉換或破壞原始結構。無法辨識或尚未支援的 AcroForm 欄位應原樣保留，Designer 不得編輯，Signer 亦不得假裝已成功寫入。

已含數位簽章的 PDF 在任何欄位或頁面內容變更後，都可能使簽章失效。介面與匯出流程必須先警告使用者；完成 CMS／PAdES 簽署後的檔案應視為定稿文件。

## 開始使用

```shell
yarn install
yarn start
```

## 致謝

- https://github.com/snamoah/react-pdf-editor
- https://github.com/bokuweb/re-resizable
- https://github.com/clauderic/dnd-kit
