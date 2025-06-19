
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, BookOpen, Users, Calendar, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-blue-600 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8" />
            <span className="font-bold text-xl">EduPortal</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`hover:text-blue-200 transition-colors ${
                isActive('/') ? 'text-blue-200' : ''
              }`}
            >
              Home
            </Link>
            <Link
              to="/batches"
              className={`hover:text-blue-200 transition-colors ${
                isActive('/batches') ? 'text-blue-200' : ''
              }`}
            >
              Batches
            </Link>
            <Link
              to="/live-classes"
              className={`hover:text-blue-200 transition-colors ${
                isActive('/live-classes') ? 'text-blue-200' : ''
              }`}
            >
              Live Classes
            </Link>
            <Link
              to="/admin"
              className="flex items-center space-x-1 hover:text-blue-200 transition-colors"
            >
              <LogIn className="h-4 w-4" />
              <span>Admin</span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="text-white hover:bg-blue-700"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-blue-500">
            <div className="flex flex-col space-y-4">
              <Link
                to="/"
                className={`hover:text-blue-200 transition-colors ${
                  isActive('/') ? 'text-blue-200' : ''
                }`}
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/batches"
                className={`hover:text-blue-200 transition-colors ${
                  isActive('/batches') ? 'text-blue-200' : ''
                }`}
                onClick={() => setIsOpen(false)}
              >
                Batches
              </Link>
              <Link
                to="/live-classes"
                className={`hover:text-blue-200 transition-colors ${
                  isActive('/live-classes') ? 'text-blue-200' : ''
                }`}
                onClick={() => setIsOpen(false)}
              >
                Live Classes
              </Link>
              <Link
                to="/admin"
                className="flex items-center space-x-1 hover:text-blue-200 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <LogIn className="h-4 w-4" />
                <span>Admin</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
