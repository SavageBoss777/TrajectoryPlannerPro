import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

export default function Habits() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [habits, setHabits] = useState({
    study_hours: '10',
    workout_freq: '3',
    skill_hours: '5',
    sleep_avg: '7',
    spending: '1500',
    savings_rate: '15',
  });

  useEffect(() => {
    if (!user) return;
    supabase.from('habits').select('*').eq('user_id', user.id).maybeSingle().then(({ data }) => {
      if (data) {
        setHabits({
          study_hours: data.study_hours?.toString() || '10',
          workout_freq: data.workout_freq?.toString() || '3',
          skill_hours: data.skill_hours?.toString() || '5',
          sleep_avg: data.sleep_avg?.toString() || '7',
          spending: data.spending?.toString() || '1500',
          savings_rate: data.savings_rate?.toString() || '15',
        });
      }
    });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    const payload = {
      user_id: user.id,
      study_hours: parseFloat(habits.study_hours) || 0,
      workout_freq: parseFloat(habits.workout_freq) || 0,
      skill_hours: parseFloat(habits.skill_hours) || 0,
      sleep_avg: parseFloat(habits.sleep_avg) || 7,
      spending: parseFloat(habits.spending) || 0,
      savings_rate: parseFloat(habits.savings_rate) || 0,
    };

    const { error } = await supabase.from('habits').upsert(payload, { onConflict: 'user_id' });
    if (error) toast.error(error.message);
    else toast.success('Habits saved');
    setLoading(false);
  };

  const fields = [
    { key: 'study_hours', label: 'Weekly Study Hours', placeholder: '10' },
    { key: 'workout_freq', label: 'Weekly Workouts', placeholder: '3' },
    { key: 'skill_hours', label: 'Weekly Skill-Building Hours', placeholder: '5' },
    { key: 'sleep_avg', label: 'Average Sleep (hours)', placeholder: '7' },
    { key: 'spending', label: 'Monthly Spending ($)', placeholder: '1500' },
    { key: 'savings_rate', label: 'Savings Rate (%)', placeholder: '15' },
  ] as const;

  return (
    <div className="container mx-auto max-w-lg px-4 py-12">
      <h1 className="mb-2 text-2xl font-bold opacity-0 animate-fade-in">Your Habits</h1>
      <p className="mb-8 text-sm text-muted-foreground opacity-0 animate-fade-in-delay-1">Weekly and monthly behavioral inputs that drive your simulations.</p>

      <div className="space-y-5 opacity-0 animate-fade-in-delay-2">
        <div className="grid grid-cols-2 gap-4">
          {fields.map((f) => (
            <div key={f.key} className="space-y-2">
              <Label>{f.label}</Label>
              <Input
                type="number"
                value={habits[f.key]}
                onChange={(e) => setHabits({ ...habits, [f.key]: e.target.value })}
                placeholder={f.placeholder}
              />
            </div>
          ))}
        </div>
        <Button onClick={handleSave} disabled={loading} className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90">
          {loading ? 'Saving...' : 'Save Habits'}
        </Button>
      </div>
    </div>
  );
}
