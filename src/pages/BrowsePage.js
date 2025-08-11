import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    fetchTrendingMovies, fetchPopularTvShows, fetchMovieDetails,
    fetchTvShowDetails, fetchMovieRecommendations,
    fetchTvRecommendations, fetchCriticallyAcclaimedSciFi, fetchMindBendingThrillers,
    fetchCollectionDetails, fetchTopRatedMovies // fetchPopularMovies has been removed
} from '../api/tmdb';
import { useWatchHistory } from '../hooks/useWatchHistory';
import Hero from '../components/Hero';
import CarouselRow from '../components/CarouselRow';
import Top10CarouselRow from '../components/Top10CarouselRow';
import DetailsModal from '../components/DetailsModal';
import { CarouselSkeleton } from '../components/Skeleton';
import LiveActivityFeed from '../components/LiveActivityFeed';

const BrowsePage = () => {
    const [data, setData] = useState({
        top10Movies: [], popularTv: [], forYou: [],
        acclaimedSciFi: [], mindBendingThrillers: [], bondCollection: []
    });
    const [continueWatching, setContinueWatching] = useState([]);
    const [loading, setLoading] = useState(true);
    const [heroMovie, setHeroMovie] = useState(null);
    const [selectedMedia, setSelectedMedia] = useState(null);
    const { getHistory } = useWatchHistory();
    const navigate = useNavigate();

    const fetchContinueWatchingDetails = useCallback(async () => {
        const history = getHistory();
        const sortedHistory = Object.values(history).sort((a, b) => new Date(b.lastWatched) - new Date(a.lastWatched));
        const detailedItems = await Promise.all(
            sortedHistory.map(async (item) => {
                try {
                    const response = item.mediaType === 'movie'
                        ? await fetchMovieDetails(item.id)
                        : await fetchTvShowDetails(item.id);
                    return { ...response.data, ...item };
                } catch { return null; }
            })
        );
        setContinueWatching(detailedItems.filter(Boolean));
        return sortedHistory;
    }, [getHistory]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const history = await fetchContinueWatchingDetails();

                let forYouPromise;
                if (history.length > 0) {
                    const lastWatched = history[0];
                    forYouPromise = lastWatched.mediaType === 'movie'
                        ? fetchMovieRecommendations(lastWatched.id)
                        : fetchTvRecommendations(lastWatched.id);
                } else {
                    forYouPromise = fetchTrendingMovies();
                }

                // Generate random pages for dynamic content on refresh
                const randomPage = () => Math.floor(Math.random() * 10) + 1;

                const [
                    top10Res, popularTvRes, forYouRes,
                    acclaimedSciFiRes, mindBendingRes, bondCollectionRes
                ] = await Promise.all([
                    fetchTopRatedMovies('', randomPage()), // Use Top Rated for the Top 10 list
                    fetchPopularTvShows('', randomPage()),
                    forYouPromise,
                    fetchCriticallyAcclaimedSciFi(randomPage()),
                    fetchMindBendingThrillers(randomPage()),
                    fetchCollectionDetails('645')
                ]);
                setData({
                    top10Movies: top10Res.data.results,
                    popularTv: popularTvRes.data.results,
                    forYou: forYouRes.data.results,
                    acclaimedSciFi: acclaimedSciFiRes.data.results,
                    mindBendingThrillers: mindBendingRes.data.results,
                    bondCollection: bondCollectionRes.data.parts,
                });
                setHeroMovie(top10Res.data.results[0]); // Use the #1 top rated movie for the hero
            } catch (error) {
                console.error("Failed to fetch initial data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [fetchContinueWatchingDetails]);

    const openModal = (media, mediaType) => {
        setSelectedMedia({ ...media, media_type: mediaType });
    };

    const closeModal = () => {
        setSelectedMedia(null);
        fetchContinueWatchingDetails();
    };

    const handleContinueWatchingClick = (media) => {
        const playerUrl = media.mediaType === 'movie'
            ? `/player/movie/${media.id}`
            : `/player/tv/${media.id}/${media.season}/${media.episode}`;
        navigate(playerUrl);
    };

    return (
        <main>
            <LiveActivityFeed popularItems={data.top10Movies} />
            {loading ? <div className="h-[56.25vw] bg-gray-800 skeleton relative overflow-hidden"></div> : <Hero movie={heroMovie} onMoreInfo={() => openModal(heroMovie, 'movie')} />}
            <div className="px-4 md:px-12 -mt-20 relative z-10 pb-16">
                {loading ? (
                    <><CarouselSkeleton /><CarouselSkeleton /></>
                ) : (
                    <>
                        {continueWatching.length > 0 && <CarouselRow title="Continue Watching" items={continueWatching} onCardClick={handleContinueWatchingClick} />}
                        {data.forYou.length > 0 && <CarouselRow title="For You" items={data.forYou} onCardClick={(media) => openModal(media, media.title ? 'movie' : 'tv')} />}
                        <Top10CarouselRow title="Top 10 Movies Today" items={data.top10Movies} onCardClick={(media) => openModal(media, 'movie')} mediaType="movie" categoryKey="top_rated" />
                        <CarouselRow title="Critically Acclaimed Sci-Fi" items={data.acclaimedSciFi} onCardClick={(media) => openModal(media, 'movie')} mediaType="movie" categoryKey="acclaimed_scifi" />
                        <CarouselRow title="Mind-Bending Thrillers" items={data.mindBendingThrillers} onCardClick={(media) => openModal(media, 'movie')} mediaType="movie" categoryKey="mind_bending" />
                        <CarouselRow title="The James Bond Collection" items={data.bondCollection} onCardClick={(media) => openModal(media, 'movie')} />
                        <CarouselRow title="Popular TV Shows" items={data.popularTv} onCardClick={(media) => openModal(media, 'tv')} mediaType="tv" categoryKey="popular" />
                    </>
                )}
            </div>
            {selectedMedia && <DetailsModal media={selectedMedia} onClose={closeModal} onSuggestionClick={openModal} />}
        </main>
    );
};

export default BrowsePage;