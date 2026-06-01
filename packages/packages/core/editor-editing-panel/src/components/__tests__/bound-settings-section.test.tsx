import * as React from 'react';
import { createMockElementType, createMockPropType, mockHistoryManager, renderWithTheme } from 'test-utils';
import { createControl, useBoundProp } from '@elementor/editor-controls';
import { type Control, type ObjectPropType, type PropValue, stringPropTypeUtil } from '@elementor/editor-props';
import { fireEvent, screen } from '@testing-library/react';

import { mockElement } from '../../__tests__/utils';
import { ElementProvider } from '../../contexts/element-context';
import { controlsRegistry } from '../../controls-registry/controls-registry';
import { BoundSettingsSection } from '../bound-settings-section';

jest.mock( '@elementor/editor-elements', () => ( {
	...jest.requireActual( '@elementor/editor-elements' ),
	getElementLabel: jest.fn( () => 'Mock Element' ),
	getElementSettings: jest.fn( () => ( {} ) ),
	updateElementSettings: jest.fn(),
} ) );
jest.mock( '@elementor/editor-documents', () => ( {
	setDocumentModifiedStatus: jest.fn(),
} ) );

const historyMock = mockHistoryManager();

const QUERY_BIND = 'query';
const SECTION_LABEL = 'Query';
const MOCK_CONTROL_TYPE = 'mock-text-bound-section';

const MockTextControl = createControl( ( { ariaLabel }: { ariaLabel: string } ) => {
	const { value, setValue, disabled } = useBoundProp( stringPropTypeUtil );

	return (
		<input
			type="text"
			aria-label={ ariaLabel }
			value={ value ?? '' }
			disabled={ disabled }
			onChange={ ( event ) => setValue( event.target.value ) }
		/>
	);
} );

beforeAll( () => {
	controlsRegistry.register( MOCK_CONTROL_TYPE, MockTextControl, 'full', stringPropTypeUtil );
} );

afterAll( () => {
	controlsRegistry.unregister( MOCK_CONTROL_TYPE );
} );

const titleVisibleOnlyForPostSource = createMockPropType( {
	kind: 'plain',
	key: 'string',
	dependencies: {
		relation: 'and',
		terms: [ { operator: 'eq', path: [ 'source' ], value: 'post', effect: 'hide' } ],
	},
} );

const queryPropType: ObjectPropType = createMockPropType( {
	kind: 'object',
	key: 'loop-query',
	shape: {
		source: createMockPropType( { kind: 'plain', key: 'string', default: { $$type: 'string', value: 'post' } } ),
		title: titleVisibleOnlyForPostSource,
	},
} );

const sectionItems: Control[] = [
	{
		type: 'control',
		value: { type: MOCK_CONTROL_TYPE, bind: 'source', label: 'Source', props: { ariaLabel: 'Source' } },
	},
	{
		type: 'control',
		value: { type: MOCK_CONTROL_TYPE, bind: 'title', label: 'Title', props: { ariaLabel: 'Title' } },
	},
];

function renderBoundSection( settings: Record< string, PropValue > = {} ) {
	const element = mockElement();
	const elementType = createMockElementType( {
		propsSchema: { [ QUERY_BIND ]: queryPropType },
	} );

	return renderWithTheme(
		<ElementProvider element={ element } elementType={ elementType } settings={ settings }>
			<BoundSettingsSection
				bind={ QUERY_BIND }
				label={ SECTION_LABEL }
				items={ sectionItems }
				element={ element }
				defaultExpanded
			/>
		</ElementProvider>
	);
}

function expandSection() {
	fireEvent.click( screen.getByRole( 'button', { name: `${ SECTION_LABEL } section` } ) );
}

describe( '<BoundSettingsSection />', () => {
	beforeEach( () => {
		historyMock.beforeEach();
	} );

	afterEach( () => {
		historyMock.afterEach();
	} );

	it( 'renders a collapsible section using the label as its title', () => {
		renderBoundSection();

		expect( screen.getByRole( 'button', { name: `${ SECTION_LABEL } section` } ) ).toBeInTheDocument();
	} );

	it( 'renders nested child controls via the registry', () => {
		renderBoundSection( {
			[ QUERY_BIND ]: {
				$$type: 'loop-query',
				value: {
					source: { $$type: 'string', value: 'post' },
					title: { $$type: 'string', value: 'My title' },
				},
			},
		} );
		expandSection();

		expect( screen.getByText( 'Source' ) ).toBeInTheDocument();
		expect( screen.getByText( 'Title' ) ).toBeInTheDocument();
	} );

	it( 'hides a child whose dependency triggers a hide effect', () => {
		renderBoundSection( {
			[ QUERY_BIND ]: {
				$$type: 'loop-query',
				value: {
					source: { $$type: 'string', value: 'manual' },
				},
			},
		} );
		expandSection();

		expect( screen.getByText( 'Source' ) ).toBeInTheDocument();
		expect( screen.queryByText( 'Title' ) ).not.toBeInTheDocument();
	} );

} );
