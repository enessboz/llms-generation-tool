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

    // Sayfa içeriğini getiren fonksiyon
    async function fetchPageContent(url) {
        try {
            // Yeni proxy servisi kullanımı
            const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
            const response = await fetch(proxyUrl);
            if (!response.ok) throw new Error('Sayfa alınamadı');
            const text = await response.text();
            return text;
        } catch (error) {
            console.error('Fetch hatası:', error);
            throw error;
        }
    }

    // Sitemap işleme fonksiyonu
    async function processSitemap(sitemapUrl) {
        try {
            const xmlContent = await fetchPageContent(sitemapUrl);
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
            const urls = Array.from(xmlDoc.getElementsByTagName('loc')).map(loc => loc.textContent.trim());
            console.log('Bulunan URLler:', urls);
            return urls;
        } catch (error) {
            console.error('Sitemap işleme hatası:', error);
            throw error;
        }
    }

    // LLMS.txt oluşturma
    generateBtn.addEventListener('click', async () => {
        const title = titleInput.value.trim();
        const description = descriptionInput.value.trim();
        const inputUrl = urlInput.value.trim();

        if (!title || !inputUrl) {
            alert('Başlık ve URL alanları zorunludur!');
            return;
        }

        let result = `# ${title}\n`;
        if (description) {
            result += `> ${description}\n`;
        }

        try {
            let urls = [];
            if (sitemapBtn.classList.contains('active')) {
                console.log('Sitemap işleniyor...');
                urls = await processSitemap(inputUrl);
            } else {
                urls = inputUrl.split('\n')
                    .map(url => url.trim())
                    .filter(url => url)
                    .map(url => !url.startsWith('http') ? 'https://' + url : url);
            }

            for (const url of urls) {
                try {
                    console.log(`İşleniyor: ${url}`);
                    const html = await fetchPageContent(url);
                    const doc = new DOMParser().parseFromString(html, 'text/html');

                    // Başlık alma
                    let pageTitle = '';
                    const h1 = doc.querySelector('h1');
                    const titleTag = doc.querySelector('title');
                    if (h1 && h1.textContent.trim()) {
                        pageTitle = h1.textContent.trim();
                    } else if (titleTag && titleTag.textContent.trim()) {
                        pageTitle = titleTag.textContent.trim();
                    } else {
                        pageTitle = 'Başlık bulunamadı';
                    }

                    // Açıklama alma
                    let pageDesc = '';
                    const metaDesc = doc.querySelector('meta[name="description"]');
                    if (metaDesc && metaDesc.getAttribute('content')) {
                        pageDesc = metaDesc.getAttribute('content').trim();
                    } else {
                        const firstP = doc.querySelector('p');
                        if (firstP && firstP.textContent.trim()) {
                            pageDesc = firstP.textContent.trim().substring(0, 200);
                            if (firstP.textContent.length > 200) pageDesc += '...';
                        }
                    }

                    result += `- [${pageTitle}](${url})${pageDesc ? ': ' + pageDesc : ''}\n`;
                    console.log(`Başarıyla işlendi: ${url}`);
                } catch (error) {
                    console.error(`Hata (${url}):`, error);
                    result += `- [URL işlenemedi](${url})\n`;
                }
            }

            resultOutput.value = result;
        } catch (error) {
            console.error('Genel hata:', error);
            alert('Bir hata oluştu: ' + error.message);
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
        result += `# ${title}\n\n`;
    }
    
    // Açıklama ekleme
    const description = descriptionInput.value.trim();
    if (description) {
        result += `> ${description}\n\n`;
    }
    
    // Her URL için içerik oluşturma
    for (const url of urls) {
        try {
            const proxyUrl = `https://cors-anywhere.herokuapp.com/${url}`;
            const response = await fetch(proxyUrl, {
                headers: {
                    'Origin': window.location.origin
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            let pageTitle = '';
            const h1 = doc.querySelector('h1');
            const metaTitle = doc.querySelector('title');
            
            if (h1 && h1.textContent.trim()) {
                pageTitle = h1.textContent.trim();
            } else if (metaTitle && metaTitle.textContent.trim()) {
                pageTitle = metaTitle.textContent.trim();
            } else {
                pageTitle = url; // URL'yi başlık olarak kullan
            }
            
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
            
            // Doğru formatta çıktı oluştur
            result += `- [${pageTitle}](${url})${pageDescription ? ': ' + pageDescription : ''}\n`;
            
        } catch (error) {
            console.error(`URL işlenirken hata oluştu ${url}:`, error);
            result += `- [${url}](${url})\n`;
        }
    }
    
    return result;
}

// Sitemap işleme fonksiyonu
async function processSitemap(sitemapUrl) {
    try {
        // CORS proxy URL'sini düzelt
        const proxyUrl = `https://cors-anywhere.herokuapp.com/${sitemapUrl}`;
        const response = await fetch(proxyUrl, {
            headers: {
                'Origin': window.location.origin
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const xmlText = await response.text();
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
        
        // Tüm loc etiketlerini bul ve URL'leri topla
        const urls = [];
        const locations = xmlDoc.getElementsByTagName('loc');
        for (let i = 0; i < locations.length; i++) {
            urls.push(locations[i].textContent.trim());
        }
        
        if (urls.length === 0) {
            throw new Error('Sitemap\'te URL bulunamadı');
        }

        console.log('Bulunan URLler:', urls); // Debug için
        return urls;
    } catch (error) {
        console.error('Sitemap işleme hatası:', error);
        throw new Error(`Sitemap işlenirken hata oluştu: ${error.message}`);
    }
} 
