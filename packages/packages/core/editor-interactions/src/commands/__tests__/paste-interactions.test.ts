import { createMockElement, dispatchCommandBefore, mockHistoryManager } from 'test-utils';
import {
	type ElementInteractions,
	getContainer,
	getElementInteractions,
	getElementLabel,
	getWidgetsCache,
	updateElementInteractions,
	type V1ElementModelProps,
} from '@elementor/editor-elements';

import { getClipboardElements } from '../get-clipboard-elements';
import { initPasteInteractionsCommand } from '../paste-interactions';

jest.mock( '@elementor/editor-elements' );

jest.mock( '../get-clipboard-elements', () => ( {
	getClipboardElements: jest.fn(),
} ) );

const ATOMIC_WIDGET_TYPE = 'atomic-widget';
const SOURCE_INTERACTION_ID = 'source-interaction-id';

function createClipboardElementWithInteractions(): unknown {
	return {
		id: 'clipboard-el',
		elType: 'widget',
		interactions: {
			version: 1,
			items: [
				{
					$$type: 'interaction-item',
					value: {
						interaction_id: { $$type: 'string', value: SOURCE_INTERACTION_ID },
						trigger: { $$type: 'string', value: 'click' },
						animation: { $$type: 'animation-preset', value: {} },
					},
				},
			],
		},
	};
}

