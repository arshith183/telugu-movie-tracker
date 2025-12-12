// TMDb API Configuration
// Get your free API key from: https://www.themoviedb.org/settings/api
const API_KEY = '8265bd1679663a7ea12ac168da84d2e8'; // Free demo key
const BASE_URL = 'https://api.themoviedb.org/3';
const IMG_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const TELUGU_LANGUAGE = 'te'; // Telugu language code

// DOM Elements
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const moviesGrid = document.getElementById('moviesGrid');
const loading = document.getElementById('loading');
const noResults = document.getElementById('noResults');
const yearFilter = document.getElementById('yearFilter');
const genreFilter = document.getElementById('genreFilter');
const countryFilter = document.getElementById('countryFilter');
const sortFilter = document.getElementById('sortFilter');
const movieModal = document.getElementById('movieModal');
const movieDetails = document.getElementById('movieDetails');
const closeModal = document.querySelector('.close');

// Load movies on page load
window.addEventListener('DOMContentLoaded', () => {
    loadTeluguMovies();
});

// Search functionality
searchBtn.addEventListener('click', () => {
    const query = searchInput.value.trim();
    if (query) {
        searchMovies(query);
    } else {
        loadTeluguMovies();
    }
});

searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchBtn.click();
    }
});

// Filter change events
[yearFilter, genreFilter, sortFilter].forEach(filter => {
    filter.addEventListener('change', () => {
        loadTeluguMovies();
    });
});

// Load Telugu Movies
async function loadTeluguMovies() {
    showLoading();
    
    const year = yearFilter.value;
    const genre = genreFilter.value;
    const sort = sortFilter.value;
    
    let url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_original_language=${TELUGU_LANGUAGE}&sort_by=${sort}&vote_count.gte=10`;
    
    if (year) url += `&primary_release_year=${year}`;
    if (genre) url += `&with_genres=${genre}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        displayMovies(data.results);
    } catch (error) {
        console.error('Error fetching movies:', error);
        hideLoading();
        showNoResults();
    }
}

