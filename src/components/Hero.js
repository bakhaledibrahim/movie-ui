import React from 'react';
import { FaPlay, FaInfoCircle } from 'react-icons/fa';
import { Link } from 'react-router-dom';

const Hero = ({ movie, onMoreInfo }) => {
    if (!movie) return null;

    const getPlayerUrl = () => {
        const isMovie = !!movie.title;
        const mediaType = isMovie ? 'movie' : 'tv';
        return isMovie ? `/player/${mediaType}/${movie.id}` : `/player/${mediaType}/${movie.id}/1/1`;
    };

    return (
        <div className="relative h-[56.25vw] min-h-[400px] max-h-[800px]">
            <img src={`https://image.tmdb.org/t/p/original${movie.backdrop_path}`} className="w-full h-full object-cover" alt={movie.title || movie.name} />
            <div className="absolute inset-0 bg-gradient-to-t from-black to-black opacity-40"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-transparent"></div>
            <div className="absolute bottom-[20%] left-4 md:left-12 max-w-xl z-10">
                <h2 className="text-3xl md:text-6xl font-bold drop-shadow-lg">{movie.title || movie.name}</h2>
                <p className="hidden md:block my-4 text-lg line-clamp-3 drop-shadow-md">{movie.overview}</p>
                <div className="flex space-x-4 mt-4">
                    <Link to={getPlayerUrl()} className="flex items-center bg-white text-black font-bold py-2 px-6 rounded hover:bg-gray-200 transition-transform hover:scale-105">
                        <FaPlay className="mr-2" /> Play
                    </Link>
                    <button onClick={onMoreInfo} className="flex items-center bg-gray-500 bg-opacity-70 text-white font-bold py-2 px-6 rounded hover:bg-opacity-50 transition-transform hover:scale-105">
                        <FaInfoCircle className="mr-2" /> More Info
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Hero;