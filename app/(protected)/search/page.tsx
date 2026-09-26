'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Search, ChevronRight } from 'lucide-react';

export default function UniversalSearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ issues: any[]; lostFound: any[] }>({ issues: [], lostFound: [] });
  const [loading, setLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setResults({ issues: data.issues || [], lostFound: data.lostFound || [] });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <Search className="w-6 h-6 text-[#2563eb]" />
          <span>Universal Search</span>
        </h1>
        <p className="text-sm font-medium text-slate-500 mt-1">Search campus issues and Lost & Found items.</p>
      </div>

      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          placeholder="Search by keywords, titles, description, location..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-900 text-sm placeholder-slate-400 focus:outline-none focus:border-[#2563eb] shadow-sm"
        />
        <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-4" />
      </form>

      {loading ? (
        <div className="text-center py-10 text-slate-400 text-xs">Searching campus records...</div>
      ) : (
        <div className="space-y-6">
          {/* Issues Results */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900">Campus Issues ({results.issues.length})</h2>
            {results.issues.length === 0 ? (
              <p className="text-slate-400 text-xs">No matching issues found.</p>
            ) : (
              <div className="space-y-2">
                {results.issues.map((i) => (
                  <Link key={i._id} href={`/issues/${i._id}`} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 text-xs font-semibold text-slate-900">
                    <div>
                      <div>{i.title}</div>
                      <span className="text-slate-400 text-[11px] font-normal">{i.location} • {i.category}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Lost & Found Results */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-4">
            <h2 className="text-base font-bold text-slate-900">Lost & Found ({results.lostFound.length})</h2>
            {results.lostFound.length === 0 ? (
              <p className="text-slate-400 text-xs">No matching Lost & Found items found.</p>
            ) : (
              <div className="space-y-2">
                {results.lostFound.map((lf) => (
                  <Link key={lf._id} href={`/lost-found/${lf._id}`} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:bg-slate-50 text-xs font-semibold text-slate-900">
                    <div>
                      <div>{lf.title} ({lf.type})</div>
                      <span className="text-slate-400 text-[11px] font-normal">{lf.location} • {lf.category}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
