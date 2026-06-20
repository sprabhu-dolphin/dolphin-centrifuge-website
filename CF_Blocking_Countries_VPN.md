# Cloudflare Blocking Review: Countries, VPNs, Datacenters, and Verified Crawlers

Date prepared: 2026-06-13

Site: `dolphincentrifuge.com`

Purpose: This document summarizes what was changed in Cloudflare, why it was changed, what the expected behavior should be, what outcomes are specifically not wanted, and how an independent reviewer should verify the work with fresh eyes.

This document intentionally contains no API token, password, or secret credential.

## Executive Summary

Cloudflare was already blocking several prohibited countries for `dolphincentrifuge.com`. The main new problem was that users from prohibited countries may use VPNs or datacenter IPs to appear as if they are outside those countries.

The change added a narrower custom WAF rule that blocks two observed VPN/anonymizer ASNs and three observed VPN/anonymizer IPs while preserving the existing crawler safety condition:

```txt
and not cf.client.bot
```

That condition is important. It is intended to prevent the country and VPN/datacenter blocking rules from blocking Cloudflare-recognized good bots and crawlers, such as legitimate search engine crawlers.

The new rule does not enable Cloudflare's Enterprise-only managed VPN/anonymizer lists. It is a targeted Free/standard WAF custom-rule approach based on observed abuse traffic and Cloudflare Intel labels.

## Review Conclusion At Time Of Writing

Current evidence supports the following conclusion:

- Prohibited countries are blocked with Cloudflare `403 Forbidden`.
- Normal control traffic from the US and UK is not blocked.
- The new VPN/datacenter rule blocks at least one live tested US datacenter/VPN ASN, AS62240 Clouvider.
- The WAF rules are written to avoid blocking Cloudflare verified bots.
- Normal `robots.txt` requests with Googlebot, Bingbot, and AdsBot-Google user agents were not blocked from the test network.
- Cloudflare Trace showed US traffic was not blocked, India traffic was blocked by the country rule, and US low-bot-score traffic was not blocked.

Important limitation:

This does not prove that every Google, Bing, OpenAI, Perplexity, Anthropic, or other crawler will always be allowed. It proves that the active WAF block rules include the Cloudflare verified-bot exclusion and that representative crawler-style sanity checks did not get blocked. A neutral reviewer should verify actual crawler behavior through Cloudflare events, Search Console/Bing tools, and traffic logs over the next 24 to 72 hours.

## Business Intent

The website should not be accessible to visitors from prohibited countries.

The named countries discussed in the work included:

- India
- Pakistan
- Bangladesh
- China
- Iran

The existing Cloudflare country rule also blocks several other countries:

- Argentina
- Brazil
- Russia
- Turkey
- Taiwan

The business concern was that people in prohibited countries can use VPNs, proxy services, or rented datacenter IPs to bypass country-based blocking. The new rule was added to block the specific VPN/anonymizer networks observed in Cloudflare analytics.

## Outcomes We Want

Expected good outcomes:

- Visitors from prohibited countries receive a Cloudflare block response.
- Visitors using the observed VPN/anonymizer ASNs or listed IPs receive a Cloudflare block response.
- A normal US visitor using a normal residential or business ISP is not blocked.
- A normal UK visitor is not blocked.
- Googlebot, Bingbot, AdsBot-Google, and other Cloudflare-recognized verified bots are not blocked by these custom WAF rules.
- Search indexing, ads crawling, and legitimate crawler access are not damaged.
- The rule remains understandable enough that a future reviewer can safely audit or disable it.

## Outcomes We Do Not Want

Unwanted outcomes:

