from sqlalchemy import Column, Integer, String, Float, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
import datetime
from .session import Base

class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, index=True)
    status = Column(String, default="Pending") # Pending, Processing, Completed, Failed
    total_rows = Column(Integer, default=0)
    processed_rows = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    companies = relationship("Company", back_populates="dataset", cascade="all, delete-orphan")


class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    dataset_id = Column(Integer, ForeignKey("datasets.id"))
    original_name = Column(String)
    cleaned_name = Column(String)
    original_domain = Column(String)
    official_domain = Column(String, nullable=True)
    industry = Column(String, nullable=True)
    confidence_score = Column(Float, nullable=True)
    status = Column(String, default="Pending") # Pending, Verified, Corrected, Unknown, Failed, Public Email, Invalid Company
    website_title = Column(String, nullable=True)
    meta_description = Column(String, nullable=True)
    error_log = Column(Text, nullable=True)
    source = Column(String, nullable=True) # E.g., 'Original Domain', 'DuckDuckGo Search'

    dataset = relationship("Dataset", back_populates="companies")


class WebsiteCache(Base):
    __tablename__ = "website_cache"

    id = Column(Integer, primary_key=True, index=True)
    domain = Column(String, unique=True, index=True)
    html_content = Column(Text, nullable=True)
    extracted_text = Column(Text, nullable=True)
    title = Column(String, nullable=True)
    meta = Column(String, nullable=True)
    scraped_at = Column(DateTime, default=datetime.datetime.utcnow)


class SearchCache(Base):
    __tablename__ = "search_cache"

    id = Column(Integer, primary_key=True, index=True)
    query = Column(String, unique=True, index=True)
    top_result_url = Column(String, nullable=True)
    searched_at = Column(DateTime, default=datetime.datetime.utcnow)


class AppSettings(Base):
    __tablename__ = "app_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    key = Column(String, unique=True, index=True)
    value = Column(String) # Stored as JSON string
