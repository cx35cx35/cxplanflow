import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Sidebar from '@/components/layout/Sidebar';
import MobileNav from '@/components/layout/MobileNav';
import Dashboard from '@/pages/Dashboard';
import Tasks from '@/pages/Tasks';
import Goals from '@/pages/Goals';
import GoalDetail from '@/pages/GoalDetail';
import TaskDetail from '@/pages/TaskDetail';
import Statistics from '@/pages/Statistics';
import SearchPage from '@/pages/SearchPage';
import { useNotifications } from '@/hooks/useNotifications';

export default function App() {
  useNotifications();

  return (
    <BrowserRouter>
      <div className="flex min-h-screen bg-surface overscroll-none">
        <Sidebar />
        <main className="flex-1 min-w-0 pb-20 md:pb-0">
          <div className="max-w-5xl mx-auto px-4 py-4 md:px-8 md:py-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/tasks/:id" element={<TaskDetail />} />
              <Route path="/goals" element={<Goals />} />
              <Route path="/goals/:id" element={<GoalDetail />} />
              <Route path="/stats" element={<Statistics />} />
              <Route path="/search" element={<SearchPage />} />
            </Routes>
          </div>
        </main>
        <MobileNav />
      </div>
    </BrowserRouter>
  );
}
