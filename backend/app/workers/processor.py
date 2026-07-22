import time
import asyncio
from concurrent.futures import ThreadPoolExecutor
from sqlalchemy.orm import Session
import json

from ..db.session import SessionLocal
from ..db.models import Dataset, Company, WebsiteCache, SearchCache, AppSettings
from ..services import DataCleaner, WebsiteScraper, CompanyVerifier, DuckDuckGoSearch, IndustryClassifier

class DatasetProcessor:
    def __init__(self, dataset_id: int, websocket_manager):
        self.dataset_id = dataset_id
        self.websocket_manager = websocket_manager
        
        # Initialize services
        self.scraper = WebsiteScraper(timeout=10)
        self.searcher = DuckDuckGoSearch(delay_seconds=2.0)
        self.classifier = IndustryClassifier()

    def process_company(self, company_id: int):
        # We need a new session per thread
        db = SessionLocal()
        try:
            company = db.query(Company).filter(Company.id == company_id).first()
            if not company:
                return

            self._log_ws(f"Processing {company.original_name}...", company_id)

            # 1. Clean data
            company.cleaned_name = DataCleaner.clean_company_name(company.original_name)
            domain = DataCleaner.clean_domain(company.original_domain)
            
            # Check Invalid
            if DataCleaner.is_invalid_company(company.original_name, company.cleaned_name):
                company.status = "Invalid Company"
                db.commit()
                self._update_progress(db)
                return
                
            # Check Public Email
            if domain and DataCleaner.is_public_email(domain):
                company.status = "Public Email"
                db.commit()
                self._update_progress(db)
                return

            official_domain = domain
            source = "Original Domain"

            # 2. Check if we need to search
            if not official_domain:
                self._log_ws(f"No domain for {company.cleaned_name}, searching...", company_id)
                official_domain = self._search_domain(db, company.cleaned_name)
                source = "DuckDuckGo Search"

            if not official_domain:
                company.status = "Unknown"
                db.commit()
                self._update_progress(db)
                return

            # 3. Scrape Website (Check Cache first)
            scraped_data = self._scrape_domain(db, official_domain)

            if not scraped_data.get("success"):
                self._log_ws(f"Failed to reach {official_domain}, searching fallback...", company_id)
                # Fallback search
                official_domain = self._search_domain(db, company.cleaned_name)
                source = "DuckDuckGo Search (Fallback)"
                if official_domain:
                    scraped_data = self._scrape_domain(db, official_domain)

            if not scraped_data.get("success"):
                company.status = "Failed"
                company.error_log = scraped_data.get("error", "Website Unreachable")
                db.commit()
                self._update_progress(db)
                return

            # 4. Verify
            confidence = CompanyVerifier.verify(company.cleaned_name, scraped_data, official_domain)
            
            # 5. Classify
            classification = self.classifier.classify(scraped_data.get("text", ""))

            # 6. Save results
            company.official_domain = official_domain
            company.website_title = scraped_data.get("title", "")
            company.meta_description = scraped_data.get("meta_description", "")
            company.confidence_score = confidence
            company.industry = classification["industry"]
            company.source = source

            if confidence >= 70.0:
                company.status = "Verified"
            else:
                company.status = "Unknown" # Not confident enough

            db.commit()
            self._log_ws(f"Finished {company.cleaned_name} - {company.status} ({confidence}%)", company_id)
            self._update_progress(db)

        except Exception as e:
            self._log_ws(f"Error processing {company_id}: {str(e)}", company_id)
        finally:
            db.close()

    def _search_domain(self, db: Session, cleaned_name: str) -> str:
        # Check Cache
        cached = db.query(SearchCache).filter(SearchCache.query == cleaned_name).first()
        if cached:
            return cached.top_result_url

        url = self.searcher.search_official_website(cleaned_name)
        if url:
            domain = DataCleaner.clean_domain(url)
            # Cache it
            db.add(SearchCache(query=cleaned_name, top_result_url=domain))
            db.commit()
            return domain
        return ""

    def _scrape_domain(self, db: Session, domain: str) -> dict:
        # Check Cache
        cached = db.query(WebsiteCache).filter(WebsiteCache.domain == domain).first()
        if cached:
            return {
                "success": True,
                "title": cached.title,
                "meta_description": cached.meta,
                "text": cached.extracted_text,
                "og_site_name": ""
            }

        scraped = self.scraper.scrape(domain)
        if scraped["success"]:
            # Save to Cache
            cache_entry = WebsiteCache(
                domain=domain,
                html_content="", # Save space
                extracted_text=scraped.get("text", ""),
                title=scraped.get("title", ""),
                meta=scraped.get("meta_description", "")
            )
            db.add(cache_entry)
            db.commit()
        return scraped

    def _update_progress(self, db: Session):
        dataset = db.query(Dataset).filter(Dataset.id == self.dataset_id).first()
        if dataset:
            dataset.processed_rows += 1
            db.commit()
            asyncio.run(self.websocket_manager.broadcast_progress(
                self.dataset_id, 
                dataset.processed_rows, 
                dataset.total_rows
            ))

    def _log_ws(self, message: str, company_id: int = None):
        asyncio.run(self.websocket_manager.broadcast_log(self.dataset_id, message))

    def run(self):
        db = SessionLocal()
        dataset = db.query(Dataset).filter(Dataset.id == self.dataset_id).first()
        if not dataset:
            db.close()
            return
            
        dataset.status = "Processing"
        db.commit()

        # Fetch workers setting
        workers_setting = db.query(AppSettings).filter(AppSettings.key == "workers").first()
        max_workers = int(workers_setting.value) if workers_setting else 5

        companies = db.query(Company).filter(Company.dataset_id == self.dataset_id, Company.status == "Pending").all()
        company_ids = [c.id for c in companies]
        
        db.close()

        self._log_ws(f"Starting processing with {max_workers} threads...")

        with ThreadPoolExecutor(max_workers=max_workers) as executor:
            executor.map(self.process_company, company_ids)

        # Mark done
        db = SessionLocal()
        dataset = db.query(Dataset).filter(Dataset.id == self.dataset_id).first()
        dataset.status = "Completed"
        import datetime
        dataset.completed_at = datetime.datetime.utcnow()
        db.commit()
        db.close()
        
        self._log_ws("Dataset processing completed.")
