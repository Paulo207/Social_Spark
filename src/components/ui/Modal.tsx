import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import './Modal.css';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    size = 'md'
}) => {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="modal-backdrop" onClick={onClose}>
            <div
                className={`modal-content modal-${size} glass`}
                onClick={(e) => e.stopPropagation()}
            >
                {title && (
                    <div className="modal-header">
                        <h3>{title}</h3>
                        <button className="modal-close" onClick={onClose}>
                            <X size={20} />
                        </button>
                    </div>
                )}
                <div className="modal-body">
                    {children}
                </div>
            </div>
        </div>
    );
};
