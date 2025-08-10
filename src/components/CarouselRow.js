import React from 'react';
import { Link } from 'react-router-dom';
import CarouselCard from './CarouselCard';

const CarouselRow = ({ title, items, onCardClick, categoryKey, mediaType }) => {
    return (
        <div className="my-12">
            <div className="flex justify-between items-center mb-2 px-12">
                <h3 className="text-xl font-bold">{title}</h3>
                {categoryKey && mediaType && (
                    <Link to={`/view/${mediaType}/${categoryKey}`} state={{ title }} className="text-gray-400 hover:text-white transition-colors text-sm font-semibold">
                        See All
                    </Link>
                )}
            </div>
            <div className="relative">
                <div className="carousel-row flex overflow-x-scroll space-x-6 py-8 px-12 scroll-smooth">
                    {items.slice(0, 20).filter(item => item.poster_path).map(item => (
                        // THE FIX IS HERE: Dimensions have been increased for a larger card.
                        // The space-x value above was also increased from 4 to 6 to give them more room.
                        <div key={item.id} className="w-52 md:w-64 h-80 md:h-96 flex-shrink-0">
                            <CarouselCard item={item} onClick={() => onCardClick(item)} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default React.memo(CarouselRow);