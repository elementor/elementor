import { expect } from '@playwright/test';
import { test } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const API_BASE_URL = process.env.BASE_URL || 'http://localhost:8888';
const API_ENDPOINT = '/wp-json/elementor/v2/css-converter/variables';

interface VariablesApiResponse {
	success: boolean;
	variables: Array<{
		name: string;
		value: string;
		type?: string;
	}>;
	rawVariables: Array<{
		name: string;
		value: string;
		scope: string;
	}>;
	stats: {
		converted: number;
		extracted: number;
		skipped: number;
	};
	logs: {
		css: string;
		variables: string;
	};
	error?: string;
}

const testIndex = process.env.TEST_PARALLEL_INDEX || '0';
const storageStatePath = path.resolve( `./storageState-${ testIndex }.json` );

if ( ! fs.existsSync( storageStatePath ) ) {
	try {
		fs.writeFileSync( storageStatePath, JSON.stringify( {} ), 'utf-8' );
	} catch ( error ) {
		//
	}
}

test.describe( 'Nested Variables API Integration @nested-variables', () => {
	test( 'should extract and rename nested variables from CSS', async ( { request } ) => {
		const css = `:root { --primary: #007bff; --secondary: #6c757d; } .theme-dark { --primary: #0d6efd; --secondary: #adb5bd; } .theme-light { --primary: #ffffff; --secondary: #f8f9fa; }`;

		const response = await request.post( `${ API_BASE_URL }${ API_ENDPOINT }`, {
			data: { css, update_mode: 'create_new' },
		} );

		expect( response.status() ).toBe( 200 );
		const body: VariablesApiResponse = await response.json();
		expect( body.success ).toBe( true );
		expect( body.variables.length ).toBeGreaterThan( 0 );

		const primaryVars = body.variables.filter( ( v ) => v.name.startsWith( '--primary' ) );
		expect( primaryVars.length ).toBeGreaterThan( 1 );

		const secondaryVars = body.variables.filter( ( v ) => v.name.startsWith( '--secondary' ) );
		expect( secondaryVars.length ).toBeGreaterThan( 1 );
	} );

	test( 'should handle identical color values and reuse variables', async ( { request } ) => {
		const css = `:root { --color: #ff0000; } .theme-1 { --color: #ff0000; } .theme-2 { --color: #00ff00; }`;

		const response = await request.post( `${ API_BASE_URL }${ API_ENDPOINT }`, {
			data: { css, update_mode: 'create_new' },
		} );

		expect( response.status() ).toBe( 200 );
		const body: VariablesApiResponse = await response.json();
		expect( body.success ).toBe( true );

		const colorVars = body.variables.filter( ( v ) => v.name.startsWith( '--color' ) );
		expect( colorVars.length ).toBe( 2 );

		const baseColor = colorVars.find( ( v ) => v.name === '--color' );
		const suffixedColor = colorVars.find( ( v ) => v.name === '--color-1' );

		expect( baseColor ).toBeDefined();
		expect( suffixedColor ).toBeDefined();
	} );

	test.skip( 'should handle media query variables as separate scope (TODO: Media Query Support)', async ( { request } ) => {
		const css = `:root { --font-size: 16px; --spacing: 20px; } @media (max-width: 768px) { :root { --font-size: 14px; --spacing: 16px; } }`;

		const response = await request.post( `${ API_BASE_URL }${ API_ENDPOINT }`, {
			data: { css, update_mode: 'create_new' },
		} );

		expect( response.status() ).toBe( 200 );
		const body: VariablesApiResponse = await response.json();
		expect( body.success ).toBe( true );

		const fontSizeVars = body.variables.filter( ( v ) => v.name.startsWith( '--font-size' ) );
		expect( fontSizeVars.length ).toBeGreaterThanOrEqual( 2 );

		const spacingVars = body.variables.filter( ( v ) => v.name.startsWith( '--spacing' ) );
		expect( spacingVars.length ).toBeGreaterThanOrEqual( 2 );
	} );

	test( 'should normalize color formats (hex to RGB)', async ( { request } ) => {
		const css = `:root { --color-hex: #ff0000; --color-hex-short: #f00; --color-rgb: rgb(255, 0, 0); }`;

		const response = await request.post( `${ API_BASE_URL }${ API_ENDPOINT }`, {
			data: { css, update_mode: 'create_new' },
		} );

		expect( response.status() ).toBe( 200 );
		const body: VariablesApiResponse = await response.json();
		expect( body.success ).toBe( true );

		const colorVars = body.variables.filter( ( v ) => v.name.startsWith( '--color' ) );
		expect( colorVars.length ).toBeGreaterThan( 0 );
	} );

	test( 'should handle class selector variables', async ( { request } ) => {
		const css = `:root { --primary: #007bff; --secondary: #6c757d; } .card { --padding: 16px; --border-width: 1px; } .card-large { --padding: 24px; --border-width: 2px; } .badge { --padding: 8px; --border-width: 0px; }`;

		const response = await request.post( `${ API_BASE_URL }${ API_ENDPOINT }`, {
			data: { css, update_mode: 'create_new' },
		} );

		expect( response.status() ).toBe( 200 );
		const body: VariablesApiResponse = await response.json();
		expect( body.success ).toBe( true );

		const paddingVars = body.variables.filter( ( v ) => v.name.startsWith( '--padding' ) );
		expect( paddingVars.length ).toBeGreaterThanOrEqual( 3 );

		const borderVars = body.variables.filter( ( v ) => v.name.startsWith( '--border' ) );
		expect( borderVars.length ).toBeGreaterThanOrEqual( 3 );
	} );

	test( 'should handle complex theme system with multiple scopes', async ( { request } ) => {
		const css = `:root { --primary: #007bff; } @media (prefers-color-scheme: dark) { :root { --primary: #0d6efd; } } .theme-brand { --primary: #ff6b35; }`;

		const response = await request.post( `${ API_BASE_URL }${ API_ENDPOINT }`, {
			data: { css, update_mode: 'create_new' },
		} );

		expect( response.status() ).toBe( 200 );
		const body: VariablesApiResponse = await response.json();
		expect( body.success ).toBe( true );
		expect( body.variables.length ).toBeGreaterThan( 0 );
	} );

	test( 'should handle empty CSS gracefully', async ( { request } ) => {
		const response = await request.post( `${ API_BASE_URL }${ API_ENDPOINT }`, {
			data: { css: '', update_mode: 'create_new' },
		} );

		expect( response.status() ).toBe( 422 );
		const body = await response.json();
		expect( body.error ).toBeDefined();
	} );

	test( 'should handle CSS with no variables', async ( { request } ) => {
		const css = `.container { width: 100%; height: auto; display: flex; } .item { flex: 1; padding: 20px; }`;

		const response = await request.post( `${ API_BASE_URL }${ API_ENDPOINT }`, {
			data: { css, update_mode: 'create_new' },
		} );

		expect( response.status() ).toBe( 200 );
		const body: VariablesApiResponse = await response.json();
		expect( body.success ).toBe( true );
		expect( body.variables.length ).toBe( 0 );
	} );

	test( 'should handle whitespace normalization in values', async ( { request } ) => {
		const css = `:root { --spacing-a: 16px; --spacing-b:  16  px  ; --color-a: #007bff; } .theme { --spacing-a: 20px; }`;

		const response = await request.post( `${ API_BASE_URL }${ API_ENDPOINT }`, {
			data: { css, update_mode: 'create_new' },
		} );

		expect( response.status() ).toBe( 200 );
		const body: VariablesApiResponse = await response.json();
		expect( body.success ).toBe( true );

		const spacingVars = body.variables.filter( ( v ) => v.name.startsWith( '--spacing' ) );
		expect( spacingVars.length ).toBeGreaterThan( 0 );
	} );

	test( 'should track statistics correctly', async ( { request } ) => {
		const css = `:root { --primary: #007bff; --secondary: #6c757d; --spacing: 16px; } .theme-dark { --primary: #0d6efd; --secondary: #adb5bd; --spacing: 20px; }`;

		const response = await request.post( `${ API_BASE_URL }${ API_ENDPOINT }`, {
			data: { css, update_mode: 'create_new' },
		} );

		expect( response.status() ).toBe( 200 );
		const body: VariablesApiResponse = await response.json();
		expect( body.success ).toBe( true );

		expect( body.stats.converted ).toBeGreaterThan( 0 );
		expect( body.stats.extracted ).toBeGreaterThan( 0 );
		expect( body.stats.skipped ).toBeGreaterThanOrEqual( 0 );

		expect( body.stats.converted + body.stats.skipped ).toBeLessThanOrEqual( body.stats.extracted );
	} );

	test( 'should return logs for debugging', async ( { request } ) => {
		const css = `:root { --primary: #007bff; }`;

		const response = await request.post( `${ API_BASE_URL }${ API_ENDPOINT }`, {
			data: { css, update_mode: 'create_new' },
		} );

		expect( response.status() ).toBe( 200 );
		const body: VariablesApiResponse = await response.json();
		expect( body.success ).toBe( true );

		expect( body.logs ).toBeDefined();
		expect( body.logs.css ).toBeDefined();
		expect( body.logs.variables ).toBeDefined();
	} );

	test( 'should handle suffix collision detection', async ( { request } ) => {
		const css = `:root { --color: #ff0000; --color-1: #00ff00; } .theme { --color: #0000ff; }`;

		const response = await request.post( `${ API_BASE_URL }${ API_ENDPOINT }`, {
			data: { css, update_mode: 'create_new' },
		} );

		expect( response.status() ).toBe( 200 );
		const body: VariablesApiResponse = await response.json();
		expect( body.success ).toBe( true );

		const colorVars = body.variables.filter( ( v ) => v.name.startsWith( '--color' ) );
		const hasColorTwo = colorVars.some( ( v ) => v.name === '--color-2' );
		expect( hasColorTwo ).toBe( true );
	} );
} ); 
