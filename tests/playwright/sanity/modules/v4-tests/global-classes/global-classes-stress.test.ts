import { type Page } from '@playwright/test';
import { parallelTest as test } from '../../../../parallelTest';
import Breakpoints from '../../../../assets/breakpoints';
import type EditorPage from '../../../../pages/editor-page';
import type StyleTab from '../../../../pages/atomic-elements-panel/style-tab';
import { type Device } from '../../../../types/types';
import WpAdminPage from '../../../../pages/wp-admin-page';
import { deleteAllGlobalClasses } from './utils';
import { timeouts } from '../../../../config/timeouts';

/**
 * This is an initial set of stress tests
 *
 * This test adds 10 global styles to a widget via the UI
 * it intentionally doesn't assert anything yet, since it should be executed only as part of some stress tests suite
 * as it is a bit of a time-consuming test, aimed only to see the UI doesn't get unresponsive at edge-case scenarios
 */

const CLASS_COUNT = 10;
const BASIC_BREAKPOINTS: Device[] = [ 'desktop', 'tablet', 'mobile' ];
const ALL_BREAKPOINTS: Device[] = [ 'desktop', 'tablet', 'mobile', 'widescreen', 'laptop', 'tablet_extra', 'mobile_extra' ];
const STATES = [ 'normal', 'hover', 'focus', 'active' ] as const;

const USE_ALL_BREAKPOINTS = false;
const BREAKPOINTS = USE_ALL_BREAKPOINTS ? ALL_BREAKPOINTS : BASIC_BREAKPOINTS;

type ClassState = typeof STATES[number];

async function enableAllBreakpoints( page: Page, editor: EditorPage ): Promise<void> {
	if ( ! USE_ALL_BREAKPOINTS ) {
		logProgress( 'Skipping breakpoint setup - using basic breakpoints only (desktop, tablet, mobile)' );
		return;
	}

	const breakpoints = new Breakpoints( page );
	await breakpoints.addAllBreakpoints( editor );
}

async function switchToState( page: Page, state: ClassState, className: string ): Promise<void> {
	const classesSection = page.locator( 'label', { hasText: 'Classes' } ).locator( '../..' );
	const classChip = classesSection.locator( `[aria-label="Edit ${ className }"]` );
	const menuTrigger = classChip.locator( '[aria-label="Open CSS Class Menu"]' );

	await menuTrigger.click();

	if ( 'normal' === state ) {
		const normalMenuItem = page.locator( 'li[role="menuitem"]', { hasText: /^normal$/i } );
		await normalMenuItem.waitFor( { state: 'visible' } );
		await normalMenuItem.click();
	} else {
		const stateMenuItem = page.locator( 'li[role="menuitem"]', { hasText: new RegExp( `^${ state }$`, 'i' ) } );
		await stateMenuItem.waitFor( { state: 'visible' } );
		await stateMenuItem.click();
	}
}

async function setExtensiveStyles( styleTab: StyleTab, classIndex: number, breakpointIndex: number, stateIndex: number ): Promise<void> {
	const baseValue = ( classIndex * 10 ) + breakpointIndex + stateIndex;

	await styleTab.openSection( 'Size' );
	await styleTab.setSizeSectionValue( 'Width', baseValue + 100, 'px' );
	await styleTab.setSizeSectionValue( 'Height', baseValue + 50, 'px' );
	await styleTab.setSizeSectionValue( 'Min width', baseValue + 10, 'px' );
	await styleTab.setSizeSectionValue( 'Min height', baseValue + 5, 'px' );
	await styleTab.setSizeSectionValue( 'Max width', baseValue + 500, 'px' );
	await styleTab.setSizeSectionValue( 'Max height', baseValue + 400, 'px' );

	await styleTab.openSection( 'Typography' );
	await styleTab.setFontSize( baseValue + 12, 'px' );
	await styleTab.setLetterSpacing( ( baseValue % 10 ) + 1, 'px' );
	await styleTab.setWordSpacing( ( baseValue % 5 ) + 1, 'px' );
	await styleTab.setLineHeight( baseValue + 20, 'px' );

	const fontWeights: Array<100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900> = [ 100, 200, 300, 400, 500, 600, 700, 800, 900 ];
	await styleTab.setFontWeight( fontWeights[ baseValue % fontWeights.length ] );

	const colors = [ '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080' ];
	await styleTab.setFontColor( colors[ baseValue % colors.length ] );

	await styleTab.openSection( 'Spacing' );
	await styleTab.setSpacingSectionValue( 'Margin', 'Top', ( baseValue % 50 ) + 5, 'px', false );
	await styleTab.setSpacingSectionValue( 'Margin', 'Right', ( baseValue % 40 ) + 5, 'px', false );
	await styleTab.setSpacingSectionValue( 'Margin', 'Bottom', ( baseValue % 30 ) + 5, 'px', false );
	await styleTab.setSpacingSectionValue( 'Margin', 'Left', ( baseValue % 20 ) + 5, 'px', false );
	await styleTab.setSpacingSectionValue( 'Padding', 'Top', ( baseValue % 25 ) + 10, 'px', false );
	await styleTab.setSpacingSectionValue( 'Padding', 'Right', ( baseValue % 20 ) + 10, 'px', false );
	await styleTab.setSpacingSectionValue( 'Padding', 'Bottom', ( baseValue % 15 ) + 10, 'px', false );
	await styleTab.setSpacingSectionValue( 'Padding', 'Left', ( baseValue % 10 ) + 10, 'px', false );

	await styleTab.openSection( 'Border' );
	await styleTab.setBorderWidth( ( baseValue % 10 ) + 1, 'px' );
	await styleTab.setBorderRadius( ( baseValue % 20 ) + 5, 'px' );
	await styleTab.setBorderColor( colors[ ( baseValue + 3 ) % colors.length ] );

	await styleTab.openSection( 'Background' );
	await styleTab.setBackgroundColor( colors[ ( baseValue + 5 ) % colors.length ] );
}

