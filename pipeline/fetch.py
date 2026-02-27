"""
HIRECAR MarketWatch — RSS Fetch + Relevance Filtering
"""
import json
import os
import re
import feedparser
from datetime import datetime, timezone

from config import (
    PYMNTS_RSS_URL,
    KEYWORDS,
    MIN_RELEVANCE_SCORE,
    MAX_ARTICLES_PER_RUN,
    FETCH_LOG_PATH,
)


def load_fetch_log(repo_root):
    """Load the set of already-processed article URLs."""
    path = os.path.join(repo_root, FETCH_LOG_PATH)
    if os.path.exists(path):
        with open(path, "r") as f:
            data = json.load(f)
        return set(data.get("processed_urls", []))
    return set()


def save_fetch_log(repo_root, processed_urls):
    """Persist the set of processed URLs."""
    path = os.path.join(repo_root, FETCH_LOG_PATH)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f:
        json.dump(
            {
                "processed_urls": list(processed_urls),
                "last_updated": datetime.now(timezone.utc).isoformat(),
            },
            f,
            indent=2,
        )


def score_article(title, summary):
    """Score an article's relevance based on keyword matches."""
    text = (title + " " + summary).lower()
    score = 0
    matched = []
    for keyword, weight in KEYWORDS.items():
        if keyword.lower() in text:
            score += weight
            matched.append(keyword)
    return score, matched


def strip_html(text):
    """Remove HTML tags from text and normalize Unicode."""
    cleaned = re.sub(r"<[^>]+>", "", text or "")
    # Normalize common Unicode characters to ASCII-safe equivalents
    replacements = {
        "\u2014": " -- ",  # em dash
        "\u2013": " - ",   # en dash
        "\u2018": "'",     # left single quote
        "\u2019": "'",     # right single quote
        "\u201c": '"',     # left double quote
        "\u201d": '"',     # right double quote
        "\u2026": "...",   # ellipsis
        "\u00a0": " ",     # non-breaking space
    }
    for char, replacement in replacements.items():
        cleaned = cleaned.replace(char, replacement)
    return cleaned


def fetch_and_filter(repo_root):
    """
    Fetch PYMNTS RSS feed, score articles for relevance,
    filter out already-processed ones, and return the top candidates.
    """
    processed = load_fetch_log(repo_root)

    print(f"Fetching RSS from {PYMNTS_RSS_URL}...")
    feed = feedparser.parse(PYMNTS_RSS_URL)

    if feed.bozo and not feed.entries:
        print(f"RSS feed error: {feed.bozo_exception}")
        return []

    print(f"Found {len(feed.entries)} entries in feed")

    candidates = []
    for entry in feed.entries:
        url = entry.get("link", "")

        # Skip already processed
        if url in processed:
            continue

        title = entry.get("title", "")
        summary = strip_html(entry.get("summary", ""))
        published = entry.get("published", "")

        score, matched_keywords = score_article(title, summary)

        if score >= MIN_RELEVANCE_SCORE:
            candidates.append(
                {
                    "url": url,
                    "title": title,
                    "summary": summary,
                    "published": published,
                    "score": score,
                    "matched_keywords": matched_keywords,
                }
            )

    # Sort by relevance score descending
    candidates.sort(key=lambda x: x["score"], reverse=True)

    # Take top N
    selected = candidates[:MAX_ARTICLES_PER_RUN]

    print(f"Scored {len(candidates)} relevant articles, selected top {len(selected)}")
    for art in selected:
        print(f"  [{art['score']}] {art['title'][:80]}")

    return selected


def mark_processed(repo_root, urls):
    """Add URLs to the processed log."""
    processed = load_fetch_log(repo_root)
    processed.update(urls)
    save_fetch_log(repo_root, processed)
