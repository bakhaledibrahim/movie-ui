import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaPlay } from 'react-icons/fa';
import * as api from '../api/tmdb';

const TrailerPage = () => {
    const { mediaType, id } = useParams();
    const navigate = useNavigate();
    const [trailerKey, setTrailerKey] = useState(null);
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTrailerAndDetails = async () => {
            setLoading(true);
            try {
                const [videoRes, detailsRes] = await Promise.all([
                    api.fetchVideos(mediaType, id),
                    mediaType === 'movie' ? api.fetchMovieDetails(id) : api.fetchTvShowDetails(id)
                ]);

                const trailer = videoRes.data.results.find(v => v.type === 'Trailer') || videoRes.data.results[0];
                setTrailerKey(trailer?.key);
                setDetails(detailsRes.data);
            } catch (error) {
                console.error("Failed to fetch trailer/details", error);
            } finally {
                setLoading(false);
            }
        };
        fetchTrailerAndDetails();
    }, [mediaType, id]);

    if (loading) {
        return <div className="bg-black w-screen h-screen flex items-center justify-center">Loading...</div>;
    }

    const backgroundStyle = {
        backgroundImage: `url(https://image.tmdb.org/t/p/original${details?.poster_path})`,
    };

    return (
        <div className="w-screen h-screen bg-black">
            <div style={backgroundStyle} className="absolute inset-0 bg-cover bg-center opacity-30 blur-2xl"></div>

            <button
                onClick={() => navigate(-1)}
                className="absolute top-5 left-5 z-20 flex items-center space-x-2 text-white bg-black bg-opacity-50 p-2 rounded-full hover:bg-opacity-75 transition-colors"
            >
                <FaArrowLeft />
                <span>Back</span>
            </button>

            <div className="relative w-full h-full flex flex-col items-center justify-center">
                {trailerKey ? (
                    <div className="w-full max-w-4xl aspect-video shadow-2xl shadow-black/50">
                        <iframe
                            src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=0&controls=1`}
                            title={`${details?.title || details?.name} Trailer`}
                            frameBorder="0"
                            allow="autoplay; fullscreen; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full"
                        ></iframe>
                    </div>
                ) : (
                    <p className="text-2xl">No trailer available for this title.</p>
                )}
                <div className="mt-8 text-center">
                    <h1 className="text-4xl font-bold">{details?.title || details?.name}</h1>
                    <p className="max-w-2xl text-gray-300 mt-2 line-clamp-3">{details?.overview}</p>
                </div>
            </div>
        </div>
    );
};

export default TrailerPage;