import { createPortal } from "react-dom";
import { useEffect } from "react";

export const Modal = ({ children, onClose, contentClassName = "modal-content" }) => {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return createPortal(
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className={contentClassName} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>,
    document.body
  );
};