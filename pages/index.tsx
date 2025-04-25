import { useState } from 'react';

export default function Home() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/yargitay-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Yargıtay Karar Arama</h1>
      
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Aranacak kelime..."
          className="flex-1 p-2 border rounded"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          {loading ? 'Aranıyor...' : 'Ara'}
        </button>
      </div>

      {results && (
        <div>
          <h2 className="text-xl font-semibold mb-2">
            Toplam {results.total} sonuç bulundu
          </h2>
          <div className="space-y-4">
            {results.decisions.map((decision: any) => (
              <div key={decision.id} className="border p-4 rounded">
                <h3 className="font-bold">{decision.daire}</h3>
                <p>Esas: {decision.esasNo}</p>
                <p>Karar: {decision.kararNo}</p>
                <p>Tarih: {decision.kararTarihi}</p>
                <div className="mt-2 text-gray-700">{decision.content}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 