
export interface LocationData {
  latitude: number;
  longitude: number;
}

export interface Telescope {
  id: string;
  name: string;
  aperture: number;
  focalLength: number;
}

export interface Eyepiece {
  id: string;
  name: string;
  focalLength: number;
  afov: number;
}

export interface Camera {
  id: string;
  name: string;
  sensorWidth: number;
  sensorHeight: number;
  pixelSize: number;
  cropFactor?: number;
}

export interface AstroObject {
  id: string;
  name: string;
  type: string;
  constellation: string;
  ra: number; // Right Ascension in decimal hours
  dec: number; // Declination in decimal degrees
  magnitude: number;
  distance_ly: number | null;
  size_arcmin: number | null;
  description: string;
  catalog?: 'Messier' | 'Caldwell' | 'NGC' | 'Herschel 400';
}

export interface Planet {
    id: string;
    name: string;
    description: string;
    // Note: a full implementation would require orbital elements to calculate position
}
