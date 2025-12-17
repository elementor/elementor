import { getElementType } from '@elementor/editor-elements';
import { stringPropTypeUtil } from '@elementor/editor-props';

import { type ElementView } from '../../legacy/types';
import { getPreviewOffset, getViewTag, isValueDynamic, syncViewSetting } from '../view';

jest.mock( '@elementor/editor-elements' );

const createMockView = ( overrides?: Partial<ElementView> ): ElementView => {
	const mockSettings = new Map();
	const settingsObject = {
		get: ( settingKey: string ) => mockSettings.get( settingKey ),
		set: ( settingKey: string, value: unknown ) => mockSettings.set( settingKey, value ),
	};

	return {
		container: {
			id: 'test-id',
			model: {
				get: jest.fn( ( key: string ) => {
					if ( key === 'widgetType' ) {
						return 'e-heading';
					}
					if ( key === 'elType' ) {
						return 'widget';
					}
					return undefined;
				} ),
			},
		} as any,
		model: {
			get: jest.fn( ( key: string ) => {
				if ( key === 'settings' ) {
					return settingsObject;
				}
				return undefined;
			} ),
		} as any,
		el: document.createElement( 'div' ),
		$el: {} as any,
		...overrides,
	} as ElementView;
};

describe( 'view utils', () => {
	describe( 'isValueDynamic', () => {
		it( 'should return false when setting key is empty', () => {
			const view = createMockView();

			const result = isValueDynamic( view, '' );

			expect( result ).toBe( false );
		} );

		it( 'should return false when prop value is not dynamic', () => {
			const view = createMockView();
			const settings = view.model.get( 'settings' );
			( settings as any ).get = jest.fn().mockReturnValue( { $$type: 'static', value: 'test' } );

			const result = isValueDynamic( view, 'title' );

			expect( result ).toBe( false );
		} );

		it( 'should return true when prop value is dynamic', () => {
			const view = createMockView();
			const settings = view.model.get( 'settings' );
			( settings as any ).get = jest.fn().mockReturnValue( { $$type: 'dynamic', value: 'test' } );

			const result = isValueDynamic( view, 'title' );

			expect( result ).toBe( true );
		} );

		it( 'should work with different setting keys', () => {
			const view = createMockView();
			const settings = view.model.get( 'settings' );
			( settings as any ).get = jest.fn().mockReturnValue( { $$type: 'dynamic', value: 'test' } );

			const result = isValueDynamic( view, 'paragraph' );

			expect( result ).toBe( true );
		} );
	} );

	describe( 'getViewTag', () => {
		it( 'should return null when widget type has no tag schema', () => {
			const view = createMockView();
			jest.mocked( getElementType ).mockReturnValue( {
				propsSchema: {},
			} as any );

			const result = getViewTag( view );

			expect( result ).toBeNull();
		} );

		it( 'should return tag from settings when available', () => {
			const view = createMockView();
			const settings = view.model.get( 'settings' );
			( settings as any ).get = jest.fn().mockReturnValue( { $$type: 'static', value: 'h2' } );

			jest.mocked( getElementType ).mockReturnValue( {
				propsSchema: {
					tag: { default: { $$type: 'static', value: 'h1' } },
				},
			} as any );
			jest.spyOn( stringPropTypeUtil, 'extract' ).mockReturnValueOnce( 'h2' );

			const result = getViewTag( view );

			expect( result ).toBe( 'h2' );
		} );

		it( 'should return default tag when settings tag not available', () => {
			const view = createMockView();
			const settings = view.model.get( 'settings' );
			( settings as any ).get = jest.fn().mockReturnValue( null );

			jest.mocked( getElementType ).mockReturnValue( {
				propsSchema: {
					tag: { default: { $$type: 'static', value: 'h1' } },
				},
			} as any );
			jest.spyOn( stringPropTypeUtil, 'extract' )
				.mockReturnValueOnce( null )
				.mockReturnValueOnce( 'h1' );

			const result = getViewTag( view );

			expect( result ).toBe( 'h1' );
		} );

		it( 'should return null when no tag available', () => {
			const view = createMockView();
			jest.mocked( getElementType ).mockReturnValue( null );

			const result = getViewTag( view );

			expect( result ).toBeNull();
		} );
	} );

	describe( 'getPreviewOffset', () => {
		let mockPreviewFrame: HTMLIFrameElement;

		beforeEach( () => {
			mockPreviewFrame = document.createElement( 'iframe' );
			Object.defineProperty( mockPreviewFrame, 'getBoundingClientRect', {
				value: jest.fn().mockReturnValue( {
					left: 100,
					top: 50,
				} ),
			} );

			const mockPreviewWrapper = document.createElement( 'div' );
			mockPreviewWrapper.scrollLeft = 20;
			mockPreviewWrapper.scrollTop = 30;

			( window as any ).elementor = {
				$preview: {
					get: jest.fn().mockReturnValue( mockPreviewFrame ),
				},
				$previewWrapper: {
					get: jest.fn().mockReturnValue( mockPreviewWrapper ),
				},
			};
		} );

		afterEach( () => {
			delete ( window as any ).elementor;
		} );

		it( 'should calculate offset with iframe and scroll positions', () => {
			const result = getPreviewOffset();

			expect( result ).toEqual( {
				left: 120,
				top: 80,
			} );
		} );

		it( 'should return fallback when preview elements not available', () => {
			( window as any ).elementor = {
				$preview: {
					get: jest.fn().mockReturnValue( null ),
				},
				$previewWrapper: {
					get: jest.fn().mockReturnValue( null ),
				},
			};

			const result = getPreviewOffset();

			expect( result ).toEqual( {
				left: 0,
				top: 0,
			} );
		} );

		it( 'should handle missing preview wrapper', () => {
			( window as any ).elementor.$previewWrapper.get = jest.fn().mockReturnValue( null );

			const result = getPreviewOffset();

			expect( result ).toEqual( {
				left: 100,
				top: 50,
			} );
		} );
	} );

	describe( 'syncViewSetting', () => {
		it( 'should not update when values are the same', () => {
			const view = createMockView();
			const settings = view.model.get( 'settings' );
			const setSpy = jest.spyOn( settings as any, 'set' );

			( settings as any ).get = jest.fn().mockReturnValue( { $$type: 'static', value: 'test' } );
			jest.spyOn( stringPropTypeUtil, 'extract' ).mockReturnValue( 'test' );
			jest.spyOn( stringPropTypeUtil, 'create' ).mockReturnValue( { $$type: 'static', value: 'test' } as any );

			syncViewSetting( view, 'testKey', stringPropTypeUtil );

			expect( setSpy ).not.toHaveBeenCalled();
		} );

		it( 'should update when transform changes value', () => {
			const view = createMockView();
			const settings = view.model.get( 'settings' );
			const setSpy = jest.spyOn( settings as any, 'set' );

			( settings as any ).get = jest.fn().mockReturnValue( { $$type: 'static', value: 'test' } );
			jest.spyOn( stringPropTypeUtil, 'extract' ).mockReturnValue( 'test' );
			jest.spyOn( stringPropTypeUtil, 'create' ).mockReturnValue( { $$type: 'static', value: 'TEST' } as any );

			syncViewSetting( view, 'testKey', stringPropTypeUtil, ( value ) => value.toUpperCase() );

			expect( setSpy ).toHaveBeenCalledWith( 'testKey', { $$type: 'static', value: 'TEST' } );
		} );

		it( 'should not update when transformed value is null', () => {
			const view = createMockView();
			const settings = view.model.get( 'settings' );
			const setSpy = jest.spyOn( settings as any, 'set' );

			( settings as any ).get = jest.fn().mockReturnValue( { $$type: 'static', value: 'test' } );
			jest.spyOn( stringPropTypeUtil, 'extract' ).mockReturnValue( 'test' );

			syncViewSetting( view, 'testKey', stringPropTypeUtil, () => null as any );

			expect( setSpy ).not.toHaveBeenCalled();
		} );

		it( 'should handle missing current value', () => {
			const view = createMockView();
			const settings = view.model.get( 'settings' );
			const setSpy = jest.spyOn( settings as any, 'set' );

			( settings as any ).get = jest.fn().mockReturnValue( null );
			jest.spyOn( stringPropTypeUtil, 'extract' ).mockReturnValue( null );

			syncViewSetting( view, 'testKey', stringPropTypeUtil );

			expect( setSpy ).not.toHaveBeenCalled();
		} );

		it( 'should work without transform function', () => {
			const view = createMockView();
			const settings = view.model.get( 'settings' );
			const setSpy = jest.spyOn( settings as any, 'set' );

			( settings as any ).get = jest.fn().mockReturnValue( { $$type: 'static', value: 'test' } );
			jest.spyOn( stringPropTypeUtil, 'extract' ).mockReturnValue( 'test' );

			syncViewSetting( view, 'testKey', stringPropTypeUtil );

			expect( setSpy ).not.toHaveBeenCalled();
		} );
	} );
} );

