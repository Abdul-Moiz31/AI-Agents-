import { useEffect, useId, useState } from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmitKey: (key: string) => void;
};

export function ApiKeyModal({ open, onClose, onSubmitKey }: Props) {
  const titleId = useId();
  const [value, setValue] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setValue('');
      setLocalError(null);
    }
  }, [open]);

  if (!open) return null;

  const submit = () => {
    const k = value.trim();
    if (!k.startsWith('sk-') || k.length < 24) {
      setLocalError('Paste a key that starts with sk- (your OpenAI API key).');
      return;
    }
    setLocalError(null);
    onSubmitKey(k);
  };

  return (
    <div className="modal-root" role="presentation">
      <button type="button" className="modal-root__backdrop" aria-label="Close" onClick={onClose} />
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <header className="modal__head">
          <h2 id={titleId} className="modal__title">
            OpenAI API key
          </h2>
          <p className="modal__lede">
            This app sends your key to the Orchestrator API as <span className="type-mono">Authorization: Bearer</span>{' '}
            only. It is kept in <strong>session storage</strong> for this browser tab until you close the tab.
          </p>
        </header>
        <label className="modal__label" htmlFor="api-key-field">
          API key
        </label>
        <input
          id="api-key-field"
          className="modal__input"
          type="password"
          autoComplete="off"
          spellCheck={false}
          placeholder="sk-..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        {localError && (
          <p className="modal__error" role="alert">
            {localError}
          </p>
        )}
        <footer className="modal__foot">
          <button type="button" className="modal__btn modal__btn--ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="modal__btn modal__btn--primary" onClick={submit}>
            Save and run
          </button>
        </footer>
      </div>
    </div>
  );
}
