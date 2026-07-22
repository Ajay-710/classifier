from duckduckgo_search import DDGS
import time

class DuckDuckGoSearch:
    def __init__(self, delay_seconds: float = 2.0):
        self.delay = delay_seconds

    def search_official_website(self, company_name: str) -> str:
        """
        Searches DDG for the official website and returns the URL.
        Returns empty string if failed.
        """
        if not company_name:
            return ""
            
        query = f'"{company_name}" official website'
        
        try:
            time.sleep(self.delay) # Respect rate limits
            with DDGS() as ddgs:
                results = list(ddgs.text(query, max_results=3))
                
            if not results:
                return ""
                
            for res in results:
                url = res.get('href', '')
                if url and "wikipedia.org" not in url and "linkedin.com" not in url and "bloomberg.com" not in url:
                    return url
                    
            return results[0].get('href', '') # Fallback to first if all were filtered
            
        except Exception as e:
            print(f"Search error for {company_name}: {e}")
            return ""
