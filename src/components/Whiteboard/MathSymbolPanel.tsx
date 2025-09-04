import React from 'react';

interface MathSymbolPanelProps {
  onSymbolSelect: (symbol: string) => void;
  onClose: () => void;
}

export const MathSymbolPanel: React.FC<MathSymbolPanelProps> = ({
  onSymbolSelect,
  onClose,
}) => {
  const mathSymbols = [
    // Greek letters
    { symbol: 'α', name: 'Alpha' },
    { symbol: 'β', name: 'Beta' },
    { symbol: 'γ', name: 'Gamma' },
    { symbol: 'δ', name: 'Delta' },
    { symbol: 'ε', name: 'Epsilon' },
    { symbol: 'θ', name: 'Theta' },
    { symbol: 'λ', name: 'Lambda' },
    { symbol: 'μ', name: 'Mu' },
    { symbol: 'π', name: 'Pi' },
    { symbol: 'σ', name: 'Sigma' },
    { symbol: 'φ', name: 'Phi' },
    { symbol: 'ω', name: 'Omega' },
    // Mathematical operators
    { symbol: '∑', name: 'Sum' },
    { symbol: '∏', name: 'Product' },
    { symbol: '∫', name: 'Integral' },
    { symbol: '√', name: 'Square Root' },
    { symbol: '∞', name: 'Infinity' },
    { symbol: '≈', name: 'Approximately' },
    { symbol: '≠', name: 'Not Equal' },
    { symbol: '≤', name: 'Less Than or Equal' },
    { symbol: '≥', name: 'Greater Than or Equal' },
    { symbol: '±', name: 'Plus Minus' },
    { symbol: '÷', name: 'Division' },
    { symbol: '×', name: 'Multiplication' },
    // Set theory
    { symbol: '∈', name: 'Element of' },
    { symbol: '∉', name: 'Not Element of' },
    { symbol: '⊂', name: 'Subset' },
    { symbol: '∪', name: 'Union' },
    { symbol: '∩', name: 'Intersection' },
    { symbol: '∅', name: 'Empty Set' },
    // Arrows
    { symbol: '→', name: 'Right Arrow' },
    { symbol: '←', name: 'Left Arrow' },
    { symbol: '↔', name: 'Left Right Arrow' },
    { symbol: '⇒', name: 'Implies' },
    { symbol: '⇔', name: 'If and Only If' },
    // Other
    { symbol: '∂', name: 'Partial Derivative' },
    { symbol: '∇', name: 'Nabla' },
    { symbol: '∆', name: 'Delta' },
    { symbol: '∀', name: 'For All' },
    { symbol: '∃', name: 'There Exists' },
    { symbol: '∴', name: 'Therefore' },
    { symbol: '∵', name: 'Because' },
  ];

  return (
    <div className="absolute bottom-20 left-4 right-4 z-20 bg-white/95 backdrop-blur-sm rounded-lg shadow-lg p-4 max-h-96 overflow-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Math Symbols</h3>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 text-xl leading-none"
        >
          ×
        </button>
      </div>
      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
        {mathSymbols.map((item) => (
          <button
            key={item.symbol}
            onClick={() => onSymbolSelect(item.symbol)}
            className="p-3 text-2xl hover:bg-gray-100 rounded-md transition-colors"
            title={item.name}
          >
            {item.symbol}
          </button>
        ))}
      </div>
    </div>
  );
};