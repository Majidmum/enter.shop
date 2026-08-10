import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Laptop, Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(6, 'Пароль должен содержать не менее 6 символов'),
});

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data: z.infer<typeof loginSchema>) => {
    setLoading(true);
    const ok = await login(data.email, data.password);
    setLoading(false);
    if (ok) {
      const { user } = useAuthStore.getState();
      toast.success('Вход выполнен успешно!');
      // Администратор → панель управления, пользователь → аккаунт
      navigate(user?.role === 'admin' ? '/admin' : '/account');
    } else {
      toast.error('Неверный email или пароль');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-secondary relative overflow-hidden">
        <div className="relative z-10 text-center px-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary mx-auto mb-4">
            <Laptop className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">ENTER<span className="text-primary">.TJ</span></h1>
          <p className="text-white/70">Компьютерная техника и офисная мебель в Душанбе</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 flex-col items-center justify-center bg-background p-6">
        <div className="w-full max-w-sm">
          <div className="md:hidden flex items-center gap-2 mb-8">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Laptop className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">ENTER<span className="text-primary">.TJ</span></span>
          </div>

          <h2 className="text-2xl font-bold text-foreground mb-1">Вход</h2>
          <p className="text-muted-foreground text-sm mb-6">Введите свои данные</p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl><Input type="email" placeholder="your@email.com" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="password" render={({ field }) => (
                <FormItem>
                  <FormLabel>Пароль</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input type={showPw ? 'text' : 'password'} placeholder="••••••••" {...field} className="pr-10" />
                      <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                        {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="text-right">
                <Link to="/forgot-password" className="text-xs text-primary hover:underline">Забыли пароль?</Link>
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90 text-white font-semibold">
                {loading ? 'Вход...' : 'Войти'}
              </Button>
            </form>
          </Form>

          <p className="text-center text-sm text-muted-foreground mt-4">
            Нет аккаунта?{' '}
            <Link to="/register" className="text-primary hover:underline font-medium">Зарегистрироваться</Link>
          </p>

          <div className="mt-4 p-3 rounded-lg bg-muted text-xs text-muted-foreground flex flex-col gap-1.5">
            <p className="font-semibold text-foreground">Тестовые аккаунты:</p>
            <div className="flex items-center justify-between">
              <span>👤 Пользователь: <span className="font-medium">demo@enter.tj</span></span>
              <span className="text-muted-foreground">любой пароль 6+ симв.</span>
            </div>
            <div className="flex items-center justify-between">
              <span>🔐 Администратор: <span className="font-medium">admin@enter.tj</span></span>
              <span className="font-medium text-primary">admin123</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
