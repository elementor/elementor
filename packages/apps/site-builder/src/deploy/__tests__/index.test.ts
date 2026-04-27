import { deployWebsite } from '../index';
import { deployGlobalClasses } from '../steps/global-classes';
import { deployGlobalVariables } from '../steps/global-variables';
import { updateKitSettings } from '../steps/kit-settings';
import { uploadLogo } from '../steps/logo';
import { createMenus } from '../steps/menus';
import { createPages, setHomePage } from '../steps/pages';
import { createSamplePosts } from '../steps/sample-posts';
import { setSiteMetadata } from '../steps/site-metadata';
import { createThemeParts } from '../steps/theme-parts';
import type { DeployPayload } from '../types';

jest.mock( '../steps/global-classes' );
jest.mock( '../steps/global-variables' );
jest.mock( '../steps/kit-settings' );
jest.mock( '../steps/logo' );
jest.mock( '../steps/menus' );
jest.mock( '../steps/pages' );
jest.mock( '../steps/sample-posts' );
jest.mock( '../steps/site-metadata' );
jest.mock( '../steps/theme-parts' );

const buildIncrementalPayload = (): DeployPayload => ( {
	mode: 'incremental',
	pages: [
		{ id: 'planner-uuid-1', title: 'About', content: [] },
	],
} );

const buildFullPayload = (): DeployPayload => ( {
	mode: 'full',
	pages: [
		{ id: 'planner-uuid-home', title: 'Home', content: [] },
		{ id: 'planner-uuid-about', title: 'About', content: [] },
	],
	kitSettings: {},
	menus: { header: [], footer: [] },
	siteMeta: { title: 'Site', tagline: '' },
} );

describe( '@elementor/site-builder/deploy/index', () => {
	beforeEach( () => {
		jest.mocked( createPages ).mockResolvedValue( {} );
		jest.mocked( setHomePage ).mockResolvedValue( undefined as never );
		jest.mocked( setSiteMetadata ).mockResolvedValue( undefined as never );
		jest.mocked( updateKitSettings ).mockResolvedValue( undefined as never );
		jest.mocked( deployGlobalClasses ).mockResolvedValue( undefined as never );
		jest.mocked( deployGlobalVariables ).mockResolvedValue( undefined as never );
		jest.mocked( uploadLogo ).mockResolvedValue( undefined as never );
		jest.mocked( createMenus ).mockResolvedValue( undefined as never );
		jest.mocked( createSamplePosts ).mockResolvedValue( undefined as never );
		jest.mocked( createThemeParts ).mockResolvedValue( undefined as never );
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	describe( 'incremental mode', () => {
		it( 'only creates pages and skips site-wide steps', async () => {
			jest.mocked( createPages ).mockResolvedValue( { 'planner-uuid-1': 42 } );

			const result = await deployWebsite( buildIncrementalPayload() );

			expect( createPages ).toHaveBeenCalledTimes( 1 );
			expect( setSiteMetadata ).not.toHaveBeenCalled();
			expect( updateKitSettings ).not.toHaveBeenCalled();
			expect( createMenus ).not.toHaveBeenCalled();
			expect( createThemeParts ).not.toHaveBeenCalled();
			expect( setHomePage ).not.toHaveBeenCalled();
			expect( result.status ).toBe( 'success' );
			expect( result.pageIdMap ).toEqual( { 'planner-uuid-1': 42 } );
			expect( result.homePageId ).toBeUndefined();
		} );

		it( 'returns error status when createPages fails', async () => {
			jest.mocked( createPages ).mockRejectedValueOnce( new Error( 'page failure' ) );

			const result = await deployWebsite( buildIncrementalPayload() );

			expect( result.status ).toBe( 'error' );
			expect( result.error ).toContain( 'page failure' );
		} );
	} );

	describe( 'full mode', () => {
		it( 'runs every deploy step and returns pageIdMap with homePageId derived from first page', async () => {
			jest.mocked( createPages ).mockResolvedValue( {
				'planner-uuid-home': 1001,
				'planner-uuid-about': 1002,
			} );

			const result = await deployWebsite( buildFullPayload() );

			expect( setSiteMetadata ).toHaveBeenCalledTimes( 1 );
			expect( updateKitSettings ).toHaveBeenCalledTimes( 1 );
			expect( createPages ).toHaveBeenCalledTimes( 1 );
			expect( createMenus ).toHaveBeenCalledTimes( 1 );
			expect( setHomePage ).toHaveBeenCalledWith( 1001 );
			expect( result.status ).toBe( 'success' );
			expect( result.homePageId ).toBe( 1001 );
			expect( result.pageIdMap ).toEqual( {
				'planner-uuid-home': 1001,
				'planner-uuid-about': 1002,
			} );
		} );
	} );
} );
