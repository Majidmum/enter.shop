import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Laptop, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import PageMeta from '@/components/common/PageMeta';

const schema = z.object({ email: z.string().email('Некорректный email') });

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { email: '' } });

  const onSubmit = (data: z.infer<typeof schema>) => {
    console.log('Reset email for:', data.email);
    setSent(true);
    toast.success('Ссылка для сброса отправлена!');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-6">
      <PageMeta title="Восстановление пароля — ENTER.TJ" description="Восстановите доступ к аккаунту ENTER.TJ." noIndex />
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-2 mb-8">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <Laptop className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold">ENTER<span className="text-primary">.TJ</span></span>
        </div>

        {sent ? (
          <div className="text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Письмо отправлено!</h2>
            <p className="text-muted-foreground text-sm mb-6">Проверьте почту и следуйте инструкциям для сброса пароля.</p>
            <Link to="/login"><Button className="bg-primary hover:bg-primary/90 text-white">Вернуться ко входу</Button></Link>
          </div>
        ) : (
          <>
            <h2 className="text-2xl font-bold mb-1">Забыли пароль?</h2>
            <p className="text-muted-foreground text-sm mb-6">Введите email и мы отправим вам ссылку для сброса</p>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl><Input type="email" placeholder="your@email.com" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 text-white font-semibold">Отправить ссылку</Button>
              </form>
            </Form>
            <p className="text-center text-sm text-muted-foreground mt-4">
              <Link to="/login" className="text-primary hover:underline">Вернуться ко входу</Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
