import { getContainer, getElementSetting, getElementStyles } from '@elementor/editor-elements';
import { getSessionStorageItem } from '@elementor/session';
import { ELEMENTS_STYLES_RESERVED_LABEL, stylesRepository } from '@elementor/editor-styles-repository';

import { getClassesProp } from '../../utils/command-utils';
import { getActiveStyleSessionLookup, resolveActiveStyleTarget } from '../resolve-active-style-target';

jest.mock( '@elementor/editor-elements' );
jest.mock( '@elementor/session' );
jest.mock( '@elementor/editor-styles-repository', () => ( {
	stylesRepository: {
		getProviders: jest.fn(),
	},
} ) );
jest.mock( '../../utils/command-utils' );

describe( 'resolveActiveStyleTarget', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should return null when container is missing', () => {
		jest.mocked( getContainer ).mockReturnValue( null );

		expect( resolveActiveStyleTarget( 'missing' ) ).toBeNull();
	} );

	it( 'should return null when classes prop is missing', () => {
		jest.mocked( getContainer ).mockReturnValue( { id: 'el-1' } as never );
		jest.mocked( getClassesProp ).mockReturnValue( null );

		expect( resolveActiveStyleTarget( 'el-1' ) ).toBeNull();
	} );

	it( 'should prefer stored active style when it is applied on the element', () => {
		const elementId = 'el-1';
		const activeStyleId = 'global-class-1';

		jest.mocked( getContainer ).mockReturnValue( { id: elementId } as never );
		jest.mocked( getClassesProp ).mockReturnValue( 'classes' );
		jest.mocked( getSessionStorageItem ).mockReturnValue( activeStyleId );
		jest.mocked( getElementSetting ).mockReturnValue( { value: [ activeStyleId, 'local-1' ] } );
		jest.mocked( getElementStyles ).mockReturnValue( {
			'local-1': { id: 'local-1', label: 'local', type: 'class', variants: [] },
		} );
		jest.mocked( stylesRepository.getProviders ).mockReturnValue( [
			{
				actions: {
					all: () => [ { id: activeStyleId } ],
					get: ( id: string ) => ( id === activeStyleId ? { id: activeStyleId } : null ),
				},
			},
		] as never );

		const result = resolveActiveStyleTarget( elementId );

		expect( getSessionStorageItem ).toHaveBeenCalledWith( getActiveStyleSessionLookup( elementId ) );
		expect( result ).toEqual( {
			styleId: activeStyleId,
			provider: expect.anything(),
			classesProp: 'classes',
		} );
	} );

	it( 'should fall back to the first applied local style when stored active style is not applied', () => {
		const elementId = 'el-1';
		const localStyleId = 'local-1';

		jest.mocked( getContainer ).mockReturnValue( { id: elementId } as never );
		jest.mocked( getClassesProp ).mockReturnValue( 'classes' );
		jest.mocked( getSessionStorageItem ).mockReturnValue( 'stale-class' );
		jest.mocked( getElementSetting ).mockReturnValue( { value: [ localStyleId ] } );
		jest.mocked( getElementStyles ).mockReturnValue( {
			[ localStyleId ]: { id: localStyleId, label: 'local', type: 'class', variants: [] },
		} );
		jest.mocked( stylesRepository.getProviders ).mockReturnValue( [
			{
				actions: {
					all: () => [ { id: localStyleId } ],
					get: ( id: string, meta?: { elementId?: string } ) =>
						id === localStyleId && meta?.elementId === elementId ? { id: localStyleId } : null,
				},
			},
		] as never );

		const result = resolveActiveStyleTarget( elementId );

		expect( result?.styleId ).toBe( localStyleId );
	} );

	it( 'should fall back to the reserved local style when it exists on the element', () => {
		const elementId = 'el-1';
		const localStyleId = 'local-1';

		jest.mocked( getContainer ).mockReturnValue( { id: elementId } as never );
		jest.mocked( getClassesProp ).mockReturnValue( 'classes' );
		jest.mocked( getSessionStorageItem ).mockReturnValue( null );
		jest.mocked( getElementSetting ).mockReturnValue( { value: [] } );
		jest.mocked( getElementStyles ).mockReturnValue( {
			[ localStyleId ]: {
				id: localStyleId,
				label: ELEMENTS_STYLES_RESERVED_LABEL,
				type: 'class',
				variants: [],
			},
		} );
		jest.mocked( stylesRepository.getProviders ).mockReturnValue( [
			{
				getKey: () => 'document-elements-1',
				actions: {
					all: () => [],
					get: ( id: string, meta?: { elementId?: string } ) =>
						id === localStyleId && meta?.elementId === elementId ? { id: localStyleId } : null,
				},
			},
		] as never );

		const result = resolveActiveStyleTarget( elementId );

		expect( result?.styleId ).toBe( localStyleId );
		expect( result?.provider ).toEqual( expect.objectContaining( { getKey: expect.any( Function ) } ) );
	} );

	it( 'should prefer the last applied local style when multiple styles are attached', () => {
		const elementId = 'el-1';
		const firstStyleId = 'local-1';
		const secondStyleId = 'local-2';
		const provider = {
			actions: {
				all: () => [ { id: firstStyleId }, { id: secondStyleId } ],
				get: ( id: string, meta?: { elementId?: string } ) => {
					if ( meta?.elementId !== elementId ) {
						return null;
					}

					return id === secondStyleId ? { id: secondStyleId } : null;
				},
			},
		};

		jest.mocked( getContainer ).mockReturnValue( { id: elementId } as never );
		jest.mocked( getClassesProp ).mockReturnValue( 'classes' );
		jest.mocked( getSessionStorageItem ).mockReturnValue( null );
		jest.mocked( getElementSetting ).mockReturnValue( { value: [ firstStyleId, secondStyleId ] } );
		jest.mocked( getElementStyles ).mockReturnValue( {
			[ firstStyleId ]: { id: firstStyleId, label: 'local', type: 'class', variants: [] },
			[ secondStyleId ]: { id: secondStyleId, label: 'local', type: 'class', variants: [] },
		} );
		jest.mocked( stylesRepository.getProviders ).mockReturnValue( [ provider ] as never );

		const result = resolveActiveStyleTarget( elementId );

		expect( result?.styleId ).toBe( secondStyleId );
	} );
} );
