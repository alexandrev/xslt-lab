#!/usr/bin/env python3
"""
Schedule XSLT Playground blog articles in Postiz.
2 articles/week: Monday 09:00 + Thursday 09:00 UTC
Starting: 2026-04-20
Platforms: dev.to, Hashnode, Medium (full article + canonical), X + Bluesky (promo tweet)
"""

import subprocess
import re
import uuid
import json
import requests
from datetime import datetime, timedelta
from pathlib import Path

# ── Credentials ──────────────────────────────────────────────────────────────

def pass_show(key):
    return subprocess.check_output(['pass', 'show', key]).decode().strip()

POSTIZ_API   = 'https://postiz.alexandre-vazquez.cloud/api/public/v1'
POSTIZ_KEY   = pass_show('avblog/postiz-api-key')

CHANNEL = {
    'devto':    pass_show('avblog/postiz-devto-id'),
    'hashnode': pass_show('avblog/postiz-hashnode-id'),
    'medium':   pass_show('avblog/postiz-medium-id'),
    'x':        pass_show('avblog/postiz-twitter-id'),
    'bluesky':  pass_show('avblog/postiz-bluesky-id'),
}
HASHNODE_PUB = pass_show('avblog/hashnode-publication-id')

HEADERS = {
    'Authorization': POSTIZ_KEY,
    'Content-Type': 'application/json',
}

# ── Article data ──────────────────────────────────────────────────────────────

BLOG_DIR = Path(__file__).parent.parent / 'site/content/posts'

ARTICLES = [
    {'slug': 'xslt-for-beginners',              'title': 'XSLT for beginners: your first transformation',                              'description': 'Learn XSLT from scratch with practical examples. Transform XML step by step using templates, match patterns, and value-of.',         'tags': ['xslt', 'tutorial', 'beginners', 'xml']},
    {'slug': 'xslt-online-editor-guide',         'title': 'XSLT online editor: how to test transformations without installing anything',  'description': 'Run and test XSLT online with a free editor that supports XSLT 1.0, 2.0, and 3.0. No installation, no signup required.',            'tags': ['xslt', 'tools', 'online', 'editor']},
    {'slug': 'xslt-validator-online',            'title': 'XSLT validator online: catch errors before running your transform',            'description': 'How to validate XSLT stylesheets online. Catch syntax errors, undefined variables, and namespace issues before they hit production.', 'tags': ['xslt', 'validation', 'debugging', 'tools']},
    {'slug': 'xsl-online-tester',                'title': 'XSL online tester: run XSL and XSLT transforms in your browser',             'description': 'Free XSL online tester and editor. Run XSL transformations, test XSLT stylesheets without installing anything.',                   'tags': ['xsl', 'xslt', 'online', 'tools']},
    {'slug': 'xslt-3-new-features',              'title': 'XSLT 3.0 new features: what changed from 2.0',                               'description': 'A practical guide to XSLT 3.0: streaming, maps, arrays, and JSON support. What to adopt and why.',                                 'tags': ['xslt', 'xslt3', 'saxon']},
    {'slug': 'xslt-template-matching-explained', 'title': 'XSLT template matching explained with examples',                              'description': 'How XSLT template matching works: priorities, conflict resolution, modes, and default templates.',                                  'tags': ['xslt', 'templates', 'xpath']},
    {'slug': 'xslt-grouping-for-each-group',     'title': 'XSLT grouping with xsl:for-each-group: complete guide',                      'description': 'How to group XML nodes in XSLT 2.0 using for-each-group with group-by, group-adjacent and more.',                                 'tags': ['xslt', 'grouping', 'xslt2', 'xpath']},
    {'slug': 'xslt-string-functions',            'title': 'XSLT string functions: complete reference with examples',                     'description': 'Complete guide to XSLT and XPath string functions: substring, contains, replace, tokenize, normalize-space and more.',              'tags': ['xslt', 'xpath', 'strings', 'functions']},
    {'slug': 'xslt-debugging-patterns',          'title': 'XSLT debugging patterns that save hours',                                    'description': 'Practical ways to trace, isolate, and fix transformations with minimal friction.',                                                 'tags': ['xslt', 'debugging', 'tools']},
    {'slug': 'xslt-performance-tuning',          'title': 'XSLT performance tuning without losing readability',                          'description': 'A practical guide to faster transformations with keys, modes, and smarter selection.',                                             'tags': ['xslt', 'performance', 'optimization']},
    {'slug': 'xslt-parameters-and-multiple-inputs','title': 'Designing XSLT transforms with parameters and multiple inputs',             'description': 'How to structure stylesheets that consume several XML documents and stay maintainable.',                                             'tags': ['xslt', 'parameters', 'xml']},
    {'slug': 'xslt-xml-to-json-csv',             'title': 'Transforming XML to JSON and CSV with XSLT',                                 'description': 'Patterns for producing modern integration formats while staying in XSLT.',                                                         'tags': ['xslt', 'json', 'csv', 'xml']},
    {'slug': 'xslt-testing-and-regression',      'title': 'XSLT testing: how to build a regression harness for safe deployments',       'description': 'How to test XSLT stylesheets and catch regressions before they hit production.',                                                   'tags': ['xslt', 'testing', 'debugging']},
    {'slug': 'xslt-integration-architecture',    'title': 'Architecting XSLT in integration pipelines',                                 'description': 'Where XSLT fits in modern systems and how to keep transforms clean.',                                                            'tags': ['xslt', 'integration', 'architecture']},
    {'slug': 'why-xslt-playground-online-editor','title': 'Why I built an XSLT online editor for real-world work',                      'description': 'The story behind XSLT Playground — an online editor tuned for multi-parameter transforms, fast feedback, and practical debugging.',  'tags': ['xslt', 'tools', 'editor']},
    {'slug': 'welcome-to-xslt-lab',              'title': 'Welcome to the XSLT Playground blog',                                        'description': 'What you will find here and how it helps you get more from the online XSLT editor.',                                              'tags': ['xslt', 'blog']},
]

