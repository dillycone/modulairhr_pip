"use client";

import { useRouter, usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  BarChart, 
  Settings, 
  Bell, 
  HelpCircle, 
  Filter, 
  PlusCircle, 
  User as UserIcon 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";

interface SidebarLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  badge?: number;
}

const SidebarLink = ({ href, icon, label, active, badge }: SidebarLinkProps) => {
  const router = useRouter();

  return (
    <Button
      variant="ghost"
      className={cn(
        "w-full justify-start gap-2 mb-1",
        active ? "bg-slate-100 text-indigo-600" : "text-slate-700"
      )}
      onClick={() => router.push(href)}
    >
      {icon}
      <span className="flex-1 text-left">{label}</span>
      {badge && (
        <Badge variant="secondary" className="h-5 px-2 text-xs">
          {badge}
        </Badge>
      )}
    </Button>
  );
};

export default function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  
  // Simple function to check if a path is active
  const isActive = (path: string) => pathname.startsWith(path);

  // Get user information from metadata safely
  const userEmail = user?.email || "";
  const userName = user?.user_metadata?.name || userEmail || "User";
  const userInitial = userEmail ? userEmail.charAt(0).toUpperCase() : "U";

  // Determine if the user is an admin (check potential locations for role)
  const isAdmin = user?.app_metadata?.role === 'admin' || user?.role === 'admin';

  return (
    <div className="w-64 h-screen bg-white border-r border-slate-200 flex flex-col">
      {/* User Profile Section */}
      <div className="p-4 flex items-center gap-3">
        <Avatar className="h-9 w-9">
          <AvatarFallback>{userInitial}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-medium text-sm">{userName}</span>
          <span className="text-xs text-slate-500">{user?.app_metadata?.role || user?.role || 'User'}</span>
        </div>
      </div>
      
      <Separator />
      
      {/* Quick Actions */}
      <div className="p-4">
        <Button 
          onClick={() => router.push('/create-pip/select-template')} 
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
        >
          <PlusCircle className="h-4 w-4 mr-2" /> Create New PIP
        </Button>
      </div>
      
      {/* Navigation Menu */}
      <div className="p-4 flex-1 overflow-y-auto">
        <div className="mb-2 px-2 text-xs font-semibold text-slate-500 uppercase">Main</div>
        <SidebarLink 
          href="/dashboard" 
          icon={<LayoutDashboard className="h-4 w-4" />} 
          label="Dashboard" 
          active={isActive('/dashboard')}
        />
        <SidebarLink 
          href="/dashboard/pips" 
          icon={<FileText className="h-4 w-4" />} 
          label="PIPs Management" 
          active={isActive('/dashboard/pips')}
        />
        <SidebarLink 
          href="/dashboard/accountability" 
          icon={<Users className="h-4 w-4" />} 
          label="Accountability" 
          active={isActive('/dashboard/accountability')}
        />
        <SidebarLink 
          href="/dashboard/reports" 
          icon={<BarChart className="h-4 w-4" />} 
          label="Reports & Analytics" 
          active={isActive('/dashboard/reports')}
        />
        
        <div className="mt-6 mb-2 px-2 text-xs font-semibold text-slate-500 uppercase">Tools</div>
        <SidebarLink 
          href="/create-pip/transcript-source" 
          icon={<FileText className="h-4 w-4" />} 
          label="Transcript Tools" 
          active={isActive('/create-pip/transcript')}
        />
        <SidebarLink 
          href="/dashboard/notifications" 
          icon={<Bell className="h-4 w-4" />} 
          label="Notifications" 
          active={isActive('/dashboard/notifications')}
        />
        <SidebarLink 
          href="/dashboard/filters" 
          icon={<Filter className="h-4 w-4" />} 
          label="Filters & Search" 
          active={isActive('/dashboard/filters')}
        />
        
        <div className="mt-6 mb-2 px-2 text-xs font-semibold text-slate-500 uppercase">Account</div>
        <SidebarLink 
          href="/dashboard/profile" 
          icon={<UserIcon className="h-4 w-4" />} 
          label="My Profile" 
          active={isActive('/dashboard/profile')}
        />
        <SidebarLink 
          href="/dashboard/settings" 
          icon={<Settings className="h-4 w-4" />} 
          label="Settings" 
          active={isActive('/dashboard/settings') && !isActive('/dashboard/settings/pip-templates')}
        />
        {/* PIP Templates management removed */}
      </div>
      
      {/* Help & Resources */}
      <div className="p-4 border-t border-slate-200">
        <SidebarLink 
          href="/dashboard/help" 
          icon={<HelpCircle className="h-4 w-4" />} 
          label="Help & Resources" 
          active={isActive('/dashboard/help')}
        />
      </div>
    </div>
  );
} 