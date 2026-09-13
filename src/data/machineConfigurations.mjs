// Primary-source variants. These are OEM configurations, not installed skid inventories.
export const configurationSources = {
  'alfa-laval-mab-104': {
    machineType: 'MAB 104B-14/24', productNumber: '881241-08-17',
    sourceUrl: 'https://assets.alfalaval.com/documents/p884593f9/alfa-laval-mab-104-881241-08-17-rev3.pdf',
    location: 'Page 136, section 8.2, Alfa Laval ref. 558168 rev. 2; product identity page 133',
    sha256: 'd305b550533f2d4aea0f900e148130a8684b139c2d4ff58234674bbbcdfcac50',
    reviewedOn: '2026-09-13', evidenceClass: 'public-oem-manual',
    motorKw: {withoutPump: 1.1, withPump: 1.5},
    bowlSpeedByFrequency: [{frequencyHz: 50, value: 7500, unit: 'RPM'}, {frequencyHz: 60, value: 7350, unit: 'RPM'}],
    separatorWeight: {value: 149, unit: 'kg', scope: 'separator without motor; not a skid shipping weight'},
  },
  'alfa-laval-mab-206': {
    machineType: 'MAB 206S-24', productNumber: '881240-22-15',
    sourceUrl: 'https://assets.alfalaval.com/documents/pc904f98d/alfa-laval-mab-206-881240-22-15-rev2.pdf',
    location: 'Page 159, section 8.2, Alfa Laval ref. 557968 rev. 3; product identity page 156',
    sha256: 'eb3862f0155f5dbbb51d42d12a6e1987342e140cd48f859757997bdfdc72aec7',
    reviewedOn: '2026-09-13', evidenceClass: 'public-oem-manual',
    motorKw: {withoutPump: 5.5, withPump: [11, 13]},
    separatorWeight: {value: 334, unit: 'kg', scope: 'separator without motor; not a skid shipping weight'},
  },
};

export function machineConfigurations(modelId) {
  const source = configurationSources[modelId];
  if (!source) return [];
  return ['withoutPump', 'withPump'].map(pump => {
    const kw = source.motorKw[pump];
    return {
      id: `${modelId}-${pump === 'withPump' ? 'with' : 'without'}-oem-pump`,
      machineType: source.machineType, productNumber: source.productNumber,
      pumpConfiguration: pump === 'withPump' ? 'with OEM pump' : 'without OEM pump',
      motorPower: {...(Array.isArray(kw) ? {minimum: kw[0], maximum: kw[1]} : {value: kw}), unit: 'kW',
        scope: 'OEM manual motor rating for this pump arrangement; not total skid load',
        ...(modelId.endsWith('206') ? {ratingBasis: 'OEM recommended motor power'} : {})},
      ...(source.bowlSpeedByFrequency ? {bowlSpeedByFrequency: source.bowlSpeedByFrequency} : {}),
      separatorWeight: source.separatorWeight,
      sourceUrl: source.sourceUrl, location: source.location, reviewedOn: source.reviewedOn,
      qualification: 'Match machine type, product number and installed nameplate. A separate skid feed-pump motor is not the same as this OEM pump arrangement. OEM kW is not rounded nominal HP.',
    };
  });
}