# ── Scheduling ────────────────────────────────────────────────────────────────

def schedule_dates(n, start='2026-04-20', hour=9):
    """Return n datetime strings: Mon + Thu at {hour}:00 UTC starting from start."""
    dates = []
    d = datetime.fromisoformat(start)
    # Advance to the next Monday if needed
    while d.weekday() != 0:
        d += timedelta(days=1)
    while len(dates) < n:
        dates.append(d.strftime('%Y-%m-%dT%H:%M:%S.000Z').replace(
            d.strftime('%H:%M:%S'), f'{hour:02d}:00:00'))
        if d.weekday() == 0:      # Monday → next is Thursday (+3)
            d += timedelta(days=3)
        else:                      # Thursday → next is Monday (+4)
            d += timedelta(days=4)
    return dates

# ── Content helpers ───────────────────────────────────────────────────────────

def read_article_body(slug):
    """Read markdown file, strip frontmatter and Hugo shortcodes."""
    path = BLOG_DIR / f'{slug}.md'
    text = path.read_text(encoding='utf-8')
    # Strip frontmatter
    if text.startswith('---'):
        parts = text.split('---', 2)
        text = parts[2].strip() if len(parts) >= 3 else text
    # Strip Hugo shortcodes {{< ... >}} and {{% ... %}}
    text = re.sub(r'\{\{[<>%].*?[>%]\}\}', '', text, flags=re.DOTALL)
    return text.strip()

def social_text(article):
    """Short promo text for X and Bluesky."""
    url = f"https://blog.xsltplayground.com/posts/{article['slug']}/"
    tags = ' '.join(f'#{t}' for t in article['tags'][:3])
    return f"{article['title']}\n\n{article['description']}\n\n{url}\n\n{tags}"

def make_tags(tag_list):
    return [{'value': t, 'label': t} for t in tag_list]

# ── Post creation ─────────────────────────────────────────────────────────────

def create_scheduled_post(article, date_str):
    canonical = f"https://blog.xsltplayground.com/posts/{article['slug']}/"
    body = read_article_body(article['slug'])
    social = social_text(article)
    group_id = str(uuid.uuid4())
    tags = make_tags(article['tags'])

    def post_value(content):
        return [{'content': content, 'id': str(uuid.uuid4()), 'delay': 0, 'image': []}]

    hn_tags  = [{'value': t, 'label': t} for t in article['tags']]
    med_tags = [{'value': t, 'label': t} for t in article['tags']]

    payload = {
        'type': 'schedule',
        'date': date_str,
        'shortLink': False,
        'tags': [],
        'posts': [
            {
                'integration': {'id': CHANNEL['devto']},
                'value': post_value(body),
                'group': group_id,
                'settings': {'title': article['title'], 'canonical': canonical, 'tags': []},
            },
            {
                'integration': {'id': CHANNEL['hashnode']},
                'value': post_value(body),
                'group': group_id,
                'settings': {'title': article['title'], 'canonical': canonical, 'publication': HASHNODE_PUB, 'tags': hn_tags},
            },
            {
                'integration': {'id': CHANNEL['medium']},
                'value': post_value(body),
                'group': group_id,
                'settings': {'title': article['title'], 'subtitle': article['description'], 'canonical': canonical, 'tags': med_tags},
            },
            {
                'integration': {'id': CHANNEL['x']},
                'value': post_value(social),
                'group': group_id,
                'settings': {'who_can_reply_post': 'everyone'},
            },
            {
                'integration': {'id': CHANNEL['bluesky']},
                'value': post_value(social),
                'group': group_id,
                'settings': {},
            },
        ],
    }

    resp = requests.post(f'{POSTIZ_API}/posts', headers=HEADERS, json=payload)
    return resp.status_code, resp.json() if resp.content else {}

# ── Main ──────────────────────────────────────────────────────────────────────

if __name__ == '__main__':
    dates = schedule_dates(len(ARTICLES))
    print(f'Scheduling {len(ARTICLES)} articles across {len(dates)} slots\n')

    for article, date_str in zip(ARTICLES, dates):
        print(f'[{date_str}] {article["slug"]}', end=' ... ', flush=True)
        status, result = create_scheduled_post(article, date_str)
        if status in (200, 201):
            print('OK')
        else:
            print(f'ERROR {status}')
            print(json.dumps(result, indent=2))
            break

    print('\nDone.')
