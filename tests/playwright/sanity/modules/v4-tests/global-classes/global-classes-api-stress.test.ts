import { expect } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import type EditorPage from '../../../../pages/editor-page';
import { type Device } from '../../../../types/types';
import WpAdminPage from '../../../../pages/wp-admin-page';

import { deleteAllGlobalClasses, createGlobalClasses, getGlobalClasses } from './utils';

/**
 * This is an initial set of stress tests, currently meant to be executed manually+locally (against a valid .env file)
 *
 * This test adds 100 global styles via REST API
 */

const CLASS_COUNT = 100;
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

function logProgress( message: string ): void {
	const timestamp = new Date().toISOString();
	// eslint-disable-next-line no-console
	console.log( `[${ timestamp }] API STRESS: ${ message }` );
}

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
			logProgress( `Built data for ${ i + 1 }/${ count } classes` );
		}
	}

	return { items, order };
}

test.describe.skip( 'Global Classes API Stress Test @stress', () => {
	test.setTimeout( 600000 );

	test( 'Create 100 global classes via REST API and verify CSS generation', async ( { page, apiRequests }, testInfo ) => {
		logProgress( 'Starting API-based stress test...' );

		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		const request = page.context().request;

		logProgress( 'Setting up experiments...' );
		await wpAdmin.setExperiments( { e_atomic_elements: 'active', e_classes: 'active' } );

		logProgress( 'Cleaning up existing global classes...' );
		const cleanupResult = await deleteAllGlobalClasses( apiRequests, request );
		logProgress( `Cleanup result: deleted=${ cleanupResult.deleted }, success=${ cleanupResult.success }` );

		logProgress( `Building ${ CLASS_COUNT } bloated global classes...` );
		const startBuild = Date.now();
		const { items, order } = buildGlobalClassData( CLASS_COUNT );
		const buildTime = Date.now() - startBuild;

		const totalVariants = CLASS_COUNT * STATES.length * BREAKPOINTS.length;
		logProgress( `Built ${ CLASS_COUNT } classes with ${ totalVariants } total variants in ${ buildTime }ms` );

		logProgress( 'Sending classes to API...' );
		const startApi = Date.now();
		const apiResponse = await createGlobalClasses( apiRequests, request, items, order );
		const apiTime = Date.now() - startApi;

		logProgress( `API response: ok=${ apiResponse.ok }, time=${ apiTime }ms` );

		if ( ! apiResponse.ok ) {
			logProgress( `API error: ${ apiResponse.error }` );
		}

		expect( apiResponse.ok ).toBe( true );

		logProgress( 'Verifying classes were created...' );
		const { order: existingIds } = await getGlobalClasses( apiRequests, request );
		logProgress( `Found ${ existingIds.length } classes in storage` );

		expect( existingIds.length ).toBe( CLASS_COUNT );

		logProgress( 'Opening editor...' );
		const editor = await wpAdmin.openNewPage() as EditorPage;
		await editor.waitForPanelToLoad();

		logProgress( 'Adding div block widget...' );
		const divBlockId = await editor.addElement( { elType: 'e-div-block' }, 'document' );
		await editor.selectElement( divBlockId );

		logProgress( 'Publishing page...' );
		const startPublish = Date.now();
		await editor.publishPage();
		const publishTime = Date.now() - startPublish;
		logProgress( `Page published in ${ publishTime }ms` );

		logProgress( 'Navigating to frontend...' );
		const startView = Date.now();
		await editor.viewPage();
		await page.waitForLoadState( 'networkidle' );
		const viewTime = Date.now() - startView;
		logProgress( `Frontend loaded in ${ viewTime }ms` );

		const stylesheets = await page.evaluate( () => {
			const links = document.querySelectorAll( 'link[rel="stylesheet"]' );
			return Array.from( links ).map( ( link ) => ( link as HTMLLinkElement ).href );
		} );

		logProgress( `Found ${ stylesheets.length } stylesheets on frontend` );

		const pageSize = await page.evaluate( () => document.documentElement.outerHTML.length );
		logProgress( `Page HTML size: ${ ( pageSize / 1024 ).toFixed( 2 ) } KB` );

		logProgress( 'API stress test completed successfully!' );
		logProgress( `Summary: ${ CLASS_COUNT } classes, ${ totalVariants } variants` );
		logProgress( `Timings: API=${ apiTime }ms, Publish=${ publishTime }ms, View=${ viewTime }ms` );
	} );
} );
