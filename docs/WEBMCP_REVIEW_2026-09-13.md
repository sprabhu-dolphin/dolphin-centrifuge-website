# WebMCP and technical-data review, 13 September 2026

Target: dolphincentrifuge.com, production repository sprabhu-dolphin/dolphin-centrifuge-website.

## Result and scope

The previous implementation had four browser tools and 32 model records. It exposed the OEM capacity tables well, but its mechanical specification copy could diverge from the website's main specification source. It could retrieve a model's capacity but could not select candidates from an application and required flow.

The updated implementation exposes five sitewide tools plus inquiry preparation on the contact page. A merged catalog contains 63 model records and 177 capacity records, including the original 148 OEM table records. Published mechanical specifications come from the same source as `/specs.json`. Original units, fluid, conditions, evidence class and source location remain attached to each capacity.

This review does not certify every historical page claim or every installed machine. Missing serial-number, nameplate, package and process evidence remains missing. Declaring those fields unresolved is essential to an accurate answer.

## Corrections

| Issue | Result |
| --- | --- |
| MAB 206 single 7.5 HP figure hid OEM pump variants | Separate OEM configurations: recommended 5.5 kW without pump, 11–13 kW with pump. The nominal Dolphin HP figure is retained with its narrower scope. |
| MAB 104 single 2 HP figure hid pump variants | OEM configurations: 1.1 kW without pump, 1.5 kW with pump. |
| MAB 104 60 Hz model labelled 7,500 RPM | Corrected to 7,350 RPM at 60 Hz, with 7,500 RPM explicitly retained for 50 Hz. MAB 104 and DMB-007 prose, tables and structured data agree. |
| Bare separator versus motor/skid weight | OEM configurations explicitly identify separator weight without motor: MAB 104 149 kg; MAB 206 334 kg. These are not skid shipping weights. |
| Homepage MAB 103 speed diverged from canonical data | Homepage now reads its 8,600 RPM value from the shared specification source. |
| Overly permissive inputs and partial registration failure | Runtime schema validation, abort handling and independent registration promises; failed tools can be retried without duplicate registrations. |
| Large tool outputs | Paginated model, capacity and specification results, with original qualifiers and full-record links. Direct specification-field lookup reduces unnecessary calls. |
| Application and flow selection absent | Deterministic `select_centrifuge_candidates`, with explicit flow units, cleaning preference and separate operating/viscosity-reference temperatures. |
| Free-text fluid conditions could lose decimals or accept an unrecognized mixture | Decimal preservation and narrower matching; no diesel capacity transferred to diesel/coolant mixtures. |
| Form preparation unavailable to agents | `prepare_centrifuge_inquiry` fills the visible form, preserves omitted fields and reports missing fields. It never submits or claims an order. Existing asynchronous submission now reports completion only after the Worker confirms success. |

The OEM pump arrangement is not interchangeable with a separate electric feed pump on a Dolphin skid. Drive rating, auxiliary pump rating, heater load and actual power consumption are distinct quantities. OEM kW values are not silently rounded into nominal HP sizes.

