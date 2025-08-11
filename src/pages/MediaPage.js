import React, { useState, useEffect } from 'react';
import {
    fetchMovieGenres, fetchTvShowGenres, fetchNowPlayingMovies,
    fetchPopularMovies, fetchTopRatedMovies, fetchPopularTvShows,
    fetchTopRatedTvShows, fetchUpcomingMovies, fetchHighQualityMovies,
    // THE FIX IS HERE: Added all the missing anime fetch functions
    fetchPopularAnime, fetchTopRatedAnime, fetchNetflixAnime,
    fetchDisneyAnime, fetchHboAnime, fetchAppleAnime
} from '../api/tmdb';
import { useAmbiance } from '../context/AmbianceContext';
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
    const { clearAmbiance } = useAmbiance();

    useEffect(() => {
        clearAmbiance();
    }, [clearAmbiance]);

    useEffect(() => {
        if (mediaType === 'anime') {
            setGenres([]);
            setSelectedGenreId('');
            return;
        }
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
                        "high_quality": { title: "High Quality", items: highQuality.data.results },
                        "popular": { title: "Popular", items: popular.data.results },
                        "top_rated": { title: "Top Rated", items: topRated.data.results },
                    };
                    heroCandidates = popular.data.results.length > 0 ? popular.data.results : inTheaters.data.results;
                } else if (mediaType === 'tv') {
                    const [popular, topRated] = await Promise.all([
                        fetchPopularTvShows(selectedGenreId, 1),
                        fetchTopRatedTvShows(selectedGenreId, 1)
                    ]);
                    fetchedData = {
                        "popular": { title: "Popular", items: popular.data.results },
                        "top_rated": { title: "Top Rated", items: topRated.data.results },
                    };
                    heroCandidates = popular.data.results;
                } else if (mediaType === 'anime') {
                    const [popular, topRated, netflix, disney, hbo, apple] = await Promise.all([
                        fetchPopularAnime(1),
                        fetchTopRatedAnime(1),
                        fetchNetflixAnime(1),
                        fetchDisneyAnime(1),
                        fetchHboAnime(1),
                        fetchAppleAnime(1),
                    ]);
                    fetchedData = {
                        "popular_anime": { title: "Most Popular Anime", items: popular.data.results },
                        "top_rated_anime": { title: "Top Rated Anime", items: topRated.data.results },
                        "netflix_anime": { title: "Netflix Anime", items: netflix.data.results },
                        "disney_anime": { title: "Disney+ Anime", items: disney.data.results },
                        "hbo_anime": { title: "HBO Anime", items: hbo.data.results },
                        "apple_anime": { title: "Apple TV+ Anime", items: apple.data.results },
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

    const handleGenreChange = (genreId) => {
        setSelectedGenreId(genreId);
    };

    const openModal = (media) => setSelectedMedia(media);
    const closeModal = () => setSelectedMedia(null);

    const selectedGenre = genres.find(g => g.id === parseInt(selectedGenreId));

    return (
        <main>
            {loading && !heroMedia ? <div className="h-[56.25vw] bg-gray-800 skeleton relative overflow-hidden"></div> : <Hero movie={heroMedia} onMoreInfo={() => openModal(heroMedia)} />}

            <div className="px-4 md:px-12 -mt-20 relative z-10 pb-16">
                <div className="flex items-center justify-between mb-8 pt-20">
                    <h1 className="text-4xl font-bold capitalize">{mediaType === 'anime' ? 'Anime' : `${mediaType}s`}</h1>
                </div>

                {mediaType !== 'anime' && (
                    <div className="flex items-center space-x-2 mb-12 overflow-x-auto carousel-row">
                        <button
                            onClick={() => handleGenreChange('')}
                            className={`px-4 py-2 text-sm font-semibold rounded-full flex-shrink-0 transition-colors duration-200 ${selectedGenreId === '' ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                        >
                            All Genres
                        </button>
                        {genres.map(genre => (
                            <button
                                key={genre.id}
                                onClick={() => handleGenreChange(genre.id)}
                                className={`px-4 py-2 text-sm font-semibold rounded-full flex-shrink-0 transition-colors duration-200 ${selectedGenreId === genre.id ? 'bg-red-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
                            >
                                {genre.name}
                            </button>
                        ))}
                    </div>
                )}

                {loading ? (
                    <><CarouselSkeleton /><CarouselSkeleton /></>
                ) : (
                    Object.entries(pageData).map(([key, { title, items }]) => (
                        items.length > 0 && <CarouselRow key={key} title={selectedGenre ? `${selectedGenre.name} ${title}` : title} items={items} onCardClick={openModal} mediaType={mediaType === 'anime' ? 'tv' : mediaType} categoryKey={key} />
                    ))
                )}
            </div>

            {selectedMedia && <DetailsModal media={{...selectedMedia, media_type: mediaType === 'anime' ? 'tv' : mediaType}} onClose={closeModal} onSuggestionClick={openModal} />}
        </main>
    );
};

export default MediaPage;