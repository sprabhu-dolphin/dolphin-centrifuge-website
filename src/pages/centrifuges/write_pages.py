#!/usr/bin/env python3
"""
Writes 4 Dolphin DMPX product pages for the Dolphin Centrifuge website.
DMPX-010, DMPX-028, DMPX-042, DMPX-070
"""

import os

BASE = "D:/Dolphin Marine Services/Business Docs/AI/Claude/Dolphin_Website_Redo/site/src/pages/centrifuges/"

# ─────────────────────────────────────────────────────────────────────────────
# DMPX-010
# ─────────────────────────────────────────────────────────────────────────────
DMPX_010 = r"""---
import BaseLayout from '../../layouts/BaseLayout.astro';

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "DMPX-010 Self-Cleaning 3-Phase Disc Stack Centrifuge",
  "description": "The DMPX-010 is Dolphin Centrifuge's most compact self-cleaning three-phase disc stack centrifuge, processing ~7 GPM of diesel fuel and ideal for small-scale marine, remote-site, and portable oil-separation systems.",
  "brand": { "@type": "Brand", "name": "Dolphin Centrifuge" },
  "manufacturer": { "@type": "Organization", "name": "Dolphin Centrifuge" },
  "category": "Disc Stack Centrifuges",
  "model": "DMPX-010",
  "offers": {
    "@type": "Offer",
    "availability": "https://schema.org/InStock",
    "priceCurrency": "USD",
    "seller": { "@type": "Organization", "name": "Dolphin Centrifuge" }
  }
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is the throughput of the DMPX-010 centrifuge?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The DMPX-010 processes approximately 7 GPM of diesel fuel at rated conditions and up to ~12 GPM under ideal, low-viscosity conditions. Lube oil throughput is ~4 GPM and steam turbine oil throughput is ~8 GPM."
      }
    },
    {
      "@type": "Question",
      "name": "What applications is the DMPX-010 best suited for?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The DMPX-010 is purpose-built for compact and portable installations including small marine vessel diesel polishing, remote-site waste oil reclamation, compact hydraulic oil maintenance, and portable lube oil purification where space and weight are at a premium."
      }
    },
    {
      "@type": "Question",
      "name": "How does the DMPX-010 compare to larger Dolphin DMPX models?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The DMPX-010 is the smallest model in the DMPX series with a 0.16-gallon sludge bowl and ~3.5–5 HP motor. The DMPX-014 roughly doubles the throughput (~13 GPM diesel), while the DMPX-028 (~20–26 GPM) and DMPX-042 (~32–47 GPM) serve progressively larger industrial applications."
      }
    }
  ]
};
---

<BaseLayout
  title="DMPX-010 Compact Self-Cleaning Disc Stack Centrifuge | Dolphin Centrifuge"
  description="DMPX-010 compact self-cleaning disc centrifuge: ~7 GPM diesel throughput. Smallest bowl in the Dolphin DMPX series for marine, remote site, and small-scale oil separation."
  canonicalUrl="https://dolphincentrifuge.com/centrifuges/dmpx-010/"
  breadcrumbs={[{label: "Centrifuges", href: "/disc-stack-centrifuge/"}, {label: "DMPX-010"}]}
  jsonLd={jsonLd}
>

  <!-- ── HERO ─────────────────────────────────────────────────────────────── -->
  <section class="bg-navy text-white py-16 px-4">
    <div class="max-w-5xl mx-auto text-center">
      <h1 class="text-4xl md:text-5xl font-bold font-heading mb-4">
        DMPX-010 Self-Cleaning Disc Stack Centrifuge
      </h1>
      <p class="text-xl text-gold font-semibold mb-3">
        ~7 GPM Diesel · Smallest DMPX Bowl · Marine &amp; Remote-Site Ready
      </p>
      <p class="text-lg text-white/80 max-w-3xl mx-auto mb-8">
        The DMPX-010 delivers continuous, automatic three-phase separation in a compact footprint — ideal for portable skids, small marine vessels, and remote facilities where space is limited but clean fuel and oil are mission-critical.
      </p>
      <div class="flex flex-wrap justify-center gap-4">
        <a href="/contact-for-alfa-laval-centrifuges/"
           class="bg-gold text-navy font-bold px-8 py-3 rounded hover:brightness-110 transition">
          Request a Quote
        </a>
        <a href="/industrial-centrifuge-sample-testing/"
           class="border-2 border-white text-white font-bold px-8 py-3 rounded hover:bg-white hover:text-navy transition">
          Submit Oil Sample
        </a>
      </div>
    </div>
  </section>

  <!-- ── AI SUMMARY CALLOUT ────────────────────────────────────────────────── -->
  <section class="max-w-5xl mx-auto my-10 px-4">
    <div class="bg-navy/5 border-l-4 border-gold rounded-r-lg p-6">
      <p class="text-base italic text-gray-700 leading-relaxed">
        <strong>AI Summary:</strong> The DMPX-010 is Dolphin Centrifuge's most compact self-cleaning three-phase disc stack centrifuge, rated at approximately 7 GPM for diesel fuel polishing and small-scale waste oil processing. With a 0.16-gallon sludge bowl, automatic solids ejection, and a ~3.5–5 HP motor, it operates continuously without manual desludging — making it the preferred choice for portable installations, small marine vessels, and remote-site oil treatment systems where a larger centrifuge is impractical.
      </p>
    </div>
  </section>

  <!-- ── PRODUCT IMAGE ─────────────────────────────────────────────────────── -->
  <section class="max-w-5xl mx-auto px-4 mb-12 flex justify-center">
    <figure class="text-center">
      <img
        src="/images/dmpx-014-self-cleaning-3-phase-disc-stack-centrifuge/DMPX-014-Self-Cleaning-Centrifuge-modified-Alfa-Laval-Disc-Stack-Centrifuge-Hydraulic-Oil-600.webp"
        alt="Dolphin Centrifuge DMPX-010 self-cleaning three-phase disc stack centrifuge"
        width="600"
        height="600"
        loading="eager"
        class="rounded-lg shadow-lg max-w-full"
      />
      <figcaption class="text-sm text-gray-500 mt-2">
        DMPX-010 — Compact Self-Cleaning 3-Phase Disc Stack Centrifuge
      </figcaption>
    </figure>
  </section>

  <!-- ── SPECS TABLE ───────────────────────────────────────────────────────── -->
  <section class="max-w-5xl mx-auto px-4 mb-12">
    <h2 class="text-2xl font-bold font-heading text-navy mb-4">Technical Specifications</h2>
    <div class="overflow-x-auto">
      <table class="w-full border-collapse text-sm">
        <thead>
          <tr class="bg-navy text-white">
            <th class="px-4 py-3 text-left font-semibold">Parameter</th>
            <th class="px-4 py-3 text-left font-semibold">DMPX-010 Value</th>
          </tr>
        </thead>
        <tbody>
          <tr class="border-b border-gray-200 bg-white hover:bg-gray-50">
            <td class="px-4 py-3 font-medium text-gray-700">Diesel Throughput (Actual)</td>
            <td class="px-4 py-3 text-gray-900">~7 GPM</td>
          </tr>
          <tr class="border-b border-gray-200 bg-gray-50 hover:bg-gray-100">
            <td class="px-4 py-3 font-medium text-gray-700">Diesel Throughput (Rated)</td>
            <td class="px-4 py-3 text-gray-900">~12 GPM</td>
          </tr>
          <tr class="border-b border-gray-200 bg-white hover:bg-gray-50">
            <td class="px-4 py-3 font-medium text-gray-700">Bowl Sludge Capacity</td>
            <td class="px-4 py-3 text-gray-900">0.16 gallon</td>
          </tr>
          <tr class="border-b border-gray-200 bg-gray-50 hover:bg-gray-100">
            <td class="px-4 py-3 font-medium text-gray-700">Motor Power</td>
            <td class="px-4 py-3 text-gray-900">~3.5–5 HP</td>
          </tr>
          <tr class="border-b border-gray-200 bg-white hover:bg-gray-50">
            <td class="px-4 py-3 font-medium text-gray-700">Separation Type</td>
            <td class="px-4 py-3 text-gray-900">Three-phase (oil / water / solids)</td>
          </tr>
          <tr class="border-b border-gray-200 bg-gray-50 hover:bg-gray-100">
            <td class="px-4 py-3 font-medium text-gray-700">Desludging</td>
            <td class="px-4 py-3 text-gray-900">Automatic self-cleaning (hydraulic ejection)</td>
          </tr>
          <tr class="border-b border-gray-200 bg-white hover:bg-gray-50">
            <td class="px-4 py-3 font-medium text-gray-700">Process</td>
            <td class="px-4 py-3 text-gray-900">Continuous, unattended operation</td>
          </tr>
          <tr class="border-b border-gray-200 bg-gray-50 hover:bg-gray-100">
            <td class="px-4 py-3 font-medium text-gray-700">Lube Oil (R&amp;O) Throughput</td>
            <td class="px-4 py-3 text-gray-900">~4 GPM</td>
          </tr>
          <tr class="border-b border-gray-200 bg-white hover:bg-gray-50">
            <td class="px-4 py-3 font-medium text-gray-700">Steam Turbine Oil Throughput</td>
            <td class="px-4 py-3 text-gray-900">~8 GPM</td>
          </tr>
          <tr class="bg-gray-50 hover:bg-gray-100">
            <td class="px-4 py-3 font-medium text-gray-700">DMPX Series Position</td>
            <td class="px-4 py-3 text-gray-900">Smallest / Entry (10 bowl equiv.)</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>

  <!-- ── CAPACITY BY FLUID TABLE ───────────────────────────────────────────── -->
  <section class="max-w-5xl mx-auto px-4 mb-12">
    <h2 class="text-2xl font-bold font-heading text-navy mb-4">Capacity by Fluid Type</h2>
    <div class="overflow-x-auto">
      <table class="w-full border-collapse text-sm">
        <thead>
          <tr class="bg-navy text-white">
            <th class="px-4 py-3 text-left font-semibold">Fluid Type</th>
            <th class="px-4 py-3 text-left font-semibold">Approx. Throughput (GPM)</th>
          </tr>
        </thead>
        <tbody>
          <tr class="border-b border-gray-200 bg-white hover:bg-gray-50">
            <td class="px-4 py-3 font-medium text-gray-700">Diesel / Light Fuel Oil</td>
            <td class="px-4 py-3 text-gray-900">~7</td>
          </tr>
          <tr class="border-b border-gray-200 bg-gray-50 hover:bg-gray-100">
            <td class="px-4 py-3 font-medium text-gray-700">HFO 30 cSt</td>
            <td class="px-4 py-3 text-gray-900">~7</td>
          </tr>
          <tr class="border-b border-gray-200 bg-white hover:bg-gray-50">
            <td class="px-4 py-3 font-medium text-gray-700">HFO 60 cSt</td>
            <td class="px-4 py-3 text-gray-900">~6</td>
          </tr>
          <tr class="border-b border-gray-200 bg-gray-50 hover:bg-gray-100">
            <td class="px-4 py-3 font-medium text-gray-700">HFO 100 cSt</td>
            <td class="px-4 py-3 text-gray-900">~5</td>
          </tr>
          <tr class="border-b border-gray-200 bg-white hover:bg-gray-50">
            <td class="px-4 py-3 font-medium text-gray-700">HFO 180 cSt</td>
            <td class="px-4 py-3 text-gray-900">~4</td>
          </tr>
          <tr class="border-b border-gray-200 bg-gray-50 hover:bg-gray-100">
            <td class="px-4 py-3 font-medium text-gray-700">HFO 380 cSt</td>
            <td class="px-4 py-3 text-gray-900">Not rated for this model</td>
          </tr>
          <tr class="bg-white hover:bg-gray-50">
            <td class="px-4 py-3 font-medium text-gray-700">Lube Oil (R&amp;O) / Steam Turbine</td>
            <td class="px-4 py-3 text-gray-900">~4 / ~8 GPM</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="text-xs text-gray-500 mt-2">
      * Throughput values are at typical process temperature (194°F / 90°C). Actual flow rates vary with temperature, contamination level, and desired separation efficiency.
    </p>
  </section>

  <!-- ── APPLICATIONS GRID ─────────────────────────────────────────────────── -->
  <section class="max-w-5xl mx-auto px-4 mb-12">
    <h2 class="text-2xl font-bold font-heading text-navy mb-6">Key Applications</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="border border-gray-200 rounded-lg p-5 hover:shadow-md transition">
        <h3 class="font-bold text-navy text-lg mb-2">Marine Diesel Polishing</h3>
        <p class="text-gray-600 text-sm">
          The DMPX-010's compact size fits tight engine room spaces on small vessels, yachts, and workboats. Continuously removes water, microbial contamination, and particulates from diesel day tanks without manual intervention.
        </p>
      </div>
      <div class="border border-gray-200 rounded-lg p-5 hover:shadow-md transition">
        <h3 class="font-bold text-navy text-lg mb-2">Remote-Site Waste Oil Reclamation</h3>
        <p class="text-gray-600 text-sm">
          For remote generators, mobile equipment fleets, or off-grid facilities, the DMPX-010 reclaims used lube oil and diesel on-site, eliminating costly waste oil disposal and reducing re-supply frequency. See our <a href="/waste-oil-centrifuge/" class="text-gold underline">waste oil centrifuge</a> page for more.
        </p>
      </div>
      <div class="border border-gray-200 rounded-lg p-5 hover:shadow-md transition">
        <h3 class="font-bold text-navy text-lg mb-2">Compact Hydraulic &amp; Lube Oil Maintenance</h3>
        <p class="text-gray-600 text-sm">
          Small machine shops, mobile hydraulic systems, and light industrial operations use the DMPX-010 to continuously clean hydraulic and R&amp;O lube oils, extending fluid and component life at ~4 GPM throughput.
        </p>
      </div>
      <div class="border border-gray-200 rounded-lg p-5 hover:shadow-md transition">
        <h3 class="font-bold text-navy text-lg mb-2">Portable Skid &amp; Trailer Applications</h3>
        <p class="text-gray-600 text-sm">
          The smallest DMPX bowl and motor make it the natural choice for portable oil-cleaning skids and trailers serving multiple machines or tanks at different sites. Pairs well with a small feed pump and process heater in a self-contained unit.
        </p>
      </div>
    </div>
  </section>

  <!-- ── CROSS-MODEL COMPARISON ────────────────────────────────────────────── -->
  <section class="max-w-5xl mx-auto px-4 mb-12">
    <h2 class="text-2xl font-bold font-heading text-navy mb-4">How the DMPX-010 Fits the DMPX Series</h2>
    <p class="text-gray-700 leading-relaxed">
      The DMPX series spans a wide range of throughputs to match every application scale. The <strong>DMPX-010</strong> (this page) is the entry-level model at ~7 GPM diesel, ideal when space and flow requirements are modest. Moving up, the
      <a href="/dmpx-014-self-cleaning-3-phase-disc-stack-centrifuge/" class="text-gold underline font-medium">DMPX-014</a>
      roughly doubles throughput to ~13 GPM, while the
      <a href="/centrifuges/dmpx-028/" class="text-gold underline font-medium">DMPX-028</a>
      (~20–26 GPM) handles medium industrial volumes. The
      <a href="/centrifuges/dmpx-042/" class="text-gold underline font-medium">DMPX-042</a>
      (~32–47 GPM) and
      <a href="/centrifuges/dmpx-070/" class="text-gold underline font-medium">DMPX-070</a>
      (~59–72 GPM) serve large-scale industrial and power-generation applications.
      All DMPX models share the same automatic self-cleaning bowl technology and continuous three-phase separation capability. Visit our
      <a href="/disc-stack-centrifuge/" class="text-gold underline font-medium">Disc Stack Centrifuge overview</a>
      to compare models side by side.
    </p>
  </section>

  <!-- ── FAQ ──────────────────────────────────────────────────────────────── -->
  <section class="max-w-5xl mx-auto px-4 mb-12">
    <h2 class="text-2xl font-bold font-heading text-navy mb-6">Frequently Asked Questions</h2>
    <div class="space-y-6">
      <div class="border border-gray-200 rounded-lg p-5">
        <h3 class="font-bold text-navy text-base mb-2">What is the throughput of the DMPX-010 centrifuge?</h3>
        <p class="text-gray-700 text-sm">
          The DMPX-010 processes approximately 7 GPM of diesel fuel at rated conditions and up to ~12 GPM under ideal, low-viscosity conditions. Lube oil (R&amp;O) throughput is ~4 GPM and steam turbine oil is ~8 GPM. HFO can be processed at 4–7 GPM depending on viscosity grade.
        </p>
      </div>
      <div class="border border-gray-200 rounded-lg p-5">
        <h3 class="font-bold text-navy text-base mb-2">What applications is the DMPX-010 best suited for?</h3>
        <p class="text-gray-700 text-sm">
          The DMPX-010 is purpose-built for compact and portable installations: small marine vessel <a href="/diesel-centrifuge/" class="text-gold underline">diesel polishing</a>, remote-site waste oil reclamation, compact hydraulic oil maintenance, and portable lube oil purification where space and weight are at a premium.
        </p>
      </div>
      <div class="border border-gray-200 rounded-lg p-5">
        <h3 class="font-bold text-navy text-base mb-2">How does the DMPX-010 compare to larger Dolphin DMPX models?</h3>
        <p class="text-gray-700 text-sm">
          The DMPX-010 is the smallest model in the DMPX series with a 0.16-gallon sludge bowl and ~3.5–5 HP motor. The <a href="/dmpx-014-self-cleaning-3-phase-disc-stack-centrifuge/" class="text-gold underline">DMPX-014</a> roughly doubles diesel throughput (~13 GPM), while the <a href="/centrifuges/dmpx-028/" class="text-gold underline">DMPX-028</a> (~20–26 GPM) and <a href="/centrifuges/dmpx-042/" class="text-gold underline">DMPX-042</a> (~32–47 GPM) serve progressively larger industrial applications.
        </p>
      </div>
    </div>
  </section>

  <!-- ── RELATED RESOURCES ─────────────────────────────────────────────────── -->
  <section class="max-w-5xl mx-auto px-4 mb-12">
    <h2 class="text-2xl font-bold font-heading text-navy mb-4">Related Resources</h2>
    <ul class="space-y-2 text-sm">
      <li><a href="/disc-stack-centrifuge/" class="text-gold underline">Disc Stack Centrifuge Overview — All DMPX Models</a></li>
      <li><a href="/dmpx-014-self-cleaning-3-phase-disc-stack-centrifuge/" class="text-gold underline">DMPX-014 Product Page (~13 GPM)</a></li>
      <li><a href="/centrifuges/dmpx-028/" class="text-gold underline">DMPX-028 Product Page (~20–26 GPM)</a></li>
      <li><a href="/centrifuges/dmpx-042/" class="text-gold underline">DMPX-042 Product Page (~32–47 GPM)</a></li>
      <li><a href="/centrifuges/dmpx-070/" class="text-gold underline">DMPX-070 Product Page (~59–72 GPM)</a></li>
      <li><a href="/waste-oil-centrifuge/" class="text-gold underline">Waste Oil Centrifuge Applications</a></li>
      <li><a href="/diesel-centrifuge/" class="text-gold underline">Diesel Fuel Polishing Centrifuges</a></li>
      <li><a href="/industrial-centrifuge-sample-testing/" class="text-gold underline">Free Oil Sample Testing Program</a></li>
    </ul>
  </section>

  <!-- ── BOTTOM CTA ─────────────────────────────────────────────────────────── -->
  <section class="bg-navy text-white py-14 px-4 mt-8">
    <div class="max-w-4xl mx-auto text-center">
      <h2 class="text-3xl font-bold font-heading mb-4">Ready to Spec the DMPX-010?</h2>
      <p class="text-white/80 text-lg mb-8">
        Talk to our engineering team about your flow rate, fluid type, and installation footprint. We'll confirm the DMPX-010 is the right fit — or recommend a larger model if your application needs more capacity.
      </p>
      <div class="flex flex-wrap justify-center gap-4">
        <a href="/contact-for-alfa-laval-centrifuges/"
           class="bg-gold text-navy font-bold px-8 py-3 rounded hover:brightness-110 transition">
          Contact Us
        </a>
        <a href="/industrial-centrifuge-sample-testing/"
           class="border-2 border-white text-white font-bold px-8 py-3 rounded hover:bg-white hover:text-navy transition">
          Sample Testing
        </a>
      </div>
    </div>
  </section>

  <script type="application/ld+json" set:html={JSON.stringify(faqJsonLd)} />

</BaseLayout>
"""