- Blocking normal US visitors.
- Blocking normal Canadian, UK, or other legitimate non-prohibited-country visitors.
- Blocking Googlebot, Bingbot, AdsBot-Google, or other legitimate search crawlers.
- Blocking AI crawlers that Dolphin intentionally wants to allow, if Cloudflare recognizes them as verified good bots or if Dolphin later chooses to explicitly allow them.
- Blocking Search Console validation, Google Ads crawling, or indexing checks.
- Blocking Cloudflare Pages, form handling, or site assets.
- Creating a redirect loop or redirecting blocked visitors to public content.
- Accidentally opening the site to prohibited-country traffic by weakening the country rule.
- Relying on user-agent text alone as proof of crawler identity.

Important nuance:

A US visitor using a VPN or datacenter address in one of the blocked ASNs may be blocked. That is not necessarily a failure, because the purpose of the new rule is to stop VPN/datacenter bypass traffic. The failure case would be blocking ordinary US visitors on normal residential/business networks.

## Cloudflare Account And Zone Context

These identifiers are operational metadata, not secrets.

- Account: `Dolphin Centrifuge`
- Account ID: `b421c569a13f32171251c80aa3c491a0`
- Zone: `dolphincentrifuge.com`
- Zone ID: `c3f8077487f897458f817e632b825f97`
- Custom WAF entrypoint ruleset ID: `df4aa048d07749a8ab22c28c7ba40ea0`
- Ruleset phase: `http_request_firewall_custom`

## API Token Created And Expanded

A user API token was created/expanded for this work:

```txt
Codex Dolphin WAF Intel VPN Block 2026-06-13
```

Final scoped permissions:

- Account `Dolphin Centrifuge`
  - `Intel:Read`
  - `Allow Request Tracer:Read`
- Zone `dolphincentrifuge.com`
  - `Zone WAF:Edit`
  - `Analytics:Read`

The token secret was not stored in:

- This repository
- Obsidian
- Chat
- GitHub
- Shell profile
- Any committed file

Reason these permissions were needed:

- `Zone WAF:Edit`: create and read the custom WAF rule.
- `Intel:Read`: inspect Cloudflare Intel labels for observed IPs.
- `Analytics:Read`: read Cloudflare Security Events / firewall events for proof of blocks.
- `Allow Request Tracer:Read`: run Cloudflare Trace simulations.

## Cost Note

No new Cloudflare paid feature was enabled.

The API token itself should not create an added Cloudflare cost. The custom WAF rule used standard Cloudflare custom rules.

Cloudflare's managed VPN/anonymizer lists, such as `cf.vpn` and `cf.anonymizer`, are documented as Enterprise-plan features. Those were not enabled. This matters because a broad, fully managed "block all known VPNs" rule would likely require Enterprise/custom Cloudflare pricing.

## Existing Rule 1: Country Block

Rule description:

```txt
Block selected countries for non-verified bots
```

Rule ID:

```txt
07cc426e07f3491db89caed97acd1a64
```

Action:

```txt
block
```

Enabled:

```txt
true
```

Expression:

```txt
((ip.geoip.country in {"AR" "BD" "BR" "CN" "IN" "IR" "PK" "RU" "TR" "TW"}) or (ip.src eq 178.62.114.57)) and not cf.client.bot
```

Plain-English meaning:

Block requests from the listed countries and one listed IP address, unless Cloudflare identifies the request as coming from a known good bot or crawler.

Reviewer note:

This rule uses `ip.geoip.country` and `cf.client.bot`. The `not cf.client.bot` condition is the key crawler safety guard.

## Existing Rule 2: Specific IP Block

Rule description:

```txt
Block selected IPs for non-verified bots
```

Rule ID:

```txt
cd04f44dc75c435ab48db761e35f0ef0
```

Action:

```txt
block
```

Enabled:

```txt
true
```

Expression:

```txt
((ip.src eq 157.42.201.108) or (ip.src eq 223.238.49.250) or (ip.src eq 196.189.242.147) or (ip.src eq 129.205.114.36) or (ip.src eq 129.205.114.37) or (ip.src eq 173.197.18.174)) and not cf.client.bot
```

Plain-English meaning:

