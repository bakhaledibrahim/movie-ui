import { useCallback } from 'react';

const WATCH_HISTORY_KEY = 'vidflix_watch_history';

export const useWatchHistory = () => {
    const getHistory = useCallback(() => {
        try {
            const history = localStorage.getItem(WATCH_HISTORY_KEY);
            return history ? JSON.parse(history) : {};
        } catch (error) {
            console.error("[WatchHistory] Error reading from local storage:", error);
            return {};
        }
    }, []);

    const updateProgress = useCallback((media, secondsWatched, duration) => {
        if (!media || !media.id || !media.mediaType) {
            console.error("[WatchHistory] CANCELED SAVE: Invalid media object provided.", media);
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
            // This log will confirm that the data is being saved
            console.log(`[WatchHistory] SUCCESS: Saved progress for ${key}. Watched ${secondsWatched}s of ${duration}s.`);
        } catch (error) {
            console.error("[WatchHistory] FAILED to save to local storage:", error);
        }
    }, [getHistory]);

    return { getHistory, updateProgress };
};