# ─────────────────────────────────────────────────────────────────────────────
# DMPX-028
# ─────────────────────────────────────────────────────────────────────────────
DMPX_028 = r"""---
import BaseLayout from '../../layouts/BaseLayout.astro';

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "DMPX-028 Self-Cleaning 3-Phase Disc Stack Centrifuge",
  "description": "The DMPX-028 is a mid-range self-cleaning three-phase disc stack centrifuge processing 20–26 GPM of diesel and handling HFO, biodiesel, waste oil, and lube oil in continuous industrial service.",
  "brand": { "@type": "Brand", "name": "Dolphin Centrifuge" },
  "manufacturer": { "@type": "Organization", "name": "Dolphin Centrifuge" },
  "category": "Disc Stack Centrifuges",
  "model": "DMPX-028",
  "offers": {
    "@type": "Offer",
    "availability": "https://schema.org/InStock",
    "priceCurrency": "USD",
    "seller": { "@type": "Organization", "name": "Dolphin Centrifuge" }
  }
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is the throughput of the DMPX-028 centrifuge?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The DMPX-028 processes approximately 20–26 GPM of diesel fuel at actual operating conditions, with a rated capacity of 33–40 GPM under ideal low-viscosity conditions. Lube oil (R&O) throughput is 10–14 GPM and steam turbine oil is 21–26 GPM."
      }
    },
    {
      "@type": "Question",
      "name": "What applications is the DMPX-028 used for?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The DMPX-028 is widely used for biodiesel production finishing, industrial waste oil reclamation, HFO purification on medium-sized marine vessels and power generators, hydraulic and lube oil maintenance, and light crude oil dewatering. Its 1.03-gallon sludge bowl supports continuous operation in moderately contaminated streams."
      }
    },
    {
      "@type": "Question",
      "name": "How does the DMPX-028 compare to the DMPX-014?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The DMPX-028 delivers roughly twice the diesel throughput of the DMPX-014 (20–26 GPM vs. 13–16 GPM) and features a significantly larger 1.03-gallon sludge bowl versus the DMPX-014's smaller bowl. This makes it better suited for industrial waste oil and HFO applications with higher solids loading, while the DMPX-014 is preferred for lighter marine and small industrial duties."
      }
    }
  ]
};
---

<BaseLayout
  title="DMPX-028 Self-Cleaning 3-Phase Disc Stack Centrifuge | Dolphin Centrifuge"
  description="DMPX-028 self-cleaning three-phase disc stack centrifuge: 20–26 GPM diesel throughput. Mid-range industrial centrifuge for waste oil, HFO purification, biodiesel, and lube oil applications."
  canonicalUrl="https://dolphincentrifuge.com/centrifuges/dmpx-028/"
  breadcrumbs={[{label: "Centrifuges", href: "/disc-stack-centrifuge/"}, {label: "DMPX-028"}]}
  jsonLd={jsonLd}
>

  <!-- ── HERO ─────────────────────────────────────────────────────────────── -->
  <section class="bg-navy text-white py-16 px-4">
    <div class="max-w-5xl mx-auto text-center">
      <h1 class="text-4xl md:text-5xl font-bold font-heading mb-4">
        DMPX-028 Self-Cleaning Disc Stack Centrifuge
      </h1>
      <p class="text-xl text-gold font-semibold mb-3">
        20–26 GPM Diesel · 1.03-Gallon Sludge Bowl · Biodiesel, HFO &amp; Waste Oil
      </p>
      <p class="text-lg text-white/80 max-w-3xl mx-auto mb-8">
        The DMPX-028 is the workhorse of medium industrial oil-separation: processing diesel, HFO, waste oil, and biodiesel continuously with a self-cleaning bowl that never shuts down for manual desludging.
      </p>
      <div class="flex flex-wrap justify-center gap-4">
        <a href="/contact-for-alfa-laval-centrifuges/"
           class="bg-gold text-navy font-bold px-8 py-3 rounded hover:brightness-110 transition">
          Request a Quote
        </a>
        <a href="/industrial-centrifuge-sample-testing/"
           class="border-2 border-white text-white font-bold px-8 py-3 rounded hover:bg-white hover:text-navy transition">
          Submit Oil Sample
        </a>
      </div>
    </div>
  </section>

  <!-- ── AI SUMMARY CALLOUT ────────────────────────────────────────────────── -->
  <section class="max-w-5xl mx-auto my-10 px-4">
    <div class="bg-navy/5 border-l-4 border-gold rounded-r-lg p-6">
      <p class="text-base italic text-gray-700 leading-relaxed">
        <strong>AI Summary:</strong> The DMPX-028 is a mid-range self-cleaning three-phase disc stack centrifuge from Dolphin Centrifuge, rated at 20–26 GPM for diesel fuel and capable of processing heavy fuel oil up to 180 cSt at 10–12 GPM. With a 1.03-gallon automatic sludge bowl and a 10–15 HP motor, it operates continuously without manual desludging — making it the preferred choice for industrial waste oil reclamation, biodiesel production, HFO purification on medium vessels, and hydraulic oil maintenance systems where higher throughput than the DMPX-014 is required.
      </p>
    </div>
  </section>

  <!-- ── PRODUCT IMAGE ─────────────────────────────────────────────────────── -->
  <section class="max-w-5xl mx-auto px-4 mb-12 flex justify-center">
    <figure class="text-center">
      <img
        src="/images/alfa-laval-mopx-207-centrifuge/Alfa-Laval-MOPX207-Used-Oil-Centrifuge-600.jpg"
        alt="Dolphin Centrifuge DMPX-028 self-cleaning three-phase disc stack centrifuge"
        width="600"
        height="600"
        loading="eager"
        class="rounded-lg shadow-lg max-w-full"
      />
      <figcaption class="text-sm text-gray-500 mt-2">
        DMPX-028 — Mid-Range Self-Cleaning 3-Phase Disc Stack Centrifuge
      </figcaption>
    </figure>
  </section>

  <!-- ── SPECS TABLE ───────────────────────────────────────────────────────── -->
  <section class="max-w-5xl mx-auto px-4 mb-12">
    <h2 class="text-2xl font-bold font-heading text-navy mb-4">Technical Specifications</h2>
    <div class="overflow-x-auto">
      <table class="w-full border-collapse text-sm">
        <thead>
          <tr class="bg-navy text-white">
            <th class="px-4 py-3 text-left font-semibold">Parameter</th>
            <th class="px-4 py-3 text-left font-semibold">DMPX-028 Value</th>
          </tr>
        </thead>
        <tbody>
          <tr class="border-b border-gray-200 bg-white hover:bg-gray-50">
            <td class="px-4 py-3 font-medium text-gray-700">Diesel Throughput (Actual)</td>
            <td class="px-4 py-3 text-gray-900">~20–26 GPM</td>
          </tr>
          <tr class="border-b border-gray-200 bg-gray-50 hover:bg-gray-100">
            <td class="px-4 py-3 font-medium text-gray-700">Diesel Throughput (Rated)</td>
            <td class="px-4 py-3 text-gray-900">~33–40 GPM</td>
          </tr>
          <tr class="border-b border-gray-200 bg-white hover:bg-gray-50">
            <td class="px-4 py-3 font-medium text-gray-700">Bowl Sludge Capacity</td>
            <td class="px-4 py-3 text-gray-900">1.03 gallons</td>
          </tr>
          <tr class="border-b border-gray-200 bg-gray-50 hover:bg-gray-100">
            <td class="px-4 py-3 font-medium text-gray-700">Motor Power</td>
            <td class="px-4 py-3 text-gray-900">~10–15 HP</td>
          </tr>
          <tr class="border-b border-gray-200 bg-white hover:bg-gray-50">
            <td class="px-4 py-3 font-medium text-gray-700">Separation Type</td>
            <td class="px-4 py-3 text-gray-900">Three-phase (oil / water / solids)</td>
          </tr>
          <tr class="border-b border-gray-200 bg-gray-50 hover:bg-gray-100">
            <td class="px-4 py-3 font-medium text-gray-700">Desludging</td>
            <td class="px-4 py-3 text-gray-900">Automatic self-cleaning (hydraulic ejection)</td>
          </tr>
          <tr class="border-b border-gray-200 bg-white hover:bg-gray-50">
            <td class="px-4 py-3 font-medium text-gray-700">Process</td>
            <td class="px-4 py-3 text-gray-900">Continuous, unattended operation</td>
          </tr>
          <tr class="border-b border-gray-200 bg-gray-50 hover:bg-gray-100">
            <td class="px-4 py-3 font-medium text-gray-700">Lube Oil (R&amp;O) Throughput</td>
            <td class="px-4 py-3 text-gray-900">10–14 GPM</td>
          </tr>
          <tr class="border-b border-gray-200 bg-white hover:bg-gray-50">
            <td class="px-4 py-3 font-medium text-gray-700">Steam Turbine Oil Throughput</td>
            <td class="px-4 py-3 text-gray-900">21–26 GPM</td>
          </tr>
          <tr class="bg-gray-50 hover:bg-gray-100">
            <td class="px-4 py-3 font-medium text-gray-700">DMPX Series Position</td>
            <td class="px-4 py-3 text-gray-900">Mid-range (28 bowl equiv.)</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>

  <!-- ── CAPACITY BY FLUID TABLE ───────────────────────────────────────────── -->
  <section class="max-w-5xl mx-auto px-4 mb-12">
    <h2 class="text-2xl font-bold font-heading text-navy mb-4">Capacity by Fluid Type</h2>
    <div class="overflow-x-auto">
      <table class="w-full border-collapse text-sm">
        <thead>
          <tr class="bg-navy text-white">
            <th class="px-4 py-3 text-left font-semibold">Fluid Type</th>
            <th class="px-4 py-3 text-left font-semibold">Approx. Throughput (GPM)</th>
          </tr>
        </thead>
        <tbody>
          <tr class="border-b border-gray-200 bg-white hover:bg-gray-50">
            <td class="px-4 py-3 font-medium text-gray-700">Diesel / Light Fuel Oil</td>
            <td class="px-4 py-3 text-gray-900">20–26</td>
          </tr>
          <tr class="border-b border-gray-200 bg-gray-50 hover:bg-gray-100">
            <td class="px-4 py-3 font-medium text-gray-700">HFO 30 cSt</td>
            <td class="px-4 py-3 text-gray-900">20–25</td>
          </tr>
          <tr class="border-b border-gray-200 bg-white hover:bg-gray-50">
            <td class="px-4 py-3 font-medium text-gray-700">HFO 60 cSt</td>
            <td class="px-4 py-3 text-gray-900">15–18</td>
          </tr>
          <tr class="border-b border-gray-200 bg-gray-50 hover:bg-gray-100">
            <td class="px-4 py-3 font-medium text-gray-700">HFO 100 cSt</td>
            <td class="px-4 py-3 text-gray-900">15–18</td>
          </tr>
          <tr class="border-b border-gray-200 bg-white hover:bg-gray-50">
            <td class="px-4 py-3 font-medium text-gray-700">HFO 180 cSt</td>
            <td class="px-4 py-3 text-gray-900">10–12</td>
          </tr>
          <tr class="border-b border-gray-200 bg-gray-50 hover:bg-gray-100">
            <td class="px-4 py-3 font-medium text-gray-700">HFO 380 cSt</td>
            <td class="px-4 py-3 text-gray-900">8–10</td>
          </tr>
          <tr class="bg-white hover:bg-gray-50">
            <td class="px-4 py-3 font-medium text-gray-700">Lube Oil (R&amp;O) / Steam Turbine</td>
            <td class="px-4 py-3 text-gray-900">10–14 / 21–26 GPM</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="text-xs text-gray-500 mt-2">
      * Throughput values are at typical process temperature (194°F / 90°C). Actual flow rates vary with temperature, contamination level, and desired separation efficiency.
    </p>
  </section>

  <!-- ── APPLICATIONS GRID ─────────────────────────────────────────────────── -->
  <section class="max-w-5xl mx-auto px-4 mb-12">
    <h2 class="text-2xl font-bold font-heading text-navy mb-6">Key Applications</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="border border-gray-200 rounded-lg p-5 hover:shadow-md transition">
        <h3 class="font-bold text-navy text-lg mb-2">Waste Oil Reclamation</h3>
        <p class="text-gray-600 text-sm">
          At 20–26 GPM, the DMPX-028 can continuously process industrial used oil streams — including used motor oil, hydraulic oil, and gear oil — separating water and particulate solids to produce reclaimed base oil suitable for reuse or resale. See our <a href="/waste-oil-centrifuge/" class="text-gold underline">waste oil centrifuge</a> application page for details.
        </p>
      </div>
      <div class="border border-gray-200 rounded-lg p-5 hover:shadow-md transition">
        <h3 class="font-bold text-navy text-lg mb-2">Biodiesel Production</h3>
        <p class="text-gray-600 text-sm">
          The DMPX-028 is widely used in biodiesel finishing: removing residual methanol, water, and glycerin from biodiesel after transesterification. Continuous operation at 20–26 GPM supports mid-scale biodiesel production without manual centrifuge downtime. Learn more on our <a href="/biodiesel-centrifuge/" class="text-gold underline">biodiesel centrifuge</a> page.
        </p>
      </div>
      <div class="border border-gray-200 rounded-lg p-5 hover:shadow-md transition">
        <h3 class="font-bold text-navy text-lg mb-2">HFO Purification</h3>
        <p class="text-gray-600 text-sm">
          Capable of processing HFO up to 380 cSt at 8–10 GPM, the DMPX-028 handles heavy fuel oil purification on medium marine vessels, shore-based power generators, and industrial boiler fuel systems. Three-phase separation removes both water and catalyst fines in a single pass.
        </p>
      </div>
      <div class="border border-gray-200 rounded-lg p-5 hover:shadow-md transition">
        <h3 class="font-bold text-navy text-lg mb-2">Hydraulic &amp; Lube Oil Maintenance</h3>
        <p class="text-gray-600 text-sm">
          The DMPX-028 processes 10–14 GPM of R&amp;O lube oil, making it appropriate for larger industrial gearbox oil systems, compressor lube circuits, and hydraulic power units where the DMPX-010 or DMPX-014 is undersized. Continuous operation eliminates the need for batch filtering or oil changes.
        </p>
      </div>
    </div>
  </section>

  <!-- ── CROSS-MODEL COMPARISON ────────────────────────────────────────────── -->
  <section class="max-w-5xl mx-auto px-4 mb-12">
    <h2 class="text-2xl font-bold font-heading text-navy mb-4">Where the DMPX-028 Fits in the DMPX Series</h2>
    <p class="text-gray-700 leading-relaxed">
      The DMPX-028 sits at the middle of the Dolphin DMPX product range. For lighter-duty applications, the
      <a href="/centrifuges/dmpx-010/" class="text-gold underline font-medium">DMPX-010</a>
      (~7 GPM) and
      <a href="/dmpx-014-self-cleaning-3-phase-disc-stack-centrifuge/" class="text-gold underline font-medium">DMPX-014</a>
      (~13 GPM) offer more compact and lower-power alternatives. For higher-volume industrial applications, the
      <a href="/centrifuges/dmpx-042/" class="text-gold underline font-medium">DMPX-042</a>
      (~32–47 GPM) and
      <a href="/centrifuges/dmpx-070/" class="text-gold underline font-medium">DMPX-070</a>
      (~59–72 GPM) provide the throughput needed for large-scale crude oil, refinery, or power-plant fuel treatment. All DMPX models use the same automatic self-cleaning bowl design.
      Visit our <a href="/disc-stack-centrifuge/" class="text-gold underline font-medium">Disc Stack Centrifuge overview</a> to compare all models.
    </p>
  </section>

  <!-- ── FAQ ──────────────────────────────────────────────────────────────── -->
  <section class="max-w-5xl mx-auto px-4 mb-12">
    <h2 class="text-2xl font-bold font-heading text-navy mb-6">Frequently Asked Questions</h2>
    <div class="space-y-6">
      <div class="border border-gray-200 rounded-lg p-5">
        <h3 class="font-bold text-navy text-base mb-2">What is the throughput of the DMPX-028 centrifuge?</h3>
        <p class="text-gray-700 text-sm">
          The DMPX-028 processes approximately 20–26 GPM of diesel fuel at actual operating conditions, with a rated capacity of 33–40 GPM under ideal low-viscosity conditions. Lube oil (R&amp;O) throughput is 10–14 GPM and steam turbine oil is 21–26 GPM.
        </p>
      </div>
      <div class="border border-gray-200 rounded-lg p-5">
        <h3 class="font-bold text-navy text-base mb-2">What applications is the DMPX-028 used for?</h3>
        <p class="text-gray-700 text-sm">
          The DMPX-028 is used for <a href="/biodiesel-centrifuge/" class="text-gold underline">biodiesel</a> production finishing, industrial <a href="/waste-oil-centrifuge/" class="text-gold underline">waste oil</a> reclamation, HFO purification on medium marine vessels and power generators, hydraulic and lube oil maintenance, and light crude oil dewatering. Its 1.03-gallon sludge bowl supports continuous operation even with moderately contaminated oil streams.
        </p>
      </div>
      <div class="border border-gray-200 rounded-lg p-5">
        <h3 class="font-bold text-navy text-base mb-2">How does the DMPX-028 compare to the DMPX-014?</h3>
        <p class="text-gray-700 text-sm">
          The DMPX-028 delivers roughly twice the diesel throughput of the <a href="/dmpx-014-self-cleaning-3-phase-disc-stack-centrifuge/" class="text-gold underline">DMPX-014</a> (20–26 GPM vs. 13–16 GPM) and features a significantly larger 1.03-gallon sludge bowl, making it better suited for industrial waste oil and HFO applications with higher solids loading. The DMPX-014 is preferred for lighter marine and small industrial duties.
        </p>
      </div>
    </div>
  </section>

  <!-- ── RELATED RESOURCES ─────────────────────────────────────────────────── -->
  <section class="max-w-5xl mx-auto px-4 mb-12">
    <h2 class="text-2xl font-bold font-heading text-navy mb-4">Related Resources</h2>
    <ul class="space-y-2 text-sm">
      <li><a href="/disc-stack-centrifuge/" class="text-gold underline">Disc Stack Centrifuge Overview — All DMPX Models</a></li>
      <li><a href="/centrifuges/dmpx-010/" class="text-gold underline">DMPX-010 Product Page (~7 GPM)</a></li>
      <li><a href="/dmpx-014-self-cleaning-3-phase-disc-stack-centrifuge/" class="text-gold underline">DMPX-014 Product Page (~13 GPM)</a></li>
      <li><a href="/centrifuges/dmpx-042/" class="text-gold underline">DMPX-042 Product Page (~32–47 GPM)</a></li>
      <li><a href="/centrifuges/dmpx-070/" class="text-gold underline">DMPX-070 Product Page (~59–72 GPM)</a></li>
      <li><a href="/waste-oil-centrifuge/" class="text-gold underline">Waste Oil Centrifuge Applications</a></li>
      <li><a href="/biodiesel-centrifuge/" class="text-gold underline">Biodiesel Production Centrifuges</a></li>
      <li><a href="/explosion-proof-centrifuge/" class="text-gold underline">Explosion-Proof Centrifuge Options</a></li>
      <li><a href="/industrial-centrifuge-sample-testing/" class="text-gold underline">Free Oil Sample Testing Program</a></li>
    </ul>
  </section>

  <!-- ── BOTTOM CTA ─────────────────────────────────────────────────────────── -->
  <section class="bg-navy text-white py-14 px-4 mt-8">
    <div class="max-w-4xl mx-auto text-center">
      <h2 class="text-3xl font-bold font-heading mb-4">Ready to Spec the DMPX-028?</h2>
      <p class="text-white/80 text-lg mb-8">
        Our engineers will verify the DMPX-028 is sized correctly for your fluid type, contamination level, and throughput requirement — or recommend the optimal model from the full DMPX series.
      </p>
      <div class="flex flex-wrap justify-center gap-4">
        <a href="/contact-for-alfa-laval-centrifuges/"
           class="bg-gold text-navy font-bold px-8 py-3 rounded hover:brightness-110 transition">
          Contact Us
        </a>
        <a href="/industrial-centrifuge-sample-testing/"
           class="border-2 border-white text-white font-bold px-8 py-3 rounded hover:bg-white hover:text-navy transition">
          Sample Testing
        </a>
      </div>
    </div>
  </section>

  <script type="application/ld+json" set:html={JSON.stringify(faqJsonLd)} />

</BaseLayout>
"""

