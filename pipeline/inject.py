#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
HIRECAR MarketWatch -- Main Pipeline Orchestrator
Fetch -> Filter -> Rewrite -> Save to data/articles.json
"""
import json
import os
import sys
import locale
from datetime import datetime, timezone

# Force UTF-8 everywhere before any other imports
os.environ["PYTHONIOENCODING"] = "utf-8"
os.environ["LC_ALL"] = "C.UTF-8"
os.environ["LANG"] = "C.UTF-8"
try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")
except Exception:
    pass

# Add pipeline dir to path so imports work when run from repo root
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from config import ARTICLES_JSON_PATH, MAX_STORED_ARTICLES, EDITIONS
from fetch import fetch_and_filter, mark_processed
from rewrite import get_client, rewrite_article, generate_ticker


def load_existing_articles(repo_root):
    """Load existing articles.json or return empty structure."""
    path = os.path.join(repo_root, ARTICLES_JSON_PATH)
    if os.path.exists(path):
        with open(path, "r") as f:
            return json.load(f)
    return {
        "articles": [],
        "ticker_items": [],
        "trending": [],
        "last_updated": None,
    }


def save_articles(repo_root, data):
    """Write articles.json."""
    path = os.path.join(repo_root, ARTICLES_JSON_PATH)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    print(f"Saved {len(data['articles'])} articles to {path}")


def run_pipeline(repo_root=None):
    """Execute the full pipeline."""
    if repo_root is None:
        # Default: assume running from repo root
        repo_root = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

    print("=" * 60)
    print("HIRECAR MarketWatch -- Content Pipeline")
    print(f"Run time: {datetime.now(timezone.utc).isoformat()}")
    print("=" * 60)

    # Step 1: Fetch and filter
    print("\n[1/4] Fetching and filtering RSS feed...")
    sources = fetch_and_filter(repo_root)

    if not sources:
        print("No new relevant articles found. Exiting.")
        return

    # Step 2: Initialize Claude client
    print("\n[2/4] Initializing Claude API client...")
    client = get_client()

    # Step 3: Rewrite each article for each city
    print("\n[3/4] Rewriting articles...")
    now = datetime.now(timezone.utc).isoformat()
    new_articles = []
    new_tickers = []

    for i, source in enumerate(sources):
        print(f"\n  Source {i+1}/{len(sources)}: {source['title'][:70]}...")

        for city_code in EDITIONS:
            city_name = EDITIONS[city_code]["name"]
            print(f"    -> Rewriting for {city_name}...")

            try:
                article = rewrite_article(client, source, city_code)
                article["generated_at"] = now
                new_articles.append(article)

                # Generate ticker item
                ticker = generate_ticker(
                    client, article["headline"], article["excerpt"]
                )
                new_tickers.append(
                    {
                        "text": ticker,
                        "city": city_code,
                        "article_id": article["id"],
                    }
                )

                print(f"      Headline: {article['headline'][:60]}...")

            except Exception as e:
                import traceback
                print(f"      ERROR rewriting for {city_name}: {e}")
                traceback.print_exc()
                continue

    if not new_articles:
        print("\nNo articles were successfully rewritten. Exiting.")
        return

    # Step 4: Merge into existing data and save
    print(f"\n[4/4] Saving {len(new_articles)} new articles...")
    data = load_existing_articles(repo_root)

    # Insert new articles at the top
    data["articles"] = new_articles + data["articles"]

    # Cap total articles
    data["articles"] = data["articles"][:MAX_STORED_ARTICLES]

    # Update ticker items (keep last 30)
    data["ticker_items"] = new_tickers + data.get("ticker_items", [])
    data["ticker_items"] = data["ticker_items"][:30]

    # Update trending (top 8 most recent articles)
    data["trending"] = [
        {"headline": a["headline"], "category": a["category"], "id": a["id"]}
        for a in data["articles"][:8]
    ]

    data["last_updated"] = now

    save_articles(repo_root, data)

    # Mark source URLs as processed
    mark_processed(repo_root, [s["url"] for s in sources])

    print(f"\nPipeline complete. {len(new_articles)} articles generated.")
    print(f"Total articles in store: {len(data['articles'])}")


if __name__ == "__main__":
    run_pipeline()
