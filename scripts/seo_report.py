"""GSC + GA4 report for xsltplayground.com — last 28 days vs prior 28 days."""
import json
from datetime import date, timedelta
from google.oauth2 import service_account
import google.auth.transport.requests
import requests as req_lib

SA_KEY = json.load(open("/tmp/sa_key.json"))
SITE = "sc-domain:xsltplayground.com"
GA4_PROPERTY = "495227679"  # xslt-playground (verified via admin list)

today = date.today()
end = today - timedelta(days=1)
start = end - timedelta(days=27)
prev_end = start - timedelta(days=1)
prev_start = prev_end - timedelta(days=27)


def gsc_token():
    creds = service_account.Credentials.from_service_account_info(
        SA_KEY, scopes=["https://www.googleapis.com/auth/webmasters.readonly"])
    creds.refresh(google.auth.transport.requests.Request(session=req_lib.Session()))
    return creds.token


def gsc_query(token, dims, start_d, end_d, row_limit=25, filters=None):
    import urllib.parse
    site = urllib.parse.quote(SITE, safe="")
    url = f"https://www.googleapis.com/webmasters/v3/sites/{site}/searchAnalytics/query"
    body = {
        "startDate": str(start_d), "endDate": str(end_d),
        "dimensions": dims, "rowLimit": row_limit,
    }
    if filters:
        body["dimensionFilterGroups"] = filters
    r = req_lib.post(url, headers={"Authorization": "Bearer " + token,
                     "Content-Type": "application/json"}, json=body)
    if r.status_code != 200:
        return {"error": f"HTTP {r.status_code}: {r.text[:200]}"}
    return r.json()


def totals(rows):
    c = sum(r["clicks"] for r in rows)
    i = sum(r["impressions"] for r in rows)
    ctr = (c / i * 100) if i else 0
    pos = (sum(r["position"] * r["impressions"] for r in rows) / i) if i else 0
    return c, i, ctr, pos


print("=" * 70)
print(f"  GSC REPORT — {SITE}")
print(f"  Current:  {start} → {end}")
print(f"  Previous: {prev_start} → {prev_end}")
print("=" * 70)

token = gsc_token()

# Site totals current vs previous (use date dimension to get all rows)
cur = gsc_query(token, ["date"], start, end, row_limit=100)
prev = gsc_query(token, ["date"], prev_start, prev_end, row_limit=100)
if "error" in cur:
    print("GSC ERROR:", cur["error"])
else:
    cc, ci, cctr, cpos = totals(cur.get("rows", []))
    pc, pi, pctr, ppos = totals(prev.get("rows", []))
    print(f"\n  TOTALS (28d)        current      previous     delta")
    print(f"  Clicks          {cc:>10}   {pc:>10}   {cc-pc:+}")
    print(f"  Impressions     {ci:>10}   {pi:>10}   {ci-pi:+}")
    print(f"  CTR             {cctr:>9.2f}%   {pctr:>9.2f}%   {cctr-pctr:+.2f}pp")
    print(f"  Avg position    {cpos:>10.1f}   {ppos:>10.1f}   {cpos-ppos:+.1f}")

# Top queries
print("\n  TOP QUERIES (by impressions, current 28d)")
q = gsc_query(token, ["query"], start, end, row_limit=30)
print(f"  {'query':<42} {'clk':>5} {'impr':>7} {'ctr':>6} {'pos':>5}")
for r in sorted(q.get("rows", []), key=lambda x: -x["impressions"])[:25]:
    kw = r["keys"][0][:40]
    print(f"  {kw:<42} {r['clicks']:>5} {r['impressions']:>7} "
          f"{r['ctr']*100:>5.1f}% {r['position']:>5.1f}")

# Top pages
print("\n  TOP PAGES (by clicks, current 28d)")
p = gsc_query(token, ["page"], start, end, row_limit=30)
print(f"  {'page':<52} {'clk':>5} {'impr':>7} {'pos':>5}")
for r in sorted(p.get("rows", []), key=lambda x: -x["clicks"])[:20]:
    pg = r["keys"][0].replace("https://xsltplayground.com", "").replace(
        "https://blog.xsltplayground.com", "[blog]")[:50]
    print(f"  {pg:<52} {r['clicks']:>5} {r['impressions']:>7} {r['position']:>5.1f}")

# High-impression low-CTR queries (opportunity)
print("\n  OPPORTUNITY: high impressions, position 5-20, low CTR")
print(f"  {'query':<42} {'impr':>7} {'ctr':>6} {'pos':>5}")
opps = [r for r in q.get("rows", [])
        if r["impressions"] >= 30 and 4 < r["position"] <= 20 and r["ctr"] < 0.03]
for r in sorted(opps, key=lambda x: -x["impressions"])[:15]:
    kw = r["keys"][0][:40]
    print(f"  {kw:<42} {r['impressions']:>7} {r['ctr']*100:>5.1f}% {r['position']:>5.1f}")

