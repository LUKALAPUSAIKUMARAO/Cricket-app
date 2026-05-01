import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Yes",
  cancelText = "No"
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-sm translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg sm:rounded-2xl rounded-t-3xl sm:rounded-t-2xl bottom-0 sm:bottom-auto translate-y-0 sm:translate-y-[-50%]"
            style={{ 
              top: typeof window !== 'undefined' && window.innerWidth < 640 ? 'auto' : '50%',
              transform: typeof window !== 'undefined' && window.innerWidth < 640 ? 'translateX(-50%)' : 'translate(-50%, -50%)'
            }}
          >
            <div className="flex flex-col space-y-2 text-center sm:text-left items-center sm:items-start">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <h2 className="text-lg font-semibold">{title}</h2>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 mt-4 gap-2 sm:gap-0">
              <Button variant="outline" onClick={onClose} className="h-12 sm:h-10 rounded-xl">
                {cancelText}
              </Button>
              <Button variant="destructive" onClick={() => { onConfirm(); onClose(); }} className="h-12 sm:h-10 rounded-xl">
                {confirmText}
              </Button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
