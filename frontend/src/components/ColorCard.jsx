import { formatLab, formatNumber, getDeltaSeverity, getSeverityColor } from '../utils/formatters';

const ColorCard = ({ color, showDelta = false, deltaE = null }) => {
  const severity = deltaE !== null ? getDeltaSeverity(deltaE) : null;
  const severityClass = severity ? getSeverityColor(severity) : '';

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start gap-4">
        {/* Patch couleur */}
        <div
          className="w-16 h-16 rounded-md border-2 border-gray-300 flex-shrink-0"
          style={{
            backgroundColor: `rgb(${color.rgb?.R || 0}, ${color.rgb?.G || 0}, ${color.rgb?.B || 0})`,
          }}
          title={`RGB: ${color.rgb?.R || 0}, ${color.rgb?.G || 0}, ${color.rgb?.B || 0}`}
        />

        {/* Informations */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">
            {color.name || 'Sans nom'}
          </h3>
          
          <div className="mt-2 space-y-1 text-sm text-gray-600">
            <p className="font-mono text-xs">
              Lab: {formatLab(color.lab)}
            </p>
            {color.xyz && (
              <p className="font-mono text-xs text-gray-500">
                XYZ: X={formatNumber(color.xyz.X, 3)} Y={formatNumber(color.xyz.Y, 3)} Z={formatNumber(color.xyz.Z, 3)}
              </p>
            )}
          </div>

          {/* Delta E si présent */}
          {showDelta && deltaE !== null && (
            <div className={`mt-3 inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${severityClass}`}>
              ΔE = {formatNumber(deltaE, 3)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ColorCard;
