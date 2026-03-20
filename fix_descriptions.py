"""Fix meta descriptions that are over 165 chars."""
import re

fixes = {
    "src/pages/knowledge-center.astro": (
        'const description = "Expert guides, troubleshooting tips, technical comparisons, and case studies for industrial disc stack and decanter centrifuges. 40+ years of centrifuge expertise from Dolphin Centrifuge.";',
        'const description = "Industrial centrifuge knowledge center: troubleshooting guides, technical comparisons, and case studies from Dolphin Centrifuge. 40+ years of expertise.";'
    ),
    "src/pages/knowledge-troubleshooting.astro": (
        "const description = \"Expert troubleshooting guides for disc stack and decanter centrifuge problems. Vibration, leaking bowls, bad separation, speed issues, and more \u2014 with step-by-step solutions.\";",
        'const description = "Centrifuge troubleshooting guides: fix vibration, leaking bowls, poor separation, and speed issues in disc stack and decanter centrifuges. Step-by-step solutions.";'
    ),
    "src/pages/knowledge-product-brand.astro": (
        'const description = "Detailed information about industrial centrifuge equipment, accessories, parts, and brand-specific resources. Alfa Laval centrifuge overviews, disc stack parts, and accessory guides.";',
        'const description = "Alfa Laval centrifuge product brand guide: disc stack models, parts reference, accessories, and specifications. Expert resources from Dolphin Centrifuge.";'
    ),
    "src/pages/applications/fuels.astro": (
        'const description = "Industrial centrifuge systems for diesel fuel, heavy fuel oil, and bunker fuel purification. Remove water, particulates, cat fines, and asphaltenes for reliable fuel quality.";',
        'const description = "Centrifuge systems for diesel, HFO, and bunker fuel purification. Remove water, particulates, cat fines, and asphaltenes for reliable fuel quality. Request a quote.";'
    ),
    "src/pages/applications/water-based-fluids.astro": (
        'const description = "Industrial centrifuge systems for machining coolant recovery, parts washer fluid recycling, and water-based industrial fluid purification. Proven solutions from Dolphin Centrifuge.";',
        'const description = "Industrial centrifuge systems for machining coolant recovery and parts washer fluid recycling. Water-based fluid purification solutions from Dolphin Centrifuge.";'
    ),
    "src/pages/applications/wastewater.astro": (
        'const description = "Industrial centrifuge systems for wastewater treatment, algae harvesting, manure separation, humus processing, and biodiesel production. Proven solutions from Dolphin Centrifuge.";',
        'const description = "Disc stack and decanter centrifuge systems for wastewater treatment, algae, manure, and biodiesel applications. Proven solutions from Dolphin Centrifuge.";'
    ),
    "src/pages/applications/used-motor-oil.astro": (
        'const description = "Industrial centrifuge systems for waste oil recovery, used oil re-refining, black diesel cleaning, and general oil purification. Proven solutions from Dolphin Centrifuge.";',
        'const description = "Centrifuge systems for waste oil recovery, used oil re-refining, and black diesel cleaning. Industrial oil purification solutions from Dolphin Centrifuge.";'
    ),
    "src/pages/applications/oil-based-fluids.astro": (
        'const description = "Industrial centrifuge solutions for cutting oils, quench oils, and metalworking fluids. Remove swarf, scale, and moisture to extend fluid life and improve part quality.";',
        'const description = "Centrifuge solutions for cutting oils, quench oils, and metalworking fluids. Remove swarf, scale, and moisture to extend fluid life and improve part quality.";'
    ),
    "src/pages/applications/industrial-oils.astro": (
        'const description = "Centrifuge systems for lube oil, hydraulic oil, and industrial lubricant purification. Extend oil life, maintain ISO cleanliness codes, and reduce unplanned downtime.";',
        'const description = "Centrifuge systems for lube oil, hydraulic oil, and lubricant purification. Extend oil life, maintain ISO cleanliness codes, and reduce unplanned downtime.";'
    ),
}

