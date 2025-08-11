import React, { createContext, useState, useContext } from 'react';

const AmbianceContext = createContext();

export const useAmbiance = () => useContext(AmbianceContext);

const genreColorMap = {
    28: ['#1e3a8a', '#141414'], // Action -> Blue
    12: ['#f59e0b', '#141414'], // Adventure -> Amber
    16: ['#ec4899', '#141414'], // Animation -> Pink
    35: ['#facc15', '#141414'], // Comedy -> Yellow
    80: ['#7f1d1d', '#141414'], // Crime -> Dark Red
    99: ['#6b7280', '#141414'], // Documentary -> Gray
    18: ['#9a3412', '#141414'], // Drama -> Orange
    14: ['#8b5cf6', '#141414'], // Fantasy -> Violet
    27: ['#450a0a', '#141414'], // Horror -> Darker Red
    9648: ['#065f46', '#141414'],// Mystery -> Green
    878: ['#0e7490', '#141414'], // Sci-Fi -> Cyan
    53: ['#1f2937', '#141414'], // Thriller -> Slate
};

const defaultAmbiance = ['#2c2c2c', '#141414', '#1a0d0d', '#0d0d1a'];

export const AmbianceProvider = ({ children }) => {
    const [ambiance, setAmbiance] = useState(defaultAmbiance);

    const setAmbianceByGenre = (genreIds) => {
        if (!genreIds || genreIds.length === 0) {
            setAmbiance(defaultAmbiance);
            return;
        }
        const primaryGenreId = genreIds.find(id => genreColorMap[id]);
        setAmbiance(genreColorMap[primaryGenreId] || defaultAmbiance);
    };

    const clearAmbiance = () => {
        setAmbiance(defaultAmbiance);
    };

    const value = { ambiance, setAmbianceByGenre, clearAmbiance };

    return (
        <AmbianceContext.Provider value={value}>
            {children}
        </AmbianceContext.Provider>
    );
};