import React from 'react';

export const CarouselSkeleton = () => (
    <div className="my-12">
        <div className="h-6 w-1/4 bg-gray-700 rounded mb-4 skeleton relative overflow-hidden"></div>
        <div className="flex space-x-4">
            {[...Array(6)].map((_, i) => (
                <div key={i} className="flex-shrink-0 w-40 md:w-48">
                    <div className="w-full h-60 md:h-72 bg-gray-700 rounded-lg skeleton relative overflow-hidden"></div>
                </div>
            ))}
        </div>
    </div>
);