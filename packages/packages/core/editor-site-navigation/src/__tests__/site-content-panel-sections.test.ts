import {
	getSiteContentPanelSectionDescriptors,
	hasHiddenSiteContentPanelSections,
} from '../site-content-panel-sections';
import { registerSiteContentSection, resetSiteContentSections } from '../site-content-sections';

describe( 'site-content-panel-sections', () => {
	afterEach( () => {
		resetSiteContentSections();
	} );

	it( 'builds descriptors from post types and registered sections', () => {
		registerSiteContentSection( {
			id: 'popups',
			label: 'Popups',
			render: () => null,
		} );

		const descriptors = getSiteContentPanelSectionDescriptors( [ 'page', 'post' ] );

		expect( descriptors ).toEqual( [
			{ id: 'page', label: 'Pages' },
			{ id: 'post', label: 'Posts' },
			{ id: 'popups', label: 'Popups' },
		] );
	} );

	it( 'detects when any section is hidden', () => {
		expect( hasHiddenSiteContentPanelSections( new Set() ) ).toBe( false );
		expect( hasHiddenSiteContentPanelSections( new Set( [ 'post' ] ) ) ).toBe( true );
	} );
} );
