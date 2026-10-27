import { Star, MapPin, Users, Leaf, Drumstick } from 'lucide-react';
import type { Cook } from '@/types';

interface CookCardProps {
  cook: Cook;
  onClick: () => void;
}

export default function CookCard({ cook, onClick }: CookCardProps) {
  return (
    <button
      onClick={onClick}
      className="group text-left bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
    >
      <div className="relative h-44 overflow-hidden bg-gradient-to-br from-orange-100 to-amber-100">
        <img
          src={cook.image_url || 'https://images.pexels.com/photos/39323513/pexels-photo-39323513.jpeg?auto=compress&cs=tinysrgb&h=650&w=940'}
          alt={cook.cuisine + ' thali'}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur rounded-full px-2.5 py-1 flex items-center gap-1 shadow-sm">
          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span className="text-sm font-bold text-gray-900">{cook.rating.toFixed(1)}</span>
        </div>
        <div className="absolute top-3 left-3 flex gap-1.5">
          {cook.veg_only ? (
            <span className="bg-green-600 text-white text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
              <Leaf className="w-3 h-3" /> Veg
            </span>
          ) : (
            <span className="bg-red-600 text-white text-xs font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
              <Drumstick className="w-3 h-3" /> Non-Veg
            </span>
          )}
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-bold text-gray-900 text-lg group-hover:text-orange-600 transition-colors">
            {cook.name}
          </h3>
          <div className="flex items-center gap-2 text-sm text-gray-500 mt-0.5">
            <MapPin className="w-3.5 h-3.5" />
            <span>{cook.area}</span>
            <span className="text-gray-300">•</span>
            <span>{cook.cuisine}</span>
          </div>
        </div>

        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{cook.bio}</p>

        {cook.diet_tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {cook.diet_tags.map((tag) => (
              <span
                key={tag}
                className="text-xs font-medium bg-orange-50 text-orange-700 px-2 py-0.5 rounded-md"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-gray-50">
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <Users className="w-4 h-4" />
            <span>{cook.total_subscribers} subscribers</span>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-400">from</div>
            <div className="text-sm font-bold text-gray-900">
              ₹{cook.price_weekly}<span className="text-xs font-normal text-gray-400">/wk</span>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}