Block a short list of specific IPs, unless Cloudflare identifies the request as coming from a known good bot or crawler.

## New Rule 3: VPN/Anonymizer ASN And IP Block

Rule description:

```txt
Block observed VPN/anonymizer ASNs for non-verified bots
```

Rule ID:

```txt
bf458586d98b48dca5c945f2b089c480
```

Action:

```txt
block
```

Enabled:

```txt
true
```

Expression:

```txt
((ip.src.asnum in {62240 206092}) or (ip.src eq 85.203.15.188) or (ip.src eq 103.163.220.243) or (ip.src eq 103.163.220.235)) and not cf.client.bot
```

Plain-English meaning:

Block requests from the observed VPN/anonymizer ASNs or from the listed VPN/anonymizer IPs, unless Cloudflare identifies the request as coming from a known good bot or crawler.

## Why These ASNs And IPs Were Chosen

Cloudflare Security Analytics and Cloudflare Intel showed suspicious traffic from these IPs:

- `85.203.15.188`
- `103.163.220.243`
- `103.163.220.235`

Cloudflare Intel labeled all three as:

- `Anonymizer`
- `Security threats`
- `vpn` list

Observed network details:

- `85.203.15.188`
  - Country: GB
  - AS name: Clouvider
  - ASN: `62240`
- `103.163.220.243`
  - Country: CY
  - AS name: F.N.S. HOLDINGS LIMITED
  - ASN: `206092`
- `103.163.220.235`
  - Country: CY
  - AS name: F.N.S. HOLDINGS LIMITED
  - ASN: `206092`

The ASN-level block was added because blocking only individual IPs would be weaker. VPN users can rotate IPs within the same hosting/VPN network.

## Why `ip.src.asnum` Was Used

Cloudflare documents `ip.src.asnum` as the AS number associated with the client IP address. Cloudflare also notes that `ip.geoip.asnum` is deprecated and that `ip.src.asnum` should be used instead.

This is why the new rule uses:

```txt
ip.src.asnum in {62240 206092}
```

instead of the older/deprecated `ip.geoip.asnum`.

## Why `not cf.client.bot` Was Used

All active custom block rules include:

```txt
and not cf.client.bot
```

Cloudflare documents `cf.client.bot` as a boolean indicating whether the request came from a known good bot or crawler.

Cloudflare's own WAF use-case documentation shows this pattern for allowing traffic from verified search engine bots such as Googlebot and Bingbot while still applying country-based filtering to non-verified traffic.

This is the main safety mechanism intended to avoid blocking legitimate search crawlers.

Important limitation:

`cf.client.bot` depends on Cloudflare recognizing the crawler as a verified good bot. A fake crawler that only changes its user-agent to `Googlebot` should not be trusted and should not be allowed through just because of the text in its user-agent. This is intentional.

## What Was Tested

### 1. API Readback Of Active WAF Rules

Cloudflare API readback confirmed the custom WAF ruleset contains three active block rules:

- `Block selected countries for non-verified bots`
- `Block selected IPs for non-verified bots`
- `Block observed VPN/anonymizer ASNs for non-verified bots`

All three enabled terminating custom WAF rules include:

```txt
not cf.client.bot
```

Result:

```txt
PASS
```

### 2. Public Live Site Access

Live request:

```txt
https://dolphincentrifuge.com/
```

Result:

```txt
200 OK
```

Meaning:

Normal access from the test network was not blocked.

Result:

```txt
PASS
```

### 3. Crawler-Style `robots.txt` Sanity Checks

Live requests were made to:

```txt
https://dolphincentrifuge.com/robots.txt
```

with these user agents:

```txt
Googlebot/2.1 (+http://www.google.com/bot.html)
Bingbot/2.0 (+http://www.bing.com/bingbot.htm)
AdsBot-Google (+http://www.google.com/adsbot.html)
```

Each returned:

```txt
200 OK
```

Meaning:

Crawler-style requests from the test network were not blocked.

