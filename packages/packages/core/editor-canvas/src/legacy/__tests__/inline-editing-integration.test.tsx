import * as React from 'react';
import { act, render, screen, waitFor } from '@testing-library/react';
import { getContainer } from '@elementor/editor-elements';
import { htmlPropTypeUtil } from '@elementor/editor-props';

import { activate, deactivate, getRegistrations, register } from '../../replacements/registry';
import { ReplacementManager } from '../../replacements/replacement-manager';

jest.mock( '@elementor/editor-elements' );
jest.mock( '@elementor/editor-props' );
jest.mock( '@elementor/editor-ui', () => ( {
	ThemeProvider: ( { children }: { children: React.ReactNode } ) => <div>{children}</div>,
} ) );
jest.mock( '@elementor/editor-controls', () => ( {
	InlineEditor: ( { value, attributes }: { value: string; attributes: { class: string } } ) => (
		<div data-testid="inline-editor" className={attributes.class}>
			{value}
		</div>
	),
	InlineEditingReplacement: ( {
		elementId,
		classes,
		expectedTag,
	}: {
		elementId: string;
		classes: string;
		expectedTag: string;
	} ) => (
		<div data-testid="inline-editing-replacement">
			<div data-element-id={elementId} className={classes} data-tag={expectedTag}>
				Inline Editor Active
			</div>
		</div>
	),
} ) );

const ELEMENT_ID = 'test-heading-123';
const WIDGET_TITLE = 'Test Heading';
const WIDGET_CLASSES = 'elementor-heading-title test-class strip-styles';
const EXPECTED_TAG = 'h1';

