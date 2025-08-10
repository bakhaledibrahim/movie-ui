import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api/tmdb';

const client = axios.create({ baseURL: API_BASE_URL });

// New functions for streaming originals
export const fetchNetflixOriginals = (page = 1) => client.get(`/tv/netflix?page=${page}`);
export const fetchDisneyOriginals = (page = 1) => client.get(`/tv/disney?page=${page}`);
export const fetchAmazonOriginals = (page = 1) => client.get(`/tv/amazon?page=${page}`);
export const fetchAppleOriginals = (page = 1) => client.get(`/tv/apple?page=${page}`);

// All other functions...
export const fetchHighQualityMovies = (genreId = '', page = 1) => client.get(`/movie/high_quality?genreId=${genreId}&page=${page}`);
export const fetchTrendingTvShows = (page = 1) => client.get(`/trending/tv?page=${page}`);
export const fetchNewMovieReleases = (page = 1) => client.get(`/movie/new_releases?page=${page}`);
export const fetchPersonCredits = (personId) => client.get(`/person/${personId}/credits`);
export const fetchMovieGenres = () => client.get('/genres/movie');
export const fetchTvShowGenres = () => client.get('/genres/tv');
export const fetchNowPlayingMovies = (genreId = '', page = 1) => client.get(`/movie/now_playing?genreId=${genreId}&page=${page}`);
export const fetchPopularMovies = (genreId = '', page = 1) => client.get(`/movie/popular?genreId=${genreId}&page=${page}`);
export const fetchTopRatedMovies = (genreId = '', page = 1) => client.get(`/movie/top_rated?genreId=${genreId}&page=${page}`);
export const fetchPopularTvShows = (genreId = '', page = 1) => client.get(`/tv/popular?genreId=${genreId}&page=${page}`);
export const fetchTopRatedTvShows = (genreId = '', page = 1) => client.get(`/tv/top_rated?genreId=${genreId}&page=${page}`);
export const fetchTrendingMovies = (page = 1) => client.get(`/trending/movie?page=${page}`);
export const fetchUpcomingMovies = (page = 1) => client.get(`/upcoming/movie?page=${page}`);
export const fetchMovieDetails = (id) => client.get(`/movie/${id}`);
export const fetchTvShowDetails = (id) => client.get(`/tv/${id}`);
export const fetchSeasonDetails = (tvId, seasonNumber) => client.get(`/tv/${tvId}/season/${seasonNumber}`);
export const fetchSimilarMovies = (id) => client.get(`/movie/${id}/similar`);
export const fetchSimilarTvShows = (id) => client.get(`/tv/${id}/similar`);

export const searchMedia = (query) => {
    const movieSearch = client.get(`/search/movie?query=${query}`);
    const tvSearch = client.get(`/search/tv?query=${query}`);
    return Promise.all([movieSearch, tvSearch]);
};