# ─────────────────────────────────────────────────────────────────────────────
# DMPX-042
# ─────────────────────────────────────────────────────────────────────────────
DMPX_042 = r"""---
import BaseLayout from '../../layouts/BaseLayout.astro';

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "DMPX-042 Self-Cleaning 3-Phase Disc Stack Centrifuge",
  "description": "The DMPX-042 is a large self-cleaning three-phase disc stack centrifuge processing 32–47 GPM of diesel, designed for high-volume crude oil dewatering, large-scale HFO purification, industrial waste oil, and transformer oil applications.",
  "brand": { "@type": "Brand", "name": "Dolphin Centrifuge" },
  "manufacturer": { "@type": "Organization", "name": "Dolphin Centrifuge" },
  "category": "Disc Stack Centrifuges",
  "model": "DMPX-042",
  "offers": {
    "@type": "Offer",
    "availability": "https://schema.org/InStock",
    "priceCurrency": "USD",
    "seller": { "@type": "Organization", "name": "Dolphin Centrifuge" }
  }
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is the throughput of the DMPX-042 centrifuge?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The DMPX-042 processes 32–47 GPM of diesel fuel at actual operating conditions, with a rated capacity of 52–70 GPM. Lube oil (R&O) throughput is 15–24 GPM, steam turbine oil is 34–46 GPM, and HFO 380 cSt is processed at 14–18 GPM."
      }
    },
    {
      "@type": "Question",
      "name": "What industries use the DMPX-042?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The DMPX-042 is used in oil field operations for crude oil tank-bottom dewatering, large-scale biodiesel production, HFO purification at power plants and industrial boiler facilities, transformer oil purification, and high-volume industrial waste oil reclamation at manufacturing plants and fleet operations."
      }
    },
    {
      "@type": "Question",
      "name": "Is the DMPX-042 available in explosion-proof configuration?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. The DMPX-042 is available in Class I Division 1 and Class I Division 2 explosion-proof configurations for use in hazardous locations including oil fields, refineries, chemical plants, and offshore platforms. Visit our explosion-proof centrifuge page for details."
      }
    }
  ]
};
---

<BaseLayout
  title="DMPX-042 Self-Cleaning 3-Phase Disc Centrifuge | Dolphin Centrifuge"
  description="DMPX-042 self-cleaning three-phase disc centrifuge: 32–47 GPM diesel throughput. Large industrial unit for high-volume crude oil, HFO, waste oil, and lube oil separation systems."
  canonicalUrl="https://dolphincentrifuge.com/centrifuges/dmpx-042/"
  breadcrumbs={[{label: "Centrifuges", href: "/disc-stack-centrifuge/"}, {label: "DMPX-042"}]}
  jsonLd={jsonLd}
>

  <!-- ── HERO ─────────────────────────────────────────────────────────────── -->
  <section class="bg-navy text-white py-16 px-4">
    <div class="max-w-5xl mx-auto text-center">
      <h1 class="text-4xl md:text-5xl font-bold font-heading mb-4">
        DMPX-042 Self-Cleaning Disc Stack Centrifuge
      </h1>
      <p class="text-xl text-gold font-semibold mb-3">
        32–47 GPM Diesel · 1.64-Gallon Sludge Bowl · Crude Oil, HFO &amp; Industrial Waste Oil
      </p>
      <p class="text-lg text-white/80 max-w-3xl mx-auto mb-8">
        The DMPX-042 delivers high-volume three-phase separation for crude oil dewatering, large-scale HFO purification, transformer oil treatment, and industrial waste oil reclamation — all with continuous self-cleaning operation and no manual desludging downtime.
      </p>
      <div class="flex flex-wrap justify-center gap-4">
        <a href="/contact-for-alfa-laval-centrifuges/"
           class="bg-gold text-navy font-bold px-8 py-3 rounded hover:brightness-110 transition">
          Request a Quote
        </a>
        <a href="/industrial-centrifuge-sample-testing/"
           class="border-2 border-white text-white font-bold px-8 py-3 rounded hover:bg-white hover:text-navy transition">
          Submit Oil Sample
        </a>
      </div>
    </div>
  </section>

  <!-- ── AI SUMMARY CALLOUT ────────────────────────────────────────────────── -->
  <section class="max-w-5xl mx-auto my-10 px-4">
    <div class="bg-navy/5 border-l-4 border-gold rounded-r-lg p-6">
      <p class="text-base italic text-gray-700 leading-relaxed">
        <strong>AI Summary:</strong> The DMPX-042 is a large self-cleaning three-phase disc stack centrifuge from Dolphin Centrifuge, processing 32–47 GPM of diesel fuel and heavy fuel oil up to 380 cSt at 14–18 GPM. With a 1.64-gallon automatic sludge bowl, 20–25 HP motor, and continuous self-ejecting operation, it is the choice for high-volume applications: crude oil tank-bottom dewatering, large HFO power-plant fuel purification, industrial waste oil reclamation, and transformer oil restoration. Available in explosion-proof Class I Division 1 and Division 2 configurations for hazardous locations.
      </p>
    </div>
  </section>

  <!-- ── PRODUCT IMAGE ─────────────────────────────────────────────────────── -->
  <section class="max-w-5xl mx-auto px-4 mb-12 flex justify-center">
    <figure class="text-center">
      <img
        src="/images/alfa-laval-mopx-209-centrifuge/Alfa-Laval-MOPX209-Cutting-Oil-Centrifuge-300.jpg"
        alt="Dolphin Centrifuge DMPX-042 self-cleaning three-phase disc stack centrifuge"
        width="300"
        height="300"
        loading="eager"
        class="rounded-lg shadow-lg max-w-full"
      />
      <figcaption class="text-sm text-gray-500 mt-2">
        DMPX-042 — Large Self-Cleaning 3-Phase Disc Stack Centrifuge
      </figcaption>
    </figure>
  </section>

  <!-- ── SPECS TABLE ───────────────────────────────────────────────────────── -->
  <section class="max-w-5xl mx-auto px-4 mb-12">
    <h2 class="text-2xl font-bold font-heading text-navy mb-4">Technical Specifications</h2>
    <div class="overflow-x-auto">
      <table class="w-full border-collapse text-sm">
        <thead>
          <tr class="bg-navy text-white">
            <th class="px-4 py-3 text-left font-semibold">Parameter</th>
            <th class="px-4 py-3 text-left font-semibold">DMPX-042 Value</th>
          </tr>
        </thead>
        <tbody>
          <tr class="border-b border-gray-200 bg-white hover:bg-gray-50">
            <td class="px-4 py-3 font-medium text-gray-700">Diesel Throughput (Actual)</td>
            <td class="px-4 py-3 text-gray-900">~32–47 GPM</td>
          </tr>
          <tr class="border-b border-gray-200 bg-gray-50 hover:bg-gray-100">
            <td class="px-4 py-3 font-medium text-gray-700">Diesel Throughput (Rated)</td>
            <td class="px-4 py-3 text-gray-900">~52–70 GPM</td>
          </tr>
          <tr class="border-b border-gray-200 bg-white hover:bg-gray-50">
            <td class="px-4 py-3 font-medium text-gray-700">Bowl Sludge Capacity</td>
            <td class="px-4 py-3 text-gray-900">1.64–1.66 gallons</td>
          </tr>
          <tr class="border-b border-gray-200 bg-gray-50 hover:bg-gray-100">
            <td class="px-4 py-3 font-medium text-gray-700">Motor Power</td>
            <td class="px-4 py-3 text-gray-900">~20–25 HP</td>
          </tr>
          <tr class="border-b border-gray-200 bg-white hover:bg-gray-50">
            <td class="px-4 py-3 font-medium text-gray-700">Separation Type</td>
            <td class="px-4 py-3 text-gray-900">Three-phase (oil / water / solids)</td>
          </tr>
          <tr class="border-b border-gray-200 bg-gray-50 hover:bg-gray-100">
            <td class="px-4 py-3 font-medium text-gray-700">Desludging</td>
            <td class="px-4 py-3 text-gray-900">Automatic self-cleaning (hydraulic ejection)</td>
          </tr>
          <tr class="border-b border-gray-200 bg-white hover:bg-gray-50">
            <td class="px-4 py-3 font-medium text-gray-700">Process</td>
            <td class="px-4 py-3 text-gray-900">Continuous, unattended operation</td>
          </tr>
          <tr class="border-b border-gray-200 bg-gray-50 hover:bg-gray-100">
            <td class="px-4 py-3 font-medium text-gray-700">Lube Oil (R&amp;O) Throughput</td>
            <td class="px-4 py-3 text-gray-900">15–24 GPM</td>
          </tr>
          <tr class="border-b border-gray-200 bg-white hover:bg-gray-50">
            <td class="px-4 py-3 font-medium text-gray-700">Steam Turbine Oil Throughput</td>
            <td class="px-4 py-3 text-gray-900">34–46 GPM</td>
          </tr>
          <tr class="bg-gray-50 hover:bg-gray-100">
            <td class="px-4 py-3 font-medium text-gray-700">DMPX Series Position</td>
            <td class="px-4 py-3 text-gray-900">Large industrial (42 bowl equiv.)</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>

  <!-- ── CAPACITY BY FLUID TABLE ───────────────────────────────────────────── -->
  <section class="max-w-5xl mx-auto px-4 mb-12">
    <h2 class="text-2xl font-bold font-heading text-navy mb-4">Capacity by Fluid Type</h2>
    <div class="overflow-x-auto">
      <table class="w-full border-collapse text-sm">
        <thead>
          <tr class="bg-navy text-white">
            <th class="px-4 py-3 text-left font-semibold">Fluid Type</th>
            <th class="px-4 py-3 text-left font-semibold">Approx. Throughput (GPM)</th>
          </tr>
        </thead>
        <tbody>
          <tr class="border-b border-gray-200 bg-white hover:bg-gray-50">
            <td class="px-4 py-3 font-medium text-gray-700">Diesel / Light Fuel Oil</td>
            <td class="px-4 py-3 text-gray-900">32–47</td>
          </tr>
          <tr class="border-b border-gray-200 bg-gray-50 hover:bg-gray-100">
            <td class="px-4 py-3 font-medium text-gray-700">HFO 30 cSt</td>
            <td class="px-4 py-3 text-gray-900">32–44</td>
          </tr>
          <tr class="border-b border-gray-200 bg-white hover:bg-gray-50">
            <td class="px-4 py-3 font-medium text-gray-700">HFO 60 cSt</td>
            <td class="px-4 py-3 text-gray-900">24–33</td>
          </tr>
          <tr class="border-b border-gray-200 bg-gray-50 hover:bg-gray-100">
            <td class="px-4 py-3 font-medium text-gray-700">HFO 100 cSt</td>
            <td class="px-4 py-3 text-gray-900">23–32</td>
          </tr>
          <tr class="border-b border-gray-200 bg-white hover:bg-gray-50">
            <td class="px-4 py-3 font-medium text-gray-700">HFO 180 cSt</td>
            <td class="px-4 py-3 text-gray-900">16–22</td>
          </tr>
          <tr class="border-b border-gray-200 bg-gray-50 hover:bg-gray-100">
            <td class="px-4 py-3 font-medium text-gray-700">HFO 380 cSt</td>
            <td class="px-4 py-3 text-gray-900">14–18</td>
          </tr>
          <tr class="bg-white hover:bg-gray-50">
            <td class="px-4 py-3 font-medium text-gray-700">Lube Oil (R&amp;O) / Steam Turbine</td>
            <td class="px-4 py-3 text-gray-900">15–24 / 34–46 GPM</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="text-xs text-gray-500 mt-2">
      * Throughput values are at typical process temperature (194°F / 90°C). Actual flow rates vary with temperature, contamination level, and desired separation efficiency.
    </p>
  </section>

  <!-- ── APPLICATIONS GRID ─────────────────────────────────────────────────── -->
  <section class="max-w-5xl mx-auto px-4 mb-12">
    <h2 class="text-2xl font-bold font-heading text-navy mb-6">Key Applications</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="border border-gray-200 rounded-lg p-5 hover:shadow-md transition">
        <h3 class="font-bold text-navy text-lg mb-2">Crude Oil / Tank-Bottoms Dewatering</h3>
        <p class="text-gray-600 text-sm">
          The DMPX-042 handles high-volume crude oil dewatering and tank-bottom BS&amp;W (basic sediment and water) reduction at 32–47 GPM, making it suitable for oil-field gathering stations, tank farm operations, and upstream production facilities. Three-phase separation removes water and solids simultaneously in a single pass.
        </p>
      </div>
      <div class="border border-gray-200 rounded-lg p-5 hover:shadow-md transition">
        <h3 class="font-bold text-navy text-lg mb-2">Large-Scale HFO Purification</h3>
        <p class="text-gray-600 text-sm">
          For large marine vessels, shore-power plants, and industrial boiler systems burning heavy fuel oil, the DMPX-042 processes HFO 380 cSt at 14–18 GPM continuously — removing water and catalyst fines that cause injector wear, fouling, and combustion inefficiency.
        </p>
      </div>
      <div class="border border-gray-200 rounded-lg p-5 hover:shadow-md transition">
        <h3 class="font-bold text-navy text-lg mb-2">Industrial Waste Oil Processing</h3>
        <p class="text-gray-600 text-sm">
          At 32–47 GPM diesel-equivalent throughput, the DMPX-042 services large <a href="/waste-oil-centrifuge/" class="text-gold underline">waste oil</a> reclamation operations: fleet maintenance facilities, large industrial plants, and centralized waste oil collection centers processing thousands of gallons per day. Explosion-proof options available for hazardous locations.
        </p>
      </div>
      <div class="border border-gray-200 rounded-lg p-5 hover:shadow-md transition">
        <h3 class="font-bold text-navy text-lg mb-2">Transformer Oil Purification</h3>
        <p class="text-gray-600 text-sm">
          The DMPX-042 is used by utilities and industrial facilities to purify transformer oil in service, removing particulate contamination, free water, and degradation products to restore dielectric strength and extend transformer service life. Continuous processing at 15–24 GPM lube oil throughput supports large transformer maintenance programs.
        </p>
      </div>
    </div>
  </section>

  <!-- ── CROSS-MODEL COMPARISON ────────────────────────────────────────────── -->
  <section class="max-w-5xl mx-auto px-4 mb-12">
    <h2 class="text-2xl font-bold font-heading text-navy mb-4">Where the DMPX-042 Fits in the DMPX Series</h2>
    <p class="text-gray-700 leading-relaxed">
      The DMPX-042 is the second-largest model in the Dolphin DMPX range. For medium industrial applications, the
      <a href="/centrifuges/dmpx-028/" class="text-gold underline font-medium">DMPX-028</a>
      (~20–26 GPM) is the step below. For compact or portable use, the
      <a href="/dmpx-014-self-cleaning-3-phase-disc-stack-centrifuge/" class="text-gold underline font-medium">DMPX-014</a>
      (~13 GPM) and
      <a href="/centrifuges/dmpx-010/" class="text-gold underline font-medium">DMPX-010</a>
      (~7 GPM) serve smaller-scale needs. For the highest-volume industrial and power-generation applications, the
      <a href="/centrifuges/dmpx-070/" class="text-gold underline font-medium">DMPX-070</a>
      (~59–72 GPM) is the flagship model.
      All DMPX models share the same automatic self-cleaning bowl technology.
      See the full comparison at our <a href="/disc-stack-centrifuge/" class="text-gold underline font-medium">Disc Stack Centrifuge overview</a>.
    </p>
  </section>

  <!-- ── FAQ ──────────────────────────────────────────────────────────────── -->
  <section class="max-w-5xl mx-auto px-4 mb-12">
    <h2 class="text-2xl font-bold font-heading text-navy mb-6">Frequently Asked Questions</h2>
    <div class="space-y-6">
      <div class="border border-gray-200 rounded-lg p-5">
        <h3 class="font-bold text-navy text-base mb-2">What is the throughput of the DMPX-042 centrifuge?</h3>
        <p class="text-gray-700 text-sm">
          The DMPX-042 processes 32–47 GPM of diesel fuel at actual operating conditions, with a rated capacity of 52–70 GPM. Lube oil (R&amp;O) throughput is 15–24 GPM, steam turbine oil is 34–46 GPM, and HFO 380 cSt is processed at 14–18 GPM.
        </p>
      </div>
      <div class="border border-gray-200 rounded-lg p-5">
        <h3 class="font-bold text-navy text-base mb-2">What industries use the DMPX-042?</h3>
        <p class="text-gray-700 text-sm">
          The DMPX-042 is used in oil field operations for crude oil tank-bottom dewatering, large-scale <a href="/biodiesel-centrifuge/" class="text-gold underline">biodiesel</a> production, HFO purification at power plants and industrial boiler facilities, transformer oil purification, and high-volume industrial <a href="/waste-oil-centrifuge/" class="text-gold underline">waste oil</a> reclamation at manufacturing plants and fleet operations.
        </p>
      </div>
      <div class="border border-gray-200 rounded-lg p-5">
        <h3 class="font-bold text-navy text-base mb-2">Is the DMPX-042 available in explosion-proof configuration?</h3>
        <p class="text-gray-700 text-sm">
          Yes. The DMPX-042 is available in Class I Division 1 and Class I Division 2 <a href="/explosion-proof-centrifuge/" class="text-gold underline">explosion-proof</a> configurations for use in hazardous locations including oil fields, refineries, chemical plants, and offshore platforms. Contact us to discuss hazardous-area requirements.
        </p>
      </div>
    </div>
  </section>

  <!-- ── RELATED RESOURCES ─────────────────────────────────────────────────── -->
  <section class="max-w-5xl mx-auto px-4 mb-12">
    <h2 class="text-2xl font-bold font-heading text-navy mb-4">Related Resources</h2>
    <ul class="space-y-2 text-sm">
      <li><a href="/disc-stack-centrifuge/" class="text-gold underline">Disc Stack Centrifuge Overview — All DMPX Models</a></li>
      <li><a href="/centrifuges/dmpx-010/" class="text-gold underline">DMPX-010 Product Page (~7 GPM)</a></li>
      <li><a href="/dmpx-014-self-cleaning-3-phase-disc-stack-centrifuge/" class="text-gold underline">DMPX-014 Product Page (~13 GPM)</a></li>
      <li><a href="/centrifuges/dmpx-028/" class="text-gold underline">DMPX-028 Product Page (~20–26 GPM)</a></li>
      <li><a href="/centrifuges/dmpx-070/" class="text-gold underline">DMPX-070 Product Page (~59–72 GPM)</a></li>
      <li><a href="/waste-oil-centrifuge/" class="text-gold underline">Waste Oil Centrifuge Applications</a></li>
      <li><a href="/explosion-proof-centrifuge/" class="text-gold underline">Explosion-Proof Centrifuge Options</a></li>
      <li><a href="/industrial-centrifuge-sample-testing/" class="text-gold underline">Free Oil Sample Testing Program</a></li>
    </ul>
  </section>

  <!-- ── BOTTOM CTA ─────────────────────────────────────────────────────────── -->
  <section class="bg-navy text-white py-14 px-4 mt-8">
    <div class="max-w-4xl mx-auto text-center">
      <h2 class="text-3xl font-bold font-heading mb-4">Ready to Spec the DMPX-042?</h2>
      <p class="text-white/80 text-lg mb-8">
        Our engineers will confirm the DMPX-042 meets your throughput, fluid viscosity, contamination level, and hazardous-area requirements — or size you to the right DMPX model.
      </p>
      <div class="flex flex-wrap justify-center gap-4">
        <a href="/contact-for-alfa-laval-centrifuges/"
           class="bg-gold text-navy font-bold px-8 py-3 rounded hover:brightness-110 transition">
          Contact Us
        </a>
        <a href="/industrial-centrifuge-sample-testing/"
           class="border-2 border-white text-white font-bold px-8 py-3 rounded hover:bg-white hover:text-navy transition">
          Sample Testing
        </a>
      </div>
    </div>
  </section>

  <script type="application/ld+json" set:html={JSON.stringify(faqJsonLd)} />

</BaseLayout>
"""

