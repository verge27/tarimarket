import { Link } from 'react-router-dom';
import { Shield, ShoppingBag, User, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getCurrentUser, setCurrentUser, DEMO_USERS } from '@/lib/data';
import { useState, useEffect } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Navbar = () => {
  const [currentUser, setUser] = useState(getCurrentUser());

  const handleUserSwitch = (userId: string) => {
    const user = DEMO_USERS.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      setUser(user);
      window.location.reload();
    }
  };

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
            
            {currentUser && (
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
              </>
            )}

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <User className="w-4 h-4" />
                  {currentUser ? currentUser.displayName : 'Login'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Demo Users</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {DEMO_USERS.map(user => (
                  <DropdownMenuItem
                    key={user.id}
                    onClick={() => handleUserSwitch(user.id)}
                    className={currentUser?.id === user.id ? 'bg-primary/20' : ''}
                  >
                    {user.displayName}
                  </DropdownMenuItem>
                ))}
                {currentUser && (
                  <>
                    <DropdownMenuSeparator />
                    <Link to="/settings">
                      <DropdownMenuItem>Settings</DropdownMenuItem>
                    </Link>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
};
