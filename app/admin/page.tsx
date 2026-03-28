import { 
  Building2, 
  Users, 
  TrendingUp, 
  Eye,
  PlusCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";

const stats = [
  { 
    label: "Total Properties", 
    value: "128", 
    icon: Building2, 
    trend: "+12% from last month",
    trendType: "up"
  },
  { 
    label: "Active Users", 
    value: "2,450", 
    icon: Users, 
    trend: "+5% from last month",
    trendType: "up"
  },
  { 
    label: "Total Revenue", 
    value: "$45,200", 
    icon: TrendingUp, 
    trend: "+18% from last month",
    trendType: "up"
  },
  { 
    label: "Page Views", 
    value: "15.4K", 
    icon: Eye, 
    trend: "+24% from last month",
    trendType: "up"
  },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard Overview</h1>
          <p className="text-slate-500 mt-1">Welcome back, Admin! Here's what's happening today.</p>
        </div>
        <Button className="flex items-center gap-2">
          <PlusCircle className="w-4 h-4" />
          Add New Property
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                <stat.icon className="w-6 h-6" />
              </div>
              <span className={stat.trendType === "up" ? "text-green-600 text-xs font-medium" : "text-red-600 text-xs font-medium"}>
                {stat.trend}
              </span>
            </div>
            <h3 className="text-slate-500 text-sm font-medium">{stat.label}</h3>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Recent Property Listings</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-200 rounded-md"></div>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">Luxury Apartment in District {i}</h4>
                    <p className="text-xs text-slate-500">Listed by Admin • 2 hours ago</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-600 text-sm">$250,000</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Active</p>
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-6">View All Listings</Button>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h2 className="text-xl font-bold text-slate-900 mb-6">New Registered Users</h2>
          <div className="space-y-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 flex items-center justify-center rounded-full font-bold text-sm">
                  JD
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-slate-900 text-sm">John Doe {i}</h4>
                  <p className="text-xs text-slate-500">john.doe{i}@example.com</p>
                </div>
                <div className="text-[10px] text-slate-400 font-medium whitespace-nowrap">
                  10m ago
                </div>
              </div>
            ))}
          </div>
          <Button variant="outline" className="w-full mt-10">Manage Users</Button>
        </div>
      </div>
    </div>
  );
}
