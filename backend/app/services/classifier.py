import re
import os
import json

try:
    from openai import OpenAI
except ImportError:
    OpenAI = None

class IndustryClassifier:
    def __init__(self):
        self.api_key = os.environ.get("OPENAI_API_KEY")
        self.client = OpenAI(api_key=self.api_key) if self.api_key and OpenAI else None

        # Weighted dictionary mapping keywords to Industries
        # Values are weights. Higher weight = stronger signal.
        self.industry_keywords = {
            "Manufacturing": {"manufacturing": 5, "factory": 4, "production line": 4, "assembly": 3, "machining": 3, "fabrication": 4},
            "Semiconductor": {"semiconductor": 5, "wafer": 4, "chipmaker": 5, "integrated circuit": 4, "microelectronics": 4},
            "Electronics": {"electronics": 5, "consumer electronics": 5, "pcb": 4, "circuit board": 3},
            "Industrial Equipment": {"industrial equipment": 5, "heavy machinery": 5, "forklift": 4, "compressor": 3, "industrial automation": 4},
            "Healthcare": {"healthcare": 5, "hospital": 4, "clinic": 3, "patient care": 4, "medical services": 4},
            "Medical Devices": {"medical device": 5, "surgical instrument": 4, "diagnostic equipment": 4, "implants": 3},
            "Pharmaceutical": {"pharmaceutical": 5, "pharma": 4, "drug discovery": 5, "clinical trials": 4, "therapeutics": 4},
            "Biotechnology": {"biotechnology": 5, "biotech": 5, "genomics": 4, "crispr": 4, "life sciences": 4},
            "Retail": {"retail": 5, "storefront": 3, "supermarket": 4, "merchandise": 3, "apparel": 3},
            "E-Commerce": {"e-commerce": 5, "ecommerce": 5, "online shopping": 4, "online store": 4, "cart": 2},
            "Transportation": {"transportation": 5, "transit": 4, "freight": 4, "passenger": 3, "airlines": 4},
            "Logistics": {"logistics": 5, "supply chain": 5, "warehousing": 4, "3pl": 5, "fulfillment": 4, "shipping": 3},
            "Construction": {"construction": 5, "contractor": 4, "building materials": 4, "civil engineering": 4},
            "Real Estate": {"real estate": 5, "property management": 4, "realtor": 5, "commercial property": 4},
            "Hospitality": {"hospitality": 5, "hotel": 5, "resort": 4, "accommodation": 3, "tourism": 4},
            "Education": {"education": 5, "learning": 3, "e-learning": 4, "student": 3, "curriculum": 3},
            "University": {"university": 5, "college": 5, "campus": 4, "higher education": 5, "alumni": 3},
            "Government": {"government": 5, "municipal": 4, "public sector": 5, "department of": 3, "ministry": 4},
            "Military": {"military": 5, "armed forces": 5, "army": 4, "navy": 4, "air force": 4},
            "Defence": {"defence": 5, "defense contractor": 5, "aerospace": 4, "munitions": 5, "national security": 4},
            "Research": {"research institute": 5, "r&d": 4, "laboratory": 3, "scientific research": 4},
            "Software": {"software": 5, "saas": 5, "app development": 4, "cloud computing": 4, "api": 3},
            "IT Services": {"it services": 5, "managed services": 4, "system integration": 4, "helpdesk": 3},
            "Cybersecurity": {"cybersecurity": 5, "information security": 5, "firewall": 3, "penetration testing": 4, "threat intelligence": 4},
            "Telecommunications": {"telecommunications": 5, "telecom": 5, "broadband": 4, "wireless network": 4, "fiber optic": 3},
            "Energy": {"energy": 4, "power plant": 4, "renewable": 4, "solar": 3, "wind turbine": 3},
            "Oil & Gas": {"oil & gas": 5, "petroleum": 5, "drilling": 4, "pipeline": 4, "refinery": 5},
            "Mining": {"mining": 5, "minerals": 4, "extraction": 3, "ore": 4, "quarry": 4},
            "Agriculture": {"agriculture": 5, "farming": 4, "crop": 4, "agritech": 5, "livestock": 3},
            "Food": {"food processing": 5, "beverage": 4, "culinary": 3, "bakery": 3, "grocery": 3},
            "Banking": {"banking": 5, "bank": 4, "credit union": 5, "wealth management": 4, "deposits": 3},
            "Finance": {"finance": 5, "financial services": 5, "investment": 4, "asset management": 4, "capital": 3},
            "Insurance": {"insurance": 5, "underwriting": 4, "claims": 3, "brokerage": 3, "policyholder": 4},
            "Legal": {"legal services": 5, "law firm": 5, "attorney": 4, "litigation": 4, "counsel": 3},
            "Consulting": {"consulting": 5, "advisory": 4, "strategy": 3, "management consulting": 5},
            "Marketing": {"marketing": 5, "seo": 3, "branding": 4, "digital marketing": 5, "campaign": 3},
            "Advertising": {"advertising": 5, "ad agency": 5, "media buying": 4, "billboard": 3, "commercials": 3},
            "Media": {"media": 4, "broadcasting": 4, "publishing": 4, "journalism": 4, "news": 3},
            "Non-profit": {"non-profit": 5, "charity": 5, "ngo": 5, "philanthropy": 4, "donations": 3}
        }

    def _fallback_classify(self, text: str) -> dict:
        """
        Classifies the text into an industry based on keyword frequencies and weights.
        Returns {"industry": str, "confidence": float, "keywords_matched": list}
        """
        text_lower = text.lower()
        
        industry_scores = {}
        industry_matched_words = {}

        for industry, keywords in self.industry_keywords.items():
            score = 0
            matched = []
            
            for kw, weight in keywords.items():
                pattern = r'\b' + re.escape(kw) + r'\b'
                matches = len(re.findall(pattern, text_lower))
                
                if matches > 0:
                    effective_matches = min(matches, 5) 
                    score += (weight * effective_matches)
                    matched.append(kw)
                    
            if score > 0:
                industry_scores[industry] = score
                industry_matched_words[industry] = matched

        if not industry_scores:
            return {"industry": "Unknown", "confidence": 0.0, "keywords_matched": []}

        sorted_industries = sorted(industry_scores.items(), key=lambda x: x[1], reverse=True)
        top_industry = sorted_industries[0][0]
        top_score = sorted_industries[0][1]
        confidence = min(top_score * 2.5, 99.9)
        
        return {
            "industry": top_industry,
            "confidence": round(confidence, 1),
            "keywords_matched": industry_matched_words[top_industry]
        }

    def classify(self, text: str) -> dict:
        if not text:
            return {"industry": "Unknown", "confidence": 0.0, "keywords_matched": []}

        if not self.client:
            return self._fallback_classify(text)

        try:
            prompt = (
                "You are an expert industry classification engine. "
                "Classify the following company description into a single primary industry. "
                "Respond ONLY with a JSON object in this exact format: "
                '{"industry": "Industry Name", "confidence": 95.5, "keywords_matched": ["key", "words"]}. '
                "Ensure confidence is between 0 and 100. "
                "Pick an industry that best describes the company's core business model. "
                f"Company Description:\n{text[:2500]}"
            )
            
            response = self.client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[{"role": "user", "content": prompt}],
                response_format={ "type": "json_object" },
                max_tokens=150,
                temperature=0.1
            )
            
            result_str = response.choices[0].message.content
            result = json.loads(result_str)
            
            return {
                "industry": str(result.get("industry", "Unknown")),
                "confidence": float(result.get("confidence", 0.0)),
                "keywords_matched": result.get("keywords_matched", [])
            }
        except Exception as e:
            print(f"OpenAI Classification failed: {e}")
            return self._fallback_classify(text)
