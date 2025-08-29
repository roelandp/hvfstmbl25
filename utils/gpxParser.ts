
export interface GPXPoint {
  lat: number;
  lon: number;
}

export function parseGPX(gpxContent: string): GPXPoint[] {
  const points: GPXPoint[] = [];
  
  // Parse GPX content using regex to extract track points
  const trkptRegex = /<trkpt[^>]*lat="([^"]*)"[^>]*lon="([^"]*)"/g;
  let match;
  
  while ((match = trkptRegex.exec(gpxContent)) !== null) {
    const lat = parseFloat(match[1]);
    const lon = parseFloat(match[2]);
    
    if (!isNaN(lat) && !isNaN(lon)) {
      points.push({ lat, lon });
    }
  }
  
  return points;
}
