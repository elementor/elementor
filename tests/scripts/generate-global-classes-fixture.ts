/* eslint-disable no-console */
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const CLASS_COUNT = 1000;

const MANIFEST = {
	name: 'import-test',
	title: 'import test',
	description: null,
	author: 'miryamo@elementor.com',
	version: '3.0',
	elementor_version: '4.1.0',
	created: new Date().toISOString().replace( 'T', ' ' ).slice( 0, 19 ),
	thumbnail: false,
	site: 'http://hackathon-2025.local',
	'site-settings': {
		theme: false,
		globalColors: false,
		globalFonts: false,
		themeStyleSettings: false,
		generalSettings: false,
		experiments: false,
		customFonts: false,
		customIcons: false,
		customCode: false,
		classes: true,
		variables: false,
		classesCount: CLASS_COUNT,
		variablesCount: 0,
	},
	plugins: [],
};

const BREAKPOINTS = [ 'widescreen', 'desktop', 'tablet', 'mobile', 'laptop', 'tablet_extra', 'mobile_extra' ] as const;
const STATES = [ 'normal', 'hover', 'focus', 'active' ] as const;
const COLORS = [ '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080' ];

type Variant = {
	meta: { breakpoint: string; state: string | null };
	props: Record<string, unknown>;
	custom_css: null;
};

type GlobalClassItem = {
	id: string;
	type: 'class';
	label: string;
	variants: Variant[];
};

function buildVariant( classIndex: number, breakpoint: typeof BREAKPOINTS[number], state: typeof STATES[number] ): Variant {
	const baseValue = ( classIndex * 10 ) + BREAKPOINTS.indexOf( breakpoint ) + STATES.indexOf( state );

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

function buildGlobalClass( index: number ): GlobalClassItem {
	const id = `g-api-stress-${ index }`;
	const label = `api-stress-class-${ index }`;

	const variants: Variant[] = [];

	for ( const state of STATES ) {
		for ( const breakpoint of BREAKPOINTS ) {
			variants.push( buildVariant( index, breakpoint, state ) );
		}
	}

	return { id, type: 'class', label, variants };
}

function main(): void {
	const baseDir = path.resolve( __dirname, 'import-test' );
	const classesDir = path.join( baseDir, 'global-classes' );
	const zipPath = path.resolve( __dirname, 'import-test.zip' );

	if ( fs.existsSync( baseDir ) ) {
		fs.rmSync( baseDir, { recursive: true } );
	}

	if ( fs.existsSync( zipPath ) ) {
		fs.unlinkSync( zipPath );
	}

	fs.mkdirSync( classesDir, { recursive: true } );

	fs.writeFileSync(
		path.join( baseDir, 'manifest.json' ),
		JSON.stringify( MANIFEST ),
	);

	const order: Array<{ id: string; label: string }> = [];

	for ( let i = 0; i < CLASS_COUNT; i++ ) {
		const item = buildGlobalClass( i );

		fs.writeFileSync(
			path.join( classesDir, `${ item.id }.json` ),
			JSON.stringify( item ),
		);

		order.push( { id: item.id, label: item.label } );

		if ( 0 === ( i + 1 ) % 1000 ) {
			console.log( `Generated ${ i + 1 }/${ CLASS_COUNT } classes` );
		}
	}

	fs.writeFileSync(
		path.join( classesDir, 'order.json' ),
		JSON.stringify( order ),
	);

	console.log( `Generated ${ CLASS_COUNT } classes in ${ classesDir }` );

	execSync( `cd "${ baseDir }" && zip -r "${ zipPath }" .` );

	console.log( `Zipped to ${ zipPath }` );

	fs.rmSync( baseDir, { recursive: true } );

	console.log( 'Cleaned up unzipped folder.' );
}

main();
