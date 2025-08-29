
export interface GPXPoint {
  lat: number;
  lon: number;
}

export function parseGPX(gpxSource: any): GPXPoint[] {
  const points: GPXPoint[] = [];
  
  try {
    // Handle different types of GPX sources
    let gpxContent: string;
    
    if (typeof gpxSource === 'string') {
      gpxContent = gpxSource;
    } else if (gpxSource && gpxSource.default) {
      // Handle require() imports
      gpxContent = gpxSource.default;
    } else {
      console.error('Invalid GPX source format');
      return points;
    }
    
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
  } catch (error) {
    console.error('Error parsing GPX:', error);
  }
  
  return points;
}
