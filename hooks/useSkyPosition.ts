
import { useState, useEffect } from 'react';
import { LocationData } from '../types';

const DEGREES_TO_RADIANS = Math.PI / 180;
const RADIANS_TO_DEGREES = 180 / Math.PI;

export const useSkyPosition = (ra: number | null, dec: number | null, location: LocationData | null) => {
    const [position, setPosition] = useState<{ alt: number | null; az: number | null }>({ alt: null, az: null });

    useEffect(() => {
        if (ra === null || dec === null || !location) {
            setPosition({ alt: null, az: null });
            return;
        }

        const calculatePosition = () => {
            const now = new Date();
            const longitude = location.longitude;
            const latitude = location.latitude;

            // 1. Calculate days from J2000.0
            const j2000 = new Date(Date.UTC(2000, 0, 1, 12, 0, 0));
            const diff = now.getTime() - j2000.getTime();
            const d = diff / (1000 * 60 * 60 * 24);

            // 2. Calculate Local Sidereal Time (LST)
            const ut = now.getUTCHours() + now.getUTCMinutes() / 60 + now.getUTCSeconds() / 3600;
            const gmst = 18.697374558 + 24.06570982441908 * d;
            const lst_hours = (gmst + ut + longitude / 15) % 24;
            const lst_degrees = lst_hours * 15;

            // 3. Calculate Hour Angle (HA)
            const ra_degrees = ra * 15;
            let ha_degrees = lst_degrees - ra_degrees;
            if (ha_degrees < 0) ha_degrees += 360;

            // 4. Convert to Altitude/Azimuth
            const lat_rad = latitude * DEGREES_TO_RADIANS;
            const dec_rad = dec * DEGREES_TO_RADIANS;
            const ha_rad = ha_degrees * DEGREES_TO_RADIANS;

            const sin_alt = Math.sin(dec_rad) * Math.sin(lat_rad) + Math.cos(dec_rad) * Math.cos(lat_rad) * Math.cos(ha_rad);
            const alt_rad = Math.asin(sin_alt);
            const alt_deg = alt_rad * RADIANS_TO_DEGREES;

            const cos_az = (Math.sin(dec_rad) - Math.sin(alt_rad) * Math.sin(lat_rad)) / (Math.cos(alt_rad) * Math.cos(lat_rad));
            const az_rad = Math.acos(cos_az);
            let az_deg = az_rad * RADIANS_TO_DEGREES;
            
            if (Math.sin(ha_rad) > 0) {
                az_deg = 360 - az_deg;
            }

            setPosition({ alt: alt_deg, az: az_deg });
        };
        
        calculatePosition();
        const interval = setInterval(calculatePosition, 60000); // Recalculate every minute

        return () => clearInterval(interval);

    }, [ra, dec, location]);

    return position;
};
