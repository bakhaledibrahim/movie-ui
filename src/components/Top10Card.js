import React from 'react';

const Top10Card = ({ item, rank, onClick }) => {
    return (
        <div className="group relative w-full h-full flex items-center cursor-pointer" onClick={onClick}>
            <div className="text-8xl font-black text-gray-800 -mr-8 z-0" style={{ WebkitTextStroke: '2px #555' }}>
                {rank}
            </div>
            <div className="relative w-40 h-full rounded-lg overflow-hidden transform transition-transform duration-300 ease-in-out group-hover:scale-110">
                <img src={`https://image.tmdb.org/t/p/w500${item.poster_path}`} alt={item.title || item.name}
                     className="w-full h-full object-cover" />
            </div>
        </div>
    );
};

export default Top10Card;