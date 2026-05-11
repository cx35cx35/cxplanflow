import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  ListTodo,
  Target,
  BarChart3,
  Search,
  ChevronLeft,
  Zap,
} from 'lucide-react';
import { useUIStore } from '@/stores/uiStore';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: '仪表盘' },
  { to: '/tasks', icon: ListTodo, label: '待办事项' },
  { to: '/goals', icon: Target, label: '长期目标' },
  { to: '/stats', icon: BarChart3, label: '数据统计' },
  { to: '/search', icon: Search, label: '搜索' },
];

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const location = useLocation();

  return (
    <aside
      className={`hidden md:flex flex-col h-screen sticky top-0 border-r border-surface-border bg-surface-card/50 backdrop-blur-xl transition-all duration-300 ${
        sidebarOpen ? 'w-60' : 'w-[68px]'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 h-16 px-4 border-b border-surface-border">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-accent/15 shrink-0">
          <Zap size={18} className="text-accent" />
        </div>
        {sidebarOpen && (
          <span className="text-lg font-bold text-text-primary tracking-tight animate-fade-in">
            PlanFlow
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 px-2 space-y-0.5">
        {navItems.map(({ to, icon: Icon, label }) => {
          const active = location.pathname === to;
          return (
            <NavLink
              key={to}
              to={to}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                active
                  ? 'bg-accent/10 text-accent'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
              }`}
            >
              <Icon
                size={20}
                strokeWidth={active ? 2 : 1.5}
                className="shrink-0"
              />
              {sidebarOpen && (
                <span className="text-sm font-medium animate-fade-in">
                  {label}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse Button */}
      <div className="p-2 border-t border-surface-border">
        <button
          onClick={toggleSidebar}
          className="flex items-center justify-center w-full h-9 rounded-lg text-text-muted hover:text-text-secondary hover:bg-surface-hover transition-colors duration-200"
        >
          <ChevronLeft
            size={18}
            className={`transition-transform duration-300 ${!sidebarOpen ? 'rotate-180' : ''}`}
          />
        </button>
      </div>
    </aside>
  );
}
