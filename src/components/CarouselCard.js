import React from 'react';
import { FaChevronDown, FaStar } from 'react-icons/fa';

const CarouselCard = ({ item, onClick }) => {
    const rating = item.vote_average ? item.vote_average.toFixed(1) : 'N/A';

    return (
        <div className="group relative w-full h-full bg-gray-900 rounded-lg overflow-hidden transform transition-transform duration-300 ease-in-out hover:scale-110 hover:z-20"
             onClick={onClick}>
            <img src={`https://image.tmdb.org/t/p/w500${item.poster_path}`} alt={item.title || item.name}
                 className="w-full h-full object-cover" />
            <div className="absolute top-2 right-2 bg-black bg-opacity-70 text-white text-xs font-bold px-2 py-1 rounded-full flex items-center space-x-1">
                <FaStar className="text-yellow-400" />
                <span>{rating}</span>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black via-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="flex justify-between items-center">
                    <p className="text-white font-bold text-sm line-clamp-2">{item.title || item.name}</p>
                    <div className="border-2 border-gray-400 text-gray-400 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0">
                        <FaChevronDown />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CarouselCard;