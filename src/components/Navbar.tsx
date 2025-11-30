import { Link } from 'react-router-dom';
import { Shield, ShoppingBag, User, Package, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { NavLink } from './NavLink';

export const Navbar = () => {
  const { user, signOut } = useAuth();

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <Shield className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-2xl font-bold text-gradient">Tari Market</span>
          </Link>

          <div className="flex items-center gap-6">
            <Link to="/browse">
              <Button variant="ghost" className="gap-2">
                <ShoppingBag className="w-4 h-4" />
                Browse
              </Button>
            </Link>
            
            {user && (
              <>
                <Link to="/orders">
                  <Button variant="ghost" className="gap-2">
                    <Package className="w-4 h-4" />
                    Orders
                  </Button>
                </Link>
                <Link to="/sell">
                  <Button variant="secondary" className="gap-2">
                    Sell
                  </Button>
                </Link>
                <Link to="/settings">
                  <Button variant="ghost" size="icon">
                    <User className="w-4 h-4" />
                  </Button>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => signOut()}>
                  <LogOut className="w-4 h-4" />
                </Button>
              </>
            )}

            {!user && (
              <Link to="/auth">
                <Button>Sign In</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