describe( 'Inline Editing Integration', () => {
	let mockContainer: any;
	let targetElement: HTMLElement;

	beforeEach( () => {
		targetElement = document.createElement( 'div' );
		targetElement.innerHTML = `<h1 class="elementor-heading-title test-class">${WIDGET_TITLE}</h1>`;
		document.body.appendChild( targetElement );

		mockContainer = {
			id: ELEMENT_ID,
			settings: {
				get: jest.fn( ( key: string ) => {
					if ( key === 'title' ) {
						return htmlPropTypeUtil.create( WIDGET_TITLE );
					}
					return undefined;
				} ),
			},
			model: {
				get: jest.fn( ( key: string ) => {
					if ( key === 'widgetType' ) {
						return 'e-heading';
					}
					return undefined;
				} ),
			},
		};

		jest.mocked( getContainer ).mockReturnValue( mockContainer );
		jest.mocked( htmlPropTypeUtil.extract ).mockReturnValue( WIDGET_TITLE );
	} );

	afterEach( () => {
		document.body.innerHTML = '';
		jest.clearAllMocks();
	} );

	it( 'should register and activate inline editing replacement', async () => {
		render( <ReplacementManager /> );

		act( () => {
			register( {
				elementId: ELEMENT_ID,
				targetElement,
				type: 'inline-editing',
				shouldActivate: () => true,
				onActivate: () => {
					targetElement.innerHTML = '';
				},
				getProps: () => ( {
					classes: WIDGET_CLASSES,
					expectedTag: EXPECTED_TAG,
					onComplete: jest.fn(),
				} ),
			} );
		} );

		const registrations = getRegistrations();
		expect( registrations ).toHaveLength( 1 );
		expect( registrations[ 0 ].isActive ).toBe( false );
	} );

	it( 'should render InlineEditingReplacement when activated', async () => {
		const { rerender } = render( <ReplacementManager /> );

		act( () => {
			register( {
				elementId: ELEMENT_ID,
				targetElement,
				type: 'inline-editing',
				shouldActivate: () => true,
				onActivate: () => {
					targetElement.innerHTML = '';
				},
				getProps: () => ( {
					classes: WIDGET_CLASSES,
					expectedTag: EXPECTED_TAG,
					onComplete: jest.fn(),
				} ),
			} );
		} );

		act( () => {
			activate( ELEMENT_ID );
		} );

		rerender( <ReplacementManager /> );

		await waitFor( () => {
			expect( screen.getByTestId( 'inline-editing-replacement' ) ).toBeInTheDocument();
		} );

		const replacement = screen.getByTestId( 'inline-editing-replacement' );
		const content = replacement.querySelector( '[data-element-id]' );

		expect( content ).toHaveAttribute( 'data-element-id', ELEMENT_ID );
		expect( content ).toHaveAttribute( 'data-tag', EXPECTED_TAG );
		expect( content ).toHaveClass( WIDGET_CLASSES );
	} );

	it( 'should unmount InlineEditingReplacement when deactivated', async () => {
		const { rerender } = render( <ReplacementManager /> );

		act( () => {
			register( {
				elementId: ELEMENT_ID,
				targetElement,
				type: 'inline-editing',
				shouldActivate: () => true,
				onActivate: () => {
					targetElement.innerHTML = '';
				},
				getProps: () => ( {
					classes: WIDGET_CLASSES,
					expectedTag: EXPECTED_TAG,
					onComplete: jest.fn(),
				} ),
			} );
		} );

		act( () => {
			activate( ELEMENT_ID );
		} );

		rerender( <ReplacementManager /> );

		await waitFor( () => {
			expect( screen.getByTestId( 'inline-editing-replacement' ) ).toBeInTheDocument();
		} );

		act( () => {
			deactivate( ELEMENT_ID );
		} );

		rerender( <ReplacementManager /> );

		expect( screen.queryByTestId( 'inline-editing-replacement' ) ).not.toBeInTheDocument();
	} );

	it( 'should call onActivate callback and clear element', async () => {
		const onActivate = jest.fn();

		render( <ReplacementManager /> );

		act( () => {
			register( {
				elementId: ELEMENT_ID,
				targetElement,
				type: 'inline-editing',
				shouldActivate: () => true,
				onActivate,
				getProps: () => ( {
					classes: WIDGET_CLASSES,
					expectedTag: EXPECTED_TAG,
					onComplete: jest.fn(),
				} ),
			} );
		} );

		const initialHTML = targetElement.innerHTML;
		expect( initialHTML ).toContain( WIDGET_TITLE );

		act( () => {
			activate( ELEMENT_ID );
		} );

		expect( onActivate ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'should not activate when shouldActivate returns false', async () => {
		render( <ReplacementManager /> );

		act( () => {
			register( {
				elementId: ELEMENT_ID,
				targetElement,
				type: 'inline-editing',
				shouldActivate: () => false,
				getProps: () => ( {
					classes: WIDGET_CLASSES,
					expectedTag: EXPECTED_TAG,
					onComplete: jest.fn(),
				} ),
			} );
		} );

		act( () => {
			activate( ELEMENT_ID );
		} );

		const registrations = getRegistrations();
		expect( registrations[ 0 ].isActive ).toBe( false );
		expect( screen.queryByTestId( 'inline-editing-replacement' ) ).not.toBeInTheDocument();
	} );

	it( 'should pass correct props to InlineEditingReplacement', async () => {
		const mockProps = {
			classes: WIDGET_CLASSES,
			expectedTag: EXPECTED_TAG,
			toolbarOffset: { left: 100, top: 200 },
			onComplete: jest.fn(),
		};

		const { rerender } = render( <ReplacementManager /> );

		act( () => {
			register( {
				elementId: ELEMENT_ID,
				targetElement,
				type: 'inline-editing',
				shouldActivate: () => true,
				onActivate: () => {},
				getProps: () => mockProps,
			} );
		} );

		act( () => {
			activate( ELEMENT_ID );
		} );

		rerender( <ReplacementManager /> );

		await waitFor( () => {
			expect( screen.getByTestId( 'inline-editing-replacement' ) ).toBeInTheDocument();
		} );

		const replacement = screen.getByTestId( 'inline-editing-replacement' );
		const content = replacement.querySelector( '[data-element-id]' );

		expect( content ).toHaveClass( WIDGET_CLASSES );
		expect( content ).toHaveAttribute( 'data-tag', EXPECTED_TAG );
	} );
} );

