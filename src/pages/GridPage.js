import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useInfiniteScroll } from '../hooks/useInfiniteScroll';
import * as api from '../api/tmdb';
import CarouselCard from '../components/CarouselCard';
import DetailsModal from '../components/DetailsModal';
import { CarouselSkeleton } from '../components/Skeleton';

const GridPage = () => {
    const { mediaType, category } = useParams();
    const location = useLocation();
    const { title } = location.state || { title: 'All' };
    const [selectedMedia, setSelectedMedia] = useState(null);

    // This is the corrected and complete mapping of all categories to their API functions.
    const apiFunc = useCallback((page) => {
        const funcMap = {
            movie: {
                trending: api.fetchTrendingMovies,
                popular: (p) => api.fetchPopularMovies('', p),
                top_rated: (p) => api.fetchTopRatedMovies('', p),
                upcoming: api.fetchUpcomingMovies,
                acclaimed_scifi: api.fetchCriticallyAcclaimedSciFi,
                mind_bending: api.fetchMindBendingThrillers,
            },
            tv: {
                popular: (p) => api.fetchPopularTvShows('', p),
                top_rated: (p) => api.fetchTopRatedTvShows('', p),
                trending: api.fetchTrendingTvShows,
                netflix: api.fetchNetflixOriginals,
                disney: api.fetchDisneyOriginals,
                amazon: api.fetchAmazonOriginals,
                apple: api.fetchAppleOriginals,
            }
        };

        const func = funcMap[mediaType]?.[category];

        if (func) {
            return func(page);
        }

        return Promise.reject(new Error(`No API function found for ${mediaType}/${category}`));
    }, [mediaType, category]);

    const { items, hasMore, loading, loadMore, reset } = useInfiniteScroll(apiFunc);
    const observer = useRef();

    const lastItemRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                loadMore();
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore, loadMore]);

    useEffect(() => {
        reset();
        loadMore();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [apiFunc]);

    const openModal = (media) => {
        const correctMediaType = media.title ? 'movie' : 'tv';
        setSelectedMedia({ ...media, media_type: correctMediaType });
    };
    const closeModal = () => setSelectedMedia(null);

    return (
        <div className="pt-24 px-4 md:px-12">
            <h1 className="text-4xl font-bold mb-8">{title}</h1>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {items.map((item, index) => (
                    <div
                        key={`${item.id}-${index}`}
                        ref={items.length === index + 1 ? lastItemRef : null}
                        className="w-full h-80 md:h-96"
                    >
                        <CarouselCard item={item} onClick={() => openModal(item)} />
                    </div>
                ))}
            </div>
            {loading && <div className="text-center py-8"><CarouselSkeleton /></div>}
            {!hasMore && !loading && <div className="text-center py-8 text-gray-500">You've reached the end.</div>}
            {selectedMedia && <DetailsModal media={selectedMedia} onClose={closeModal} onSuggestionClick={openModal} />}
        </div>
    );
};

export default GridPage;