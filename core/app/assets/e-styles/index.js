import themeColorsMap from './_maps/colors/theme-colors';
import tintsMap from './_maps/colors/tints';
import darkTintsMap from './_maps/colors/dark-tints';

import breakpointsMap from './_maps/breakpoints/breakpoints.js';

import spacingMap from './_maps/spacing/spacing';

import headingMap from './_maps/typography/heading';
import textMap from './_maps/typography/text';
import lineHeightMap from './_maps/typography/line-height';
import sizeMap from './_maps/typography/size';

import fontWeightMap from './_maps/font/font-weight';

export const themeColors = ( key ) => themeColorsMap[ key ].hex;
export const tints = ( key ) => tintsMap[ key ].hex;
export const darkTints = ( key ) => darkTintsMap[ key ].hex;

export const breakpoints = ( key ) => breakpointsMap[ key ];

export const spacing = ( key ) => spacingMap[ key ];

export const heading = ( key ) => headingMap[ key ];
export const text = ( key ) => textMap[ key ];
export const lineHeight = ( key ) => lineHeightMap[ key ];
export const size = ( key ) => sizeMap[ key ];

export const fontWeight = ( key ) => fontWeightMap[ key ];
