import { createEyepieceCalc } from './eyepiece.js';
import { createTelescopeCalc } from './telescope.js';
import { createImagingCalc } from './imaging.js';
import { createLunarCalc } from './lunar.js';
import { createExposureCalc } from './exposure.js';
import { createConversionsCalc } from './conversions.js';

export function createCalculator(isNightMode) {
    const container = document.createElement('div');
    container.className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-stretch";

    container.appendChild(createTelescopeCalc(isNightMode));
    container.appendChild(createEyepieceCalc(isNightMode));
    container.appendChild(createImagingCalc(isNightMode));
    container.appendChild(createLunarCalc(isNightMode));
    container.appendChild(createExposureCalc(isNightMode));
    container.appendChild(createConversionsCalc(isNightMode));

    return container;
}
