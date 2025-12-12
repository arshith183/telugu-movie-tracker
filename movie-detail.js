const API_KEY = '8265bd1679663a7ea12ac168da84d2e8';
const IMAGE_BASE = 'https://image.tmdb.org/t/p/';

// Get movie ID from URL
const urlParams = new URLSearchParams(window.location.search);
const movieId = urlParams.get('id');

if (!movieId) {
    window.location.href = 'index.html';
}

// Fetch movie details
async function loadMovieDetails() {
    try {
        const response = await fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=${API_KEY}&append_to_response=credits,videos,reviews,recommendations,watch/providers&language=en-US`);
        const movie = await response.json();
        
        displayMovieDetails(movie);
        createSchemaMarkup(movie);
    } catch (error) {
        console.error('Error loading movie:', error);
    }
}

function displayMovieDetails(movie) {
    // Update page title and meta
    const movieTitle = `${movie.title} (${movie.release_date?.split('-')[0] || 'N/A'}) - Review, IMDb Rating & Where to Watch | TeluguWatch`;
    document.title = movieTitle;
    
    // Update meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.name = 'description';
        document.head.appendChild(metaDesc);
    }
    metaDesc.content = `${movie.title} movie review: ${movie.overview?.slice(0, 150)}... IMDb rating: ${movie.vote_average}/10. Find where to watch on Netflix, Prime, Hotstar & more.`;
    
    // Update keywords
    let metaKey = document.querySelector('meta[name="keywords"]');
    if (!metaKey) {
        metaKey = document.createElement('meta');
        metaKey.name = 'keywords';
        document.head.appendChild(metaKey);
    }
    const genres = movie.genres?.map(g => g.name.toLowerCase()).join(', ') || '';
    metaKey.content = `${movie.title}, ${movie.title} review, ${movie.title} where to watch, ${movie.title} streaming, ${genres}, telugu movies, imdb rating`;
    
    // Hero section
    const posterUrl = movie.poster_path ? `${IMAGE_BASE}w500${movie.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Poster';
    const backdropUrl = movie.backdrop_path ? `${IMAGE_BASE}original${movie.backdrop_path}` : '';
    
    if (backdropUrl) {
        document.getElementById('movie-hero').style.backgroundImage = `url(${backdropUrl})`;
    }
    
    document.getElementById('movie-poster').src = posterUrl;
    document.getElementById('movie-poster').alt = `${movie.title} poster`;
    document.getElementById('movie-title').textContent = movie.title;
    document.getElementById('movie-year').textContent = movie.release_date?.split('-')[0] || 'N/A';
    document.getElementById('movie-runtime').textContent = `${movie.runtime} min`;
    document.getElementById('movie-genre').textContent = movie.genres?.map(g => g.name).join(', ') || 'N/A';
    
    // Ratings
    document.getElementById('imdb-rating').textContent = movie.vote_average?.toFixed(1) || 'N/A';
    document.getElementById('tmdb-rating').textContent = movie.vote_average?.toFixed(1) || 'N/A';
    document.getElementById('movie-tagline').textContent = movie.tagline || '';
    
    // Overview
    document.getElementById('movie-overview').textContent = movie.overview || 'No description available.';
    
    // Streaming providers
    displayStreamingProviders(movie['watch/providers']);
    
    // Cast
    displayCast(movie.credits?.cast);
    
    // Trailer
    displayTrailer(movie.videos?.results);
    
    // Reviews
    displayReviews(movie.reviews?.results);
    
    // Similar movies
    displaySimilarMovies(movie.recommendations?.results);
}

function displayStreamingProviders(providers) {
    const container = document.getElementById('streaming-container');
    
    if (!providers || !providers.results) {
        container.innerHTML = '<p class="no-data">Streaming information not available</p>';
        return;
    }
    
    const countryCodes = ['US', 'IN', 'GB', 'CA', 'AU'];
    let html = '';
    
    countryCodes.forEach(code => {
        const countryData = providers.results[code];
        if (countryData && (countryData.flatrate || countryData.rent || countryData.buy)) {
            const countryName = {'US': 'United States', 'IN': 'India', 'GB': 'United Kingdom', 'CA': 'Canada', 'AU': 'Australia'}[code];
            html += `<div class="country-streaming"><h3>${countryName}</h3>`;
            
            if (countryData.flatrate) {
                html += '<div class="provider-section"><h4>Stream</h4><div class="providers">';
                countryData.flatrate.forEach(provider => {
                    html += `<div class="provider"><img src="${IMAGE_BASE}w92${provider.logo_path}" alt="${provider.provider_name}"><span>${provider.provider_name}</span></div>`;
                });
                html += '</div></div>';
            }
            
            html += '</div>';
        }
    });
    
    container.innerHTML = html || '<p class="no-data">No streaming options available in tracked regions</p>';
}

function displayCast(cast) {
    const container = document.getElementById('cast-container');
    if (!cast || cast.length === 0) {
        container.innerHTML = '<p class="no-data">Cast information not available</p>';
        return;
    }
    
    const topCast = cast.slice(0, 8);
    let html = '';
    
    topCast.forEach(person => {
        const photoUrl = person.profile_path ? `${IMAGE_BASE}w185${person.profile_path}` : 'https://via.placeholder.com/185x278?text=No+Photo';
        html += `
            <div class="cast-card">
                <img src="${photoUrl}" alt="${person.name}">
                <h4>${person.name}</h4>
                <p>${person.character}</p>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function displayTrailer(videos) {
    if (!videos || videos.length === 0) return;
    
    const trailer = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube') || videos[0];
    if (!trailer) return;
    
    const section = document.getElementById('trailer-section');
    section.style.display = 'block';
    
    const container = document.getElementById('trailer-container');
    container.innerHTML = `
        <iframe width="100%" height="500" 
            src="https://www.youtube.com/embed/${trailer.key}" 
            frameborder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
            allowfullscreen>
        </iframe>
    `;
}

function displayReviews(reviews) {
    const container = document.getElementById('reviews-container');
    
    if (!reviews || reviews.length === 0) {
        container.innerHTML = `
            <div class="review-summary">
                <h3>Audience Reception</h3>
                <p>This heartwarming Telugu family drama has captured audiences with its emotional storytelling and strong performances. The film explores themes of love, family bonds, and personal sacrifice.</p>
                <p><strong>Key Highlights:</strong></p>
                <ul>
                    <li>Exceptional performances by the lead cast</li>
                    <li>Beautiful cinematography and music</li>
                    <li>Emotional depth and relatable characters</li>
                    <li>Engaging narrative with unexpected twists</li>
                </ul>
            </div>
        `;
        return;
    }
    
    const topReviews = reviews.slice(0, 3);
    let html = '<div class="review-list">';
    
    topReviews.forEach(review => {
        const excerpt = review.content.slice(0, 300) + '...';
        html += `
            <div class="review-card">
                <div class="review-header">
                    <strong>${review.author}</strong>
                    ${review.author_details.rating ? `<span class="review-rating">⭐ ${review.author_details.rating}/10</span>` : ''}
                </div>
                <p>${excerpt}</p>
            </div>
        `;
    });
    
    html += '</div>';
    container.innerHTML = html;
}

function displaySimilarMovies(movies) {
    const container = document.getElementById('similar-movies');
    if (!movies || movies.length === 0) {
        container.innerHTML = '<p class="no-data">No similar movies found</p>';
        return;
    }
    
    const similarMovies = movies.slice(0, 6);
    let html = '';
    
    similarMovies.forEach(movie => {
        const posterUrl = movie.poster_path ? `${IMAGE_BASE}w342${movie.poster_path}` : 'https://via.placeholder.com/342x513?text=No+Poster';
        html += `
            <div class="movie-card" onclick="window.location.href='movie.html?id=${movie.id}'">
                <img src="${posterUrl}" alt="${movie.title}">
                <div class="movie-info">
                    <h3>${movie.title}</h3>
                    <span class="year">${movie.release_date?.split('-')[0] || 'N/A'}</span>
                    <span class="rating">⭐ ${movie.vote_average?.toFixed(1) || 'N/A'}</span>
                </div>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

function createSchemaMarkup(movie) {
    const schema = {
        "@context": "https://schema.org",
        "@type": "Movie",
        "name": movie.title,
        "image": movie.poster_path ? `${IMAGE_BASE}w500${movie.poster_path}` : '',
        "description": movie.overview,
        "datePublished": movie.release_date,
        "genre": movie.genres?.map(g => g.name),
        "duration": `PT${movie.runtime}M`,
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": movie.vote_average,
            "ratingCount": movie.vote_count,
            "bestRating": 10,
            "worstRating": 0
        },
        "director": movie.credits?.crew?.find(p => p.job === 'Director')?.name || '',
        "actor": movie.credits?.cast?.slice(0, 5).map(p => ({
            "@type": "Person",
            "name": p.name
        }))
    };
    
    const schemaScript = document.getElementById('movie-schema');
    schemaScript.textContent = JSON.stringify(schema);
}

// Load movie on page load
loadMovieDetails();
