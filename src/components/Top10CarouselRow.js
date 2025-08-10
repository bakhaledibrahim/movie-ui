import React from 'react';
import Top10Card from './Top10Card';

const Top10CarouselRow = ({ title, items, onCardClick }) => {
    return (
        <div className="my-12">
            <h3 className="text-xl font-bold mb-2 px-12">{title}</h3>
            <div className="relative">
                <div className="carousel-row flex overflow-x-scroll space-x-8 py-8 px-12 scroll-smooth">
                    {items.slice(0, 10).filter(item => item.poster_path).map((item, index) => (
                        <div key={item.id} className="w-48 h-72 flex-shrink-0">
                            <Top10Card item={item} rank={index + 1} onClick={() => onCardClick(item)} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default React.memo(Top10CarouselRow);