baselayout_fixes = {
    "src/pages/centrifuges/dmpx-028.astro": (
        "description=\"DMPX-028 self-cleaning three-phase disc stack centrifuge: 20\u201326 GPM diesel throughput. Mid-range industrial centrifuge for waste oil, HFO purification, biodiesel, and lube oil applications.\"",
        "description=\"DMPX-028 self-cleaning disc stack centrifuge: 20\u201326 GPM diesel. Mid-range unit for waste oil, HFO purification, biodiesel, and lube oil applications. Get a quote.\""
    ),
    "src/pages/centrifuges/dmb-062.astro": (
        "description=\"Dolphin DMB-062 manual-clean disc stack centrifuge. 62 GPM diesel, 92 GPM rated. Dolphin's largest manual-clean clarifier for major turbine lube oil and high-volume industrial applications.\"",
        "description=\"Dolphin DMB-062 manual-clean disc stack centrifuge: 62 GPM diesel, 92 GPM rated. Largest DMB model for high-volume turbine lube oil and industrial fluid clarification.\""
    ),
    "src/pages/centrifuges/dmb-028.astro": (
        "description=\"Dolphin DMB-028 manual-clean disc stack centrifuge. 28 GPM diesel, 7.5 HP, 42 GPM rated. High-capacity manual clarifier for large turbine lube oil and industrial fluid applications.\"",
        "description=\"Dolphin DMB-028 manual-clean disc stack centrifuge: 28 GPM diesel, 7.5 HP, 42 GPM rated. High-capacity clarifier for turbine lube oil and industrial fluid purification.\""
    ),
    "src/pages/centrifuges/dmpx-070.astro": (
        "description=\"DMPX-070 self-cleaning three-phase disc centrifuge: 59\u201372 GPM diesel throughput. Largest Dolphin DMPX model for power plants, refineries, and high-volume HFO and crude oil systems.\"",
        "description=\"DMPX-070 self-cleaning disc centrifuge: 59\u201372 GPM diesel. Largest Dolphin DMPX model for power plants, refineries, and high-volume HFO and crude oil processing.\""
    ),
    "src/pages/centrifuges/dmpx-042.astro": (
        "description=\"DMPX-042 self-cleaning three-phase disc centrifuge: 32\u201347 GPM diesel throughput. Large industrial unit for high-volume crude oil, HFO, waste oil, and lube oil separation systems.\"",
        "description=\"DMPX-042 self-cleaning disc centrifuge: 32\u201347 GPM diesel. Large industrial unit for crude oil, HFO, waste oil, and lube oil separation. Multiple flow rates available.\""
    ),
    "src/pages/centrifuges/dmb-004.astro": (
        "description=\"Dolphin DMB-004 manual-clean disc stack centrifuge. 4 GPM diesel, 1 HP, 8,600 RPM. Compact and cost-effective for turbine lube oil, diesel polishing, and low-volume applications.\"",
        "description=\"Dolphin DMB-004 manual-clean disc stack centrifuge: 4 GPM diesel, 1 HP, 8,600 RPM. Compact and cost-effective for turbine lube oil, diesel polishing, and small-scale use.\""
    ),
    "src/pages/centrifuges/dmb-007.astro": (
        "description=\"Dolphin DMB-007 manual-clean disc stack centrifuge. 7 GPM diesel, 1\u20132 HP, 8,600 RPM. Cost-effective for turbine lube oil, diesel polishing, and low-volume industrial separation.\"",
        "description=\"Dolphin DMB-007 manual-clean disc stack centrifuge: 7 GPM diesel, 1\u20132 HP, 8,600 RPM. Cost-effective for turbine lube oil, diesel polishing, and light industrial use.\""
    ),
    "src/pages/centrifuges/dmb-013.astro": (
        "description=\"Dolphin DMB-013 manual-clean disc stack centrifuge. 13 GPM diesel, 19 GPM rated. Mid-range clarifier for turbine lube oil, diesel polishing, and industrial fluid purification.\"",
        "description=\"Dolphin DMB-013 manual-clean disc stack centrifuge: 13 GPM diesel, 19 GPM rated. Mid-range clarifier for turbine lube oil, diesel polishing, and fluid purification.\""
    ),
    "src/pages/centrifuges/dmb-037.astro": (
        "description=\"Dolphin DMB-037 manual-clean disc stack centrifuge. 37 GPM diesel, 55 GPM rated. Extra-high-capacity clarifier for large turbine lube oil and industrial fluid purification.\"",
        "description=\"Dolphin DMB-037 manual-clean disc stack centrifuge: 37 GPM diesel, 55 GPM rated. High-capacity clarifier for large turbine lube oil and industrial fluid purification.\""
    ),
    "src/pages/centrifuges/dmpx-010.astro": (
        "description=\"DMPX-010 compact self-cleaning disc centrifuge: ~7 GPM diesel throughput. Smallest bowl in the Dolphin DMPX series for marine, remote site, and small-scale oil separation.\"",
        "description=\"DMPX-010 compact self-cleaning disc centrifuge: ~7 GPM diesel. Smallest Dolphin DMPX model for marine, remote sites, and small-scale oil separation. Quote today.\""
    ),
}

all_fixes = {**fixes, **baselayout_fixes}

for filepath, (old, new) in all_fixes.items():
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        if old in content:
            content = content.replace(old, new)
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            # Extract the description string to measure its length
            import re as re2
            m = re2.search(r'"(.*?)"', new)
            desc_len = len(m.group(1)) if m else '?'
            print(f"FIXED ({desc_len} chars): {filepath}")
        else:
            print(f"NOT FOUND: {filepath}")
            print(f"  Looking for: {old[:80]}...")
    except Exception as e:
        print(f"ERROR {filepath}: {e}")