function logProgress( message: string ): void {
	const timestamp = new Date().toISOString();
	// eslint-disable-next-line no-console
	console.log( `[${ timestamp }] STRESS TEST: ${ message }` );
}

test.describe.skip( 'Global Classes Memory Stress Test @stress', () => {
	test.setTimeout( timeouts.singleTest );

	test( 'Create 100 global classes with bloated styles to stress test memory', async ( { page, apiRequests }, testInfo ) => {
		logProgress( 'Starting stress test...' );

		const wpAdmin = new WpAdminPage( page, testInfo, apiRequests );
		await wpAdmin.setExperiments( { e_atomic_elements: 'active', e_classes: 'active' } );
		const { request } = page.context();

		logProgress( 'Experiments enabled, opening editor...' );

		const editor = await wpAdmin.openNewPage();

		logProgress( 'Cleaning up existing global classes...' );
		await deleteAllGlobalClasses( apiRequests, request );

		logProgress( 'Enabling all breakpoints...' );
		await enableAllBreakpoints( page, editor );

		logProgress( 'Adding div block widget...' );
		const divBlockId = await editor.addElement( { elType: 'e-div-block' }, 'document' );
		await editor.selectElement( divBlockId );

		logProgress( `Starting creation of ${ CLASS_COUNT } global classes with styles...` );

		for ( let i = 0; i < CLASS_COUNT; i++ ) {
			const className = `stress-class-${ i }`;

			await editor.selectElement( divBlockId );
			await editor.v4Panel.openTab( 'style' );
			await editor.v4Panel.style.addGlobalClass( className );

			await page.waitForTimeout( 500 );

			for ( let stateIndex = 0; stateIndex < STATES.length; stateIndex++ ) {
				const state = STATES[ stateIndex ];

				await switchToState( page, state, className );

				for ( let breakpointIndex = 0; breakpointIndex < BREAKPOINTS.length; breakpointIndex++ ) {
					const breakpoint = BREAKPOINTS[ breakpointIndex ];

					await editor.changeResponsiveView( breakpoint );

					await setExtensiveStyles( editor.v4Panel.style, i, breakpointIndex, stateIndex );
				}
			}

			await editor.changeResponsiveView( 'desktop' );

			logProgress( `Created and styled class ${ i + 1 }/${ CLASS_COUNT }: ${ className }` );

			if ( 0 === ( i + 1 ) % 10 ) {
				logProgress( `Progress: ${ i + 1 }/${ CLASS_COUNT } classes created and styled` );
			}
		}

		logProgress( 'All classes created and styled. Publishing page...' );

		await editor.publishPage();

		logProgress( 'Page published. Navigating to frontend to trigger CSS generation...' );

		await editor.viewPage();

		await page.waitForLoadState( 'networkidle' );

		logProgress( 'Frontend loaded. Checking for CSS files...' );

		const stylesheets = await page.evaluate( () => {
			const links = document.querySelectorAll( 'link[rel="stylesheet"]' );
			return Array.from( links ).map( ( link ) => ( link as HTMLLinkElement ).href );
		} );

		logProgress( `Found ${ stylesheets.length } stylesheets on the page` );

		const globalClassesStylesheets = stylesheets.filter( ( href ) => href.includes( 'global-classes' ) );
		logProgress( `Found ${ globalClassesStylesheets.length } global classes stylesheets` );
	} );
} );
