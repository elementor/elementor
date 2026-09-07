import { createMockElement, createMockStyleDefinition } from 'test-utils';
import {
	ELEMENT_STYLE_CHANGE_EVENT,
	getCurrentDocumentId,
	getElements,
	getElementStyles,
	updateElementStyle,
} from '@elementor/editor-elements';
import type { StyleDefinition } from '@elementor/editor-styles';
import { __privateListenTo as listenTo } from '@elementor/editor-v1-adapters';

import { InvalidElementsStyleProviderMetaError } from '../errors';
import { documentElementsStylesProvider } from '../providers/document-elements-styles-provider';

jest.mock( '@elementor/editor-elements' );

jest.mock( '@elementor/editor-v1-adapters', () => ( {
	...jest.requireActual( '@elementor/editor-v1-adapters' ),
	__privateListenTo: jest.fn(),
} ) );

describe( 'documentElementsStylesProvider', () => {
	beforeEach( () => {
		jest.mocked( getElements ).mockReturnValue( [
			createMockElement( {
				model: {
					id: '1',
					styles: {
						's-1': createMockStyleDefinition( { id: 's-1' } ),
						's-2': createMockStyleDefinition( { id: 's-2' } ),
					},
				},
			} ),
			createMockElement( {
				model: {
					id: '2',
					styles: {
						's-3': createMockStyleDefinition( { id: 's-3' } ),
					},
				},
			} ),
		] );
	} );

	it( 'should generate the key based on current document', () => {
		// Arrange.
		jest.mocked( getCurrentDocumentId ).mockReturnValue( 42 );

		// Act.
		const key = documentElementsStylesProvider.getKey();

		// Assert.
		expect( key ).toBe( 'document-elements-42' );
	} );

	it( 'should return all the styles attached to all the document elements', () => {
		// Act.
		const styles = documentElementsStylesProvider.actions.all();

		// Assert.
		expect( styles ).toEqual( [
			expect.objectContaining( { id: 's-1' } ),
			expect.objectContaining( { id: 's-2' } ),
			expect.objectContaining( { id: 's-3' } ),
		] );
	} );

	it( 'should return all styles filtered by element', () => {
		// Act.
		const styles = documentElementsStylesProvider.actions.all( { elementId: '1' } );

		// Assert.
		expect( styles ).toEqual( [
			expect.objectContaining( { id: 's-1' } ),
			expect.objectContaining( { id: 's-2' } ),
		] );
	} );

	it( 'should retrieve an element style by id', () => {
		const styles: Record< string, StyleDefinition > = {
			'style-1': {
				id: 'style-1',
				label: 'Style 1',
				variants: [],
				type: 'class',
			},
			'style-2': {
				id: 'style-2',
				label: 'Style 2',
				variants: [],
				type: 'class',
			},
		};

		jest.mocked( getElementStyles ).mockImplementation( ( elementId ) => {
			return elementId === 'test-element-id' ? styles : null;
		} );

		// Act.
		const elementStyle = documentElementsStylesProvider.actions.get( 'style-2', { elementId: 'test-element-id' } );

		// Assert.
		expect( elementStyle ).toStrictEqual( styles[ 'style-2' ] );
	} );

	it( 'should throw when trying to get a style by id without passing an element id', () => {
		// Act & Assert.
		expect( () => documentElementsStylesProvider.actions.get( 'style', { notElementId: 'test-value' } ) ).toThrow(
			new InvalidElementsStyleProviderMetaError()
		);
	} );

	it( 'should update style props', () => {
		// Act.
		documentElementsStylesProvider.actions?.updateProps?.(
			{
				id: 'test-style',
				meta: {
					breakpoint: null,
					state: null,
				},
				props: {
					prop: 'value',
				},
			},
			{ elementId: 'test-element' }
		);

		// Assert.
		expect( updateElementStyle ).toHaveBeenCalledTimes( 1 );

		expect( updateElementStyle ).toHaveBeenCalledWith( {
			elementId: 'test-element',
			styleId: 'test-style',
			meta: {
				breakpoint: null,
				state: null,
			},
			props: {
				prop: 'value',
			},
		} );
	} );

	it.each( [
		{ elementsMeta: { notElementId: 'test-value' } },
		{ elementsMeta: { elementId: 123 } },
		{ elementsMeta: { elementId: null } },
		{ elementsMeta: { elementId: '' } },
		{ elementsMeta: { elementId: {} } },
	] )( 'should throw when updating props with invalid elements meta', ( { elementsMeta } ) => {
		// Act & Assert.
		expect(
			() =>
				documentElementsStylesProvider.actions?.updateProps?.(
					{
						id: 'test-id',
						meta: {
							breakpoint: null,
							state: null,
						},
						props: {
							prop: 'value',
						},
					},
					elementsMeta
				)
		).toThrow( new InvalidElementsStyleProviderMetaError() );
	} );

	describe( 'subscribe', () => {
		const setupListener = () => {
			const unsubscribeFromEvents = jest.fn();
			let emit = () => {};

			jest.mocked( listenTo ).mockImplementation( ( _events, callback ) => {
				emit = () =>
					callback( {
						type: 'window-event',
						event: ELEMENT_STYLE_CHANGE_EVENT,
						originalEvent: new CustomEvent( ELEMENT_STYLE_CHANGE_EVENT ),
					} );

				return unsubscribeFromEvents;
			} );

			const frames: FrameRequestCallback[] = [];

			jest.spyOn( window, 'requestAnimationFrame' ).mockImplementation( ( frame: FrameRequestCallback ) => {
				frames.push( frame );

				return frames.length;
			} );

			return {
				emitStyleRerenderEvent: () => emit(),
				runFrame: ( index: number ) => frames[ index ]( 0 ),
				frames: () => frames,
				unsubscribeFromEvents,
			};
		};

		it( 'should notify subscribers once per frame regardless of the number of events', () => {
			// Arrange.
			const listener = setupListener();
			const subscriber = jest.fn();

			documentElementsStylesProvider.subscribe( subscriber );

			// Act.
			listener.emitStyleRerenderEvent();
			listener.emitStyleRerenderEvent();
			listener.emitStyleRerenderEvent();

			// Assert.
			expect( listener.frames() ).toHaveLength( 1 );
			expect( subscriber ).not.toHaveBeenCalled();

			// Act.
			listener.runFrame( 0 );

			// Assert.
			expect( subscriber ).toHaveBeenCalledTimes( 1 );
		} );

		it( 'should schedule a new frame after the pending one ran', () => {
			// Arrange.
			const listener = setupListener();
			const subscriber = jest.fn();

			documentElementsStylesProvider.subscribe( subscriber );

			// Act.
			listener.emitStyleRerenderEvent();
			listener.runFrame( 0 );
			listener.emitStyleRerenderEvent();
			listener.runFrame( 1 );

			// Assert.
			expect( subscriber ).toHaveBeenCalledTimes( 2 );
		} );

		it( 'should cancel a pending frame when unsubscribing', () => {
			// Arrange.
			const listener = setupListener();
			const subscriber = jest.fn();
			const cancelAnimationFrameSpy = jest.spyOn( window, 'cancelAnimationFrame' ).mockImplementation();

			const unsubscribe = documentElementsStylesProvider.subscribe( subscriber );

			// Act.
			listener.emitStyleRerenderEvent();
			unsubscribe();

			// Assert.
			expect( cancelAnimationFrameSpy ).toHaveBeenCalledTimes( 1 );
			expect( listener.unsubscribeFromEvents ).toHaveBeenCalledTimes( 1 );
		} );
	} );
} );
