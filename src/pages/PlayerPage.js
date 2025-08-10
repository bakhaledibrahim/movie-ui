import React, { useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { useWatchHistory } from '../hooks/useWatchHistory';
import { fetchMovieDetails, fetchTvShowDetails } from '../api/tmdb';

const PlayerPage = () => {
    const { mediaType, id, season, episode } = useParams();
    const navigate = useNavigate();
    const { updateProgress } = useWatchHistory();
    const durationRef = useRef(1800);

    useEffect(() => {
        const getDuration = async () => {
            try {
                let mediaDetails;
                if (mediaType === 'movie') {
                    mediaDetails = await fetchMovieDetails(id);
                    if (mediaDetails.data.runtime) durationRef.current = mediaDetails.data.runtime * 60;
                } else {
                    mediaDetails = await fetchTvShowDetails(id);
                    const episodeRuntime = mediaDetails.data.episode_run_time?.[0];
                    if (episodeRuntime) durationRef.current = episodeRuntime * 60;
                }
            } catch (error) { console.error("Could not fetch media duration, using default.", error); }
        };
        getDuration();
    }, [mediaType, id]);

    useEffect(() => {
        let secondsWatched = 0;
        const interval = setInterval(() => {
            secondsWatched += 10;
            const mediaInfo = { mediaType, id, season, episode };
            updateProgress(mediaInfo, secondsWatched, durationRef.current);
        }, 10000);
        return () => clearInterval(interval);
    }, [mediaType, id, season, episode, updateProgress]);

    const src = mediaType === 'movie'
        ? `https://vidfast.pro/movie/${id}?autoPlay=true`
        : `https://vidfast.pro/tv/${id}/${season}/${episode}?autoPlay=true`;

    return (
        <div className="bg-black w-screen h-screen flex flex-col">
            <div className="w-full p-4 flex-shrink-0">
                <button onClick={() => navigate(-1)} className="flex items-center space-x-2 text-white bg-black bg-opacity-50 p-2 rounded-full hover:bg-opacity-75 transition-colors">
                    <FaArrowLeft /><span>Back</span>
                </button>
            </div>
            <div className="relative w-full h-full">
                <iframe src={src} title="VidFast Player" className="absolute top-0 left-0 w-full h-full" frameBorder="0" allowFullScreen allow="autoplay; encrypted-media"></iframe>
            </div>
        </div>
    );
};

export default PlayerPage;