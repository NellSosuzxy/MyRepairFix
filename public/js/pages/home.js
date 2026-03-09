/**
 * INDEX.JS - Homepage Specific Logic
 * Handles the News Widget functionality
 */

document.addEventListener('DOMContentLoaded', () => {
    loadNews();
});

/**
 * Fetch and display tech news
 */
async function loadNews() {
    const newsList = document.getElementById('news-list');
    if (!newsList) return;

    try {
        const response = await fetch('/api/news');
        const data = await response.json();

        if (data.success && data.articles.length > 0) {
            // Filter articles that have images, then take top 6
            const articles = data.articles
                .filter(article => article.urlToImage)
                .slice(0, 6);
            
            // Generate HTML
            newsList.innerHTML = articles.map(article => `
                <div class="news-card">
                    <img src="${article.urlToImage}" alt="${article.title}" loading="lazy" onerror="this.src='images/logo1.png'">
                    <div class="news-content">
                        <h4><a href="${article.url}" target="_blank" rel="noopener">${article.title}</a></h4>
                        <p>${new Date(article.publishedAt).toLocaleDateString()}</p>
                    </div>
                </div>
            `).join('');
            
        } else {
            newsList.innerHTML = '<p class="text-center" style="grid-column: 1/-1;">Latest tech news currently unavailable.</p>';
        }

    } catch (error) {
        console.error('Error loading news:', error);
        newsList.innerHTML = '<p class="text-center" style="grid-column: 1/-1;">Unable to load news.</p>';
    }
}
