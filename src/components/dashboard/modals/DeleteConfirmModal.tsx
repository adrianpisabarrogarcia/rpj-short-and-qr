import { Trash2 } from 'lucide-react';

interface DeleteConfirmModalProps {
  deletingId: string | null;
  deleteLoading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function DeleteConfirmModal({
  deletingId,
  deleteLoading,
  onCancel,
  onConfirm,
}: DeleteConfirmModalProps) {
  if (!deletingId) return null;

  return (
    <div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <div
        className="bg-[#ffffff] dark:bg-[#121310] border border-[#edf0e8] dark:border-[#1c1d1a] p-6 rounded-2xl max-w-sm w-full space-y-4 text-center shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/25 flex items-center justify-center mx-auto text-red-500 dark:text-red-400 mb-2">
          <Trash2 size={24} />
        </div>

        <div className="space-y-1">
          <h3 className="text-[#1c1d1a] dark:text-white font-bold text-lg">¿Eliminar enlace?</h3>
          <p className="text-xs text-[#6d7067] dark:text-[#575855]">
            Esta acción eliminará de forma permanente el enlace corto <span className="text-[#1c1d1a] dark:text-white font-semibold font-mono">rpj.es/{deletingId}</span>. Los accesos existentes dejarán de funcionar.
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 bg-[#edf0e8] dark:bg-[#1c1d1a] border border-[#edf0e8] dark:border-[#2b2d28] text-[#1c1d1a] dark:text-white font-semibold rounded-xl hover:bg-[#e2e8f0] dark:hover:bg-[#22231f] transition cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={deleteLoading}
            className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl transition cursor-pointer disabled:opacity-50"
          >
            {deleteLoading ? 'Eliminando...' : 'Sí, Eliminar'}
          </button>
        </div>
      </div>
    </div>
  );
}
