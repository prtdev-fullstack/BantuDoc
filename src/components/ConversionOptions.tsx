import { ConversionOption } from '../types';

interface ConversionOptionsProps {
  options: ConversionOption[];
  selectedFormat: string;
  onFormatChange: (format: string) => void;
}

export const ConversionOptions = ({
  options,
  selectedFormat,
  onFormatChange,
}: ConversionOptionsProps) => {
  if (options.length === 0) return null;

  return (
    <div className="w-full">
      <label className="block text-sm font-semibold text-gray-700 mb-4">
        Choisir le format de sortie
      </label>
      <div className={`grid gap-3 ${options.length > 2 ? 'grid-cols-2 md:grid-cols-3' : 'grid-cols-2'}`}>
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onFormatChange(option.value)}
            className={`p-4 rounded-xl border-2 transition-all duration-300 font-medium flex flex-col items-center gap-2 ${
              selectedFormat === option.value
                ? 'border-blue-500 bg-blue-500 text-white shadow-lg scale-105'
                : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300 hover:shadow-md hover:scale-102'
            }`}
          >
            {option.icon && <span className="text-2xl">{option.icon}</span>}
            <span className="text-sm">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
