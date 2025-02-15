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
    urlListBtn.addEventListener('click', function() {
        urlListBtn.classList.add('active');
        sitemapBtn.classList.remove('active');
        urlInput.placeholder = 'Her satıra bir URL gelecek şekilde URLleri giriniz';
    });

    sitemapBtn.addEventListener('click', function() {
        sitemapBtn.classList.add('active');
        urlListBtn.classList.remove('active');
        urlInput.placeholder = 'Site haritası URLsini giriniz';
    });

    // LLMS.txt oluşturma
    generateBtn.onclick = function() {
        // URL'leri al ve boş satırları temizle
        const urls = urlInput.value.split('\n').filter(url => url.trim());
        
        // Başlık ve açıklamayı al
        const title = titleInput.value || 'LLMS.txt';
        const description = descriptionInput.value;

        // LLMS.txt formatında çıktı oluştur
        let output = `# ${title}\n`;
        
        if (description) {
            output += `> ${description}\n`;
        }

        // Her URL için link oluştur
        urls.forEach(url => {
            output += `- [${url}](${url})\n`;
        });

        // Sonucu göster
        resultOutput.value = output;
        resultArea.style.display = 'block';
    };

    // Kopyala butonu
    copyBtn.addEventListener('click', function() {
        resultOutput.select();
        document.execCommand('copy');
        alert('Kopyalandı!');
    });

    // İndir butonu
    downloadBtn.addEventListener('click', function() {
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
} 
