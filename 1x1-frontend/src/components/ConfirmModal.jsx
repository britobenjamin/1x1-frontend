import "./ConfirmModal.css";

function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = "Eliminar",
  cancelLabel = "Cancelar",
  confirmVariant = "danger",
  onConfirm,
  onCancel,
  hideCancel = false,
  mostrarCerrar = false,
}) {
  if (!open) return null;

  return (
    <div className="confirm-modal__overlay" onClick={onCancel}>
      <div
        className="confirm-modal"
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        {mostrarCerrar && (
          <button
            type="button"
            className="confirm-modal__cerrar-x"
            onClick={onCancel}
            aria-label="Cerrar"
          >
            ×
          </button>
        )}
        <h2 className="confirm-modal__title">{title}</h2>
        {message && <p className="confirm-modal__message">{message}</p>}

        <div className="confirm-modal__actions">
          {!hideCancel && (
            <button
              type="button"
              className="confirm-modal__cancel"
              onClick={onCancel}
            >
              {cancelLabel}
            </button>
          )}
          <button
            type="button"
            className={`confirm-modal__confirm confirm-modal__confirm--${confirmVariant}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
