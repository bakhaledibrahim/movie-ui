import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    fetchTrendingMovies, fetchPopularTvShows, fetchTopRatedMovies,
    fetchNewMovieReleases, fetchMovieDetails,
    fetchTvShowDetails, fetchNetflixOriginals, fetchDisneyOriginals,
    fetchAmazonOriginals, fetchAppleOriginals
} from '../api/tmdb';
import { useWatchHistory } from '../hooks/useWatchHistory';
import Hero from '../components/Hero';
import CarouselRow from '../components/CarouselRow';
import DetailsModal from '../components/DetailsModal';
import { CarouselSkeleton } from '../components/Skeleton';

const BrowsePage = () => {
    const [data, setData] = useState({
        trendingMovies: [], popularTv: [], topRatedMovies: [],
        newMovieReleases: [], netflixOriginals: [], disneyOriginals: [],
        amazonOriginals: [], appleOriginals: []
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
    }, [getHistory]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                await fetchContinueWatchingDetails();
                const [
                    trendingRes, popularTvRes, topRatedRes, newReleasesRes,
                    netflixRes, disneyRes, amazonRes, appleRes
                ] = await Promise.all([
                    fetchTrendingMovies(), fetchPopularTvShows(), fetchTopRatedMovies(),
                    fetchNewMovieReleases(), fetchNetflixOriginals(), fetchDisneyOriginals(),
                    fetchAmazonOriginals(), fetchAppleOriginals()
                ]);
                setData({
                    trendingMovies: trendingRes.data.results,
                    popularTv: popularTvRes.data.results,
                    topRatedMovies: topRatedRes.data.results,
                    newMovieReleases: newReleasesRes.data.results,
                    netflixOriginals: netflixRes.data.results,
                    disneyOriginals: disneyRes.data.results,
                    amazonOriginals: amazonRes.data.results,
                    appleOriginals: appleRes.data.results,
                });
                setHeroMovie(trendingRes.data.results[Math.floor(Math.random() * trendingRes.data.results.length)]);
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
                        <CarouselRow title="Trending Movies" items={data.trendingMovies} onCardClick={(media) => openModal(media, 'movie')} mediaType="movie" categoryKey="trending" />
                        <CarouselRow title="Netflix Originals" items={data.netflixOriginals} onCardClick={(media) => openModal(media, 'tv')} mediaType="tv" categoryKey="netflix" />
                        <CarouselRow title="New Movie Releases" items={data.newMovieReleases} onCardClick={(media) => openModal(media, 'movie')} mediaType="movie" categoryKey="new_releases" />
                        <CarouselRow title="Disney+ Originals" items={data.disneyOriginals} onCardClick={(media) => openModal(media, 'tv')} mediaType="tv" categoryKey="disney" />
                        <CarouselRow title="Amazon Originals" items={data.amazonOriginals} onCardClick={(media) => openModal(media, 'tv')} mediaType="tv" categoryKey="amazon" />
                        <CarouselRow title="Apple TV+ Originals" items={data.appleOriginals} onCardClick={(media) => openModal(media, 'tv')} mediaType="tv" categoryKey="apple" />
                        <CarouselRow title="Critically Acclaimed Movies" items={data.topRatedMovies} onCardClick={(media) => openModal(media, 'movie')} mediaType="movie" categoryKey="top_rated" />
                        <CarouselRow title="Popular TV Shows" items={data.popularTv} onCardClick={(media) => openModal(media, 'tv')} mediaType="tv" categoryKey="popular" />
                    </>
                )}
            </div>
            {selectedMedia && <DetailsModal media={selectedMedia} onClose={closeModal} />}
        </main>
    );
};

export default BrowsePage;