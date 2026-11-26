import { createMockElement, createMockPropType, mockHistoryManager } from 'test-utils';
import {
	createElementStyle,
	deleteElementStyle,
	getElementStyles,
	getWidgetsCache,
	updateElementStyle,
} from '@elementor/editor-elements';

import { undoableApplyElementStyles } from '../paste-element-style';

jest.mock( '@elementor/editor-elements' );

const ATOMIC_WIDGET_TYPE = 'atomic-widget';
const DESKTOP = { breakpoint: 'desktop', state: null } as const;
const MOBILE = { breakpoint: 'mobile', state: null } as const;

const createContainer = ( id: string ) => createMockElement( { model: { id, widgetType: ATOMIC_WIDGET_TYPE } } );

describe( 'undoableApplyElementStyles', () => {
	const historyMock = mockHistoryManager();

	beforeEach( () => {
		historyMock.beforeEach();

		jest.mocked( getWidgetsCache ).mockReturnValue( {
			[ ATOMIC_WIDGET_TYPE ]: {
				elType: 'widget',
				title: 'Test Atomic Widget',
				controls: {},
				atomic_controls: [],
				atomic_props_schema: { classes: createMockPropType( { key: 'classes', kind: 'plain' } ) },
				atomic_style_states: [],
			},
		} );
	} );

	afterEach( () => {
		historyMock.afterEach();
		jest.resetAllMocks();
	} );

	it( 'should write each container its own variants in one history step, and undo them together', () => {
		// Arrange.
		const existingStyle = {
			id: 's-root',
			label: 'local',
			type: 'class' as const,
			variants: [ { meta: DESKTOP, props: { gap: 'old' }, custom_css: null } ],
		};

		jest.mocked( getElementStyles ).mockImplementation( ( id ) =>
			id === 'root' ? { [ existingStyle.id ]: existingStyle } : {}
		);
		jest.mocked( createElementStyle ).mockReturnValue( 's-label' );

		const root = createContainer( 'root' );
		const label = createContainer( 'label' );

		// Act.
		undoableApplyElementStyles()( {
			entries: [
				{
					container: root,
					variants: [
						{ meta: DESKTOP, props: { background: 'dark' }, custom_css: null },
						{ meta: MOBILE, props: { padding: 'small' }, custom_css: null },
					],
				},
				{ container: label, variants: [ { meta: DESKTOP, props: { color: 'white' }, custom_css: null } ] },
			],
			subtitle: 'Button style',
		} );

		// Assert.
		expect( updateElementStyle ).toHaveBeenCalledTimes( 2 );
		expect( updateElementStyle ).toHaveBeenCalledWith(
			expect.objectContaining( { meta: MOBILE, styleId: 's-root' } )
		);
		expect( createElementStyle ).toHaveBeenCalledWith(
			expect.objectContaining( { elementId: 'label', meta: DESKTOP, props: { color: 'white' } } )
		);
		expect( historyMock.instance.get()?.subTitle ).toBe( 'Button style' );

		// Act.
		historyMock.instance.undo();

		// Assert.
		expect( deleteElementStyle ).toHaveBeenCalledWith( 'label', 's-label' );
		expect( createElementStyle ).toHaveBeenLastCalledWith(
			expect.objectContaining( { elementId: 'root', styleId: 's-root', props: { gap: 'old' } } )
		);
	} );
} );
