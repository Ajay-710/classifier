import requests
from bs4 import BeautifulSoup
import trafilatura
import urllib3

# Suppress insecure request warnings for bad SSL
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

class WebsiteScraper:
    def __init__(self, timeout: int = 15):
        self.timeout = timeout
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
        }

    def scrape(self, domain: str) -> dict:
        result = {
            "success": False,
            "title": "",
            "meta_description": "",
            "og_site_name": "",
            "text": "",
            "html": "",
            "error": None,
            "final_url": ""
        }
        
        url = f"https://{domain}"
        
        try:
            # Try HTTPS first
            response = requests.get(url, headers=self.headers, timeout=self.timeout, verify=False, allow_redirects=True)
            response.raise_for_status()
        except requests.RequestException:
            try:
                # Fallback to HTTP
                url = f"http://{domain}"
                response = requests.get(url, headers=self.headers, timeout=self.timeout, verify=False, allow_redirects=True)
                response.raise_for_status()
            except requests.RequestException as e:
                result["error"] = str(e)
                return result

        result["success"] = True
        result["final_url"] = response.url
        result["html"] = response.text

        # 1. Parse with BeautifulSoup for exact tags
        soup = BeautifulSoup(response.text, 'html.parser')
        
        # Title
        if soup.title and soup.title.string:
            result["title"] = soup.title.string.strip()
            
        # Meta Description
        meta_desc = soup.find('meta', attrs={'name': 'description'}) or soup.find('meta', attrs={'property': 'og:description'})
        if meta_desc and meta_desc.get('content'):
            result["meta_description"] = meta_desc.get('content').strip()
            
        # OG Site Name
        og_name = soup.find('meta', attrs={'property': 'og:site_name'})
        if og_name and og_name.get('content'):
            result["og_site_name"] = og_name.get('content').strip()

        # 2. Parse with Trafilatura for clean visible text (main content, footer, etc.)
        extracted_text = trafilatura.extract(response.text, include_comments=False, include_tables=True, no_fallback=False)
        if extracted_text:
            result["text"] = extracted_text.strip()
        else:
            # Fallback text extraction if trafilatura fails
            for script in soup(["script", "style", "noscript"]):
                script.decompose()
            text = soup.get_text(separator=' ')
            result["text"] = ' '.join(text.split())

        return result
