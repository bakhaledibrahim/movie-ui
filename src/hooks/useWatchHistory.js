import { useCallback } from 'react';

const WATCH_HISTORY_KEY = 'vidflix_watch_history';

export const useWatchHistory = () => {
    const getHistory = useCallback(() => {
        try {
            const history = localStorage.getItem(WATCH_HISTORY_KEY);
            return history ? JSON.parse(history) : {};
        } catch (error) {
            console.error("Error reading from local storage:", error);
            return {};
        }
    }, []);

    const updateProgress = useCallback((media, secondsWatched, duration) => {
        if (!media || !media.id || !media.mediaType) {
            console.error("Cannot update progress: Invalid media object provided.");
            return;
        }

        const history = getHistory();
        const key = `${media.mediaType}_${media.id}` + (media.mediaType === 'tv' ? `_${media.season}_${media.episode}` : '');

        history[key] = {
            id: media.id,
            mediaType: media.mediaType,
            season: media.season,
            episode: media.episode,
            secondsWatched,
            duration,
            lastWatched: new Date().toISOString(),
        };

        try {
            localStorage.setItem(WATCH_HISTORY_KEY, JSON.stringify(history));
        } catch (error) {
            console.error("Error saving to local storage:", error);
        }
    }, [getHistory]);

    return { getHistory, updateProgress };
};