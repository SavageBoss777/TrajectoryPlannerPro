import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

export default function Profile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState({
    age: '',
    education_level: 'undergraduate',
    major: '',
    baseline_gpa: '',
    income: '',
    health_score: '70',
  });

  useEffect(() => {
    if (!user) return;
    supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle().then(({ data }) => {
      if (data) {
        setProfile({
          age: data.age?.toString() || '',
          education_level: data.education_level || 'undergraduate',
          major: data.major || '',
          baseline_gpa: data.baseline_gpa?.toString() || '',
          income: data.income?.toString() || '',
          health_score: data.health_score?.toString() || '70',
        });
      }
    });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    const payload = {
      user_id: user.id,
      age: parseInt(profile.age) || null,
      education_level: profile.education_level,
      major: profile.major || null,
      baseline_gpa: parseFloat(profile.baseline_gpa) || null,
      income: parseFloat(profile.income) || null,
      health_score: parseFloat(profile.health_score) || 70,
    };

    const { error } = await supabase.from('profiles').upsert(payload, { onConflict: 'user_id' });
    if (error) toast.error(error.message);
    else toast.success('Profile saved');
    setLoading(false);
  };

  return (
    <div className="container mx-auto max-w-lg px-4 py-12">
      <h1 className="mb-2 text-2xl font-bold opacity-0 animate-fade-in">Your Profile</h1>
      <p className="mb-8 text-sm text-muted-foreground opacity-0 animate-fade-in-delay-1">This baseline data powers your simulations.</p>

      <div className="space-y-5 opacity-0 animate-fade-in-delay-2">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Age</Label>
            <Input type="number" value={profile.age} onChange={(e) => setProfile({ ...profile, age: e.target.value })} placeholder="21" />
          </div>
          <div className="space-y-2">
            <Label>Education Level</Label>
            <Select value={profile.education_level} onValueChange={(v) => setProfile({ ...profile, education_level: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="high_school">High School</SelectItem>
                <SelectItem value="undergraduate">Undergraduate</SelectItem>
                <SelectItem value="graduate">Graduate</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Major / Career Goal</Label>
          <Input value={profile.major} onChange={(e) => setProfile({ ...profile, major: e.target.value })} placeholder="Computer Science" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Current GPA</Label>
            <Input type="number" step="0.01" min="0" max="4" value={profile.baseline_gpa} onChange={(e) => setProfile({ ...profile, baseline_gpa: e.target.value })} placeholder="3.5" />
          </div>
          <div className="space-y-2">
            <Label>Annual Income ($)</Label>
            <Input type="number" value={profile.income} onChange={(e) => setProfile({ ...profile, income: e.target.value })} placeholder="45000" />
          </div>
        </div>
        <div className="space-y-2">
          <Label>Health Score (0–100)</Label>
          <Input type="number" min="0" max="100" value={profile.health_score} onChange={(e) => setProfile({ ...profile, health_score: e.target.value })} placeholder="70" />
        </div>
        <Button onClick={handleSave} disabled={loading} className="w-full bg-gradient-primary text-primary-foreground hover:opacity-90">
          {loading ? 'Saving...' : 'Save Profile'}
        </Button>
      </div>
    </div>
  );
}
