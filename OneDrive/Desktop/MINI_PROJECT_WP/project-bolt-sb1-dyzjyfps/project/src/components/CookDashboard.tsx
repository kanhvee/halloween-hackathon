import { useState, useEffect } from 'react';
import {
  Loader2, Users, CalendarCheck, UtensilsCrossed, Plus, Clock,
  TrendingUp, Star, ChevronDown, ChevronUp
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Cook, Menu, Subscription, Review } from '@/types';

export default function CookDashboard() {
  const [cooks, setCooks] = useState<Cook[]>([]);
  const [selectedCookId, setSelectedCookId] = useState<string | null>(null);
  const [menus, setMenus] = useState<Menu[]>([]);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMenuItem, setNewMenuItem] = useState('');
  const [todayMenu, setTodayMenu] = useState<string[]>([]);
  const [savingMenu, setSavingMenu] = useState(false);
  const [menuSuccess, setMenuSuccess] = useState(false);

  useEffect(() => {
    loadCooks();
  }, []);

  useEffect(() => {
    if (selectedCookId) loadCookData(selectedCookId);
  }, [selectedCookId]);

  async function loadCooks() {
    setLoading(true);
    const { data } = await supabase.from('cooks').select('*').order('name');
    setCooks(data || []);
    if (data && data.length > 0) setSelectedCookId(data[0].id);
    setLoading(false);
  }

  async function loadCookData(cookId: string) {
    const today = new Date().toISOString().split('T')[0];
    const [menusRes, subsRes, reviewsRes] = await Promise.all([
      supabase.from('menus').select('*').eq('cook_id', cookId).order('menu_date', { ascending: true }),
      supabase.from('subscriptions').select('*').eq('cook_id', cookId).order('created_at', { ascending: false }),
      supabase.from('reviews').select('*').eq('cook_id', cookId).order('created_at', { ascending: false }).limit(5),
    ]);
    setMenus(menusRes.data || []);
    setSubscriptions(subsRes.data || []);
    setReviews(reviewsRes.data || []);
    const todayMenuEntry = (menusRes.data || []).find((m) => m.menu_date === today);
    setTodayMenu(todayMenuEntry?.items || []);
  }

  async function saveMenu() {
    if (!selectedCookId || todayMenu.length === 0) return;
    setSavingMenu(true);
    const today = new Date().toISOString().split('T')[0];
    const existing = menus.find((m) => m.menu_date === today);

    if (existing) {
      await supabase.from('menus').update({ items: todayMenu }).eq('id', existing.id);
    } else {
      await supabase.from('menus').insert({ cook_id: selectedCookId, menu_date: today, items: todayMenu });
    }

    await loadCookData(selectedCookId);
    setSavingMenu(false);
    setMenuSuccess(true);
    setTimeout(() => setMenuSuccess(false), 3000);
  }

  function addMenuItem() {
    if (!newMenuItem.trim()) return;
    setTodayMenu([...todayMenu, newMenuItem.trim()]);
    setNewMenuItem('');
  }

  function removeMenuItem(index: number) {
    setTodayMenu(todayMenu.filter((_, i) => i !== index));
  }

  const selectedCook = cooks.find((c) => c.id === selectedCookId);
  const activeSubs = subscriptions.filter((s) => s.status === 'active');
  const today = new Date().toISOString().split('T')[0];
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = tomorrow.toISOString().split('T')[0];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Cook Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your menu, subscribers, and daily operations</p>
      </div>

      {/* Cook Selector */}
      <div className="mb-6">
        <label className="block text-xs font-medium text-gray-500 mb-1.5 uppercase tracking-wide">Viewing as</label>
        <select
          value={selectedCookId || ''}
          onChange={(e) => setSelectedCookId(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none text-sm font-medium"
        >
          {cooks.map((c) => (
            <option key={c.id} value={c.id}>{c.name} — {c.area}</option>
          ))}
        </select>
      </div>

      {selectedCook && (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard
              icon={Users}
              label="Active Subscribers"
              value={activeSubs.length.toString()}
              color="bg-blue-50 text-blue-600"
            />
            <StatCard
              icon={CalendarCheck}
              label="Tomorrow's Dabba Count"
              value={activeSubs.length.toString()}
              subtext="tiffins to prepare"
              color="bg-orange-50 text-orange-600"
            />
            <StatCard
              icon={Star}
              label="Rating"
              value={`${selectedCook.rating.toFixed(1)}★`}
              subtext={`${selectedCook.total_reviews} reviews`}
              color="bg-amber-50 text-amber-600"
            />
            <StatCard
              icon={TrendingUp}
              label="Total Subscribers"
              value={selectedCook.total_subscribers.toString()}
              color="bg-green-50 text-green-600"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Daily Menu Editor */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-1 flex items-center gap-2">
                <UtensilsCrossed className="w-5 h-5 text-orange-600" />
                Today's Menu
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>

              <div className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newMenuItem}
                  onChange={(e) => setNewMenuItem(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addMenuItem()}
                  placeholder="Add a dish (e.g. Dal Tadka)"
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-all text-sm"
                />
                <button
                  onClick={addMenuItem}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1.5 text-sm font-medium"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </div>

              {todayMenu.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-xl">
                  <UtensilsCrossed className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-400">No items added yet. Start by adding dishes above.</p>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 mb-4">
                  {todayMenu.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 bg-orange-50 text-orange-800 px-3 py-1.5 rounded-lg text-sm font-medium group">
                      {item}
                      <button
                        onClick={() => removeMenuItem(i)}
                        className="text-orange-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-3">
                <button
                  onClick={saveMenu}
                  disabled={savingMenu || todayMenu.length === 0}
                  className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors text-sm"
                >
                  {savingMenu ? 'Saving...' : 'Save Today\'s Menu'}
                </button>
                {menuSuccess && (
                  <span className="text-sm text-green-600 font-medium flex items-center gap-1">
                    <CalendarCheck className="w-4 h-4" /> Menu saved!
                  </span>
                )}
              </div>

              {/* Upcoming Menus */}
              {menus.length > 1 && (
                <div className="mt-6 pt-6 border-t border-gray-50">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Upcoming Menus</h3>
                  <div className="space-y-2">
                    {menus.filter((m) => m.menu_date > today).map((menu) => {
                      const date = new Date(menu.menu_date + 'T00:00:00');
                      return (
                        <div key={menu.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                          <span className="text-sm text-gray-600">
                            {date.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                          </span>
                          <span className="text-sm text-gray-500 truncate ml-3">
                            {menu.items.join(', ')}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Subscriber List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-orange-600" />
                Subscribers ({activeSubs.length})
              </h2>
              {activeSubs.length === 0 ? (
                <p className="text-sm text-gray-400">No active subscribers yet.</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {activeSubs.map((sub) => (
                    <div key={sub.id} className="border border-gray-100 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-800">{sub.customer_name}</span>
                        <span className="text-xs bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full font-medium">
                          {sub.plan_type}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3 h-3" /> {sub.customer_phone}
                        </div>
                        <div className="text-gray-400 truncate">{sub.customer_address}</div>
                        <div>Since {new Date(sub.start_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Recent Reviews */}
              {reviews.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-50">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">Recent Reviews</h3>
                  <div className="space-y-3">
                    {reviews.slice(0, 3).map((review) => (
                      <div key={review.id} className="text-sm">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="font-medium text-gray-700 text-xs">{review.customer_name}</span>
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((n) => (
                              <Star
                                key={n}
                                className={`w-3 h-3 ${n <= review.rating ? 'text-amber-500 fill-amber-500' : 'text-gray-200'}`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 line-clamp-2">{review.review_text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon, label, value, subtext, color,
}: {
  icon: typeof Users;
  label: string;
  value: string;
  subtext?: string;
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
      {subtext && <div className="text-xs text-gray-400 mt-0.5">{subtext}</div>}
    </div>
  );
}
