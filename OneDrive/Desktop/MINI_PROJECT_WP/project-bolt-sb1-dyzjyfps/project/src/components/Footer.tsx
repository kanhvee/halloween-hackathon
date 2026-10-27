import { Heart } from 'lucide-react';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <Logo className="w-9 h-9" />
              <span className="text-lg font-bold text-white">
                Tiffin<span className="text-orange-500">Connect</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed max-w-xs">
              Connecting Mumbai's home cooks with working professionals and students.
              Real home food, delivered daily.
            </p>
          </div>

          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm uppercase tracking-wide">For Customers</h4>
            <ul className="space-y-2 text-sm">
              <li className="hover:text-orange-400 transition-colors cursor-pointer">Browse Tiffins</li>
              <li className="hover:text-orange-400 transition-colors cursor-pointer">How It Works</li>
              <li className="hover:text-orange-400 transition-colors cursor-pointer">Skip a Meal</li>
              <li className="hover:text-orange-400 transition-colors cursor-pointer">Rate Your Cook</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className="text-white font-semibold text-sm uppercase tracking-wide">For Cooks</h4>
            <ul className="space-y-2 text-sm">
              <li className="hover:text-orange-400 transition-colors cursor-pointer">List Your Kitchen</li>
              <li className="hover:text-orange-400 transition-colors cursor-pointer">Manage Subscribers</li>
              <li className="hover:text-orange-400 transition-colors cursor-pointer">Daily Menu Tools</li>
              <li className="hover:text-orange-400 transition-colors cursor-pointer">Cook Guidelines</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs">© 2026 TiffinConnect. Made in Mumbai.</p>
          <p className="text-xs flex items-center gap-1.5">
            Cooked with <Heart className="w-3.5 h-3.5 text-orange-500 fill-orange-500" /> for the city of dreams
          </p>
        </div>
      </div>
    </footer>
  );
}
