import { History, RotateCcw } from 'lucide-react';
import { formatDate, formatNumber } from '../utils/formatters';

const HistoryPanel = ({ history, onRestore }) => {
  if (!history || history.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <History className="w-5 h-5" />
          Historique
        </h2>
        <p className="text-gray-500 text-sm">Aucune itération enregistrée</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
        <History className="w-5 h-5" />
        Historique ({history.length} itération{history.length > 1 ? 's' : ''})
      </h2>

      <div className="space-y-3">
        {history.map((iteration, index) => (
          <div
            key={index}
            className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-primary-300 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs font-semibold">
                    Itération #{iteration.iteration}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatDate(iteration.timestamp)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-600">Couleurs:</span>
                    <span className="ml-2 font-semibold">
                      {iteration.corrected?.length || 0}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">ΔE WP:</span>
                    <span className="ml-2 font-semibold">
                      {formatNumber(iteration.deltaWP, 3)}
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onRestore(index)}
                className="ml-4 p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                title="Restaurer cette itération"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryPanel;
