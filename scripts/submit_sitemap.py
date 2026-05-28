"""Submit sitemap + request indexing for landing pages via GSC API."""
import json, urllib.request, urllib.parse
from google.oauth2 import service_account
import google.auth.transport.requests

SA_KEY = json.load(open("/tmp/sa_key.json"))
creds = service_account.Credentials.from_service_account_info(
    SA_KEY, scopes=["https://www.googleapis.com/auth/webmasters"])
import requests as req_lib
creds.refresh(google.auth.transport.requests.Request(session=req_lib.Session()))
token = creds.token

SITE = urllib.parse.quote("sc-domain:xsltplayground.com", safe="")
SM   = urllib.parse.quote("https://xsltplayground.com/sitemap.xml", safe="")
url  = f"https://www.googleapis.com/webmasters/v3/sites/{SITE}/sitemaps/{SM}"

req = urllib.request.Request(url, method="PUT",
    headers={"Authorization": "Bearer " + token, "Content-Length": "0"})
try:
    resp = urllib.request.urlopen(req)
    print(f"Sitemap submitted OK — HTTP {resp.status}")
except urllib.error.HTTPError as e:
    body = e.read().decode()
    print(f"HTTP {e.code}: {body[:300]}")
except Exception as e:
    print(f"Error: {e}")
