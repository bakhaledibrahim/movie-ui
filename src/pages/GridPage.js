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

    // This is the corrected logic.
    // The 'page' number from the hook is now correctly passed to the right API function.
    const apiFunc = useCallback((page) => {
        const funcMap = {
            movie: {
                trending: () => api.fetchTrendingMovies(page),
                popular: () => api.fetchPopularMovies('', page),
                top_rated: () => api.fetchTopRatedMovies('', page),
                upcoming: () => api.fetchUpcomingMovies(page),
                now_playing: () => api.fetchNowPlayingMovies('', page),
                high_quality: () => api.fetchHighQualityMovies('', page),
                new_releases: () => api.fetchNewMovieReleases(page),
            },
            tv: {
                popular: () => api.fetchPopularTvShows('', page),
                top_rated: () => api.fetchTopRatedTvShows('', page),
                trending: () => api.fetchTrendingTvShows(page),
                netflix: () => api.fetchNetflixOriginals(page),
                disney: () => api.fetchDisneyOriginals(page),
                amazon: () => api.fetchAmazonOriginals(page),
                apple: () => api.fetchAppleOriginals(page),
            }
        };
        return funcMap[mediaType][category]();
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

    // This effect correctly handles the initial load and resets when the category changes.
    useEffect(() => {
        reset();
        loadMore();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [apiFunc]);

    const openModal = (media) => setSelectedMedia({ ...media, media_type: mediaType });
    const closeModal = () => setSelectedMedia(null);

    return (
        <div className="pt-24 px-4 md:px-12">
            <h1 className="text-4xl font-bold mb-8">{title}</h1>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                {items.map((item, index) => (
                    <div
                        key={`${item.id}-${index}`}
                        ref={items.length === index + 1 ? lastItemRef : null}
                        className="w-full h-60 md:h-72"
                    >
                        <CarouselCard item={item} onClick={() => openModal(item)} />
                    </div>
                ))}
            </div>
            {loading && <div className="text-center py-8"><CarouselSkeleton /></div>}
            {!hasMore && !loading && <div className="text-center py-8 text-gray-500">You've reached the end.</div>}
            {selectedMedia && <DetailsModal media={selectedMedia} onClose={closeModal} />}
        </div>
    );
};

export default GridPage;