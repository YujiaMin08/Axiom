import React from 'react';

interface ComparisonData {
  items_compared: string[];
  comparison_table: Array<{
    aspect: string;
    values: { [item: string]: string };
    insight?: string;
  }>;
  similarities: string[];
  differences: string[];
  key_insight: string;
}

interface ComparisonTableProps {
  data: ComparisonData;
}

const ComparisonTable: React.FC<ComparisonTableProps> = ({ data }) => {
  const { items_compared, comparison_table, similarities, differences, key_insight } = data;

  return (
    <div className="h-full flex flex-col space-y-6 overflow-y-auto pr-2 custom-scrollbar">
      {/* Comparison Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-stone-300">
              <th className="text-left p-3 text-xs uppercase tracking-widest text-stone-400 font-semibold bg-stone-50">
                Aspect
              </th>
              {items_compared.map((item, idx) => (
                <th key={idx} className="text-left p-3 text-sm font-serif italic text-stone-800 bg-stone-50">
                  {item}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {comparison_table.map((row, rowIdx) => (
              <tr key={rowIdx} className="border-b border-stone-200 hover:bg-stone-50/50 transition-colors">
                <td className="p-3 font-semibold text-sm text-stone-700 align-top">
                  {row.aspect}
                </td>
                {items_compared.map((item, colIdx) => (
                  <td key={colIdx} className="p-3 text-sm text-stone-600 leading-relaxed align-top">
                    {row.values[item] || '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Similarities & Differences */}
      <div className="grid grid-cols-2 gap-4">
        {/* Similarities */}
        <div className="bg-stone-50 border border-stone-200 rounded-lg p-4">
          <h4 className="text-xs uppercase tracking-widest text-stone-400 mb-3 font-semibold">Similarities</h4>
          <ul className="space-y-2">
            {similarities.map((sim, idx) => (
              <li key={idx} className="text-sm text-stone-700 leading-relaxed flex items-start">
                <span className="text-stone-300 mr-2">•</span>
                <span>{sim}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Differences */}
        <div className="bg-stone-50 border border-stone-200 rounded-lg p-4">
          <h4 className="text-xs uppercase tracking-widest text-stone-400 mb-3 font-semibold">Differences</h4>
          <ul className="space-y-2">
            {differences.map((diff, idx) => (
              <li key={idx} className="text-sm text-stone-700 leading-relaxed flex items-start">
                <span className="text-stone-300 mr-2">•</span>
                <span>{diff}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Key Insight */}
      <div className="bg-stone-100 border-l-4 border-stone-400 rounded-r-lg p-4">
        <p className="text-xs uppercase tracking-widest text-stone-500 mb-2 font-semibold">Key Insight</p>
        <p className="text-sm text-stone-800 font-serif italic leading-relaxed">{key_insight}</p>
      </div>
    </div>
  );
};

export default ComparisonTable;

