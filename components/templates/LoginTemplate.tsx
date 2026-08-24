import { Logo } from "@/components/atoms/Logo";
import { appTheme } from "@/lib/theme";
import { LoginForm } from "@/components/organisms/LoginForm";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

interface LoginTemplateProps {
  onLogin: (email: string, pass: string) => Promise<void>;
  isLoading: boolean;
}

export function LoginTemplate({ onLogin, isLoading }: LoginTemplateProps) {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 bg-white relative overflow-hidden font-sans">
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-emerald-100 rounded-full blur-[120px] opacity-80" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[55%] h-[55%] bg-teal-100 rounded-full blur-[150px] opacity-70" />
        <div className="absolute top-[18%] right-[12%] w-[28%] h-[28%] bg-lime-50 rounded-full blur-[100px] opacity-90" />
      </div>

      <div
        className="absolute inset-0 z-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#0f172a 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }}
      />

      <div className="relative z-10 w-full flex flex-col items-center max-w-lg">
        <div className="mb-8 animate-in fade-in zoom-in duration-1000 slide-in-from-top-4 ease-out">
          <Logo width={190} height={120} className="relative drop-shadow-2xl" />
        </div>

        {/* Login Card with Glassmorphism */}
        <Card className="w-full max-w-[420px] bg-white/95 backdrop-blur-xl shadow-[0_32px_64px_-24px_rgba(15,23,42,0.18)] border-emerald-100 animate-in slide-in-from-bottom-12 duration-700 ease-out-expo overflow-hidden">
          <div
            className="absolute top-0 left-0 h-[6px] w-full"
            style={{
              backgroundImage: `linear-gradient(to right, ${appTheme.colors.primary}, #34d399, ${appTheme.colors.primaryDark})`,
            }}
          />

          <CardHeader className="space-y-2 text-center pt-10 pb-6 px-8">
            <div
              className="inline-flex items-center justify-center self-center rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-[0.24em]"
              style={{ color: appTheme.colors.primaryText }}
            >
              {appTheme.brandName}
            </div>
            <CardTitle className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Chào mừng trở lại
            </CardTitle>
            <CardDescription className="text-slate-500 font-medium leading-relaxed">
              Đăng nhập để tiếp tục
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col items-center pb-12 px-10">
            <LoginForm onSubmit={onLogin} isLoading={isLoading} />

            <div className="mt-8 flex items-center justify-center w-full">
              <div className="h-px flex-1 bg-slate-100" />
              <button
                className="mx-4 text-xs font-semibold text-slate-400 transition-all uppercase tracking-wider hover:underline"
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = appTheme.colors.primary;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "";
                }}
              >
                Quên mật khẩu?
              </button>
              <div className="h-px flex-1 bg-slate-100" />
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="mt-12 flex flex-col items-center gap-2 animate-in fade-in duration-1000 delay-500">
          <p className="text-slate-400 text-[10px] uppercase tracking-[0.2em] font-bold">
            &copy; {new Date().getFullYear()} {appTheme.brandName.toUpperCase()}
          </p>
          <div className="flex items-center gap-4 text-slate-300 text-[11px] font-medium">
            <span className="hover:text-slate-500 cursor-help transition-colors">
              Privacy
            </span>
            <span>&bull;</span>
            <span className="hover:text-slate-500 cursor-help transition-colors">
              Security
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
