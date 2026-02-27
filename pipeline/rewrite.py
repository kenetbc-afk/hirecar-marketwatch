"""
HIRECAR MarketWatch -- Claude API Article Rewriting + Localization
"""
import json
import re
import uuid
from anthropic import Anthropic

from config import ANTHROPIC_API_KEY, ANTHROPIC_MODEL, EDITIONS, CATEGORIES
from prompts import SYSTEM_PROMPT, REWRITE_TEMPLATE, TICKER_TEMPLATE


def sanitize_text(text):
    """Remove any non-ASCII characters to prevent encoding errors."""
    replacements = {
        "\u2014": " -- ", "\u2013": " - ",
        "\u2018": "'", "\u2019": "'",
        "\u201c": '"', "\u201d": '"',
        "\u2026": "...", "\u00a0": " ",
        "\u2022": "* ", "\u00b7": " ",
    }
    for char, repl in replacements.items():
        text = text.replace(char, repl)
    return text.encode("ascii", "replace").decode("ascii")


def get_client():
    """Initialize the Anthropic client."""
    if not ANTHROPIC_API_KEY:
        raise RuntimeError(
            "ANTHROPIC_API_KEY not set. Export it or add to GitHub secrets."
        )
    return Anthropic(api_key=ANTHROPIC_API_KEY)


def rewrite_article(client, source, city_code):
    """
    Rewrite a source article as original HIRECAR content for a specific city.

    Args:
        client: Anthropic client
        source: dict with title, summary, published, url
        city_code: 'la' or 'sf'

    Returns:
        dict with headline, excerpt, body, category, tags, city, source info
    """
    edition = EDITIONS[city_code]
    local_context = "\n".join(f"- {ctx}" for ctx in edition["context"])
    categories_str = ", ".join(CATEGORIES)

    prompt = REWRITE_TEMPLATE.format(
        source_title=sanitize_text(source["title"]),
        source_date=sanitize_text(source["published"]),
        source_summary=sanitize_text(source["summary"][:1500]),
        city_name=edition["name"],
        city_code=city_code,
        local_context=local_context,
        categories=categories_str,
    )

    response = client.messages.create(
        model=ANTHROPIC_MODEL,
        max_tokens=1500,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": prompt}],
    )

    raw = response.content[0].text.strip()

    # Parse JSON response -- handle potential markdown fences
    if raw.startswith("```"):
        raw = raw.split("\n", 1)[1]
        if raw.endswith("```"):
            raw = raw[:-3]
        raw = raw.strip()

    article = json.loads(raw)

    # Add metadata
    article["id"] = str(uuid.uuid4())[:8]
    article["source_url"] = source["url"]
    article["source_title"] = source["title"]
    article["published"] = source["published"]
    article["generated_at"] = None  # Set by inject.py
    article["city"] = city_code

    return article


def generate_ticker(client, headline, excerpt):
    """Generate a ticker-bar news flash from an article."""
    prompt = TICKER_TEMPLATE.format(headline=headline, excerpt=excerpt)

    response = client.messages.create(
        model=ANTHROPIC_MODEL,
        max_tokens=100,
        messages=[{"role": "user", "content": prompt}],
    )

    return response.content[0].text.strip().strip('"')
