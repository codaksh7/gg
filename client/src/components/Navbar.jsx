import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, LogOut, BookOpen, DollarSign, Briefcase } from 'lucide-react';

function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Course Rec', path: '/courses', icon: <BookOpen size={16} /> },
    { name: 'Loan Assessment', path: '/loans', icon: <DollarSign size={16} /> },
    { name: 'Job Discovery', path: '/jobs', icon: <Briefcase size={16} /> },
  ];

  return (
    <nav className="navbar">
      <div className="container">
        <Link to="/" className="navbar-logo" onClick={() => setMobileMenuOpen(false)}>
          Grad<span>Guide</span>
        </Link>

        {/* Desktop Nav */}
        <div className="navbar-links hidden md:flex">
          {user && navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`flex items-center gap-2 ${location.pathname.startsWith(link.path) ? 'active' : ''}`}
            >
              {link.icon}
              {link.name}
            </Link>
          ))}
          
          {user ? (
            <div className="nav-user ml-4 pl-4 border-l border-gray-700">
              <span className="nav-user-name">{user.name}</span>
              <button onClick={logout} className="text-gray-400 hover:text-white" title="Logout">
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button 
          className="mobile-menu-btn md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileMenuOpen && (
        <div className="mobile-nav">
          <Link to="/" onClick={() => setMobileMenuOpen(false)}>Home</Link>
          
          {user && navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setMobileMenuOpen(false)}
              className={location.pathname.startsWith(link.path) ? 'text-purple-400' : ''}
            >
              {link.name}
            </Link>
          ))}
          
          {user ? (
            <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="text-red-400 mt-4 flex items-center gap-2">
              <LogOut size={20} /> Logout
            </button>
          ) : (
            <div className="flex flex-col gap-4 mt-4 text-center">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>Login</Link>
              <Link to="/register" className="text-purple-400" onClick={() => setMobileMenuOpen(false)}>Register</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}

export default Navbar;