# ─────────────────────────────────────────────────────────────────────────────
# DMPX-070
# ─────────────────────────────────────────────────────────────────────────────
DMPX_070 = r"""---
import BaseLayout from '../../layouts/BaseLayout.astro';

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "DMPX-070 Self-Cleaning 3-Phase Disc Stack Centrifuge",
  "description": "The DMPX-070 is Dolphin Centrifuge's largest self-cleaning three-phase disc stack centrifuge, processing 59–72 GPM of diesel and HFO. Designed for power plants, refineries, large marine vessels, and high-volume crude oil and waste oil systems.",
  "brand": { "@type": "Brand", "name": "Dolphin Centrifuge" },
  "manufacturer": { "@type": "Organization", "name": "Dolphin Centrifuge" },
  "category": "Disc Stack Centrifuges",
  "model": "DMPX-070",
  "offers": {
    "@type": "Offer",
    "availability": "https://schema.org/InStock",
    "priceCurrency": "USD",
    "seller": { "@type": "Organization", "name": "Dolphin Centrifuge" }
  }
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is the throughput of the DMPX-070 centrifuge?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The DMPX-070 processes 59–72 GPM of diesel fuel at actual operating conditions, with a rated capacity of 95–108 GPM under ideal low-viscosity conditions. Lube oil (R&O) throughput is 29–38 GPM and steam turbine oil is 62–70 GPM. HFO 380 cSt is processed at 25–28 GPM."
      }
    },
    {
      "@type": "Question",
      "name": "What is the DMPX-070 used for?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The DMPX-070 is used for large-scale power plant HFO and diesel fuel treatment, marine vessel main engine fuel and lube oil purification, refinery slop oil recovery and crude oil dewatering, and high-volume industrial waste oil reclamation. Its 3.65–3.96-gallon sludge bowl supports continuous operation with heavily contaminated streams."
      }
    },
    {
      "@type": "Question",
      "name": "How large is the DMPX-070 sludge bowl?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The DMPX-070 features a 3.65–3.96-gallon sludge bowl — the largest in the Dolphin DMPX series. This large bowl capacity reduces ejection frequency and supports continuous operation even with high-solids streams such as crude oil tank bottoms, heavily contaminated waste oil, and high-ash HFO."
      }
    }
  ]
};
---

<BaseLayout
  title="DMPX-070 Self-Cleaning 3-Phase Disc Centrifuge | Dolphin Centrifuge"
  description="DMPX-070 self-cleaning three-phase disc centrifuge: 59–72 GPM diesel throughput. Largest Dolphin DMPX model for power plants, refineries, and high-volume HFO and crude oil systems."
  canonicalUrl="https://dolphincentrifuge.com/centrifuges/dmpx-070/"
  breadcrumbs={[{label: "Centrifuges", href: "/disc-stack-centrifuge/"}, {label: "DMPX-070"}]}
  jsonLd={jsonLd}
>

  <!-- ── HERO ─────────────────────────────────────────────────────────────── -->
  <section class="bg-navy text-white py-16 px-4">
    <div class="max-w-5xl mx-auto text-center">
      <h1 class="text-4xl md:text-5xl font-bold font-heading mb-4">
        DMPX-070 Self-Cleaning Disc Stack Centrifuge
      </h1>
      <p class="text-xl text-gold font-semibold mb-3">
        59–72 GPM Diesel · 3.65-Gallon Sludge Bowl · Power Plants, Refineries &amp; Large Marine
      </p>
      <p class="text-lg text-white/80 max-w-3xl mx-auto mb-8">
        The DMPX-070 is Dolphin Centrifuge's flagship model — built for the highest-throughput industrial applications where continuous three-phase separation of HFO, crude oil, and waste oil must never stop. The largest bowl in the DMPX series means fewer ejections and maximum uptime in heavily contaminated service.
      </p>
      <div class="flex flex-wrap justify-center gap-4">
        <a href="/contact-for-alfa-laval-centrifuges/"
           class="bg-gold text-navy font-bold px-8 py-3 rounded hover:brightness-110 transition">
          Request a Quote
        </a>
        <a href="/industrial-centrifuge-sample-testing/"
           class="border-2 border-white text-white font-bold px-8 py-3 rounded hover:bg-white hover:text-navy transition">
          Submit Oil Sample
        </a>
      </div>
    </div>
  </section>

  <!-- ── AI SUMMARY CALLOUT ────────────────────────────────────────────────── -->
  <section class="max-w-5xl mx-auto my-10 px-4">
    <div class="bg-navy/5 border-l-4 border-gold rounded-r-lg p-6">
      <p class="text-base italic text-gray-700 leading-relaxed">
        <strong>AI Summary:</strong> The DMPX-070 is the largest model in Dolphin Centrifuge's DMPX series, rated at 59–72 GPM for diesel fuel and processing HFO 380 cSt at 25–28 GPM. With a 3.65–3.96-gallon automatic sludge bowl and 30–40 HP motor, it provides continuous three-phase separation without manual desludging — purpose-built for power-plant fuel treatment, large marine vessel HFO purification, refinery slop oil recovery, and high-volume crude oil dewatering where smaller models cannot keep pace with flow demands.
      </p>
    </div>
  </section>

  <!-- ── PRODUCT IMAGE ─────────────────────────────────────────────────────── -->
  <section class="max-w-5xl mx-auto px-4 mb-12 flex justify-center">
    <figure class="text-center">
      <img
        src="/images/alfa-laval-whpx-513/Alfa-Laval-WHPX513-Centrifuge-Skid-600.jpg"
        alt="Dolphin Centrifuge DMPX-070 self-cleaning three-phase disc stack centrifuge"
        width="600"
        height="600"
        loading="eager"
        class="rounded-lg shadow-lg max-w-full"
      />
      <figcaption class="text-sm text-gray-500 mt-2">
        DMPX-070 — Flagship Self-Cleaning 3-Phase Disc Stack Centrifuge
      </figcaption>
    </figure>
  </section>

  <!-- ── SPECS TABLE ───────────────────────────────────────────────────────── -->
  <section class="max-w-5xl mx-auto px-4 mb-12">
    <h2 class="text-2xl font-bold font-heading text-navy mb-4">Technical Specifications</h2>
    <div class="overflow-x-auto">
      <table class="w-full border-collapse text-sm">
        <thead>
          <tr class="bg-navy text-white">
            <th class="px-4 py-3 text-left font-semibold">Parameter</th>
            <th class="px-4 py-3 text-left font-semibold">DMPX-070 Value</th>
          </tr>
        </thead>
        <tbody>
          <tr class="border-b border-gray-200 bg-white hover:bg-gray-50">
            <td class="px-4 py-3 font-medium text-gray-700">Diesel Throughput (Actual)</td>
            <td class="px-4 py-3 text-gray-900">~59–72 GPM</td>
          </tr>
          <tr class="border-b border-gray-200 bg-gray-50 hover:bg-gray-100">
            <td class="px-4 py-3 font-medium text-gray-700">Diesel Throughput (Rated)</td>
            <td class="px-4 py-3 text-gray-900">~95–108 GPM</td>
          </tr>
          <tr class="border-b border-gray-200 bg-white hover:bg-gray-50">
            <td class="px-4 py-3 font-medium text-gray-700">Bowl Sludge Capacity</td>
            <td class="px-4 py-3 text-gray-900">3.65–3.96 gallons</td>
          </tr>
          <tr class="border-b border-gray-200 bg-gray-50 hover:bg-gray-100">
            <td class="px-4 py-3 font-medium text-gray-700">Motor Power</td>
            <td class="px-4 py-3 text-gray-900">~30–40 HP</td>
          </tr>
          <tr class="border-b border-gray-200 bg-white hover:bg-gray-50">
            <td class="px-4 py-3 font-medium text-gray-700">Separation Type</td>
            <td class="px-4 py-3 text-gray-900">Three-phase (oil / water / solids)</td>
          </tr>
          <tr class="border-b border-gray-200 bg-gray-50 hover:bg-gray-100">
            <td class="px-4 py-3 font-medium text-gray-700">Desludging</td>
            <td class="px-4 py-3 text-gray-900">Automatic self-cleaning (hydraulic ejection)</td>
          </tr>
          <tr class="border-b border-gray-200 bg-white hover:bg-gray-50">
            <td class="px-4 py-3 font-medium text-gray-700">Process</td>
            <td class="px-4 py-3 text-gray-900">Continuous, unattended operation</td>
          </tr>
          <tr class="border-b border-gray-200 bg-gray-50 hover:bg-gray-100">
            <td class="px-4 py-3 font-medium text-gray-700">Lube Oil (R&amp;O) Throughput</td>
            <td class="px-4 py-3 text-gray-900">29–38 GPM</td>
          </tr>
          <tr class="border-b border-gray-200 bg-white hover:bg-gray-50">
            <td class="px-4 py-3 font-medium text-gray-700">Steam Turbine Oil Throughput</td>
            <td class="px-4 py-3 text-gray-900">62–70 GPM</td>
          </tr>
          <tr class="bg-gray-50 hover:bg-gray-100">
            <td class="px-4 py-3 font-medium text-gray-700">DMPX Series Position</td>
            <td class="px-4 py-3 text-gray-900">Flagship / Largest (70 bowl equiv.)</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>

  <!-- ── CAPACITY BY FLUID TABLE ───────────────────────────────────────────── -->
  <section class="max-w-5xl mx-auto px-4 mb-12">
    <h2 class="text-2xl font-bold font-heading text-navy mb-4">Capacity by Fluid Type</h2>
    <div class="overflow-x-auto">
      <table class="w-full border-collapse text-sm">
        <thead>
          <tr class="bg-navy text-white">
            <th class="px-4 py-3 text-left font-semibold">Fluid Type</th>
            <th class="px-4 py-3 text-left font-semibold">Approx. Throughput (GPM)</th>
          </tr>
        </thead>
        <tbody>
          <tr class="border-b border-gray-200 bg-white hover:bg-gray-50">
            <td class="px-4 py-3 font-medium text-gray-700">Diesel / Light Fuel Oil</td>
            <td class="px-4 py-3 text-gray-900">59–72</td>
          </tr>
          <tr class="border-b border-gray-200 bg-gray-50 hover:bg-gray-100">
            <td class="px-4 py-3 font-medium text-gray-700">HFO 30 cSt</td>
            <td class="px-4 py-3 text-gray-900">59–67</td>
          </tr>
          <tr class="border-b border-gray-200 bg-white hover:bg-gray-50">
            <td class="px-4 py-3 font-medium text-gray-700">HFO 60 cSt</td>
            <td class="px-4 py-3 text-gray-900">45–51</td>
          </tr>
          <tr class="border-b border-gray-200 bg-gray-50 hover:bg-gray-100">
            <td class="px-4 py-3 font-medium text-gray-700">HFO 100 cSt</td>
            <td class="px-4 py-3 text-gray-900">43–49</td>
          </tr>
          <tr class="border-b border-gray-200 bg-white hover:bg-gray-50">
            <td class="px-4 py-3 font-medium text-gray-700">HFO 180 cSt</td>
            <td class="px-4 py-3 text-gray-900">30–34</td>
          </tr>
          <tr class="border-b border-gray-200 bg-gray-50 hover:bg-gray-100">
            <td class="px-4 py-3 font-medium text-gray-700">HFO 380 cSt</td>
            <td class="px-4 py-3 text-gray-900">25–28</td>
          </tr>
          <tr class="bg-white hover:bg-gray-50">
            <td class="px-4 py-3 font-medium text-gray-700">Lube Oil (R&amp;O) / Steam Turbine</td>
            <td class="px-4 py-3 text-gray-900">29–38 / 62–70 GPM</td>
          </tr>
        </tbody>
      </table>
    </div>
    <p class="text-xs text-gray-500 mt-2">
      * Throughput values are at typical process temperature (194°F / 90°C). Actual flow rates vary with temperature, contamination level, and desired separation efficiency.
    </p>
  </section>

  <!-- ── APPLICATIONS GRID ─────────────────────────────────────────────────── -->
  <section class="max-w-5xl mx-auto px-4 mb-12">
    <h2 class="text-2xl font-bold font-heading text-navy mb-6">Key Applications</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="border border-gray-200 rounded-lg p-5 hover:shadow-md transition">
        <h3 class="font-bold text-navy text-lg mb-2">Power Plant HFO &amp; Fuel Treatment</h3>
        <p class="text-gray-600 text-sm">
          Large diesel and HFO-fired power plants require continuous fuel purification to protect injectors and combustion systems. The DMPX-070 processes HFO at up to 59–67 GPM (30 cSt) and 25–28 GPM (380 cSt), handling the full fuel delivery needs of multi-megawatt generation facilities around the clock.
        </p>
      </div>
      <div class="border border-gray-200 rounded-lg p-5 hover:shadow-md transition">
        <h3 class="font-bold text-navy text-lg mb-2">Marine Vessel Fuel &amp; Oil Systems</h3>
        <p class="text-gray-600 text-sm">
          On large commercial vessels, bulk carriers, tankers, and cruise ships, the DMPX-070 handles main engine HFO purification and lube oil treatment simultaneously. At 29–38 GPM lube oil throughput and up to 72 GPM diesel throughput, it meets the demanding fuel and oil requirements of large-bore marine diesel and gas turbine engines.
        </p>
      </div>
      <div class="border border-gray-200 rounded-lg p-5 hover:shadow-md transition">
        <h3 class="font-bold text-navy text-lg mb-2">Refinery Slop Oil Recovery</h3>
        <p class="text-gray-600 text-sm">
          Refineries generate significant volumes of slop oil — mixed hydrocarbon streams contaminated with water and sediment. The DMPX-070 recovers this product-quality oil at high throughput, reducing refinery waste, improving yields, and minimizing environmental liability from contaminated oil disposal. See our <a href="/waste-oil-centrifuge/" class="text-gold underline">waste oil centrifuge</a> page for more on oil recovery applications.
        </p>
      </div>
      <div class="border border-gray-200 rounded-lg p-5 hover:shadow-md transition">
        <h3 class="font-bold text-navy text-lg mb-2">Large-Volume Crude Oil BS&amp;W Reduction</h3>
        <p class="text-gray-600 text-sm">
          For upstream production operations, gathering stations, and crude oil pipelines requiring BS&amp;W (basic sediment and water) reduction ahead of custody transfer or pipeline specification compliance, the DMPX-070 delivers the throughput needed to process high-volume crude streams — up to 95–108 GPM rated — continuously and without manual intervention.
        </p>
      </div>
    </div>
  </section>

  <!-- ── CROSS-MODEL COMPARISON ────────────────────────────────────────────── -->
  <section class="max-w-5xl mx-auto px-4 mb-12">
    <h2 class="text-2xl font-bold font-heading text-navy mb-4">The DMPX-070 as the Dolphin Series Flagship</h2>
    <p class="text-gray-700 leading-relaxed">
      The DMPX-070 is the largest model in the Dolphin DMPX range, delivering the highest throughput for the most demanding industrial applications. For applications requiring somewhat lower flow rates, the
      <a href="/centrifuges/dmpx-042/" class="text-gold underline font-medium">DMPX-042</a>
      (~32–47 GPM) provides a cost-effective alternative. Mid-range applications are served by the
      <a href="/centrifuges/dmpx-028/" class="text-gold underline font-medium">DMPX-028</a>
      (~20–26 GPM), while compact installations use the
      <a href="/dmpx-014-self-cleaning-3-phase-disc-stack-centrifuge/" class="text-gold underline font-medium">DMPX-014</a>
      (~13 GPM) or
      <a href="/centrifuges/dmpx-010/" class="text-gold underline font-medium">DMPX-010</a>
      (~7 GPM).
      All DMPX models share the same automatic self-cleaning bowl design and continuous three-phase separation capability.
      Visit our <a href="/disc-stack-centrifuge/" class="text-gold underline font-medium">Disc Stack Centrifuge overview</a> for a full model comparison.
    </p>
  </section>

  <!-- ── FAQ ──────────────────────────────────────────────────────────────── -->
  <section class="max-w-5xl mx-auto px-4 mb-12">
    <h2 class="text-2xl font-bold font-heading text-navy mb-6">Frequently Asked Questions</h2>
    <div class="space-y-6">
      <div class="border border-gray-200 rounded-lg p-5">
        <h3 class="font-bold text-navy text-base mb-2">What is the throughput of the DMPX-070 centrifuge?</h3>
        <p class="text-gray-700 text-sm">
          The DMPX-070 processes 59–72 GPM of diesel fuel at actual operating conditions, with a rated capacity of 95–108 GPM under ideal low-viscosity conditions. Lube oil (R&amp;O) throughput is 29–38 GPM and steam turbine oil is 62–70 GPM. HFO 380 cSt is processed at 25–28 GPM.
        </p>
      </div>
      <div class="border border-gray-200 rounded-lg p-5">
        <h3 class="font-bold text-navy text-base mb-2">What is the DMPX-070 used for?</h3>
        <p class="text-gray-700 text-sm">
          The DMPX-070 is used for large-scale power plant HFO and <a href="/diesel-centrifuge/" class="text-gold underline">diesel</a> fuel treatment, marine vessel main engine fuel and lube oil purification, refinery slop oil recovery and crude oil dewatering, and high-volume industrial <a href="/waste-oil-centrifuge/" class="text-gold underline">waste oil</a> reclamation. Its 3.65–3.96-gallon sludge bowl supports continuous operation even with heavily contaminated streams.
        </p>
      </div>
      <div class="border border-gray-200 rounded-lg p-5">
        <h3 class="font-bold text-navy text-base mb-2">How large is the DMPX-070 sludge bowl?</h3>
        <p class="text-gray-700 text-sm">
          The DMPX-070 features a 3.65–3.96-gallon sludge bowl — the largest in the Dolphin DMPX series. This large bowl capacity reduces ejection frequency and supports continuous operation even with high-solids streams such as crude oil tank bottoms, heavily contaminated waste oil, and high-ash HFO.
        </p>
      </div>
    </div>
  </section>

  <!-- ── RELATED RESOURCES ─────────────────────────────────────────────────── -->
  <section class="max-w-5xl mx-auto px-4 mb-12">
    <h2 class="text-2xl font-bold font-heading text-navy mb-4">Related Resources</h2>
    <ul class="space-y-2 text-sm">
      <li><a href="/disc-stack-centrifuge/" class="text-gold underline">Disc Stack Centrifuge Overview — All DMPX Models</a></li>
      <li><a href="/centrifuges/dmpx-010/" class="text-gold underline">DMPX-010 Product Page (~7 GPM)</a></li>
      <li><a href="/dmpx-014-self-cleaning-3-phase-disc-stack-centrifuge/" class="text-gold underline">DMPX-014 Product Page (~13 GPM)</a></li>
      <li><a href="/centrifuges/dmpx-028/" class="text-gold underline">DMPX-028 Product Page (~20–26 GPM)</a></li>
      <li><a href="/centrifuges/dmpx-042/" class="text-gold underline">DMPX-042 Product Page (~32–47 GPM)</a></li>
      <li><a href="/waste-oil-centrifuge/" class="text-gold underline">Waste Oil Centrifuge Applications</a></li>
      <li><a href="/diesel-centrifuge/" class="text-gold underline">Diesel Fuel Polishing Centrifuges</a></li>
      <li><a href="/explosion-proof-centrifuge/" class="text-gold underline">Explosion-Proof Centrifuge Options</a></li>
      <li><a href="/industrial-centrifuge-sample-testing/" class="text-gold underline">Free Oil Sample Testing Program</a></li>
    </ul>
  </section>

  <!-- ── BOTTOM CTA ─────────────────────────────────────────────────────────── -->
  <section class="bg-navy text-white py-14 px-4 mt-8">
    <div class="max-w-4xl mx-auto text-center">
      <h2 class="text-3xl font-bold font-heading mb-4">Ready to Spec the DMPX-070?</h2>
      <p class="text-white/80 text-lg mb-8">
        For the highest-volume industrial oil-separation requirements, our engineers will validate the DMPX-070 against your exact fluid, flow, contamination, and installation specifications.
      </p>
      <div class="flex flex-wrap justify-center gap-4">
        <a href="/contact-for-alfa-laval-centrifuges/"
           class="bg-gold text-navy font-bold px-8 py-3 rounded hover:brightness-110 transition">
          Contact Us
        </a>
        <a href="/industrial-centrifuge-sample-testing/"
           class="border-2 border-white text-white font-bold px-8 py-3 rounded hover:bg-white hover:text-navy transition">
          Sample Testing
        </a>
      </div>
    </div>
  </section>

  <script type="application/ld+json" set:html={JSON.stringify(faqJsonLd)} />

</BaseLayout>
"""

# ─────────────────────────────────────────────────────────────────────────────
# Write files
# ─────────────────────────────────────────────────────────────────────────────
files = {
    "dmpx-010.astro": DMPX_010,
    "dmpx-028.astro": DMPX_028,
    "dmpx-042.astro": DMPX_042,
    "dmpx-070.astro": DMPX_070,
}

for filename, content in files.items():
    path = BASE + filename
    with open(path, "w", encoding="utf-8") as f:
        f.write(content.lstrip("\n"))
    size = os.path.getsize(path)
    print(f"Written: {path}  ({size:,} bytes)")

print("\nAll 4 files written successfully.")