describe( 'paste-interactions command', () => {
	const historyMock = mockHistoryManager();

	beforeEach( () => {
		initPasteInteractionsCommand();

		jest.mocked( getWidgetsCache ).mockReturnValue( {
			[ ATOMIC_WIDGET_TYPE ]: {
				elType: 'widget',
				atomic_props_schema: {},
				title: 'Test Atomic Widget',
				controls: {},
			},
		} );
		jest.mocked( getElementLabel ).mockReturnValue( 'Test Element' );
		jest.mocked( getElementInteractions ).mockReturnValue( undefined );

		historyMock.beforeEach();
	} );

	afterEach( () => {
		historyMock.afterEach();
		jest.resetAllMocks();
	} );

	it( 'should call updateElementInteractions with regenerated interaction ids when clipboard has interactions', () => {
		const container = createMockElement( {
			model: { id: 'target-container', widgetType: ATOMIC_WIDGET_TYPE },
		} );
		jest.mocked( getContainer ).mockImplementation( ( id ) => ( id === container.id ? container : null ) );
		jest.mocked( getClipboardElements ).mockReturnValue( [
			createClipboardElementWithInteractions() as unknown as V1ElementModelProps,
		] );

		dispatchCommandBefore( 'document/elements/paste-interactions', {
			containers: [ container ],
		} );

		expect( updateElementInteractions ).toHaveBeenCalledTimes( 1 );
		const [ call ] = jest.mocked( updateElementInteractions ).mock.calls;

		const interactions = call[ 0 ].interactions as ElementInteractions;
		expect( interactions ).toBeDefined();
		expect( interactions?.version ).toBe( 1 );
		expect( interactions?.items ).toHaveLength( 1 );

		const pastedId = interactions?.items?.[ 0 ]?.value?.interaction_id?.value;
		expect( pastedId ).toBeDefined();
		expect( pastedId ).toMatch( /^temp-[a-z0-9]+$/i );
		expect( pastedId ).not.toBe( SOURCE_INTERACTION_ID );
	} );

	it( 'should not call updateElementInteractions when clipboard is empty', () => {
		const container = createMockElement( {
			model: { id: 'target-container', widgetType: ATOMIC_WIDGET_TYPE },
		} );
		jest.mocked( getContainer ).mockImplementation( ( id ) => ( id === container.id ? container : null ) );
		jest.mocked( getClipboardElements ).mockReturnValue( undefined );

		dispatchCommandBefore( 'document/elements/paste-interactions', {
			containers: [ container ],
		} );

		expect( updateElementInteractions ).not.toHaveBeenCalled();
	} );

	it( 'should not call updateElementInteractions when clipboard element has no interactions', () => {
		const container = createMockElement( {
			model: { id: 'target-container', widgetType: ATOMIC_WIDGET_TYPE },
		} );
		jest.mocked( getContainer ).mockImplementation( ( id ) => ( id === container.id ? container : null ) );
		jest.mocked( getClipboardElements ).mockReturnValue( [ { id: 'clipboard-el', elType: 'widget' } ] );

		dispatchCommandBefore( 'document/elements/paste-interactions', {
			containers: [ container ],
		} );

		expect( updateElementInteractions ).not.toHaveBeenCalled();
	} );

	it( 'should use custom storageKey when provided', () => {
		const container = createMockElement( {
			model: { id: 'target-container', widgetType: ATOMIC_WIDGET_TYPE },
		} );
		jest.mocked( getContainer ).mockImplementation( ( id ) => ( id === container.id ? container : null ) );
		jest.mocked( getClipboardElements ).mockReturnValue( [
			createClipboardElementWithInteractions() as unknown as V1ElementModelProps,
		] );

		dispatchCommandBefore( 'document/elements/paste-interactions', {
			containers: [ container ],
			storageKey: 'custom-clipboard',
		} );

		expect( getClipboardElements ).toHaveBeenCalledWith( 'custom-clipboard' );
		expect( updateElementInteractions ).toHaveBeenCalled();
	} );

	it( 'should accept single container via args.container', () => {
		const container = createMockElement( {
			model: { id: 'target-container', widgetType: ATOMIC_WIDGET_TYPE },
		} );
		jest.mocked( getContainer ).mockImplementation( ( id ) => ( id === container.id ? container : null ) );
		jest.mocked( getClipboardElements ).mockReturnValue( [
			createClipboardElementWithInteractions() as unknown as V1ElementModelProps,
		] );

		dispatchCommandBefore( 'document/elements/paste-interactions', {
			container,
		} );

		expect( updateElementInteractions ).toHaveBeenCalledWith(
			expect.objectContaining( { elementId: 'target-container' } )
		);
	} );

	it( 'should not paste to non-atomic containers', () => {
		const container = createMockElement( {
			model: { id: 'target-container', widgetType: 'non-atomic-widget' },
		} );
		jest.mocked( getContainer ).mockImplementation( ( id ) => ( id === container.id ? container : null ) );
		jest.mocked( getWidgetsCache ).mockReturnValue( {
			'non-atomic-widget': { elType: 'widget', title: 'Test Non-Atomic Widget', controls: {} },
		} );
		jest.mocked( getClipboardElements ).mockReturnValue( [
			createClipboardElementWithInteractions() as unknown as V1ElementModelProps,
		] );

		dispatchCommandBefore( 'document/elements/paste-interactions', {
			containers: [ container ],
		} );

		expect( updateElementInteractions ).not.toHaveBeenCalled();
	} );

	it( 'should restore previous interactions on undo', () => {
		const container = createMockElement( {
			model: { id: 'target-container', widgetType: ATOMIC_WIDGET_TYPE },
		} );
		const previousInteractions = {
			version: 1,
			items: [
				{
					$$type: 'interaction-item',
					value: {
						interaction_id: { $$type: 'string', value: 'previous-id' },
						trigger: { $$type: 'string', value: 'hover' },
						animation: { $$type: 'animation-preset', value: {} },
					},
				},
			],
		};
		jest.mocked( getContainer ).mockImplementation( ( id ) => ( id === container.id ? container : null ) );
		jest.mocked( getElementInteractions ).mockReturnValue( previousInteractions as unknown as ElementInteractions );
		jest.mocked( getClipboardElements ).mockReturnValue( [
			createClipboardElementWithInteractions() as unknown as V1ElementModelProps,
		] );

		dispatchCommandBefore( 'document/elements/paste-interactions', {
			containers: [ container ],
		} );

		expect( updateElementInteractions ).toHaveBeenCalledTimes( 1 );

		historyMock.instance.undo();

		expect( updateElementInteractions ).toHaveBeenCalledTimes( 2 );
		expect( updateElementInteractions ).toHaveBeenLastCalledWith( {
			elementId: 'target-container',
			interactions: previousInteractions,
		} );
	} );
} );
