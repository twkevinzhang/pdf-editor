import React from 'react';
import styled from 'styled-components';
import { AlertTriangle, Lock, ShieldCheck, Trash2 } from 'lucide-react';
import { useDocument } from '../../application/DocumentStore';
import { Theme, UIButton } from '../../styles/DesignSystem';

const InspectorContainer = styled.aside<{ $signer: boolean }>`
  width: 300px;
  flex: 0 0 300px;
  min-width: 0;
  background: ${Theme.colors.surface};
  border-left: 1px solid ${Theme.colors.border};
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  overflow-y: auto;
  z-index: 900;

  @media (max-width: 980px) {
    width: 260px;
    flex-basis: 260px;
    padding: 20px;
  }

  @media (max-width: 700px) {
    ${(props) =>
      props.$signer
        ? `
      position: fixed;
      left: 0;
      right: 0;
      bottom: 0;
      width: auto;
      height: 250px;
      flex-basis: auto;
      border-left: 0;
      border-top: 1px solid ${Theme.colors.border};
      border-radius: 20px 20px 0 0;
      box-shadow: 0 -8px 30px rgba(0, 0, 0, 0.12);
      padding: 18px 20px calc(18px + env(safe-area-inset-bottom));
    `
        : `
      width: 240px;
      flex-basis: 240px;
      padding: 16px;
    `}
  }
`;

const InspectorHeading = styled.div`
  font-size: 18px;
  font-weight: 700;
`;

const SectionTitle = styled.div`
  font-size: 12px;
  font-weight: 700;
  color: ${Theme.colors.secondary};
  text-transform: uppercase;
  letter-spacing: 0.6px;
  margin-bottom: 2px;
`;

const PropertyGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 7px;
`;

const Label = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: #1d1d1f;
`;

const Input = styled.input<{ $invalid?: boolean }>`
  width: 100%;
  box-sizing: border-box;
  padding: 9px 11px;
  border-radius: ${Theme.radius.small};
  border: 1px solid
    ${(props) => (props.$invalid ? Theme.colors.danger : Theme.colors.border)};
  background: ${(props) => (props.disabled ? '#f5f5f7' : '#fff')};
  color: #1d1d1f;
  font-size: 14px;
  outline: none;

  &:focus {
    border-color: ${Theme.colors.primary};
    box-shadow: 0 0 0 3px rgba(0, 113, 227, 0.12);
  }
`;

const TextArea = styled.textarea<{ $invalid?: boolean }>`
  width: 100%;
  box-sizing: border-box;
  min-height: 86px;
  resize: vertical;
  padding: 9px 11px;
  border-radius: ${Theme.radius.small};
  border: 1px solid
    ${(props) => (props.$invalid ? Theme.colors.danger : Theme.colors.border)};
  font: inherit;
  outline: none;

  &:focus {
    border-color: ${Theme.colors.primary};
  }
`;

const Select = styled.select`
  width: 100%;
  box-sizing: border-box;
  padding: 9px 11px;
  border-radius: ${Theme.radius.small};
  border: 1px solid ${Theme.colors.border};
  background: white;
  font-size: 14px;
`;

const CheckboxGroup = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  cursor: pointer;
`;

const Notice = styled.div<{ $warning?: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 9px;
  padding: 11px 12px;
  border-radius: ${Theme.radius.small};
  background: ${(props) => (props.$warning ? '#fff8e8' : '#f3f6fa')};
  color: ${(props) => (props.$warning ? '#8a5600' : '#46505a')};
  border: 1px solid ${(props) => (props.$warning ? '#f1d08a' : '#dde3e9')};
  font-size: 12px;
  line-height: 1.45;

  svg {
    flex: 0 0 auto;
    margin-top: 1px;
  }
`;

const ErrorText = styled.div`
  color: ${Theme.colors.danger};
  font-size: 12px;
`;

const TYPE_LABELS = {
  text: '文字',
  date: '日期',
  handwrittenSignature: '手寫簽名',
  certificateSignature: '憑證簽章預留欄位',
};

