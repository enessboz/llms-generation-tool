document.addEventListener('DOMContentLoaded', function() {
    // Elementleri seçme
    const urlListBtn = document.getElementById('urlListBtn');
    const sitemapBtn = document.getElementById('sitemapBtn');
    const urlInput = document.getElementById('urlInput');
    const generateBtn = document.getElementById('generateBtn');
    const resultArea = document.querySelector('.result-area');
    const resultOutput = document.getElementById('resultOutput');
    const copyBtn = document.getElementById('copyBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const loader = document.getElementById('loader');
    const titleInput = document.getElementById('titleInput');
    const descriptionInput = document.getElementById('descriptionInput');

    // URL Listesi / Sitemap geçişi
    urlListBtn.addEventListener('click', () => {
        urlListBtn.classList.add('active');
        sitemapBtn.classList.remove('active');
        urlInput.placeholder = 'Her satıra bir URL gelecek şekilde URL\'leri giriniz';
    });

    sitemapBtn.addEventListener('click', () => {
        sitemapBtn.classList.add('active');
        urlListBtn.classList.remove('active');
        urlInput.placeholder = 'Site haritası URL\'sini giriniz';
    });

    // LLMS.txt oluşturma
    generateBtn.addEventListener('click', async () => {
        const urls = urlInput.value.trim();
        const title = titleInput.value.trim();
        
        if (!urls) {
            alert('Lütfen URL giriniz!');
            return;
        }

        if (!title) {
            alert('Lütfen başlık giriniz!');
            return;
        }

        loader.style.display = 'block';
        resultArea.style.display = 'none';

        try {
            let urlList;
            if (sitemapBtn.classList.contains('active')) {
                // Sitemap modu
                urlList = await processSitemap(urls);
            } else {
                // URL listesi modu
                urlList = urls.split('\n').filter(url => url.trim()).map(url => {
                    // URL'nin http:// veya https:// ile başlamasını sağla
                    if (!url.startsWith('http://') && !url.startsWith('https://')) {
                        return 'https://' + url;
                    }
                    return url;
                });
            }

            const result = await generateLLMS(urlList);
            resultOutput.value = result;
            resultArea.style.display = 'block';
        } catch (error) {
            console.error('Hata:', error);
            alert('Bir hata oluştu: ' + error.message);
        } finally {
            loader.style.display = 'none';
        }
    });

    // Kopyalama işlemi
    copyBtn.addEventListener('click', () => {
        resultOutput.select();
        document.execCommand('copy');
        alert('Kopyalandı!');
    });

    // İndirme işlemi
    downloadBtn.addEventListener('click', () => {
        const blob = new Blob([resultOutput.value], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'llms.txt';
        a.click();
        window.URL.revokeObjectURL(url);
    });
});

// LLMS.txt oluşturma fonksiyonu
async function generateLLMS(urls) {
    let result = '';
    
    // Başlık ekleme
    const title = titleInput.value.trim();
    if (title) {
        result += `# ${title}\n`;
    }
    
    // Açıklama ekleme
    const description = descriptionInput.value.trim();
    if (description) {
        result += `> ${description}\n`;
    }
    
    // Her URL için içerik oluşturma
    for (const url of urls) {
        try {
            // CORS Proxy ekleyelim
            const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
            const response = await fetch(proxyUrl);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            const html = data.contents;
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Başlık alma (önce H1, yoksa meta title)
            let pageTitle = '';
            const h1 = doc.querySelector('h1');
            const metaTitle = doc.querySelector('title');
            
            if (h1 && h1.textContent.trim()) {
                pageTitle = h1.textContent.trim();
            } else if (metaTitle && metaTitle.textContent.trim()) {
                pageTitle = metaTitle.textContent.trim();
            } else {
                pageTitle = 'Başlık bulunamadı';
            }
            
            // Açıklama alma (önce meta description, yoksa ilk p etiketi)
            let pageDescription = '';
            const metaDesc = doc.querySelector('meta[name="description"]');
            
            if (metaDesc && metaDesc.getAttribute('content')) {
                pageDescription = metaDesc.getAttribute('content').trim();
            } else {
                const firstP = doc.querySelector('p');
                if (firstP && firstP.textContent.trim()) {
                    pageDescription = firstP.textContent.trim().substring(0, 200);
                    if (firstP.textContent.length > 200) {
                        pageDescription += '...';
                    }
                }
            }
            
            // LLMS formatında satır oluşturma
            result += `- [${pageTitle}](${url})${pageDescription ? ': ' + pageDescription : ''}\n`;
            
        } catch (error) {
            console.error(`URL işlenirken hata oluştu ${url}:`, error);
            result += `- [Hata: İçerik alınamadı](${url})\n`;
        }
    }
    
    return result;
}

// Sitemap işleme fonksiyonu
async function processSitemap(sitemapUrl) {
    try {
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(sitemapUrl)}`;
        const response = await fetch(proxyUrl);
        const data = await response.json();
        const xmlText = data.contents;
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
        
        const urls = Array.from(xmlDoc.getElementsByTagName('loc')).map(loc => loc.textContent);
        
        return urls;
    } catch (error) {
        throw new Error('Sitemap işlenirken hata oluştu: ' + error.message);
    }
} 
