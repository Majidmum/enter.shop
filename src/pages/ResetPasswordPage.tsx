import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Laptop, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import PageMeta from '@/components/common/PageMeta';
import { supabase } from '@/db/supabase';

const schema = z
  .object({
    password: z.string().min(8, 'Пароль должен содержать не менее 8 символов'),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: 'Пароли не совпадают',
    path: ['confirmPassword'],
  });

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  // Пока Supabase не обработает ссылку из письма (в адресе есть служебный код),
  // сессии для смены пароля ещё нет — показываем форму, только когда она готова.
  const [ready, setReady] = useState(false);

  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirmPassword: '' },
  });

  useEffect(() => {
    // Supabase сам обрабатывает код из ссылки в URL и создаёт временную сессию —
    // просто ждём событие PASSWORD_RECOVERY (или уже готовую сессию, если событие
    // успело сработать до подписки).
    const { data: listener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true);
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  const onSubmit = async (data: z.infer<typeof schema>) => {
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password: data.password });
    setLoading(false);
    if (error) {
      toast.error('Не удалось изменить пароль. Возможно, ссылка устарела — запросите новую.');
      return;
    }
    toast.success('Пароль изменён! Теперь можно войти с новым паролем.');
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <PageMeta title="Новый пароль — ENTER.TJ" description="Задайте новый пароль для аккаунта ENTER.TJ." noIndex />
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Laptop className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold">ENTER<span className="text-primary">.TJ</span></span>
        </div>

        {!ready ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground text-sm">
              Проверяем ссылку... Если ничего не происходит — ссылка могла устареть,{' '}
              <a href="/forgot-password" className="text-primary hover:underline">запросите новую</a>.
            </p>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-1">Новый пароль</h2>
            <p className="text-muted-foreground text-sm mb-6">Придумайте новый пароль для входа</p>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <FormField control={form.control} name="password" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Новый пароль</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input type={showPw ? 'text' : 'password'} placeholder="••••••••" {...field} />
                        <button
                          type="button"
                          onClick={() => setShowPw((v) => !v)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                        >
                          {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Повторите пароль</FormLabel>
                    <FormControl><Input type={showPw ? 'text' : 'password'} placeholder="••••••••" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90 text-white font-semibold">
                  {loading ? 'Сохраняем...' : 'Сохранить новый пароль'}
                </Button>
              </form>
            </Form>
          </>
        )}
      </div>
    </div>
  );
}
