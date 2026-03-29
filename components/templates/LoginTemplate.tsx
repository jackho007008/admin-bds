import { Logo } from "@/components/atoms/Logo";
import { LoginForm } from "@/components/organisms/LoginForm";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface LoginTemplateProps {
  onLogin: (email: string, pass: string) => Promise<void>;
  isLoading: boolean;
}

export function LoginTemplate({ onLogin, isLoading }: LoginTemplateProps) {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center p-4 bg-slate-950 relative overflow-hidden font-sans">
      {/* Premium Static Mesh Gradient Background */}
      <div className="absolute inset-0 z-0 text-white">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#0ba149] rounded-full blur-[120px] opacity-20" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#0F612D] rounded-full blur-[150px] opacity-30" />
        <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-emerald-500 rounded-full blur-[100px] opacity-10" />
      </div>

      {/* SVG Pattern Overlay */}
      <div className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none" 
        style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} 
      />

      <div className="relative z-10 w-full flex flex-col items-center max-w-lg">
        {/* Logo Section */}
        <div className="mb-10 animate-in fade-in zoom-in duration-1000 slide-in-from-top-4 ease-out">
          <div className="relative group">
            <Logo width={200} height={130} className="relative drop-shadow-2xl" />
          </div>
        </div>


        {/* Login Card with Glassmorphism */}
        <Card className="w-full max-w-[420px] bg-white/95 backdrop-blur-xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] border-white/20 animate-in slide-in-from-bottom-12 duration-700 ease-out-expo overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-[6px] bg-gradient-to-r from-[#0ba149] via-emerald-400 to-[#0F612D]" />
          
          <CardHeader className="space-y-2 text-center pt-10 pb-6 px-8">
            <CardTitle className="text-3xl font-extrabold text-slate-900 tracking-tight">
              BDS <span className="text-[#0ba149]">Admin</span>
            </CardTitle>
            <CardDescription className="text-slate-500 font-medium">
              Trung tâm quản lý hệ thống Nhật Phát Land
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col items-center pb-12 px-10">
            <LoginForm onSubmit={onLogin} isLoading={isLoading} />
            
            <div className="mt-8 flex items-center justify-center w-full">
              <div className="h-px flex-1 bg-slate-100" />
              <button className="mx-4 text-xs font-semibold text-slate-400 hover:text-[#0ba149] transition-all uppercase tracking-wider hover:underline">
                Quên mật khẩu?
              </button>
              <div className="h-px flex-1 bg-slate-100" />
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-12 flex flex-col items-center gap-2 animate-in fade-in duration-1000 delay-500">
          <p className="text-white/40 text-[10px] uppercase tracking-[0.2em] font-bold">
            &copy; {new Date().getFullYear()} NHAT PHAT LAND &bull; INTERNAL SYSTEM
          </p>
          <div className="flex items-center gap-4 text-white/20 text-[11px] font-medium">
            <span className="hover:text-white/40 cursor-help transition-colors">Privacy</span>
            <span>&bull;</span>
            <span className="hover:text-white/40 cursor-help transition-colors">Security</span>
          </div>
        </div>
      </div>
    </div>
  );
}


