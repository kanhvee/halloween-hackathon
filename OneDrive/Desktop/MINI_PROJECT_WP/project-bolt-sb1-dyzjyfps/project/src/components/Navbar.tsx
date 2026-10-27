import { UtensilsCrossed, ChefHat, ShieldCheck, LogOut, User as UserIcon } from 'lucide-react';
import Logo from './Logo';
import { useAuth } from '@/context/AuthContext';

export type AppRole = 'customer' | 'cook' | 'admin';

interface NavbarProps {
  role: AppRole;
  onRoleChange: (role: AppRole) => void;
}

const roleConfig: Record<AppRole, { label: string; icon: typeof UtensilsCrossed }> = {
  customer: { label: 'Browse Tiffins', icon: UtensilsCrossed },
  cook: { label: 'Cook Dashboard', icon: ChefHat },
  admin: { label: 'Admin Panel', icon: ShieldCheck },
};

export default function Navbar({ role, onRoleChange }: NavbarProps) {
  const { profile, signOut } = useAuth();

  const availableRoles: AppRole[] = profile
    ? profile.role === 'admin'
      ? ['customer', 'cook', 'admin']
      : profile.role === 'cook'
        ? ['customer', 'cook']
        : ['customer']
    : ['customer'];

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-orange-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button
            onClick={() => onRoleChange('customer')}
            className="flex items-center gap-2.5 group"
          >
            <Logo className="w-10 h-10 transition-transform group-hover:scale-105" />
            <div className="text-left">
              <span className="block text-lg font-bold text-gray-900 leading-none">
                Tiffin<span className="text-orange-600">Connect</span>
              </span>
              <span className="block text-[10px] text-gray-500 font-medium tracking-wide uppercase">
                Mumbai Home Tiffins
              </span>
            </div>
          </button>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 sm:gap-2 bg-orange-50/80 rounded-full p-1 border border-orange-100">
              {availableRoles.map((key) => {
                const config = roleConfig[key];
                const Icon = config.icon;
                const isActive = role === key;
                return (
                  <button
                    key={key}
                    onClick={() => onRoleChange(key)}
                    className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-white text-orange-600 shadow-sm'
                        : 'text-gray-600 hover:text-orange-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{config.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 border-l border-gray-200 pl-3">
              <div className="hidden sm:flex items-center gap-2">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-orange-600" />
                </div>
                <div className="text-right">
                  <div className="text-xs font-semibold text-gray-700 leading-none">
                    {profile?.display_name || 'User'}
                  </div>
                  <div className="text-[10px] text-gray-400 uppercase tracking-wide mt-0.5">
                    {profile?.role || 'guest'}
                  </div>
                </div>
              </div>
              <button
                onClick={() => signOut()}
                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
