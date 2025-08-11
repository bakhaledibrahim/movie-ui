import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaPlay, FaPlus, FaChevronDown, FaCheck, FaStar } from 'react-icons/fa';
import { useGenres } from '../context/GenreContext';
import { useMyList } from '../hooks/useMyList';

const CarouselCard = ({ item, onClick }) => {
    const navigate = useNavigate();
    const { getGenreNames } = useGenres();
    const { addToList, removeFromList, isInList } = useMyList();
    const inList = isInList(item.id);

    const mediaType = item.media_type || (item.title ? 'movie' : 'tv');
    const genres = getGenreNames(item.genre_ids, mediaType);
    const year = item.release_date ? new Date(item.release_date).getFullYear() : (item.first_air_date ? new Date(item.first_air_date).getFullYear() : 'N/A');
    const progress = item.secondsWatched && item.duration ? (item.secondsWatched / item.duration) * 100 : 0;
    const rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';

    const handlePlay = (e) => {
        e.stopPropagation();
        const playerUrl = mediaType === 'movie'
            ? `/player/movie/${item.id}`
            : `/player/tv/${item.id}/1/1`;
        navigate(playerUrl);
    };

    const handleMyList = (e) => {
        e.stopPropagation();
        if (inList) {
            removeFromList(item.id);
        } else {
            addToList({ id: item.id, media_type: mediaType, poster_path: item.poster_path, title: item.title, name: item.name });
        }
    };

    return (
        <div
            className="group relative w-full h-full bg-gray-900 rounded-lg overflow-hidden cursor-pointer transition-transform duration-300 ease-in-out hover:scale-105 hover:z-20"
            onClick={onClick}
        >
            {/* The new, subtle glow effect */}
            <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ backgroundImage: `radial-gradient(circle at center, rgba(229, 9, 20, 0.3) 0%, transparent 70%)` }}></div>

            <img
                src={`https://image.tmdb.org/t/p/w500${item.poster_path}`}
                alt={item.title || item.name}
                className="relative w-full h-full object-cover rounded-lg"
            />

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
                    <button onClick={handlePlay} className="w-8 h-8 flex items-center justify-center bg-white text-black rounded-full hover:bg-gray-300 transition-colors">
                        <FaPlay className="ml-0.5" />
                    </button>
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
            {progress > 0 && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-600/50 rounded-b-lg">
                    <div
                        className="h-full bg-red-600"
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            )}
        </div>
    );
};

export default CarouselCard;