import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    fetchMovieDetails, fetchTvShowDetails, fetchSeasonDetails,
    fetchSimilarMovies, fetchSimilarTvShows
} from '../api/tmdb';
import { useMyList } from '../hooks/useMyList';
import { FaPlay, FaTimes, FaPlus, FaCheck } from 'react-icons/fa';
import CarouselRow from './CarouselRow';

const DetailsModal = ({ media, onClose }) => {
    const [details, setDetails] = useState(null);
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
                const detailsResponse = isMovie ? await fetchMovieDetails(media.id) : await fetchTvShowDetails(media.id);
                setDetails(detailsResponse.data);
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
                        <div className="relative">
                            <img src={`https://image.tmdb.org/t/p/w1280${details.backdrop_path}`} alt={details.title || details.name} className="w-full h-auto" />
                            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
                            <button onClick={handleClose} className="absolute top-4 right-4 bg-black bg-opacity-50 rounded-full p-2 hover:bg-opacity-75"><FaTimes size={20} /></button>
                            <div className="absolute bottom-8 left-8 flex items-center space-x-4">
                                {renderPlayButton()}
                                <button onClick={handleMyList} className="border-2 border-gray-400 text-gray-400 rounded-full w-12 h-12 flex items-center justify-center hover:border-white hover:text-white">
                                    {inList ? <FaCheck /> : <FaPlus />}
                                </button>
                            </div>
                        </div>
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
                                        <select onChange={(e) => handleSeasonClick(e.target.value)} className="bg-gray-800 text-white p-2 rounded border border-gray-600">
                                            {details.seasons.filter(s => s.episode_count > 0).map(s => <option key={s.id} value={s.season_number}>{s.name}</option>)}
                                        </select>
                                    </div>
                                    {selectedSeason && (
                                        <div className="space-y-3 pr-2">
                                            {selectedSeason.episodes.map(ep => (
                                                <div key={ep.id} onClick={() => navigate(`/player/tv/${media.id}/${selectedSeason.season_number}/${ep.episode_number}`)}
                                                     className="group relative bg-gray-800 p-4 rounded-lg flex items-center space-x-4 overflow-hidden cursor-pointer hover:bg-gray-700 transition-colors">
                                                    {ep.still_path && (
                                                        <div className="absolute inset-0 z-0">
                                                            <img src={`https://image.tmdb.org/t/p/w500${ep.still_path}`} alt="" className="w-full h-full object-cover opacity-20 group-hover:opacity-30 transition-opacity" />
                                                            <div className="absolute inset-0 bg-gradient-to-r from-gray-800 via-gray-800/70 to-transparent"></div>
                                                        </div>
                                                    )}
                                                    <div className="relative z-10 flex-shrink-0 w-12 text-center"><span className="text-2xl font-bold text-gray-400">{ep.episode_number}</span></div>
                                                    <div className="relative z-10 flex-grow">
                                                        <h4 className="font-bold">{ep.name}</h4>
                                                        <p className="text-gray-400 text-sm mt-1 line-clamp-2">{ep.overview}</p>
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