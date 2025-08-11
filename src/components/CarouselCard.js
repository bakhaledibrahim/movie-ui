import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlay, FaPlus, FaChevronDown, FaCheck, FaBell, FaStar } from 'react-icons/fa';
import { useGenres } from '../context/GenreContext';
import { useMyList } from '../hooks/useMyList';
import { useReminders } from '../hooks/useReminders';
import * as api from '../api/tmdb';

const CarouselCard = ({ item, onClick, isUpcoming = false }) => {
    const navigate = useNavigate();
    const { getGenreNames } = useGenres();
    const { addToList, removeFromList, isInList } = useMyList();
    const { addReminder, removeReminder, hasReminder } = useReminders();
    const inList = isInList(item.id);
    const hasReminderSet = hasReminder(item.id);

    const [isHovering, setIsHovering] = useState(false);
    const [trailerKey, setTrailerKey] = useState(null);
    const hoverTimeout = useRef(null);

    const mediaType = item.media_type || (item.title ? 'movie' : 'tv');
    const genres = getGenreNames(item.genre_ids, mediaType);
    const year = item.release_date ? new Date(item.release_date).getFullYear() : (item.first_air_date ? new Date(item.first_air_date).getFullYear() : 'N/A');
    const rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';

    const handleMouseEnter = () => {
        hoverTimeout.current = setTimeout(async () => {
            setIsHovering(true);
            try {
                const response = await api.fetchVideos(mediaType, item.id);
                const trailer = response.data.results.find(v => v.type === 'Trailer') || response.data.results[0];
                if (trailer) setTrailerKey(trailer.key);
            } catch (error) {
                console.error("Failed to fetch trailer", error);
            }
        }, 500);
    };

    const handleMouseLeave = () => {
        clearTimeout(hoverTimeout.current);
        setIsHovering(false);
        setTrailerKey(null);
    };

    const handlePlay = (e) => {
        e.stopPropagation();
        const playerUrl = mediaType === 'movie' ? `/player/movie/${item.id}` : `/player/tv/${item.id}/1/1`;
        navigate(playerUrl);
    };

    const handleMyList = (e) => {
        e.stopPropagation();
        if (inList) removeFromList(item.id);
        else addToList({ id: item.id, media_type: mediaType, poster_path: item.poster_path, title: item.title, name: item.name });
    };

    const handleReminder = (e) => {
        e.stopPropagation();
        if (hasReminderSet) removeReminder(item.id);
        else addReminder({ id: item.id, media_type: mediaType, poster_path: item.poster_path, title: item.title, name: item.name });
    };

    return (
        <div
            className="group relative w-full h-full bg-gray-900 rounded-lg overflow-hidden cursor-pointer transition-transform duration-300 ease-in-out hover:scale-110 hover:z-20"
            onClick={onClick}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            {isHovering && trailerKey ? (
                <iframe
                    title={`${item.title || item.name} Trailer`}
                    className="absolute inset-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&controls=0&loop=1&playlist=${trailerKey}`}
                    frameBorder="0"
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                ></iframe>
            ) : (
                <img src={`https://image.tmdb.org/t/p/w500${item.poster_path}`} alt={item.title || item.name} className="w-full h-full object-cover" />
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                <h3 className="text-white font-bold text-lg line-clamp-2">{item.title || item.name}</h3>
                <div className="flex items-center space-x-4 text-sm mt-2">
                    <span className="text-green-400 font-semibold">{Math.round(item.vote_average * 10)}% Match</span>
                    <div className="flex items-center space-x-1">
                        <FaStar className="text-yellow-400" />
                        <span className="text-white font-semibold">{rating}</span>
                    </div>
                    <span className="text-gray-400">{year}</span>
                </div>
                <div className="flex items-center space-x-2 mt-4">
                    {isUpcoming ? (
                        <button onClick={handleReminder} className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${hasReminderSet ? 'bg-white text-black' : 'bg-black/50 border-2 border-gray-400 text-gray-400 hover:border-white hover:text-white'}`}>
                            <FaBell />
                        </button>
                    ) : (
                        <button onClick={handlePlay} className="w-8 h-8 flex items-center justify-center bg-white text-black rounded-full hover:bg-gray-300 transition-colors">
                            <FaPlay className="ml-0.5" />
                        </button>
                    )}
                    <button onClick={handleMyList} className="w-8 h-8 flex items-center justify-center bg-black/50 border-2 border-gray-400 text-gray-400 rounded-full hover:border-white hover:text-white transition-colors">
                        {inList ? <FaCheck /> : <FaPlus />}
                    </button>
                    <button onClick={onClick} className="w-8 h-8 flex items-center justify-center bg-black/50 border-2 border-gray-400 text-gray-400 rounded-full ml-auto hover:border-white hover:text-white transition-colors">
                        <FaChevronDown />
                    </button>
                </div>
                <div className="flex items-center space-x-2 text-xs text-gray-300 mt-3">
                    {genres.map((genre, index) => (
                        <React.Fragment key={genre}>
                            <span>{genre}</span>
                            {index < genres.length - 1 && <div className="w-1 h-1 bg-gray-500 rounded-full"></div>}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default CarouselCard;