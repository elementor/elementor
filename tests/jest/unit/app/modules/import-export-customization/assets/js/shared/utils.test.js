import {
	hasExportedComponents,
	resolveComponentsCustomization,
} from 'elementor/app/modules/import-export-customization/assets/js/shared/utils';
import { createRegisteredCustomizationDialogsRegistry } from 'elementor/app/modules/import-export-customization/assets/js/shared/registry/customization-dialogs';
import { KIT_SECTION_ITEMS } from 'elementor/app/modules/import-export-customization/assets/js/shared/constants';

describe( 'resolveComponentsCustomization', () => {
	let registry;

	beforeEach( () => {
		registry = createRegisteredCustomizationDialogsRegistry();

		global.elementorModules = {
			importExport: {
				customizationDialogsRegistry: registry,
			},
		};
	} );

	afterEach( () => {
		delete global.elementorModules;
	} );

	it( 'should return false when templates are not included', () => {
		// Arrange
		const customization = { templates: { components: { enabled: true } } };

		// Act
		const result = resolveComponentsCustomization( { customization, includes: [ 'content' ], data: null, isImport: false } );

		// Assert
		expect( result ).toBe( false );
	} );

	it.each( [ true, false ] )( 'should return the saved dialog value %s', ( savedValue ) => {
		// Arrange
		registry.register( {
			key: KIT_SECTION_ITEMS.TEMPLATES_COMPONENTS,
			title: 'Components',
			getInitialState: () => ( { enabled: ! savedValue } ),
		} );
		const customization = { templates: { components: { enabled: savedValue } } };

		// Act
		const result = resolveComponentsCustomization( { customization, includes: [ 'templates' ], data: null, isImport: false } );

		// Assert
		expect( result ).toBe( savedValue );
	} );

	it( 'should return false from the Core default when the dialog was never opened', () => {
		// Arrange
		const customization = { templates: null };

		// Act
		const result = resolveComponentsCustomization( { customization, includes: [ 'templates' ], data: null, isImport: false } );

		// Assert
		expect( result ).toBe( false );
	} );

	it( 'should fall back to the overridden initial state with the context data', () => {
		// Arrange
		const getInitialState = jest.fn( () => ( { enabled: true } ) );
		const data = { uploadedData: { manifest: { components: { 1: {} } } } };
		registry.register( {
			key: KIT_SECTION_ITEMS.TEMPLATES_COMPONENTS,
			title: 'Components',
			getInitialState,
		} );

		// Act
		const result = resolveComponentsCustomization( { customization: { templates: null }, includes: [ 'templates' ], data, isImport: true } );

		// Assert
		expect( result ).toBe( true );
		expect( getInitialState ).toHaveBeenCalledWith( { contextData: { data }, includesTemplates: true, isImport: true } );
	} );

	it( 'should return false when the registry is not available', () => {
		// Arrange
		delete global.elementorModules;

		// Act
		const result = resolveComponentsCustomization( { customization: undefined, includes: [ 'templates' ], data: null, isImport: false } );

		// Assert
		expect( result ).toBe( false );
	} );
} );

describe( 'hasExportedComponents', () => {
	it( 'should return true when the manifest has components', () => {
		// Arrange
		const contextData = { data: { uploadedData: { manifest: { components: { 12: { title: 'Card' } } } } } };

		// Act & Assert
		expect( hasExportedComponents( contextData ) ).toBe( true );
	} );

	it.each( [
		[ 'no manifest', {} ],
		[ 'empty components', { data: { uploadedData: { manifest: { components: {} } } } } ],
	] )( 'should return false for %s', ( _label, contextData ) => {
		// Act & Assert
		expect( hasExportedComponents( contextData ) ).toBe( false );
	} );
} );