Limitation:

This does not prove Cloudflare treated the request as a verified Googlebot or Bingbot, because the request did not originate from Google or Bing infrastructure. It is a sanity check only.

Result:

```txt
PASS with limitation
```

### 4. Blocked Country Testing With Globalping

Globalping probes tested blocked and control countries.

Blocked-country results:

```txt
IN India: 403 Forbidden
PK Pakistan: 403 Forbidden
BD Bangladesh: 403 Forbidden
CN China: 403 Forbidden
IR Iran: 403 Forbidden
AR Argentina: 403 Forbidden
BR Brazil: 403 Forbidden
RU Russia: 403 Forbidden
TR Turkey: 403 Forbidden
TW Taiwan: 403 Forbidden
```

Control-country results:

```txt
US United States: 200 OK
GB United Kingdom: 200 OK
```

Meaning:

The country block behaves as expected, and normal controls were not blocked.

Result:

```txt
PASS
```

### 5. Live VPN/Datacenter ASN Test

Globalping found a live probe in:

```txt
ASN 62240
Network: Clouvider
Country: US
City: Ashburn
```

Request result:

```txt
403 Forbidden
```

Meaning:

The new rule blocked AS62240 even though the probe was in the US. This is expected because AS62240 was identified by Cloudflare Intel as associated with the observed VPN/anonymizer IP `85.203.15.188`.

Cloudflare Security Events confirmed:

```txt
action: block
source: firewallCustom
clientAsn: 62240
clientCountryName: US
rayName: a0af03b76c3fd6d9
```

Result:

```txt
PASS
```

### 6. AS206092 Test Limitation

Globalping did not have a matching IPv4 probe available for:

```txt
ASN 206092
```

Therefore, there was no live outside-origin test from AS206092.

However:

- Both observed AS206092 IPs are explicitly included in the rule.
- The ASN `206092` is included in the rule.
- Cloudflare Intel identified both observed AS206092 IPs as VPN/anonymizer/security-threat traffic.

Result:

```txt
NOT FULLY LIVE-TESTED
```

Reviewer should retest AS206092 if another probe or VPN endpoint becomes available.

### 7. Cloudflare Trace

Cloudflare Trace was used after adding the `Allow Request Tracer:Read` permission.

Trace result 1:

```txt
Simulated US request
Status: 200
Matched WAF custom rules: none
```

Trace result 2:

```txt
Simulated India request
Status: 403
Matched rule: Block selected countries for non-verified bots
Matched expression included: and not cf.client.bot
```

Trace result 3:

```txt
Simulated US request with low bot score
Status: 200
Matched WAF custom rules: none
```

Meaning:

The custom WAF rules block the prohibited country condition and do not broadly block US traffic or low-bot-score traffic by themselves.

Result:

```txt
PASS
```

## Current Behavior: Block, Not Redirect

The current behavior is a Cloudflare block:

```txt
403 Forbidden
```

No redirect-to-page behavior was implemented.

If the business later wants blocked users to see a custom explanatory page, that should be handled as a separate design/security decision. For now, the cleanest security posture is a direct Cloudflare block.

## Why We Did Not Enable `cf.vpn` Or `cf.anonymizer`

Cloudflare provides managed IP lists such as:

- `cf.vpn`
- `cf.anonymizer`
- `cf.open_proxies`

Cloudflare documents Managed IP Lists as Enterprise-plan features.

Because this was not enabled, the work used a narrower custom rule based on:

- Observed Cloudflare Security Analytics traffic
- Cloudflare Intel results
- Specific ASNs
- Specific IPs

This reduces cost and avoids turning on a broader paid feature, but it also means this is not a complete "block every VPN on the Internet" solution.

## Key Risks

### Risk 1: ASN Blocking Can Be Broad

Blocking an ASN blocks all client IPs Cloudflare maps to that ASN.

That is useful against VPN/datacenter bypass traffic, but it can also block legitimate users who happen to use that provider.

