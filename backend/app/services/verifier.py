from rapidfuzz import fuzz
from .data_cleaner import DataCleaner

class CompanyVerifier:
    @staticmethod
    def verify(company_name: str, scraped_data: dict, domain: str) -> float:
        """
        Returns a confidence score 0-100 indicating if the website belongs to the company.
        """
        if not company_name or not scraped_data.get("success"):
            return 0.0
            
        cleaned_target = DataCleaner.clean_company_name(company_name)
        if not cleaned_target:
            return 0.0

        scores = []

        # 1. Check against OG Site Name (Usually the most accurate)
        og_name = scraped_data.get("og_site_name", "")
        if og_name:
            cleaned_og = DataCleaner.clean_company_name(og_name)
            score = fuzz.token_set_ratio(cleaned_target, cleaned_og)
            scores.append(score)

        # 2. Check against Title
        title = scraped_data.get("title", "")
        if title:
            cleaned_title = DataCleaner.clean_company_name(title)
            score = fuzz.partial_ratio(cleaned_target, cleaned_title)
            scores.append(score)

        # 3. Check against Domain Name itself
        domain_name = domain.split('.')[0] if domain else ""
        if domain_name:
            # We don't clean the domain much, just compare
            score = fuzz.ratio(cleaned_target.replace(" ", ""), domain_name.lower())
            scores.append(score)

        # 4. Check against visible text (first 1000 chars - often contains copyright/about)
        text = scraped_data.get("text", "")
        if text:
            # Look for exact string match in first bit of text (case insensitive)
            if cleaned_target in text[:2000].lower():
                scores.append(80.0) # Solid boost if name is explicitly in the intro text

        if not scores:
            return 0.0

        # Return the highest signal found
        return max(scores)
