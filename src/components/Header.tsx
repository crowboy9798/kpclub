import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Users, Calendar, Mail, UserCheck, Home, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Events', href: '/events', icon: Calendar },
    { name: 'Newsletter', href: '/newsletter', icon: Mail },
    { name: 'New Membership', href: '/membership', icon: Users },
    { name: 'Contact', href: '/contact', icon: Mail },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-primary shadow-elegant sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo and Club Name */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-glow transition-smooth group-hover:scale-105">
              <img src="/lovable-uploads/a6d3b80c-ee71-454e-989a-d2fd3a8a98ef.png" alt="Probus Logo" className="w-12 h-12 rounded-full" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-primary-foreground">Kensington Probus Club</h1>
              <p className="text-sm text-primary-foreground/80">Connecting Community & Friendship</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-smooth ${
                    isActive(item.href)
                      ? 'bg-secondary text-secondary-foreground shadow-glow'
                      : 'text-primary-foreground hover:bg-primary-glow hover:text-primary-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden text-primary-foreground hover:bg-primary-glow"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden py-4 border-t border-primary-glow/20">
            <div className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-smooth ${
                      isActive(item.href)
                        ? 'bg-secondary text-secondary-foreground shadow-glow'
                        : 'text-primary-foreground hover:bg-primary-glow'
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
};

export default Header;