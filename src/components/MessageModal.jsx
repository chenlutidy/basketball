import { useGameStore } from '../store/gameStore';

export default function MessageModal() {
  const { message, showMessage, hideMessagePopup } = useGameStore();

  if (!showMessage) return null;

  return (
    <div className="modal-overlay" onClick={hideMessagePopup}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="text-center">
          <div className="text-4xl mb-4">📢</div>
          <div className="text-lg font-bold mb-6 whitespace-pre-line">{message}</div>
          <button onClick={hideMessagePopup} className="btn-primary">
            确定
          </button>
        </div>
      </div>
    </div>
  );
}
