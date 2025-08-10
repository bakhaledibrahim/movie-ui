import React, { createContext, useState, useEffect, useContext } from 'react';
import * as api from '../api/tmdb';

// Create the context
const GenreContext = createContext();

// Create a custom hook to use the context easily
export const useGenres = () => {
    return useContext(GenreContext);
};

// Create the provider component that will wrap our app
export const GenreProvider = ({ children }) => {
    const [movieGenres, setMovieGenres] = useState(new Map());
    const [tvGenres, setTvGenres] = useState(new Map());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllGenres = async () => {
            try {
                const [movieRes, tvRes] = await Promise.all([
                    api.fetchMovieGenres(),
                    api.fetchTvShowGenres()
                ]);

                // Convert array of genres to a Map for fast lookups (ID -> Name)
                const movieGenreMap = new Map(movieRes.data.genres.map(g => [g.id, g.name]));
                const tvGenreMap = new Map(tvRes.data.genres.map(g => [g.id, g.name]));

                setMovieGenres(movieGenreMap);
                setTvGenres(tvGenreMap);
            } catch (error) {
                console.error("Failed to fetch genres", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAllGenres();
    }, []);

    // This function will be available to any component to get genre names from IDs
    const getGenreNames = (genreIds, mediaType) => {
        if (loading || !genreIds) return [];
        const genreMap = mediaType === 'movie' ? movieGenres : tvGenres;
        return genreIds.slice(0, 3).map(id => genreMap.get(id)).filter(Boolean);
    };

    const value = {
        getGenreNames,
        loadingGenres: loading,
    };

    return (
        <GenreContext.Provider value={value}>
            {children}
        </GenreContext.Provider>
    );
};