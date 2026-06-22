export async function loadArticleData() {
  const urlParams = new URLSearchParams(window.location.search);
  const articleId = urlParams.get('id');
  if (!articleId) return;

  try {
    // Try to find the article in index.html
    const response = await fetch('/');
    const htmlText = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlText, 'text/html');

    let link = doc.querySelector(`a[href*="/article.html?id=${articleId}"]`);
    
    if (!link) {
      // Check category.html if not found
      const catResponse = await fetch('/category.html');
      const catText = await catResponse.text();
      const catDoc = parser.parseFromString(catText, 'text/html');
      link = catDoc.querySelector(`a[href*="/article.html?id=${articleId}"]`);
    }

    if (link) {
      updateArticle(link);
    }
  } catch (err) {
    console.error("Error loading article data:", err);
  }

  function updateArticle(linkEl) {
    // Find closest container
    let container = linkEl.closest('article.card') || 
                    linkEl.closest('.hero-card') || 
                    linkEl.closest('.hero-side-card') || 
                    linkEl.closest('.deep-dive-item') || 
                    linkEl.closest('.sidebar-item-mini') ||
                    linkEl.closest('.card'); // fallback
    
    if (!container) return;

    // Extract data
    let titleEl = container.querySelector('.card-title');
    let title = titleEl ? titleEl.textContent.trim() : linkEl.textContent.trim();
    
    let imgEl = container.querySelector('img');
    let imgSrc = imgEl ? imgEl.src : '';
    
    let catEl = container.querySelector('.card-category');
    let category = catEl ? catEl.textContent.trim() : 'NEWS';
    
    // For sidebar items with "Press Release", they might not have .card-category
    if (!catEl && container.classList.contains('sidebar-item-mini')) {
      let prEl = container.querySelector('.card-meta');
      if (prEl && prEl.textContent.includes('Press Release')) {
        category = 'PRESS RELEASE';
      }
    }
    
    let dateEl = container.querySelector('.card-meta span');
    let date = dateEl ? dateEl.textContent.trim() : 'Today';

    // Update the DOM
    document.querySelector('.article-title').textContent = title;
    
    let headerCat = document.querySelector('.article-header .card-category');
    if (headerCat) headerCat.textContent = category.toUpperCase();
    
    let featuredImg = document.querySelector('.article-featured-img');
    if (featuredImg && imgSrc) {
      // Upgrade resolution from thumbnail to featured image size
      featuredImg.src = imgSrc.replace('&w=200', '&w=1200').replace('&w=800', '&w=1200');
    }
    
    let metaSpans = document.querySelectorAll('.article-meta span');
    if (metaSpans.length >= 3) {
       // Index 0 is Author, Index 1 is bullet, Index 2 is Date
       metaSpans[2].textContent = date;
    }
    
    // Dynamically update the document title too
    document.title = `${title} - CryptoDailyAlert`;
  }
}
