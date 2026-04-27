import * as fs from 'fs';
import * as path from 'path';

type Device = 'mobile' | 'mobile_extra' | 'tablet' | 'tablet_extra' | 'laptop' | 'desktop' | 'widescreen';

const CLASS_COUNT = 2000;
const BASIC_BREAKPOINTS: Device[] = [ 'desktop', 'tablet', 'mobile' ];
const ALL_BREAKPOINTS: Device[] = [ 'widescreen', 'desktop', 'tablet', 'mobile', 'widescreen', 'laptop', 'tablet_extra', 'mobile_extra' ];
const STATES = [ 'normal', 'hover', 'focus', 'active' ] as const;

const USE_ALL_BREAKPOINTS = true;
const BREAKPOINTS = USE_ALL_BREAKPOINTS ? ALL_BREAKPOINTS : BASIC_BREAKPOINTS;

const COLORS = [ '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080' ];

type GlobalClassVariant = {
	meta: { breakpoint: string | null; state: string | null };
	props: Record<string, unknown>;
	custom_css: null;
};

type GlobalClassItem = {
	id: string;
	type: 'class';
	label: string;
	variants: GlobalClassVariant[];
};

function buildBloatedVariant( classIndex: number, breakpoint: Device = 'desktop', state: string ): GlobalClassVariant {
	const baseValue = ( classIndex * 10 ) + BREAKPOINTS.indexOf( breakpoint ) + STATES.indexOf( state as typeof STATES[number] );

	return {
		meta: {
			breakpoint,
			state: 'normal' === state ? null : state,
		},
		props: {
			width: { $$type: 'size', value: { size: baseValue + 100, unit: 'px' } },
			height: { $$type: 'size', value: { size: baseValue + 50, unit: 'px' } },
			'min-width': { $$type: 'size', value: { size: baseValue + 10, unit: 'px' } },
			'min-height': { $$type: 'size', value: { size: baseValue + 5, unit: 'px' } },
			'max-width': { $$type: 'size', value: { size: baseValue + 500, unit: 'px' } },
			'max-height': { $$type: 'size', value: { size: baseValue + 400, unit: 'px' } },
			'font-size': { $$type: 'size', value: { size: baseValue + 12, unit: 'px' } },
			'letter-spacing': { $$type: 'size', value: { size: ( baseValue % 10 ) + 1, unit: 'px' } },
			'word-spacing': { $$type: 'size', value: { size: ( baseValue % 5 ) + 1, unit: 'px' } },
			'line-height': { $$type: 'size', value: { size: baseValue + 20, unit: 'px' } },
			color: { $$type: 'color', value: COLORS[ baseValue % COLORS.length ] },
			'background-color': { $$type: 'color', value: COLORS[ ( baseValue + 5 ) % COLORS.length ] },
			'border-width': { $$type: 'size', value: { size: ( baseValue % 10 ) + 1, unit: 'px' } },
			'border-radius': { $$type: 'size', value: { size: ( baseValue % 20 ) + 5, unit: 'px' } },
			'border-color': { $$type: 'color', value: COLORS[ ( baseValue + 3 ) % COLORS.length ] },
			'border-style': { $$type: 'string', value: 'solid' },
			padding: {
				$$type: 'dimensions',
				value: {
					top: { size: ( baseValue % 25 ) + 10, unit: 'px' },
					right: { size: ( baseValue % 20 ) + 10, unit: 'px' },
					bottom: { size: ( baseValue % 15 ) + 10, unit: 'px' },
					left: { size: ( baseValue % 10 ) + 10, unit: 'px' },
				},
			},
			margin: {
				$$type: 'dimensions',
				value: {
					top: { size: ( baseValue % 50 ) + 5, unit: 'px' },
					right: { size: ( baseValue % 40 ) + 5, unit: 'px' },
					bottom: { size: ( baseValue % 30 ) + 5, unit: 'px' },
					left: { size: ( baseValue % 20 ) + 5, unit: 'px' },
				},
			},
			'text-decoration': { $$type: 'string', value: 'underline' },
			'text-transform': { $$type: 'string', value: 'uppercase' },
			'font-style': { $$type: 'string', value: 'italic' },
		},
		custom_css: null,
	};
}

function buildGlobalClassData( count: number ): { items: Record<string, GlobalClassItem>; order: string[] } {
	const items: Record<string, GlobalClassItem> = {};
	const order: string[] = [];

	for ( let i = 0; i < count; i++ ) {
		const classId = `g-api-stress-${ i }`;
		const className = `api-stress-class-${ i }`;

		const variants: GlobalClassVariant[] = [];

		for ( const state of STATES ) {
			for ( const breakpoint of BREAKPOINTS ) {
				variants.push( buildBloatedVariant( i, breakpoint, state ) );
			}
		}

		items[ classId ] = {
			id: classId,
			type: 'class',
			label: className,
			variants,
		};

		order.push( classId );

		if ( 0 === ( i + 1 ) % 20 ) {
			// eslint-disable-next-line no-console
			console.log( `Built data for ${ i + 1 }/${ count } classes` );
		}
	}

	return { items, order };
}

const totalVariants = CLASS_COUNT * STATES.length * BREAKPOINTS.length;
// eslint-disable-next-line no-console
console.log( `Generating ${ CLASS_COUNT } classes with ${ totalVariants } total variants...` );

const data = buildGlobalClassData( CLASS_COUNT );

const outputPath = path.resolve( __dirname, 'global-classes-stress-data-2000.json' );
fs.writeFileSync( outputPath, JSON.stringify( data, null, 2 ) );

// eslint-disable-next-line no-console
console.log( `Written to ${ outputPath }` );
