"""
HIRECAR MarketWatch — Pipeline Configuration
"""
import os

# RSS source
PYMNTS_RSS_URL = "https://www.pymnts.com/feed/"

# Relevance keywords (scored by weight)
KEYWORDS = {
    # High relevance (weight 3)
    "credit score": 3, "credit report": 3, "auto loan": 3, "car loan": 3,
    "vehicle financing": 3, "subprime auto": 3, "auto lending": 3,
    "credit repair": 3, "FICO": 3, "credit bureau": 3,
    # Medium relevance (weight 2)
    "consumer finance": 2, "consumer credit": 2, "collections": 2,
    "debt": 2, "automotive": 2, "vehicle": 2, "automobile": 2,
    "insurance": 2, "fintech": 2, "personal loan": 2,
    "buy now pay later": 2, "BNPL": 2, "delinquency": 2,
    # Lower relevance (weight 1)
    "banking": 1, "payments": 1, "economy": 1, "inflation": 1,
    "interest rate": 1, "Federal Reserve": 1, "recession": 1,
    "AI": 1, "fraud": 1, "identity theft": 1,
}

# Minimum relevance score to include an article
MIN_RELEVANCE_SCORE = 3

# Max articles per pipeline run
MAX_ARTICLES_PER_RUN = 5

# Max total articles stored in articles.json
MAX_STORED_ARTICLES = 100

# City editions with local context
EDITIONS = {
    "la": {
        "name": "Los Angeles",
        "short": "LA",
        "context": [
            "Los Angeles has over 810,000 reported vehicle collisions annually",
            "Average auto insurance premiums in LA County exceed $2,900/year",
            "LA is the largest used-car market in the United States",
            "Southern California leads the nation in subprime auto originations",
            "LA County has 7.2 million registered vehicles — more than 38 states",
            "The 405, 101, and 10 freeways see some of the highest collision density in the US",
            "Collision repair shops in LA process an estimated $4.8B in annual claims",
        ],
    },
    "sf": {
        "name": "San Francisco Bay Area",
        "short": "SF",
        "context": [
            "The Bay Area has the highest EV adoption rate of any major US metro",
            "Waymo operates over 100,000 autonomous rides per week in San Francisco",
            "Bay Area auto insurance rates average $2,400/year despite lower collision rates",
            "Silicon Valley drives fintech innovation in auto lending and credit scoring",
            "SF has aggressive emissions regulations that reshape the local vehicle market",
            "The Bay Area accounts for 18% of California's new EV registrations",
            "Tech-sector layoffs have driven a measurable spike in Bay Area auto loan delinquencies",
        ],
    },
}

# File paths (relative to repo root)
ARTICLES_JSON_PATH = "data/articles.json"
FETCH_LOG_PATH = "data/fetch-log.json"

# Claude API
ANTHROPIC_MODEL = "claude-sonnet-4-20250514"
ANTHROPIC_API_KEY = os.environ.get("ANTHROPIC_API_KEY", "")

# Categories for article tagging
CATEGORIES = [
    "Credit & Lending",
    "Auto Finance",
    "Insurance & Risk",
    "Consumer Economy",
    "Fintech & Innovation",
    "Regulatory & Policy",
    "Market Data",
]
