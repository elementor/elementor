import { act } from 'react';
import { createMockElementType, mockHistoryManager } from 'test-utils';
import {
	createElementStyle,
	deleteElementStyle,
	getElementLabel,
	getElementType,
	updateElementStyle,
} from '@elementor/editor-elements';
import { type PropType } from '@elementor/editor-props';
import { type StyleDefinition } from '@elementor/editor-styles';

import {
	cleanupClosedStructureFixture,
	type ClosedStructureFixture,
	setupClosedStructureFixture,
} from '../../closed-structure/__tests__/closed-structure-fixture';
import { updateLocalStyles } from '../update-local-styles';

jest.mock( '@elementor/editor-elements', () => ( {
	...jest.requireActual( '@elementor/editor-elements' ),
	createElementStyle: jest.fn(),
	deleteElementStyle: jest.fn(),
	getElementLabel: jest.fn(),
	getElementType: jest.fn(),
	updateElementStyle: jest.fn(),
} ) );

const DESKTOP = { breakpoint: 'desktop', state: null } as const;
const ROOT_STYLE_ID = 'e-root-style';
const CREATED_LABEL_STYLE_ID = 'e-label-style';
const PREVIOUS_GAP = { $$type: 'size', value: { size: 8, unit: 'px' } };
const NEW_GAP = { $$type: 'size', value: { size: 24, unit: 'px' } };

const CLASSES_PROP_TYPE = { kind: 'plain', key: 'classes' } as PropType;

const ROOT_LOCAL_STYLE: StyleDefinition = {
	id: ROOT_STYLE_ID,
	type: 'class',
	label: 'local',
	variants: [ { meta: DESKTOP, props: { gap: PREVIOUS_GAP }, custom_css: null } ],
};

describe( 'updateLocalStyles', () => {
	const historyMock = mockHistoryManager();
	let fixture: ClosedStructureFixture;

	beforeEach( () => {
		fixture = setupClosedStructureFixture();
		historyMock.beforeEach();
		jest.useFakeTimers();

		fixture.root.model.set( 'styles', { [ ROOT_STYLE_ID ]: ROOT_LOCAL_STYLE } );

		jest.mocked( getElementType ).mockImplementation( ( type ) =>
			createMockElementType( { key: type, propsSchema: { classes: CLASSES_PROP_TYPE } } )
		);
		jest.mocked( getElementLabel ).mockReturnValue( 'Icon button' );
		jest.mocked( createElementStyle ).mockReturnValue( CREATED_LABEL_STYLE_ID );
	} );

	afterEach( () => {
		historyMock.afterEach();
		cleanupClosedStructureFixture();
		jest.useRealTimers();
	} );

	const run = () => {
		updateLocalStyles( {
			rootId: fixture.root.id,
			elementIds: [ fixture.root.id, fixture.label.id ],
			meta: DESKTOP,
			props: { gap: NEW_GAP },
			propDisplayName: 'Gap',
		} );

		jest.runAllTimers();
	};

	it( 'should update an existing local style and create a missing one, in one history step named after the widget', () => {
		// Act
		run();

		// Assert
		expect( updateElementStyle ).toHaveBeenCalledWith( {
			elementId: fixture.root.id,
			styleId: ROOT_STYLE_ID,
			meta: DESKTOP,
			props: { gap: NEW_GAP },
		} );
		expect( createElementStyle ).toHaveBeenCalledWith( {
			styleId: undefined,
			elementId: fixture.label.id,
			classesProp: 'classes',
			label: 'local',
			meta: DESKTOP,
			props: { gap: NEW_GAP },
		} );

		const historyItem = historyMock.instance.get();

		expect( historyItem?.title ).toBe( 'Icon button' );
		expect( historyItem?.subTitle ).toBe( 'Gap edited' );
	} );

	it( 'should restore the previous values and delete the created style on undo, and reuse the style id on redo', () => {
		// Arrange
		run();

		// Act
		act( () => historyMock.instance.undo() );

		// Assert
		expect( updateElementStyle ).toHaveBeenLastCalledWith( {
			elementId: fixture.root.id,
			styleId: ROOT_STYLE_ID,
			meta: DESKTOP,
			props: { gap: PREVIOUS_GAP },
		} );
		expect( deleteElementStyle ).toHaveBeenCalledWith( fixture.label.id, CREATED_LABEL_STYLE_ID );

		// Act
		act( () => historyMock.instance.redo() );

		// Assert
		expect( createElementStyle ).toHaveBeenLastCalledWith(
			expect.objectContaining( { elementId: fixture.label.id, styleId: CREATED_LABEL_STYLE_ID } )
		);
	} );

	it( 'should write null on undo for a prop the local style did not have', () => {
		// Arrange
		fixture.root.model.set( 'styles', {
			[ ROOT_STYLE_ID ]: { ...ROOT_LOCAL_STYLE, variants: [ { meta: DESKTOP, props: {}, custom_css: null } ] },
		} );
		run();

		// Act
		act( () => historyMock.instance.undo() );

		// Assert
		expect( updateElementStyle ).toHaveBeenLastCalledWith(
			expect.objectContaining( { elementId: fixture.root.id, props: { gap: null } } )
		);
	} );
} );
