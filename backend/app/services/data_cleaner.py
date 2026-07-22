import re
import tldextract

PUBLIC_EMAIL_PROVIDERS = {
    "gmail.com", "hotmail.com", "outlook.com", "live.com", "icloud.com", 
    "googlemail.com", "yahoo.com", "aol.com", "zoho.com", "proton.me", 
    "mail.com", "gmx.com", "163.com", "qq.com", "rediffmail.com", "gameil.com",
    "yandex.com", "ymail.com", "mac.com", "me.com", "msn.com", "comcast.net",
    "sbcglobal.net", "att.net", "verizon.net", "earthlink.net", "cox.net",
    "charter.net", "rocketmail.com", "juno.com", "aim.com", "inbox.com",
    "fastmail.com", "fastmail.fm", "hushmail.com", "lycos.com", "mail.ru",
    "tutanota.com", "tutamail.com", "pm.me", "hey.com", "protonmail.com"
}

INVALID_NAMES = {
    "na", "n/a", "unknown", "no company", "none", "null", 
    "[not provided]", "-", "undefined", "blank", "empty"
}

COMPANY_SUFFIXES = [
    r'\binc\b', r'\bllc\b', r'\bltd\b', r'\blimited\b', r'\bcorporation\b', 
    r'\bcompany\b', r'\bpvt ltd\b', r'\bpte ltd\b', r'\bco\b', r'\bcorp\b', r'\bplc\b'
]

class DataCleaner:
    @staticmethod
    def clean_company_name(name: str) -> str:
        if not name or not isinstance(name, str):
            return ""
            
        # Convert to lowercase
        name = name.lower()
        
        # Remove brackets and their contents
        name = re.sub(r'\(.*?\)|\[.*?\]|\{.*?\}', '', name)
        
        # Remove suffixes
        for suffix in COMPANY_SUFFIXES:
            name = re.sub(suffix, '', name, flags=re.IGNORECASE)
            
        # Remove punctuation
        name = re.sub(r'[^\w\s]', ' ', name)
        
        # Remove extra spaces
        name = ' '.join(name.split())
        return name.strip()

    @staticmethod
    def is_invalid_company(original_name: str, cleaned_name: str) -> bool:
        if not original_name or not isinstance(original_name, str):
            return True
            
        orig_lower = original_name.strip().lower()
        if orig_lower in INVALID_NAMES:
            return True
            
        if not cleaned_name:
            return True
            
        # Only digits
        if cleaned_name.isdigit():
            return True
            
        # Less than two letters
        letters_only = re.sub(r'[^a-z]', '', cleaned_name)
        if len(letters_only) < 2:
            return True
            
        return False

    @staticmethod
    def is_public_email(domain: str) -> bool:
        if not domain or not isinstance(domain, str):
            return True
        return domain.strip().lower() in PUBLIC_EMAIL_PROVIDERS

    @staticmethod
    def clean_domain(domain: str) -> str:
        if not domain or not isinstance(domain, str):
            return ""
            
        domain = domain.strip().lower()
        
        # Extract root domain using tldextract
        # e.g., https://www.google.com/path -> google.com
        ext = tldextract.extract(domain)
        if ext.domain and ext.suffix:
            return f"{ext.domain}.{ext.suffix}"
            
        return domain
