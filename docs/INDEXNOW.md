# IndexNow

Pushes new or changed URLs to Bing, Yandex, Seznam and Naver right away (Bing feeds ChatGPT, Copilot and Perplexity).

- Key file: `public/<key>.txt` (the file contains its own name as the key). It must stay live at `https://dolphincentrifuge.com/<key>.txt`.
- Submit specific URLs after a deploy: `npm run indexnow -- /some-page/ /other-page/`
- Submit the whole sitemap: `npm run indexnow -- --sitemap`
- The script POSTs to `https://api.indexnow.org/indexnow` in batches of 100. HTTP 200 or 202 means accepted.
- Run it only after the deploy is live, since the search engines fetch the key file to check ownership.