# Striking distance: position 8-20 (close to page 1 / top of page 1)
print("\n  STRIKING DISTANCE: position 8-20 (push to top with content/links)")
print(f"  {'query':<42} {'impr':>7} {'pos':>5}")
strike = [r for r in q.get("rows", [])
          if r["impressions"] >= 15 and 8 <= r["position"] <= 20]
for r in sorted(strike, key=lambda x: x["position"])[:15]:
    kw = r["keys"][0][:40]
    print(f"  {kw:<42} {r['impressions']:>7} {r['position']:>5.1f}")

# ---- GA4 ----
print("\n" + "=" * 70)
print(f"  GA4 REPORT — property {GA4_PROPERTY} (xslt-playground)")
print("=" * 70)
try:
    from google.analytics.data_v1beta import BetaAnalyticsDataClient
    from google.analytics.data_v1beta.types import (
        DateRange, Dimension, Metric, RunReportRequest, OrderBy, Filter,
        FilterExpression)
    ga_creds = service_account.Credentials.from_service_account_info(
        SA_KEY, scopes=["https://www.googleapis.com/auth/analytics.readonly"])
    client = BetaAnalyticsDataClient(credentials=ga_creds)
    prop = f"properties/{GA4_PROPERTY}"

    # Totals current vs previous (dateRange dimension is implicit with 2 ranges)
    r = client.run_report(RunReportRequest(
        property=prop,
        date_ranges=[DateRange(start_date=str(start), end_date=str(end), name="cur"),
                     DateRange(start_date=str(prev_start), end_date=str(prev_end), name="prev")],
        metrics=[Metric(name="sessions"), Metric(name="totalUsers"),
                 Metric(name="engagementRate"), Metric(name="averageSessionDuration"),
                 Metric(name="screenPageViews")],
    ))
    vals = {}
    for row in r.rows:
        dr = row.dimension_values[0].value
        vals[dr] = [m.value for m in row.metric_values]
    cur_v = vals.get("cur", ["0"]*5)
    prev_v = vals.get("prev", ["0"]*5)
    labels = ["Sessions", "Users", "Engagement%", "AvgSessDur(s)", "Pageviews"]
    print(f"\n  {'metric':<16} {'current':>12} {'previous':>12}")
    for i, lab in enumerate(labels):
        cv = float(cur_v[i]); pv = float(prev_v[i])
        if "%" in lab: cv*=100; pv*=100
        print(f"  {lab:<16} {cv:>12.1f} {pv:>12.1f}")

    # Top landing pages from organic
    print("\n  TOP LANDING PAGES (current 28d, by sessions)")
    r2 = client.run_report(RunReportRequest(
        property=prop,
        date_ranges=[DateRange(start_date=str(start), end_date=str(end))],
        dimensions=[Dimension(name="landingPage")],
        metrics=[Metric(name="sessions"), Metric(name="engagementRate"),
                 Metric(name="averageSessionDuration")],
        order_bys=[OrderBy(metric=OrderBy.MetricOrderBy(metric_name="sessions"), desc=True)],
        limit=15,
    ))
    print(f"  {'landing page':<40} {'sess':>6} {'eng%':>6} {'dur(s)':>7}")
    for row in r2.rows:
        lp = row.dimension_values[0].value[:38]
        s = row.metric_values[0].value
        e = float(row.metric_values[1].value)*100
        d = float(row.metric_values[2].value)
        print(f"  {lp:<40} {s:>6} {e:>5.0f}% {d:>7.0f}")

    # Channel breakdown
    print("\n  TRAFFIC BY CHANNEL (current 28d)")
    r3 = client.run_report(RunReportRequest(
        property=prop,
        date_ranges=[DateRange(start_date=str(start), end_date=str(end))],
        dimensions=[Dimension(name="sessionDefaultChannelGroup")],
        metrics=[Metric(name="sessions"), Metric(name="engagementRate")],
        order_bys=[OrderBy(metric=OrderBy.MetricOrderBy(metric_name="sessions"), desc=True)],
    ))
    print(f"  {'channel':<26} {'sess':>6} {'eng%':>6}")
    for row in r3.rows:
        ch = row.dimension_values[0].value[:24]
        s = row.metric_values[0].value
        e = float(row.metric_values[1].value)*100
        print(f"  {ch:<26} {s:>6} {e:>5.0f}%")

    # Key events / conversions
    print("\n  TOP EVENTS (current 28d)")
    r4 = client.run_report(RunReportRequest(
        property=prop,
        date_ranges=[DateRange(start_date=str(start), end_date=str(end))],
        dimensions=[Dimension(name="eventName")],
        metrics=[Metric(name="eventCount")],
        order_bys=[OrderBy(metric=OrderBy.MetricOrderBy(metric_name="eventCount"), desc=True)],
        limit=15,
    ))
    print(f"  {'event':<32} {'count':>8}")
    for row in r4.rows:
        ev = row.dimension_values[0].value[:30]
        c = row.metric_values[0].value
        print(f"  {ev:<32} {c:>8}")
except Exception as e:
    import traceback
    print("  GA4 error:", str(e)[:300])
    traceback.print_exc()
