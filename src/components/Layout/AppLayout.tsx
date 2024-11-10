import Sidebar from './Sidebar';
import { ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

export default function AppLayout({ children }: Props) {
  return (
    <div className="min-h-screen bg-[#FAFAFA]">
      <Sidebar />
      <div className="lg:ml-64">
        {children}
      </div>
    </div>
  );
}
