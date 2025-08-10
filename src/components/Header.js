import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { FaSearch, FaBell, FaUser } from 'react-icons/fa';
import { useScroll } from '../hooks/useScroll';

const Header = () => {
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [query, setQuery] = useState('');
    const isScrolled = useScroll();
    const location = useLocation();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const inputRef = useRef(null);

    useEffect(() => {
        const urlQuery = searchParams.get('q') || '';
        setQuery(urlQuery);
        if (location.pathname === '/search') {
            setIsSearchOpen(true);
        }
    }, [location, searchParams]);

    useEffect(() => {
        if (isSearchOpen) {
            inputRef.current?.focus();
        }
    }, [isSearchOpen]);

    useEffect(() => {
        const handler = setTimeout(() => {
            if (query.trim() !== '') {
                if (query !== (searchParams.get('q') || '')) {
                    navigate(`/search?q=${encodeURIComponent(query)}`);
                }
            } else {
                if (location.pathname === '/search') {
                    navigate('/');
                }
            }
        }, 500);

        return () => clearTimeout(handler);
    }, [query, navigate, location.pathname, searchParams]);

    const handleSearchChange = (e) => setQuery(e.target.value);
    const handleNavClick = () => {
        setQuery('');
        setIsSearchOpen(false);
    };

    const getLinkClass = (path) => {
        return location.pathname === path ? 'font-bold text-white' : 'text-gray-300 hover:text-gray-400';
    };

    return (
        <header className={`fixed top-0 left-0 right-0 p-4 z-50 flex justify-between items-center transition-all duration-500 ${isScrolled ? 'bg-black/50 backdrop-blur-md' : 'bg-gradient-to-b from-black to-transparent'}`}>
            <div className="flex items-center space-x-8">
                <Link to="/" className="text-red-600 text-3xl font-bold" onClick={handleNavClick}>VIDFLIX</Link>
                <nav className="hidden md:flex space-x-4">
                    <Link to="/" className={getLinkClass('/')} onClick={handleNavClick}>Home</Link>
                    <Link to="/movies" className={getLinkClass('/movies')}>Movies</Link>
                    <Link to="/tv" className={getLinkClass('/tv')}>TV Shows</Link>
                    {/* New Anime link */}
                    <Link to="/anime" className={getLinkClass('/anime')}>Anime</Link>
                    <Link to="/my-list" className={getLinkClass('/my-list')}>My List</Link>
                </nav>
            </div>
            <div className="flex items-center space-x-4">
                <div className="flex items-center">
                    <FaSearch className="cursor-pointer" onClick={() => setIsSearchOpen(prev => !prev)} />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={handleSearchChange}
                        placeholder="Titles, people, genres"
                        className={`bg-black/50 text-white border border-white/20 rounded-md ml-2 p-1 transition-all duration-300 ${isSearchOpen ? 'w-48 opacity-100' : 'w-0 opacity-0'}`}
                    />
                </div>
                <FaBell className="cursor-pointer" />
                <FaUser className="cursor-pointer" />
            </div>
        </header>
    );
};

export default Header;