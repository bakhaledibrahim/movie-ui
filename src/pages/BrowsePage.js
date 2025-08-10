import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    fetchTrendingMovies, fetchPopularTvShows, fetchUpcomingMovies,
    fetchMovieDetails, fetchTvShowDetails, fetchPopularMovies,
    fetchMovieRecommendations, fetchTvRecommendations
} from '../api/tmdb';
import { useWatchHistory } from '../hooks/useWatchHistory';
import Hero from '../components/Hero';
import CarouselRow from '../components/CarouselRow';
import Top10CarouselRow from '../components/Top10CarouselRow';
import DetailsModal from '../components/DetailsModal';
import { CarouselSkeleton } from '../components/Skeleton';

const BrowsePage = () => {
    const [data, setData] = useState({
        top10Movies: [], popularTv: [], forYou: [],
        upcomingMovies: [], actionMovies: [], comedyMovies: []
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
                    forYouPromise = fetchTrendingMovies(); // Fallback to trending
                }

                const [
                    top10Res, popularTvRes, upcomingRes,
                    actionMoviesRes, comedyMoviesRes, forYouRes
                ] = await Promise.all([
                    fetchPopularMovies(), fetchPopularTvShows(), fetchUpcomingMovies(),
                    fetchPopularMovies('28'), fetchPopularMovies('35'), forYouPromise
                ]);
                setData({
                    top10Movies: top10Res.data.results,
                    popularTv: popularTvRes.data.results,
                    upcomingMovies: upcomingRes.data.results,
                    actionMovies: actionMoviesRes.data.results,
                    comedyMovies: comedyMoviesRes.data.results,
                    forYou: forYouRes.data.results,
                });
                setHeroMovie(top10Res.data.results[Math.floor(Math.random() * 10)]);
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
            {loading ? <div className="h-[56.25vw] bg-gray-800 skeleton relative overflow-hidden"></div> : <Hero movie={heroMovie} onMoreInfo={() => openModal(heroMovie, heroMovie.title ? 'movie' : 'tv')} />}
            <div className="px-4 md:px-12 -mt-20 relative z-10 pb-16">
                {loading ? (
                    <><CarouselSkeleton /><CarouselSkeleton /></>
                ) : (
                    <>
                        {continueWatching.length > 0 && <CarouselRow title="Continue Watching" items={continueWatching} onCardClick={handleContinueWatchingClick} />}
                        {data.forYou.length > 0 && <CarouselRow title="For You" items={data.forYou} onCardClick={(media) => openModal(media, media.title ? 'movie' : 'tv')} />}
                        <Top10CarouselRow title="Top 10 Movies Today" items={data.top10Movies} onCardClick={(media) => openModal(media, 'movie')} />
                        <CarouselRow title="Upcoming" items={data.upcomingMovies} onCardClick={(media) => openModal(media, 'movie')} isUpcoming={true} />
                        <CarouselRow title="Popular TV Shows" items={data.popularTv} onCardClick={(media) => openModal(media, 'tv')} />
                        <CarouselRow title="Action & Adventure" items={data.actionMovies} onCardClick={(media) => openModal(media, 'movie')} />
                        <CarouselRow title="Comedies" items={data.comedyMovies} onCardClick={(media) => openModal(media, 'movie')} />
                    </>
                )}
            </div>
            {selectedMedia && <DetailsModal media={selectedMedia} onClose={closeModal} />}
        </main>
    );
};

export default BrowsePage;