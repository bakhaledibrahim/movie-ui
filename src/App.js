import React from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { GenreProvider } from './context/GenreContext';
import BrowsePage from './pages/BrowsePage';
import MediaPage from './pages/MediaPage';
import PlayerPage from './pages/PlayerPage';
import GridPage from './pages/GridPage';
import MyListPage from './pages/MyListPage';
import PersonPage from './pages/PersonPage';
import SearchPage from './pages/SearchPage';
import Header from './components/Header';

const pageVariants = {
    initial: { opacity: 0 },
    in: { opacity: 1 },
    out: { opacity: 0 },
};

const pageTransition = {
    type: 'tween',
    ease: 'easeInOut',
    duration: 0.8,
};

const AnimatedRoutes = () => {
    const location = useLocation();

    return (
        <>
            <Routes location={location} key={location.pathname.split('/')[1]}>
                <Route path="/player/:mediaType/:id" element={null} />
                <Route path="/player/:mediaType/:id/:season/:episode" element={null} />
                <Route path="*" element={<Header />} />
            </Routes>

            <AnimatePresence mode="wait">
                <Routes location={location} key={location.pathname}>
                    <Route path="/" element={<motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}><BrowsePage /></motion.div>} />
                    <Route path="/search" element={<motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}><SearchPage /></motion.div>} />
                    <Route path="/movies" element={<motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}><MediaPage key="movies" mediaType="movie" /></motion.div>} />
                    <Route path="/tv" element={<motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}><MediaPage key="tv" mediaType="tv" /></motion.div>} />
                    <Route path="/anime" element={<motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}><MediaPage key="anime" mediaType="anime" /></motion.div>} />
                    <Route path="/my-list" element={<motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}><MyListPage /></motion.div>} />
                    <Route path="/person/:personId" element={<motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}><PersonPage /></motion.div>} />
                    <Route path="/view/:mediaType/:category" element={<motion.div initial="initial" animate="in" exit="out" variants={pageVariants} transition={pageTransition}><GridPage /></motion.div>} />
                    <Route path="/player/:mediaType/:id" element={<PlayerPage />} />
                    <Route path="/player/:mediaType/:id/:season/:episode" element={<PlayerPage />} />
                </Routes>
            </AnimatePresence>
        </>
    );
};

function App() {
    return (
        <Router>
            <GenreProvider>
                <div className="bg-brand-bg min-h-screen text-white">
                    <AnimatedRoutes />
                </div>
            </GenreProvider>
        </Router>
    );
}

export default App;