The contradictory phrase “316L duplex stainless steel” was also removed from the shared material records and affected pages. [Outokumpu identifies 316L as austenitic](https://www.outokumpu.com/en/products/product-ranges/supra); it is not a duplex grade. Exact installed component grades require OEM part/material evidence, so no replacement grade was invented.

## Source evidence

- [MAB 206 OEM manual](https://assets.alfalaval.com/documents/pc904f98d/alfa-laval-mab-206-881240-22-15-rev2.pdf): product 881240-22-15, MAB 206S-24; identity page 156; technical data page 159, ref. 557968 rev. 3.
- [MAB 104 OEM manual](https://assets.alfalaval.com/documents/p884593f9/alfa-laval-mab-104-881241-08-17-rev3.pdf): product 881241-08-17, MAB 104B-14/24; identity page 133; technical data page 136, ref. 558168 rev. 2.

The technical pages were downloaded from Alfa Laval, inspected and rendered locally to verify column alignment. Source hashes and exact variants are recorded in `src/data/machineConfigurations.mjs`. The pre-existing owner review dates remain unchanged; the new configuration verification has its own date.

## Diesel purification at 10 US GPM

The tool ranks the smallest documented OEM application capacity meeting the request. It returns a shortlist, not a guarantee of separation quality or a universal “best” model.

| Cleaning preference | First candidate | Published diesel capacity | Conditions |
| --- | --- | --- | --- |
| Manual clean | MAB 204 / DMB-013 | 2,900 L/h, 12.77 US GPM derived | 40 C; 13 cSt at 40 C |
| Self-cleaning | MOPX 205 / DMPX-014 variant | 3,300 L/h, 14.53 US GPM derived | 40 C; 13 cSt at 40 C |

Confirm viscosity and its measurement temperature, operating temperature, solids loading, water/emulsion state, outlet quality, duty cycle and installed equipment configuration. A lower bound is used when the published capacity is a range. Hydraulic ceilings, unspecified-fluid references and individual actual runs do not establish general suitability.

Examples:

```json
{"application":"diesel","requiredFlow":10,"flowUnit":"US GPM","cleaning":"self-cleaning"}
```

```json
{"model":"MAB 206","field":"motorPower","configurationId":"alfa-laval-mab-206-with-oem-pump"}
```

## Current Google/Microsoft implementation guidance

Verified against [Chrome's imperative API](https://developer.chrome.com/docs/ai/webmcp/imperative-api), updated 11 September, [best practices](https://developer.chrome.com/docs/ai/webmcp/best-practices), [secure tools](https://developer.chrome.com/docs/ai/webmcp/secure-tools), and the [joint WebMCP draft](https://webmachinelearning.github.io/webmcp/).

The implementation uses `document.modelContext`, asynchronous `registerTool`, structured schemas, explicit effect annotations, cancellation signals and same-origin data. The existing `Permissions-Policy: tools=(self)` and `Origin-Agent-Cluster: ?1` headers remain appropriate. Unsupported browsers retain normal pages, forms and JSON. No remote script or arbitrary-URL execution was added.

The native Codex agent browser successfully discovered and executed the selection, exact motor configuration and contact preparation tools. Its declarative-form discovery was not available, so inquiry preparation uses the imperative API. No live customer inquiry was submitted during testing.

WebMCP remains experimental, not a W3C Standard. Ordinary browser activation is distinct from successful testing in a WebMCP-enabled agent browser:

- [Chrome trial registration](https://developer.chrome.com/origintrials/#/register_trial/4163014905550602241): Chrome 149–156, trial expiry 16 November 2026.
- [Microsoft Edge trial](https://developer.microsoft.com/en-us/microsoft-edge/origin-trials/trials/0b76fe60-b266-458e-a285-04e375c0c31a): expiry 17 November 2026.

No issued tokens were present at audit time. Trial sign-in/registration was staged; agreement acceptance and actual token issuance are not completed in this source revision. `PUBLIC_WEBMCP_ORIGIN_TRIAL_TOKENS` accepts comma-separated browser-issued tokens and emits separate origin-trial meta tags at build time. Configure the exact apex origin and rebuild after issuance; then verify in ordinary eligible Chrome/Edge. Do not claim trial activation merely because a token field or feature-detection code exists.

## Future on-site answer assistant

Use the same catalog and pure selection/query modules behind the chat interface. The language model should interpret the visitor's question, call these functions, present their cited facts and ask for missing engineering inputs. It should not reconstruct horsepower, capacity or model mappings from prose. A server-side MCP service can wrap these same functions if external clients need access without an open browser page. WebMCP itself is a browser tool interface, not a standalone reasoning server.

The next data work is evidence for currently unpublished duties/configurations: MAPX 309 capacity; MAPX 210's fluid-specific rating; WSPX application sizing; WHPX 513 bare-machine speed; NX 414 missing dimensions/power; NX 416 diameter; G2-40 missing G-force/area. Some are intentionally unpublished, not errors. Do not fill them from sibling models. Installed pump and skid/nameplate inventories would allow final package answers rather than model-level candidates.

## Verification

Run `npm run agent:ready:test`: production build, existing rendered-site consistency scan, OEM provenance/alias/mapping tests, runtime registration/cancellation/validation/form completion tests, and deterministic selection/configuration consistency tests. Browser checks cover native tool discovery/execution, visible form preparation and human-readable configuration tables. Deployment proof must additionally identify Cloudflare's exact production source commit and verify live apex behavior.
