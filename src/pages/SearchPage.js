import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import * as api from '../api/tmdb';
import CarouselCard from '../components/CarouselCard';
import DetailsModal from '../components/DetailsModal';
import { CarouselSkeleton } from '../components/Skeleton';

const SearchPage = () => {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedMedia, setSelectedMedia] = useState(null);

    useEffect(() => {
        const performSearch = async () => {
            if (query && query.trim() !== '') {
                setLoading(true);
                try {
                    const [movieRes, tvRes] = await api.searchMedia(query);
                    const combinedResults = [...movieRes.data.results, ...tvRes.data.results]
                        .sort((a, b) => b.popularity - a.popularity);
                    setResults(combinedResults);
                } catch (error) {
                    console.error("Failed to perform search", error);
                } finally {
                    setLoading(false);
                }
            } else {
                setResults([]);
            }
        };
        performSearch();
    }, [query]);

    const openModal = (media) => {
        const mediaType = media.title ? 'movie' : 'tv';
        setSelectedMedia({ ...media, media_type: mediaType });
    };

    const closeModal = () => setSelectedMedia(null);

    return (
        <div className="pt-24 px-4 md:px-12">
            <h1 className="text-4xl font-bold mb-8">
                {query ? `Results for "${query}"` : 'Please enter a search term'}
            </h1>
            {loading ? (
                <CarouselSkeleton />
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {results.filter(item => item.poster_path).map((item) => (
                        <div key={item.id} className="w-full h-60 md:h-72">
                            <CarouselCard item={item} onClick={() => openModal(item)} />
                        </div>
                    ))}
                </div>
            )}
            {selectedMedia && <DetailsModal media={selectedMedia} onClose={closeModal} />}
        </div>
    );
};

export default SearchPage;