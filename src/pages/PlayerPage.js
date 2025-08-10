import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { useWatchHistory } from '../hooks/useWatchHistory';
import { fetchMovieDetails, fetchTvShowDetails } from '../api/tmdb';

const PlayerPage = () => {
    const { mediaType, id, season, episode } = useParams();
    const navigate = useNavigate();
    const { updateProgress } = useWatchHistory();

    const durationRef = useRef(1800); // Default to 30 minutes (1800s)

    useEffect(() => {
        const getDuration = async () => {
            try {
                let mediaDetails;
                if (mediaType === 'movie') {
                    mediaDetails = await fetchMovieDetails(id);
                    if (mediaDetails.data.runtime) {
                        durationRef.current = mediaDetails.data.runtime * 60;
                    }
                } else {
                    mediaDetails = await fetchTvShowDetails(id);
                    const episodeRuntime = mediaDetails.data.episode_run_time?.[0];
                    if (episodeRuntime) {
                        durationRef.current = episodeRuntime * 60;
                    }
                }
                console.log(`[PlayerPage] Fetched and set duration to: ${durationRef.current} seconds.`);
            } catch (error) {
                console.error("[PlayerPage] Could not fetch media duration, using default.", error);
            }
        };
        getDuration();
    }, [mediaType, id]);

    useEffect(() => {
        const mediaInfo = { mediaType, id, season, episode };
        let secondsWatched = 0;

        console.log("[PlayerPage] Starting watch progress tracking for:", mediaInfo);

        const interval = setInterval(() => {
            secondsWatched += 10;
            updateProgress(mediaInfo, secondsWatched, durationRef.current);
        }, 10000);

        return () => {
            console.log("[PlayerPage] Stopping watch progress tracking.");
            clearInterval(interval);
        };
    }, [mediaType, id, season, episode, updateProgress]);

    let src = '';
    if (mediaType === 'movie') {
        src = `https://vidfast.pro/movie/${id}?autoPlay=true`;
    } else {
        src = `https://vidfast.pro/tv/${id}/${season}/${episode}?autoPlay=true`;
    }

    return (
        <div className="bg-black w-screen h-screen flex flex-col">
            <div className="w-full p-4 flex-shrink-0">
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center space-x-2 text-white bg-black bg-opacity-50 p-2 rounded-full hover:bg-opacity-75 transition-colors"
                >
                    <FaArrowLeft />
                    <span>Back</span>
                </button>
            </div>
            <div className="relative w-full h-full">
                <iframe
                    src={src}
                    title="VidFast Player"
                    className="absolute top-0 left-0 w-full h-full"
                    frameBorder="0"
                    allowFullScreen
                    allow="autoplay; encrypted-media"
                ></iframe>
            </div>
        </div>
    );
};

export default PlayerPage;