Current mitigation:

- Only two observed VPN/anonymizer ASNs were blocked.
- Normal US and GB control tests passed.
- Cloudflare Security Events should be monitored for unexpected US blocks.

### Risk 2: This Does Not Block All VPNs

The rule blocks two ASNs and three IPs. It does not block every VPN service.

Current mitigation:

- Continue reviewing Cloudflare Security Events.
- Add more ASNs/IPs only when there is evidence.
- Consider Enterprise managed lists only if the business needs broad VPN coverage and accepts the cost/risk.

### Risk 3: Some Legitimate Crawlers May Not Be Cloudflare Verified

`not cf.client.bot` protects Cloudflare-recognized known good bots/crawlers.

It may not protect every AI crawler, niche crawler, monitoring tool, or partner bot unless Cloudflare recognizes it as verified.

Current mitigation:

- Monitor Cloudflare events for blocked crawler user agents.
- Use Google Search Console and Bing Webmaster Tools to verify indexing health.
- If Dolphin wants to explicitly allow a specific AI crawler, create a separate allow/skip strategy based on reliable identity, not user-agent text alone.

### Risk 4: Fake Googlebot Should Still Be Blocked

Attackers can set a fake `Googlebot` user-agent.

The rules should not allow traffic only because the user-agent says Googlebot. Cloudflare's verified-bot signal is safer because it is based on Cloudflare's bot verification, not just text.

This is why a fake Googlebot from a prohibited country or blocked VPN ASN should still be blocked.

### Risk 5: GeoIP Is Not Perfect

Country blocking depends on Cloudflare geolocation. GeoIP can be imperfect.

Current mitigation:

- Use Cloudflare's edge geolocation consistently.
- Test with distributed probes.
- Investigate any legitimate customer report with CF-Ray, IP, country, and ASN.

## Neutral Reviewer Checklist

A fresh reviewer should independently verify these items.

### Dashboard Checks

1. Go to Cloudflare dashboard.
2. Open `dolphincentrifuge.com`.
3. Open Security / WAF / Custom rules.
4. Confirm these rules are enabled:
   - `Block selected countries for non-verified bots`
   - `Block selected IPs for non-verified bots`
   - `Block observed VPN/anonymizer ASNs for non-verified bots`
5. Confirm every active block rule contains:

```txt
not cf.client.bot
```

6. Confirm the new VPN/anonymizer rule expression is:

```txt
((ip.src.asnum in {62240 206092}) or (ip.src eq 85.203.15.188) or (ip.src eq 103.163.220.243) or (ip.src eq 103.163.220.235)) and not cf.client.bot
```

### API Checks

Use a token with appropriate read permissions. Do not commit or paste token secrets.

Recommended read permissions for review:

- Zone `Zone WAF:Read` or `Zone WAF:Edit`
- Zone `Analytics:Read`
- Account `Intel:Read`
- Account `Allow Request Tracer:Read`

Useful API surfaces:

- Verify token:

```txt
GET /user/tokens/verify
```

- Read custom WAF ruleset:

```txt
GET /zones/{zone_id}/rulesets/{ruleset_id}
```

- Cloudflare Intel IP lookup:

```txt
GET /accounts/{account_id}/intel/ip?ipv4={ip}
```

- Cloudflare Trace:

```txt
POST /accounts/{account_id}/request-tracer/trace
```

- Security Events:

```txt
Cloudflare GraphQL firewallEventsAdaptive
```

### Live External Tests

Retest from multiple probes:

- India should be `403`.
- Pakistan should be `403`.
- Bangladesh should be `403`.
- China should be `403`.
- Iran should be `403`.
- US control should be `200`.
- UK or Canada control should be `200`.
- AS62240 should be `403`, if a probe is available.
- AS206092 should be `403`, if a probe is available.

Recommended external probing tool:

- Globalping

### Crawler Safety Tests

