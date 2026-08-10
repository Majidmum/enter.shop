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

const schema = z.object({
  name: z.string().min(2, 'Введите полное имя'),
  phone: z.string().min(9, 'Введите корректный номер телефона'),
  email: z.string().email('Некорректный email'),
  password: z.string().min(8, 'Пароль должен содержать не менее 8 символов'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Пароли не совпадают',
  path: ['confirmPassword'],
});

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuthStore();
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', phone: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    await register(data.name, data.email, data.phone, data.password);
    setLoading(false);
    toast.success('Аккаунт создан! Добро пожаловать!');
    navigate('/account');
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden md:flex flex-1 flex-col items-center justify-center bg-secondary">
        <div className="text-center px-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary mx-auto mb-4">
            <Laptop className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">ENTER<span className="text-primary">.TJ</span></h1>
          <p className="text-white/70">Присоединяйтесь к тысячам довольных покупателей</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center bg-background p-6">
        <div className="w-full max-w-sm">
          <div className="md:hidden flex items-center gap-2 mb-6">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Laptop className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold">ENTER<span className="text-primary">.TJ</span></span>
          </div>

          <h2 className="text-2xl font-bold mb-1">Создать аккаунт</h2>
          <p className="text-muted-foreground text-sm mb-6">Заполните данные для регистрации</p>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-3">
              <FormField control={form.control} name="name" render={({ field }) => (
                <FormItem>
                  <FormLabel>Полное имя</FormLabel>
                  <FormControl><Input placeholder="Рустам Каримов" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem>
                  <FormLabel>Телефон</FormLabel>
                  <FormControl><Input placeholder="+992 9XX XXX XXX" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
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
                      <Input type={showPw ? 'text' : 'password'} placeholder="Минимум 8 символов" {...field} className="pr-10" />
                      <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="confirmPassword" render={({ field }) => (
                <FormItem>
                  <FormLabel>Подтвердить пароль</FormLabel>
                  <FormControl><Input type="password" placeholder="Повторите пароль" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <Button type="submit" disabled={loading} className="w-full bg-primary hover:bg-primary/90 text-white font-semibold mt-2">
                {loading ? 'Создание...' : 'Создать аккаунт'}
              </Button>
            </form>
          </Form>

          <p className="text-center text-sm text-muted-foreground mt-4">
            Уже есть аккаунт?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">Войти</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
