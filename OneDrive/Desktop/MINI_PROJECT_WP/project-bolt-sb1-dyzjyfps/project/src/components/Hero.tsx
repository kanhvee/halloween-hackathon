import { ArrowRight, CalendarCheck, Truck, UtensilsCrossed } from 'lucide-react';

interface HeroProps {
  onBrowse: () => void;
}

export default function Hero({ onBrowse }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-orange-50 via-amber-50 to-red-50">
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-10 left-10 w-72 h-72 bg-orange-200 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-red-200 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur rounded-full px-4 py-1.5 border border-orange-200">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-gray-700">50+ home cooks across Mumbai</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-[1.1] tracking-tight">
              Home-cooked tiffins,
              <span className="block text-orange-600">delivered to your door</span>
            </h1>

            <p className="text-lg text-gray-600 leading-relaxed max-w-lg">
              Browse authentic home kitchens in your area. Subscribe to weekly or monthly plans,
              skip meals with one tap, and enjoy real ghar ka khana every day.
            </p>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={onBrowse}
                className="group inline-flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold px-6 py-3.5 rounded-xl shadow-lg shadow-orange-200 transition-all duration-200 hover:shadow-xl hover:shadow-orange-300"
              >
                Browse Tiffins
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-800 font-semibold px-6 py-3.5 rounded-xl border border-gray-200 transition-all duration-200"
              >
                How It Works
              </a>
            </div>

            <div className="flex items-center gap-6 pt-4">
              <div>
                <div className="text-2xl font-bold text-gray-900">4.6★</div>
                <div className="text-xs text-gray-500">Avg. rating</div>
              </div>
              <div className="w-px h-10 bg-gray-200" />
              <div>
                <div className="text-2xl font-bold text-gray-900">1,200+</div>
                <div className="text-xs text-gray-500">Active subscribers</div>
              </div>
              <div className="w-px h-10 bg-gray-200" />
              <div>
                <div className="text-2xl font-bold text-gray-900">15+</div>
                <div className="text-xs text-gray-500">Mumbai areas</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://images.pexels.com/photos/35008222/pexels-photo-35008222.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
                alt="Delicious Indian thali with chapati, rice, dal, and vegetables"
                className="w-full h-[400px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>

            <div className="absolute -bottom-5 -left-5 bg-white rounded-2xl shadow-xl p-4 border border-gray-100 hidden sm:block">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                  <CalendarCheck className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">Skip before 9 PM</div>
                  <div className="text-xs text-gray-500">One-tap meal skipping</div>
                </div>
              </div>
            </div>

            <div className="absolute -top-5 -right-5 bg-white rounded-2xl shadow-xl p-4 border border-gray-100 hidden sm:block">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
                  <Truck className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-gray-900">Daily delivery</div>
                  <div className="text-xs text-gray-500">Fresh & on time</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div id="how-it-works" className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { icon: UtensilsCrossed, title: '1. Browse & Choose', desc: 'Filter cooks by area, cuisine, and diet. See menus, ratings, and reviews.' },
            { icon: CalendarCheck, title: '2. Subscribe', desc: 'Pick a weekly or monthly plan. Skip meals anytime before 9 PM the night before.' },
            { icon: Truck, title: '3. Enjoy Daily', desc: 'Fresh home-cooked tiffin delivered to your door every day. Rate and review!' },
          ].map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.title} className="bg-white/70 backdrop-blur rounded-2xl p-6 border border-orange-100 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{step.title}</h3>
                <p className="text-sm text-gray-600 leading-relaxed">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
