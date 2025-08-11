import { useState, useEffect, useCallback } from 'react';
import { useWatchHistory } from './useWatchHistory';
import * as api from '../api/tmdb';

// A map of moods to TMDb genre IDs
const genreMap = {
    "Action": 28, "Adventure": 12, "Animation": 16, "Comedy": 35, "Crime": 80,
    "Documentary": 99, "Drama": 18, "Family": 10751, "Fantasy": 14, "History": 36,
    "Horror": 27, "Music": 10402, "Mystery": 9648, "Romance": 10749,
    "Science Fiction": 878, "TV Movie": 10770, "Thriller": 53, "War": 10752, "Western": 37
};

export const useBentoGrid = () => {
    const [bentoCarousels, setBentoCarousels] = useState([]);
    const [loading, setLoading] = useState(true);
    const { getHistory } = useWatchHistory();

    const generateBentoGrid = useCallback(async () => {
        setLoading(true);
        try {
            const history = getHistory();
            const sortedHistory = Object.values(history).sort((a, b) => new Date(b.lastWatched) - new Date(a.lastWatched));
            const lastWatched = sortedHistory.length > 0 ? (await api.fetchMovieDetails(sortedHistory[0].id)).data : null;

            // --- CONTEXT GATHERING ---
            const timeOfDay = new Date().getHours() < 18 ? 'afternoon' : 'evening';
            const weather = 'sunny'; // Hardcoded for demo, could be replaced with a real weather API
            const lastWatchedGenre = lastWatched ? lastWatched.genres[0]?.name : 'popular movies';

            // --- AI PROMPT ---
            const prompt = `
                Based on the user's context, suggest 3-5 creative carousel titles for a movie streaming homepage.
                Context:
                - Time of day: ${timeOfDay}
                - Weather: ${weather}
                - Last watched genre: ${lastWatchedGenre}

                Respond with ONLY a JSON array of objects, where each object has a "title" (string) and "genres" (array of genre names).
                Example: [{"title": "High-Energy Action Blockbusters", "genres": ["Action", "Adventure"]}]
            `;

            // --- SIMULATED AI RESPONSE (replace with a real Gemini API call in a full implementation) ---
            // This simulates what the AI would return based on the prompt.
            const aiResponse = `[
                {"title": "Sunny Afternoon Action Flicks", "genres": ["Action", "Adventure"]},
                {"title": "Critically Acclaimed Thrillers", "genres": ["Thriller", "Mystery"]},
                {"title": "Laugh-Out-Loud Comedies", "genres": ["Comedy"]}
            ]`;

            const carousels = JSON.parse(aiResponse);

            // --- FETCH DATA FOR AI-GENERATED CAROUSELS ---
            const carouselData = await Promise.all(
                carousels.map(async (carousel) => {
                    const genreIds = carousel.genres.map(g => genreMap[g]).filter(Boolean).join(',');
                    if (!genreIds) return null;
                    const response = await api.fetchMoviesByGenreList(genreIds, 1);
                    return { title: carousel.title, items: response.data.results };
                })
            );

            setBentoCarousels(carouselData.filter(Boolean));
        } catch (error) {
            console.error("Failed to generate Bento Grid:", error);
        } finally {
            setLoading(false);
        }
    }, [getHistory]);

    useEffect(() => {
        generateBentoGrid();
    }, [generateBentoGrid]);

    return { bentoCarousels, loading };
};