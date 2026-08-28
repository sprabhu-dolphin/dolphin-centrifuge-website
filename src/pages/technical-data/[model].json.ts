import { technicalCatalog } from '../../data/centrifugeTechnicalRegistry.mjs';

export const prerender = true;

export function getStaticPaths() {
  return technicalCatalog.models.map((model) => ({
    params: { model: model.id },
    props: { model },
  }));
}

export function GET({ props }: { props: { model: (typeof technicalCatalog.models)[number] } }) {
  const payload = {
    schemaVersion: technicalCatalog.schemaVersion,
    catalog: technicalCatalog.catalogId,
    lastReviewed: technicalCatalog.lastReviewed,
    reviewedBy: technicalCatalog.reviewedBy,
    methodology: technicalCatalog.methodology,
    model: props.model,
  };

  return new Response(JSON.stringify(payload, null, 2), {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
