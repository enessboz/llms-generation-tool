<<<<<<< HEAD
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
        if (!urls) {
            alert('Lütfen URL giriniz!');
            return;
        }

        loader.style.display = 'block';
        resultArea.style.display = 'none';

        try {
            let urlList;
            if (sitemapBtn.classList.contains('active')) {
                // Sitemap işleme kodu buraya gelecek
                urlList = await processSitemap(urls);
            } else {
                urlList = urls.split('\n').filter(url => url.trim());
            }

            const result = await generateLLMS(urlList);
            resultOutput.value = result;
            resultArea.style.display = 'block';
        } catch (error) {
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
    let result = `# ${titleInput.value || 'LLMS.txt'}\n`;
    
    if (descriptionInput.value) {
        result += `> ${descriptionInput.value}\n`;
    }

    for (const url of urls) {
        try {
            const response = await fetch(url);
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            // Başlık alma
            const h1 = doc.querySelector('h1');
            const metaTitle = doc.querySelector('title');
            const title = h1 ? h1.textContent : (metaTitle ? metaTitle.textContent : url);

            // Açıklama alma
            const metaDesc = doc.querySelector('meta[name="description"]');
            let description = '';
            if (metaDesc) {
                description = metaDesc.getAttribute('content');
            } else {
                const firstP = doc.querySelector('p');
                if (firstP) {
                    description = firstP.textContent.substring(0, 200);
                    if (firstP.textContent.length > 200) description += '...';
                }
            }

            result += `- [${title}](${url})${description ? ': ' + description : ''}\n`;
        } catch (error) {
            console.error(`Error processing ${url}:`, error);
            result += `- [Error](${url}): Could not process this URL\n`;
        }
    }

    return result;
}

// Sitemap işleme fonksiyonu (gerekirse implement edilecek)
async function processSitemap(sitemapUrl) {
    // Sitemap işleme kodu buraya gelecek
    throw new Error('Sitemap işleme özelliği henüz eklenmedi');
=======
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
        if (!urls) {
            alert('Lütfen URL giriniz!');
            return;
        }

        loader.style.display = 'block';
        resultArea.style.display = 'none';

        try {
            let urlList;
            if (sitemapBtn.classList.contains('active')) {
                // Sitemap işleme kodu buraya gelecek
                urlList = await processSitemap(urls);
            } else {
                urlList = urls.split('\n').filter(url => url.trim());
            }

            const result = await generateLLMS(urlList);
            resultOutput.value = result;
            resultArea.style.display = 'block';
        } catch (error) {
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
    let result = `# ${titleInput.value || 'LLMS.txt'}\n`;
    
    if (descriptionInput.value) {
        result += `> ${descriptionInput.value}\n`;
    }

    for (const url of urls) {
        try {
            const response = await fetch(url);
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            // Başlık alma
            const h1 = doc.querySelector('h1');
            const metaTitle = doc.querySelector('title');
            const title = h1 ? h1.textContent : (metaTitle ? metaTitle.textContent : url);

            // Açıklama alma
            const metaDesc = doc.querySelector('meta[name="description"]');
            let description = '';
            if (metaDesc) {
                description = metaDesc.getAttribute('content');
            } else {
                const firstP = doc.querySelector('p');
                if (firstP) {
                    description = firstP.textContent.substring(0, 200);
                    if (firstP.textContent.length > 200) description += '...';
                }
            }

            result += `- [${title}](${url})${description ? ': ' + description : ''}\n`;
        } catch (error) {
            console.error(`Error processing ${url}:`, error);
            result += `- [Error](${url}): Could not process this URL\n`;
        }
    }

    return result;
}

// Sitemap işleme fonksiyonu (gerekirse implement edilecek)
async function processSitemap(sitemapUrl) {
    // Sitemap işleme kodu buraya gelecek
    throw new Error('Sitemap işleme özelliği henüz eklenmedi');
>>>>>>> c61bf051dacb09f4a4e03e7e24159c1198cf8ea2
} 