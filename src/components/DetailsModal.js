import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    fetchMovieDetails, fetchTvShowDetails, fetchSeasonDetails,
    fetchSimilarMovies, fetchSimilarTvShows, fetchVideos // Import fetchVideos
} from '../api/tmdb';
import { useMyList } from '../hooks/useMyList';
import { FaPlay, FaTimes, FaPlus, FaCheck } from 'react-icons/fa';
import CarouselRow from './CarouselRow';

const DetailsModal = ({ media, onClose }) => {
    const [details, setDetails] = useState(null);
    const [trailerKey, setTrailerKey] = useState(null); // State for the trailer video
    const [selectedSeason, setSelectedSeason] = useState(null);
    const [similar, setSimilar] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();
    const { addToList, removeFromList, isInList } = useMyList();
    const isMovie = media.media_type === 'movie';
    const inList = isInList(media.id);

    const handleSeasonClick = useCallback(async (seasonNumber, tvId) => {
        const response = await fetchSeasonDetails(tvId || media.id, seasonNumber);
        setSelectedSeason(response.data);
    }, [media.id]);

    useEffect(() => {
        setShowModal(true);
        const fetchAllDetails = async () => {
            try {
                // Fetch details and videos at the same time
                const [detailsResponse, videoResponse] = await Promise.all([
                    isMovie ? fetchMovieDetails(media.id) : fetchTvShowDetails(media.id),
                    fetchVideos(media.media_type, media.id)
                ]);

                setDetails(detailsResponse.data);

                // Find the best trailer to display
                const trailer = videoResponse.data.results.find(v => v.type === 'Trailer') || videoResponse.data.results[0];
                setTrailerKey(trailer?.key);

                if (!isMovie && detailsResponse.data.seasons.length > 0) {
                    const firstSeason = detailsResponse.data.seasons.find(s => s.episode_count > 0 && s.season_number > 0) || detailsResponse.data.seasons.find(s => s.episode_count > 0);
                    if (firstSeason) handleSeasonClick(firstSeason.season_number, detailsResponse.data.id);
                }
                const similarResponse = isMovie ? await fetchSimilarMovies(media.id) : await fetchSimilarTvShows(media.id);
                setSimilar(similarResponse.data.results);
            } catch (error) { console.error("Failed to fetch modal details", error); }
        };
        fetchAllDetails();
    }, [media, isMovie, handleSeasonClick]);

    const handleClose = () => {
        setShowModal(false);
        setTimeout(onClose, 300);
    };

    const handleMyList = () => {
        if (inList) {
            removeFromList(media.id);
        } else {
            addToList({ id: media.id, media_type: media.media_type, poster_path: media.poster_path });
        }
    };

    const getYear = (date) => date ? new Date(date).getFullYear() : 'N/A';
    const formatRuntime = (runtime) => {
        if (!runtime) return '';
        const hours = Math.floor(runtime / 60);
        const minutes = runtime % 60;
        return `${hours}h ${minutes}m`;
    };

    const renderPlayButton = () => {
        if (isMovie) {
            return (
                <Link to={`/player/movie/${media.id}`} className="flex items-center bg-white text-black font-bold py-2 px-6 rounded hover:bg-gray-200">
                    <FaPlay className="mr-2" /> Play
                </Link>
            );
        }
        return <button disabled className="flex items-center bg-gray-400 text-black font-bold py-2 px-6 rounded cursor-not-allowed"><FaPlay className="mr-2" /> Select an Episode to Play</button>;
    };

    return (
        <div className={`fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 transition-opacity duration-300 ${showModal ? 'opacity-100' : 'opacity-0'}`} onClick={handleClose}>
            <div className={`bg-gray-900 rounded-lg w-11/12 max-w-6xl max-h-[90vh] overflow-y-auto transition-all duration-300 ${showModal ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`} onClick={e => e.stopPropagation()}>
                {!details ? (<div className="h-96 flex items-center justify-center">Loading...</div>) : (
                    <>
                        {/* This section now conditionally renders the video or the image */}
                        <div className="relative aspect-video bg-black">
                            {trailerKey ? (
                                <iframe
                                    title={`${details.title || details.name} Trailer`}
                                    className="absolute inset-0 w-full h-full"
                                    src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&controls=0&loop=1&playlist=${trailerKey}`}
                                    frameBorder="0"
                                    allow="autoplay; encrypted-media"
                                    allowFullScreen
                                ></iframe>
                            ) : (
                                <img src={`https://image.tmdb.org/t/p/w1280${details.backdrop_path}`} alt={details.title || details.name} className="w-full h-full object-cover" />
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
                            <button onClick={handleClose} className="absolute top-4 right-4 bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75"><FaTimes size={20} /></button>
                            <div className="absolute bottom-8 left-8 flex items-center space-x-4">
                                {renderPlayButton()}
                                <button onClick={handleMyList} className="border-2 border-gray-400 text-gray-400 rounded-full w-12 h-12 flex items-center justify-center hover:border-white hover:text-white">
                                    {inList ? <FaCheck /> : <FaPlus />}
                                </button>
                            </div>
                        </div>

                        {/* The rest of your component remains exactly the same */}
                        <div className="p-8">
                            <div className="flex justify-between items-start">
                                <div className="w-2/3">
                                    <h2 className="text-3xl font-bold">{details.title || details.name}</h2>
                                    <div className="flex items-center space-x-4 text-gray-400 my-2">
                                        <span>{getYear(details.release_date || details.first_air_date)}</span>
                                        {isMovie && <span>{formatRuntime(details.runtime)}</span>}
                                        <span className="border border-gray-400 px-2 text-xs">HD</span>
                                    </div>
                                    <p className="my-4">{details.overview}</p>
                                </div>
                                <div className="w-1/3 pl-8 text-sm">
                                    <p><span className="text-gray-400">Cast: </span>
                                        {details.credits.cast.slice(0, 3).map((c, i) => (
                                            <React.Fragment key={c.id}>
                                                <Link to={`/person/${c.id}`} onClick={handleClose} className="hover:underline">{c.name}</Link>
                                                {i < 2 ? ', ' : ''}
                                            </React.Fragment>
                                        ))}
                                    </p>
                                    <p className="mt-2"><span className="text-gray-400">Genres: </span>{details.genres.map(g => g.name).join(', ')}</p>
                                </div>
                            </div>
                            {!isMovie && (
                                <div>
                                    <div className="flex justify-between items-center mt-8 mb-4">
                                        <h3 className="text-2xl font-bold">Episodes</h3>
                                        <div className="flex items-center space-x-2 overflow-x-auto carousel-row">
                                            {details.seasons.filter(s => s.episode_count > 0).map(s => (
                                                <button
                                                    key={s.id}
                                                    onClick={() => handleSeasonClick(s.season_number)}
                                                    className={`px-4 py-2 text-sm font-semibold rounded-full flex-shrink-0 transition-colors duration-200 ${selectedSeason?.season_number === s.season_number ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                                                >
                                                    {s.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                    {selectedSeason && (
                                        <div className="carousel-row flex overflow-x-auto space-x-4 py-4 scroll-smooth">
                                            {selectedSeason.episodes.map(ep => (
                                                <div
                                                    key={ep.id}
                                                    onClick={() => navigate(`/player/tv/${media.id}/${selectedSeason.season_number}/${ep.episode_number}`)}
                                                    className="group relative bg-gray-800 rounded-lg flex-shrink-0 w-64 h-36 overflow-hidden cursor-pointer"
                                                >
                                                    {ep.still_path ? (
                                                        <img src={`https://image.tmdb.org/t/p/w500${ep.still_path}`} alt={ep.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full bg-gray-700"></div>
                                                    )}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex flex-col justify-end p-3">
                                                        <h4 className="font-bold text-white text-sm">E{ep.episode_number}: {ep.name}</h4>
                                                    </div>
                                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <FaPlay size={32} className="text-white" />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                            {similar.length > 0 && <CarouselRow title="More Like This" items={similar} onCardClick={onClose} />}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default DetailsModal;