export const Inspector: React.FC = () => {
  const {
    fields,
    activeFieldId,
    updateField,
    removeField,
    appMode,
    validationErrors,
  } = useDocument();
  const activeField = fields.find((field) => field.id === activeFieldId);
  const isDesigner = appMode === 'designer';
  const isSigner = appMode === 'signer';

  if (!activeField) {
    return (
      <InspectorContainer $signer={isSigner}>
        <InspectorHeading>
          {isDesigner ? '欄位屬性' : '填寫欄位'}
        </InspectorHeading>
        <div
          style={{
            color: Theme.colors.secondary,
            textAlign: 'center',
            margin: '64px 12px 0',
            lineHeight: 1.6,
          }}
        >
          {isDesigner
            ? '選取欄位以檢視或編輯屬性。新增欄位時，請先選擇上方工具，再點擊 PDF 頁面。'
            : '點選 PDF 上的欄位開始填寫。欄位位置在簽署模式中會保持鎖定。'}
        </div>
      </InspectorContainer>
    );
  }

  const canConfigure = isDesigner && activeField.source === 'project';
  const canFill =
    isSigner &&
    !activeField.readOnly &&
    activeField.type !== 'certificateSignature';
  const fieldError = validationErrors[activeField.id];

  const handleSignatureUpload = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      updateField(activeField.id, {
        value: loadEvent.target?.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <InspectorContainer $signer={isSigner}>
      <InspectorHeading>
        {isDesigner ? '欄位屬性' : '填寫欄位'}
      </InspectorHeading>

      <SectionTitle>一般</SectionTitle>
      <PropertyGroup>
        <Label>類型</Label>
        <div style={{ fontSize: 14, color: Theme.colors.secondary }}>
          {TYPE_LABELS[activeField.type]}
        </div>
      </PropertyGroup>

      <PropertyGroup>
        <Label>來源</Label>
        <div style={{ fontSize: 14, color: Theme.colors.secondary }}>
          {activeField.source === 'project' ? 'PDF Editor' : '外部 AcroForm'}
        </div>
      </PropertyGroup>

      {isDesigner && activeField.source === 'external' && (
        <Notice>
          <Lock size={16} />
          <span>
            外部 AcroForm 欄位在 Designer
            中僅供檢視。為避免破壞既有結構，其名稱、屬性與位置均不會被修改。
          </span>
        </Notice>
      )}

      {canConfigure && (
        <>
          <PropertyGroup>
            <Label htmlFor="field-label">顯示標籤</Label>
            <Input
              id="field-label"
              value={activeField.label}
              onChange={(event) =>
                updateField(activeField.id, { label: event.target.value })
              }
              placeholder="例如：申請人姓名"
            />
          </PropertyGroup>

          <PropertyGroup>
            <Label>AcroForm 名稱</Label>
            <Input value={activeField.acroName} disabled />
          </PropertyGroup>

          {(activeField.type === 'text' || activeField.type === 'date') && (
            <PropertyGroup>
              <Label>預設值</Label>
              <Input
                value={activeField.defaultValue ?? ''}
                onChange={(event) =>
                  updateField(activeField.id, {
                    defaultValue: event.target.value || undefined,
                  })
                }
                placeholder={
                  activeField.type === 'date'
                    ? activeField.dateFormat ?? 'YYYY-MM-DD'
                    : '選填'
                }
              />
            </PropertyGroup>
          )}

          {activeField.type === 'text' && (
            <>
              <PropertyGroup>
                <Label>最大字數</Label>
                <Input
                  type="number"
                  min={1}
                  value={activeField.maxLength ?? ''}
                  onChange={(event) =>
                    updateField(activeField.id, {
                      maxLength: event.target.value
                        ? Math.max(1, Number(event.target.value))
                        : undefined,
                    })
                  }
                  placeholder="不限制"
                />
              </PropertyGroup>
              <CheckboxGroup>
                <input
                  type="checkbox"
                  checked={Boolean(activeField.multiline)}
                  onChange={(event) =>
                    updateField(activeField.id, {
                      multiline: event.target.checked,
                    })
                  }
                />
                多行文字
              </CheckboxGroup>
            </>
          )}

          {activeField.type === 'date' && (
            <PropertyGroup>
              <Label>日期格式</Label>
              <Select
                value={activeField.dateFormat ?? 'YYYY-MM-DD'}
                onChange={(event) =>
                  updateField(activeField.id, {
                    dateFormat: event.target.value,
                  })
                }
              >
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                <option value="YYYY/MM/DD">YYYY/MM/DD</option>
              </Select>
            </PropertyGroup>
          )}

          {activeField.type === 'handwrittenSignature' && (
            <SignatureUpload
              value={activeField.value}
              onChange={handleSignatureUpload}
              label="範本預覽（選填）"
            />
          )}

          {activeField.type === 'certificateSignature' && (
            <Notice $warning>
              <ShieldCheck size={17} />
              <span>
                此欄位只建立標準 /Sig placeholder，不代表文件已簽署。CMS／PAdES
                憑證簽署必須由後端或遠端簽章服務完成，瀏覽器不會處理私鑰。
              </span>
            </Notice>
          )}

          <CheckboxGroup>
            <input
              type="checkbox"
              checked={activeField.required}
              onChange={(event) =>
                updateField(activeField.id, { required: event.target.checked })
              }
            />
            必填欄位
          </CheckboxGroup>
          <CheckboxGroup>
            <input
              type="checkbox"
              checked={activeField.readOnly}
              onChange={(event) =>
                updateField(activeField.id, { readOnly: event.target.checked })
              }
            />
            唯讀
          </CheckboxGroup>

          <div style={{ flex: 1 }} />
          <UIButton
            onClick={() => removeField(activeField.id)}
            style={{
              color: Theme.colors.danger,
              borderColor: Theme.colors.danger,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <Trash2 size={16} />
            刪除欄位
          </UIButton>
        </>
      )}

      {isSigner && (
        <>
          <SectionTitle>填寫內容</SectionTitle>
          {activeField.readOnly && (
            <Notice>
              <Lock size={16} />
              <span>這是唯讀欄位，無法在此變更內容。</span>
            </Notice>
          )}

          {activeField.type === 'certificateSignature' ? (
            <Notice $warning>
              <AlertTriangle size={17} />
              <span>
                這是憑證簽章預留欄位，不是手寫簽名。此應用程式不會在瀏覽器中執行或假裝完成數位簽章；請在匯出後交由受信任的
                CMS／PAdES 簽章服務處理。
              </span>
            </Notice>
          ) : activeField.type === 'handwrittenSignature' ? (
            <SignatureUpload
              value={activeField.value}
              onChange={handleSignatureUpload}
              disabled={!canFill}
              label="手寫簽名圖片"
            />
          ) : activeField.multiline ? (
            <PropertyGroup>
              <Label htmlFor="field-value">{activeField.label}</Label>
              <TextArea
                id="field-value"
                value={activeField.value ?? ''}
                disabled={!canFill}
                maxLength={activeField.maxLength}
                $invalid={Boolean(fieldError)}
                onChange={(event) =>
                  updateField(activeField.id, { value: event.target.value })
                }
              />
            </PropertyGroup>
          ) : (
            <PropertyGroup>
              <Label htmlFor="field-value">{activeField.label}</Label>
              <Input
                id="field-value"
                value={activeField.value ?? ''}
                disabled={!canFill}
                maxLength={activeField.maxLength}
                $invalid={Boolean(fieldError)}
                placeholder={
                  activeField.type === 'date'
                    ? activeField.dateFormat ?? 'YYYY-MM-DD'
                    : '請輸入內容'
                }
                inputMode={activeField.type === 'date' ? 'numeric' : 'text'}
                onChange={(event) =>
                  updateField(activeField.id, { value: event.target.value })
                }
              />
            </PropertyGroup>
          )}
          {fieldError && <ErrorText>{fieldError}</ErrorText>}
        </>
      )}
    </InspectorContainer>
  );
};

const SignatureUpload: React.FC<{
  value?: string;
  label: string;
  disabled?: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}> = ({ value, label, disabled = false, onChange }) => (
  <PropertyGroup>
    <Label>{label}</Label>
    {value && (
      <img
        src={value}
        alt="手寫簽名預覽"
        style={{
          width: '100%',
          maxHeight: 110,
          objectFit: 'contain',
          borderRadius: 6,
          border: `1px solid ${Theme.colors.border}`,
          background: '#fff',
        }}
      />
    )}
    <UIButton
      as="label"
      aria-disabled={disabled}
      style={{
        fontSize: 12,
        textAlign: 'center',
        pointerEvents: disabled ? 'none' : 'auto',
        opacity: disabled ? 0.45 : 1,
      }}
    >
      {value ? '重新選擇圖片' : '選擇 PNG／JPEG 圖片'}
      <input
        type="file"
        hidden
        disabled={disabled}
        accept="image/png,image/jpeg"
        onChange={onChange}
      />
    </UIButton>
  </PropertyGroup>
);
