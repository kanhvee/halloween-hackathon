import { useState, useEffect } from 'react';
import { Search, SlidersHorizontal, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Cook } from '@/types';
import Hero from './Hero';
import CookCard from './CookCard';
import CookDetail from './CookDetail';

const AREAS = ['All Areas', 'Bandra West', 'Andheri East', 'Dadar', 'Goregaon', 'Worli', 'Powai', 'Malad West', 'Vikhroli', 'Chembur', 'Kurla'];
const CUISINES = ['All Cuisines', 'Maharashtrian', 'Gujarati', 'Mughlai', 'North Indian', 'South Indian', 'Punjabi', 'Rajasthani', 'Healthy', 'Hyderabadi'];
const DIETS = ['Jain', 'High-Protein', 'Pure Veg', 'Non-Veg', 'Low-Cal'];
const SORT_OPTIONS = [
  { value: 'rating', label: 'Top Rated' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'subscribers', label: 'Most Popular' },
];

export default function CustomerView() {
  const [cooks, setCooks] = useState<Cook[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCook, setSelectedCook] = useState<Cook | null>(null);
  const [search, setSearch] = useState('');
  const [area, setArea] = useState('All Areas');
  const [cuisine, setCuisine] = useState('All Cuisines');
  const [dietFilter, setDietFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState('rating');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadCooks();
  }, []);

  async function loadCooks() {
    setLoading(true);
    const { data, error } = await supabase
      .from('cooks')
      .select('*')
      .eq('approved', true)
      .order('rating', { ascending: false });

    if (error) {
      console.error('Error loading cooks:', error);
    }
    setCooks(data || []);
    setLoading(false);
  }

  const filtered = cooks
    .filter((c) => {
      if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.bio.toLowerCase().includes(search.toLowerCase())) return false;
      if (area !== 'All Areas' && c.area !== area) return false;
      if (cuisine !== 'All Cuisines' && c.cuisine !== cuisine) return false;
      if (dietFilter && !c.diet_tags.includes(dietFilter)) return false;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price_low': return a.price_weekly - b.price_weekly;
        case 'price_high': return b.price_weekly - a.price_weekly;
        case 'subscribers': return b.total_subscribers - a.total_subscribers;
        default: return b.rating - a.rating;
      }
    });

  if (selectedCook) {
    return <CookDetail cook={selectedCook} onBack={() => setSelectedCook(null)} />;
  }

  return (
    <div>
      <Hero onBrowse={() => document.getElementById('cooks-grid')?.scrollIntoView({ behavior: 'smooth' })} />

      <section id="cooks-grid" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Available Tiffin Services</h2>
            <p className="text-sm text-gray-500 mt-1">{filtered.length} home cooks ready to serve you</p>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name or cuisine..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all text-sm"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-gray-200 hover:border-orange-300 text-sm font-medium text-gray-700 transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Area</label>
                <select
                  value={area}
                  onChange={(e) => setArea(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-orange-400 outline-none text-sm"
                >
                  {AREAS.map((a) => <option key={a} value={a}>{a}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Cuisine</label>
                <select
                  value={cuisine}
                  onChange={(e) => setCuisine(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-orange-400 outline-none text-sm"
                >
                  {CUISINES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-orange-400 outline-none text-sm"
                >
                  {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">Diet Preferences</label>
              <div className="flex flex-wrap gap-2">
                {DIETS.map((d) => (
                  <button
                    key={d}
                    onClick={() => setDietFilter(dietFilter === d ? null : d)}
                    className={`text-sm px-3 py-1.5 rounded-lg font-medium transition-all ${
                      dietFilter === d
                        ? 'bg-orange-600 text-white'
                        : 'bg-orange-50 text-orange-700 hover:bg-orange-100'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No tiffin services match your filters.</p>
            <button
              onClick={() => { setSearch(''); setArea('All Areas'); setCuisine('All Cuisines'); setDietFilter(null); }}
              className="mt-3 text-sm font-medium text-orange-600 hover:text-orange-700"
            >
              Clear all filters →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((cook) => (
              <CookCard key={cook.id} cook={cook} onClick={() => setSelectedCook(cook)} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
