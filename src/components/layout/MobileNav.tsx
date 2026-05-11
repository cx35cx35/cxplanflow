import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, ListTodo, Target, BarChart3, Search } from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: '首页' },
  { to: '/tasks', icon: ListTodo, label: '待办' },
  { to: '/goals', icon: Target, label: '目标' },
  { to: '/stats', icon: BarChart3, label: '统计' },
  { to: '/search', icon: Search, label: '搜索' },
];

export default function MobileNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface-card/90 backdrop-blur-xl border-t border-surface-border md:hidden safe-area-pb">
      <div className="flex items-center justify-around h-16 px-1">
        {navItems.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to;
          return (
            <NavLink
              key={to}
              to={to}
              className={`flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-200 min-w-[56px] ${
                active
                  ? 'text-accent'
                  : 'text-text-muted active:text-text-secondary'
              }`}
            >
              <div className={`relative ${active ? 'scale-110' : ''} transition-transform duration-200`}>
                <Icon size={22} strokeWidth={active ? 2.5 : 1.5} />
                {active && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent" />
                )}
              </div>
              <span className={`text-[10px] font-medium ${active ? 'font-semibold' : ''}`}>{label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
