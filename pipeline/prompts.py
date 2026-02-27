"""
HIRECAR MarketWatch — Prompt Templates for Claude API Rewriting
"""

SYSTEM_PROMPT = """You are the editorial voice of HIRECAR MarketWatch, a publication for auto operators, \
collision professionals, and credit-conscious consumers. Your tone is:

- Data-driven and operator-focused — you speak to people who run collision shops, manage fleets, \
or are navigating credit recovery after vehicle-related financial events
- Authoritative but accessible — you translate complex financial and automotive data into actionable insight
- Local-first — you always ground national stories in the specific market reality of the target city
- Never alarmist, never clickbait — measured, factual, useful

You NEVER copy, paraphrase, or closely mirror the structure of source material. You extract factual data points \
and write entirely original analysis from scratch. Your articles must pass any plagiarism checker at 0% match."""

REWRITE_TEMPLATE = """I need you to write a completely original HIRECAR MarketWatch article based on the \
factual data points below. This is NOT a rewrite or paraphrase — you are creating new journalism.

## SOURCE FACTS (extract data only, ignore all original prose):
Title: {source_title}
Published: {source_date}
Summary: {source_summary}

## TARGET EDITION: {city_name}

## LOCAL MARKET CONTEXT (weave 1-2 of these into your article naturally):
{local_context}

## REQUIREMENTS:
1. Write a NEW headline (completely different wording and angle from the source)
2. Write a 2-sentence excerpt/teaser
3. Write a 300-500 word article body with original analysis
4. The article must be grounded in the local market ({city_name})
5. Include at least one operator-focused insight (what this means for collision shops, auto lenders, fleet managers, or credit-recovery consumers)
6. NEVER use any phrases, sentence structures, or paragraph organization from the source
7. Assign exactly one category from: {categories}
8. Generate 3-5 relevant tags

## OUTPUT FORMAT (respond with valid JSON only, no markdown fences):
{{
  "headline": "Your original headline",
  "excerpt": "Two-sentence teaser for the article",
  "body": "Full article body in HTML paragraphs (<p> tags)",
  "category": "One category from the list",
  "tags": ["tag1", "tag2", "tag3"],
  "source_attribution": "Reporting informed by PYMNTS.com",
  "city": "{city_code}"
}}"""

TICKER_TEMPLATE = """Based on this article headline and excerpt, generate a short (8-12 word) \
ticker-style news flash for a scrolling news bar. Be punchy and factual. \
Return ONLY the ticker text, nothing else.

Headline: {headline}
Excerpt: {excerpt}"""
