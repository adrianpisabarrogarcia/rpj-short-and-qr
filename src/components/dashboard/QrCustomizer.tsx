import { Sliders } from 'lucide-react';

const MODULE_COLORS = [
  { hex: '#000000', label: 'Negro' },
  { hex: '#94C700', label: 'Verde RPJ' },
  { hex: '#80CAE3', label: 'Azul RPJ' },
  { hex: '#3300C7', label: 'Azul Oscuro' },
];

const BACKGROUND_COLORS = [
  { hex: '#ffffff', label: 'Blanco' },
  { hex: '#f7fbe6', label: 'Verde Claro' },
  { hex: '#80cae3', label: 'Azul' },
  { hex: '#ffffff00', label: 'Transparente' },
];

interface QrCustomizerProps {
  qrColor: string;
  qrBgColor: string;
  includeLogo: boolean;
  onColorChange: (hex: string) => void;
  onBgColorChange: (hex: string) => void;
  onIncludeLogoChange: (value: boolean) => void;
}

export default function QrCustomizer({
  qrColor,
  qrBgColor,
  includeLogo,
  onColorChange,
  onBgColorChange,
  onIncludeLogoChange,
}: QrCustomizerProps) {
  return (
    <div className="pt-6 border-t border-[#edf0e8] dark:border-[#1c1d1a]/80 space-y-4">
      <div className="flex items-center gap-2 text-[#1c1d1a] dark:text-white font-bold text-sm">
        <Sliders size={16} className="text-[#94C700]" />
        <span>Personalizar Diseño del Código QR</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-[#1c1d1a] dark:text-[#d4d8cc]">
        {/* Foreground Color Picker */}
        <div className="space-y-1.5">
          <span className="text-[#6d7067] dark:text-[#575855] font-semibold uppercase tracking-wider block">Color de Módulos</span>
          <div className="flex gap-2">
            {MODULE_COLORS.map((color) => (
              <button
                key={color.hex}
                type="button"
                onClick={() => onColorChange(color.hex)}
                className={`w-6 h-6 rounded-full border cursor-pointer transition ${qrColor === color.hex ? 'border-neutral-500 dark:border-white scale-110 shadow-lg' : 'border-transparent'}`}
                style={{ backgroundColor: color.hex }}
                title={color.label}
              />
            ))}
          </div>
        </div>

        {/* Background Color Picker */}
        <div className="space-y-1.5">
          <span className="text-[#6d7067] dark:text-[#575855] font-semibold uppercase tracking-wider block">Color de Fondo</span>
          <div className="flex gap-2">
            {BACKGROUND_COLORS.map((color) => (
              <button
                key={color.hex}
                type="button"
                onClick={() => onBgColorChange(color.hex)}
                className={`w-6 h-6 rounded-full border cursor-pointer transition ${qrBgColor === color.hex ? 'border-neutral-500 dark:border-white scale-110 shadow-lg' : 'border-neutral-300 dark:border-neutral-700/50'}`}
                style={{ backgroundColor: color.hex === '#ffffff00' ? '#e2e8f0' : color.hex }}
                title={color.label}
              >
                {color.hex === '#ffffff00' && <span className="text-[9px] text-[#6d7067] font-bold">X</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Central Logo Overlay Toggle */}
        <div className="space-y-1.5 flex flex-col justify-center">
          <span className="text-[#6d7067] dark:text-[#575855] font-semibold uppercase tracking-wider block mb-1">Branding Corporativo</span>
          <label className="flex items-center gap-2 cursor-pointer select-none text-[#1c1d1a] dark:text-[#d4d8cc]">
            <input
              type="checkbox"
              checked={includeLogo}
              onChange={(e) => onIncludeLogoChange(e.target.checked)}
              className="w-4 h-4 rounded accent-[#94C700] bg-white dark:bg-[#0e0f0c] border-[#edf0e8] dark:border-[#1c1d1a]"
            />
            <span className="text-xs">Incluir Logo RPJ al centro</span>
          </label>
        </div>
      </div>
    </div>
  );
}