// Search Movies
async function searchMovies(query) {
    showLoading();
    
    const url = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&with_original_language=${TELUGU_LANGUAGE}`;
    
    try {
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.results.length === 0) {
            hideLoading();
            showNoResults();
        } else {
            displayMovies(data.results);
        }
    } catch (error) {
        console.error('Error searching movies:', error);
        hideLoading();
        showNoResults();
    }
}

// Display Movies
function displayMovies(movies) {
    hideLoading();
    hideNoResults();
    moviesGrid.innerHTML = '';
    
    if (movies.length === 0) {
        showNoResults();
        return;
    }
    
    movies.forEach(movie => {
        const movieCard = createMovieCard(movie);
        moviesGrid.appendChild(movieCard);
    });
}

// Create Movie Card
function createMovieCard(movie) {
    const card = document.createElement('div');
    card.className = 'movie-card';
    card.onclick = () => showMovieDetails(movie.id);
    
    const posterPath = movie.poster_path 
        ? IMG_BASE_URL + movie.poster_path 
        : 'https://via.placeholder.com/500x750?text=No+Poster';
    
    const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';
    const rating = movie.vote_average ? movie.vote_average.toFixed(1) : 'N/A';
    
    card.innerHTML = `
        <img src="${posterPath}" alt="${movie.title}" class="movie-poster">
        <div class="movie-info">
            <h3 class="movie-title">${movie.title || movie.original_title}</h3>
            <div class="movie-meta">
                <span class="movie-year">${releaseYear}</span>
                <span class="movie-rating">
                    ⭐ ${rating}
                </span>
            </div>
            <p class="movie-description">${movie.overview || 'No description available.'}</p>
        </div>
    `;
    
    return card;
}

// Show Movie Details
async function showMovieDetails(movieId) {
    showLoading();
    
    try {
        // Fetch movie details
        const movieResponse = await fetch(`${BASE_URL}/movie/${movieId}?api_key=${API_KEY}&append_to_response=credits,videos`);
        const movie = await movieResponse.json();
        
        // Fetch streaming providers
        const providersResponse = await fetch(`${BASE_URL}/movie/${movieId}/watch/providers?api_key=${API_KEY}`);
        const providers = await providersResponse.json();
        
        hideLoading();
        
        // Build modal content
        const selectedCountry = countryFilter.value;
        const countryProviders = providers.results[selectedCountry] || {};
        
        const posterPath = movie.poster_path 
            ? IMG_BASE_URL + movie.poster_path 
            : 'https://via.placeholder.com/500x750?text=No+Poster';
        
        const trailer = movie.videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');
        const trailerEmbed = trailer 
            ? `<iframe width="100%" height="400" src="https://www.youtube.com/embed/${trailer.key}" frameborder="0" allowfullscreen></iframe>`
            : '';
        
        const cast = movie.credits.cast.slice(0, 5).map(c => c.name).join(', ');
        const director = movie.credits.crew.find(c => c.job === 'Director')?.name || 'Unknown';
        
        const streamingHTML = buildStreamingHTML(countryProviders, selectedCountry);
        
        movieDetails.innerHTML = `
            <div style="display: flex; gap: 30px; flex-wrap: wrap;">
                <img src="${posterPath}" alt="${movie.title}" style="width: 300px; border-radius: 15px;">
                <div style="flex: 1;">
                    <h2>${movie.title || movie.original_title}</h2>
                    <div style="margin: 15px 0;">
                        <span style="background: #667eea; color: white; padding: 5px 15px; border-radius: 20px; margin-right: 10px;">
                            ⭐ ${movie.vote_average.toFixed(1)} / 10
                        </span>
                        <span style="background: #ff6b6b; color: white; padding: 5px 15px; border-radius: 20px;">
                            ${movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}
                        </span>
                    </div>
                    <p style="margin: 20px 0; line-height: 1.8;">${movie.overview}</p>
                    <div style="margin: 20px 0;">
                        <p><strong>Director:</strong> ${director}</p>
                        <p><strong>Cast:</strong> ${cast}</p>
                        <p><strong>Runtime:</strong> ${movie.runtime} minutes</p>
                        <p><strong>Genres:</strong> ${movie.genres.map(g => g.name).join(', ')}</p>
                    </div>
                    ${streamingHTML}
                </div>
            </div>
            ${trailerEmbed ? `<div style="margin-top: 30px;">${trailerEmbed}</div>` : ''}
        `;
        
        movieModal.style.display = 'block';
    } catch (error) {
        console.error('Error fetching movie details:', error);
        hideLoading();
    }
}

// Build Streaming HTML
function buildStreamingHTML(providers, country) {
    if (!providers.flatrate && !providers.rent && !providers.buy) {
        return `<div style="margin-top: 20px; padding: 20px; background: #f0f0f0; border-radius: 10px;">
                    <h3>Where to Watch in ${getCountryName(country)}</h3>
                    <p>Not currently available on major streaming platforms in your region.</p>
                    <p style="font-size: 0.9em; color: #666;">Check local theaters or cable providers.</p>
                </div>`;
    }
    
    let html = `<div style="margin-top: 20px; padding: 20px; background: #f0f0f0; border-radius: 10px;">
                    <h3>🎬 Where to Watch in ${getCountryName(country)}</h3>`;
    
    if (providers.flatrate) {
        html += '<div style="margin: 15px 0;"><strong>Stream:</strong><br>';
        providers.flatrate.forEach(p => {
            html += `<span style="background: white; padding: 8px 15px; border-radius: 10px; margin: 5px; display: inline-block; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">${p.provider_name}</span>`;
        });
        html += '</div>';
    }
    
    if (providers.rent) {
        html += '<div style="margin: 15px 0;"><strong>Rent:</strong><br>';
        providers.rent.forEach(p => {
            html += `<span style="background: white; padding: 8px 15px; border-radius: 10px; margin: 5px; display: inline-block; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">${p.provider_name}</span>`;
        });
        html += '</div>';
    }
    
    html += '</div>';
    return html;
}

// Helper: Get Country Name
function getCountryName(code) {
    const countries = {
        'US': 'United States',
        'IN': 'India',
        'GB': 'United Kingdom',
        'CA': 'Canada',
        'AU': 'Australia',
        'AE': 'UAE'
    };
    return countries[code] || code;
}

// Modal close
closeModal.onclick = () => {
    movieModal.style.display = 'none';
};

window.onclick = (e) => {
    if (e.target === movieModal) {
        movieModal.style.display = 'none';
    }
};

// Loading helpers
function showLoading() {
    loading.style.display = 'block';
    moviesGrid.innerHTML = '';
}

function hideLoading() {
    loading.style.display = 'none';
}

function showNoResults() {
    noResults.style.display = 'block';
}

function hideNoResults() {
    noResults.style.display = 'none';
}