Minimum checks:

- `https://dolphincentrifuge.com/robots.txt` returns `200`.
- Google Search Console live URL inspection can fetch the homepage and important pages.
- Bing Webmaster Tools can fetch representative pages if available.
- Cloudflare Security Events do not show legitimate Googlebot/Bingbot/AdsBot blocks.

Important:

A user-agent-only curl test is not proof of verified bot treatment. Real crawler verification should use Cloudflare events and search-engine webmaster tools.

### Monitoring Checks Over The Next 24 To 72 Hours

Review Cloudflare Security Events for:

- Unexpected US blocks outside AS62240 and AS206092.
- Googlebot, Bingbot, AdsBot-Google, or other legitimate crawlers being blocked.
- AI crawler user agents that Dolphin wants allowed.
- New VPN/anonymizer ASNs being used by prohibited-country traffic.
- Any increase in customer complaints about access.

Review Search Console for:

- Crawl errors.
- Blocked by robots or server errors.
- Sudden indexing/fetch problems.

## Rollback Plan

If the new rule causes an unwanted side effect, the safest rollback is to disable only the new rule:

```txt
Block observed VPN/anonymizer ASNs for non-verified bots
```

Rule ID:

```txt
bf458586d98b48dca5c945f2b089c480
```

Do not disable the existing country block unless the evidence specifically shows the country rule is the problem.

Recommended order:

1. Disable the new VPN/anonymizer ASN rule.
2. Retest normal US access.
3. Retest `robots.txt`.
4. Check Cloudflare Security Events for continued crawler blocks.
5. If crawler blocks still occur, inspect the older country and specific-IP rules.

## Open Questions For Fresh Review

1. Are AS62240 and AS206092 too broad for Dolphin's risk tolerance?
2. Does Dolphin want to allow all verified bots, or only search engines and specific business-use crawlers?
3. Which AI crawlers does Dolphin actually want to allow?
4. Should blocked traffic remain a Cloudflare 403, or should Dolphin create a custom block page?
5. Should Cloudflare Enterprise managed lists be priced later if VPN bypass attempts continue?
6. Should a scheduled Cloudflare event review be added to watch for false positives and new VPN ASNs?

## Source Links

Cloudflare primary documentation used for review context:

- WAF custom rules API: https://developers.cloudflare.com/waf/custom-rules/create-api/
- WAF custom rules overview: https://developers.cloudflare.com/waf/custom-rules/
- `cf.client.bot` field: https://developers.cloudflare.com/ruleset-engine/rules-language/fields/reference/cf.client.bot/
- Allow traffic from verified search engine bots: https://developers.cloudflare.com/waf/custom-rules/use-cases/allow-traffic-from-verified-bots/
- `ip.src.asnum` field: https://developers.cloudflare.com/ruleset-engine/rules-language/fields/reference/ip.src.asnum/
- Cloudflare Trace: https://developers.cloudflare.com/rules/trace-request/
- Request Trace API: https://developers.cloudflare.com/api/resources/request_tracers/subresources/traces/methods/create/
- API token permissions: https://developers.cloudflare.com/fundamentals/api/reference/permissions/
- Cloudflare Managed Lists: https://developers.cloudflare.com/waf/tools/lists/managed-lists/
- Cloudflare Lists availability: https://developers.cloudflare.com/waf/tools/lists/

## Final Current State

Current state as of 2026-06-13:

- Country blocking is active.
- Targeted VPN/anonymizer ASN and IP blocking is active.
- Normal US and UK control checks passed.
- AS62240 Clouvider blocking was live-tested and confirmed in Cloudflare Security Events.
- AS206092 could not be externally probe-tested due to no available Globalping IPv4 probe, but it is present in the rule and the observed IPs are explicitly listed.
- Verified-bot safety is built into all three active block rules through `not cf.client.bot`.
- No broad Enterprise managed VPN list was enabled.
- No API token secret was stored in the repo.

