import React, { useState, useEffect } from 'react';
import {
    fetchMovieGenres, fetchTvShowGenres, fetchNowPlayingMovies,
    fetchPopularMovies, fetchTopRatedMovies, fetchPopularTvShows,
    fetchTopRatedTvShows, fetchUpcomingMovies, fetchHighQualityMovies
} from '../api/tmdb';
import Hero from '../components/Hero';
import CarouselRow from '../components/CarouselRow';
import DetailsModal from '../components/DetailsModal';
import { CarouselSkeleton } from '../components/Skeleton';

const MediaPage = ({ mediaType }) => {
    const [genres, setGenres] = useState([]);
    const [selectedGenreId, setSelectedGenreId] = useState('');
    const [pageData, setPageData] = useState({});
    const [loading, setLoading] = useState(true);
    const [heroMedia, setHeroMedia] = useState(null);
    const [selectedMedia, setSelectedMedia] = useState(null);

    useEffect(() => {
        const getGenres = async () => {
            try {
                const response = mediaType === 'movie' ? await fetchMovieGenres() : await fetchTvShowGenres();
                setGenres(response.data.genres);
            } catch (error) {
                console.error("Failed to fetch genres:", error);
            }
        };
        getGenres();
        setSelectedGenreId('');
    }, [mediaType]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            setPageData({});
            setHeroMedia(null);

            try {
                let heroCandidates = [];
                let fetchedData = {};

                if (mediaType === 'movie') {
                    const [popular, topRated, upcoming, inTheaters, highQuality] = await Promise.all([
                        fetchPopularMovies(selectedGenreId, 1),
                        fetchTopRatedMovies(selectedGenreId, 1),
                        fetchUpcomingMovies(1),
                        fetchNowPlayingMovies(selectedGenreId, 1),
                        fetchHighQualityMovies(selectedGenreId, 1)
                    ]);
                    fetchedData = {
                        "in_theaters": { title: "In Theaters", items: inTheaters.data.results },
                        "upcoming": { title: "Upcoming", items: upcoming.data.results },
                        "high_quality": { title: "High Quality (Digital/Blu-ray)", items: highQuality.data.results },
                        "popular": { title: "Popular", items: popular.data.results },
                        "top_rated": { title: "Top Rated", items: topRated.data.results },
                    };
                    heroCandidates = popular.data.results.length > 0 ? popular.data.results : inTheaters.data.results;
                } else { // tv
                    const [popular, topRated] = await Promise.all([
                        fetchPopularTvShows(selectedGenreId, 1),
                        fetchTopRatedTvShows(selectedGenreId, 1)
                    ]);
                    fetchedData = {
                        "popular": { title: "Popular", items: popular.data.results },
                        "top_rated": { title: "Top Rated", items: topRated.data.results },
                    };
                    heroCandidates = popular.data.results;
                }

                setPageData(fetchedData);

                if (heroCandidates && heroCandidates.length > 0) {
                    const randomHero = heroCandidates[Math.floor(Math.random() * heroCandidates.length)];
                    setHeroMedia(randomHero);
                }
            } catch (error) {
                console.error(`Failed to fetch ${mediaType} data`, error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [mediaType, selectedGenreId]);

    const handleGenreChange = (e) => {
        setSelectedGenreId(e.target.value);
    };

    const openModal = (media) => setSelectedMedia(media);
    const closeModal = () => setSelectedMedia(null);

    const selectedGenre = genres.find(g => g.id === parseInt(selectedGenreId));
    // const pageTitle = selectedGenre ? selectedGenre.name : `All ${mediaType === 'movie' ? 'Movies' : 'TV Shows'}`;

    return (
        <main>
            {loading && !heroMedia ? <div className="h-[56.25vw] bg-gray-800 skeleton relative overflow-hidden"></div> : <Hero movie={heroMedia} onMoreInfo={() => openModal(heroMedia)} />}

            <div className="px-4 md:px-12 -mt-20 relative z-10 pb-16">
                <div className="flex items-center justify-between mb-8 pt-20">
                    <div className="flex items-center space-x-4">
                        <h1 className="text-4xl font-bold capitalize">{mediaType}s</h1>
                        <select
                            value={selectedGenreId}
                            onChange={handleGenreChange}
                            className="bg-gray-800 text-white p-2 rounded border border-gray-600"
                        >
                            <option value="">All Genres</option>
                            {genres.map(genre => <option key={genre.id} value={genre.id}>{genre.name}</option>)}
                        </select>
                    </div>
                </div>

                {loading ? (
                    <><CarouselSkeleton /><CarouselSkeleton /></>
                ) : (
                    Object.entries(pageData).map(([key, { title, items }]) => (
                        items.length > 0 && <CarouselRow key={key} title={selectedGenre ? `${selectedGenre.name} ${title}` : title} items={items} onCardClick={openModal} mediaType={mediaType} categoryKey={key} />
                    ))
                )}
            </div>

            {selectedMedia && <DetailsModal media={{...selectedMedia, media_type: mediaType}} onClose={closeModal} />}
        </main>
    );
};

export default MediaPage;