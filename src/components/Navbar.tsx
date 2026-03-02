import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { LogOut, BarChart3, UserCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <motion.nav
      className="sticky top-0 z-50 surface-glass"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to={user ? '/dashboard' : '/'} className="flex items-center gap-2">
          <motion.div
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-primary"
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 17 }}
          >
            <BarChart3 className="h-4 w-4 text-primary-foreground" />
          </motion.div>
          <span className="text-lg font-bold tracking-tight">Trajectory</span>
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              {['Dashboard', 'Habits', 'Simulate'].map((item, i) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i, duration: 0.3 }}
                >
                  <Link to={`/${item.toLowerCase()}`}>
                    <Button variant="ghost" size="sm" className="transition-colors duration-200">{item}</Button>
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
              >
                <Button variant="ghost" size="sm" onClick={handleSignOut} className="transition-colors duration-200">
                  <LogOut className="h-4 w-4" />
                </Button>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, type: 'spring', stiffness: 300, damping: 20 }}
              >
                <Link to="/profile">
                  <motion.div
                    className="flex items-center justify-center rounded-full border-2 border-border hover:border-primary/50 h-8 w-8 overflow-hidden bg-secondary"
                    whileHover={{ scale: 1.1, borderColor: 'hsl(174, 72%, 46%)' }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 17 }}
                  >
                    <UserCircle className="h-6 w-6 text-muted-foreground" />
                  </motion.div>
                </Link>
              </motion.div>
            </>
          ) : (
            <>
              <Link to="/auth">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link to="/auth?mode=register">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button size="sm" className="bg-gradient-primary text-primary-foreground hover:opacity-90">
                    Get Started
                  </Button>
                </motion.div>
              </Link>
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
}
