import * as React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';

import { DesignSystemPanelContent } from '../design-system-panel-content';
import {
	getInitialDesignSystemTab,
	notifyDesignSystemTabChange,
	persistDesignSystemTab,
} from '../../initial-tab';

/**
 * `mockVariablesCloseAttempt` / `mockClassesCloseAttempt` — declared with the
 * `mock` prefix so babel-jest's hoisting plugin lifts them alongside
 * `jest.mock` factories so they are in-scope inside the closure below.
 */
const mockVariablesCloseAttempt = jest.fn();
const mockClassesCloseAttempt = jest.fn();

// Captures the Tabs `onChange` prop so Tab click tests can invoke it directly,
// since we replace Tabs/Tab with lightweight test stubs.
let capturedTabsOnChange:
	| ( ( e: React.SyntheticEvent, val: string ) => void )
	| undefined;

jest.mock( '@elementor/editor-panels', () => ( {
	Panel: ( { children }: { children: React.ReactNode } ) => (
		<div role="dialog">{ children }</div>
	),
	PanelBody: ( { children }: { children: React.ReactNode } ) => (
		<div>{ children }</div>
	),
	PanelHeader: ( { children }: { children: React.ReactNode } ) => (
		<header>{ children }</header>
	),
	PanelHeaderTitle: ( { children }: { children: React.ReactNode } ) => (
		<h2>{ children }</h2>
	),
} ) );

jest.mock( '@elementor/editor-ui', () => ( {
	ThemeProvider: ( { children }: { children: React.ReactNode } ) => (
		<>{ children }</>
	),
} ) );

jest.mock( '@elementor/icons', () => ( {
	ColorFilterIcon: () => <span data-testid="color-filter-icon" />,
	ColorSwatchIcon: () => <span data-testid="color-swatch-icon" />,
} ) );

jest.mock( '@wordpress/i18n', () => ( {
	__: ( str: string ) => str,
} ) );

jest.mock( '../../initial-tab', () => ( {
	getInitialDesignSystemTab: jest.fn( () => 'variables' ),
	notifyDesignSystemTabChange: jest.fn(),
	persistDesignSystemTab: jest.fn(),
} ) );

// Using jest.fn() directly in the factory avoids TDZ issues.
// Retrieve the mock references via require() after the registry is set up.
jest.mock( '@elementor/editor-global-classes', () => ( {
	ClassManagerPanelEmbedded: jest.fn(),
} ) );

jest.mock( '@elementor/editor-variables', () => ( {
	VariablesManagerPanelEmbedded: jest.fn(),
} ) );

// Retrieve typed references to the mock components after the mocks are set up.
// Following the pattern used by variables-manager-panel.test.tsx.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const mockVariablesManagerPanelEmbedded = require( '@elementor/editor-variables' )
	.VariablesManagerPanelEmbedded as jest.Mock;
// eslint-disable-next-line @typescript-eslint/no-require-imports
const mockClassManagerPanelEmbedded = require( '@elementor/editor-global-classes' )
	.ClassManagerPanelEmbedded as jest.Mock;

jest.mock( '@elementor/ui', () => ( {
	useTabs: ( currentTab: string ) => ( {
		getTabProps: ( tab: string ) => ( { value: tab } ),
		getTabPanelProps: () => ( {} ),
		getTabsProps: () => ( {
			value: currentTab,
			onChange: jest.fn(),
		} ),
	} ),
	Tabs: ( {
		children,
		onChange,
	}: {
		children: React.ReactNode;
		onChange: ( e: React.SyntheticEvent, val: string ) => void;
	} ) => {
		capturedTabsOnChange = onChange;
		return <div role="tablist">{ children }</div>;
	},
	Tab: ( { label, value }: { label: string; value: string } ) => (
		<button
			role="tab"
			onClick={ () =>
				capturedTabsOnChange?.(
					{} as React.SyntheticEvent,
					value
				)
			}
		>
			{ label }
		</button>
	),
	Box: ( {
		children,
		role,
	}: {
		children: React.ReactNode;
		role?: string;
	} ) => <div role={ role }>{ children }</div>,
	Stack: ( { children }: { children: React.ReactNode } ) => (
		<div>{ children }</div>
	),
	Divider: () => <hr />,
	CloseButton: ( {
		onClick,
		'aria-label': ariaLabel,
	}: {
		onClick: () => void;
		'aria-label'?: string;
	} ) => (
		<button onClick={ onClick } aria-label={ ariaLabel || 'Close' } />
	),
} ) );

const SET_TAB_EVENT = 'elementor/design-system/set-tab';

describe( 'DesignSystemPanelContent', () => {
	const onRequestClose = jest.fn();

	beforeEach( () => {
		jest.clearAllMocks();
		capturedTabsOnChange = undefined;
		jest.mocked( getInitialDesignSystemTab ).mockReturnValue( 'variables' );

		// Default implementations: expose close attempts and render test ids
		mockVariablesManagerPanelEmbedded.mockImplementation(
			( {
				onExposeCloseAttempt,
			}: {
				onRequestClose: () => void;
				onExposeCloseAttempt?: ( fn: ( () => void ) | null ) => void;
			} ) => {
				React.useEffect( () => {
					onExposeCloseAttempt?.( mockVariablesCloseAttempt );
					return () => onExposeCloseAttempt?.( null );
				}, [ onExposeCloseAttempt ] );
				return (
					<div data-testid="variables-manager-embedded">
						Variables Manager Content
					</div>
				);
			}
		);

		mockClassManagerPanelEmbedded.mockImplementation(
			( {
				onExposeCloseAttempt,
			}: {
				onRequestClose: () => void;
				onExposeCloseAttempt?: ( fn: ( () => void ) | null ) => void;
			} ) => {
				React.useEffect( () => {
					onExposeCloseAttempt?.( mockClassesCloseAttempt );
					return () => onExposeCloseAttempt?.( null );
				}, [ onExposeCloseAttempt ] );
				return (
					<div data-testid="class-manager-embedded">
						Class Manager Content
					</div>
				);
			}
		);
	} );

	// -------------------------------------------------------------------------
	// Rendering
	// -------------------------------------------------------------------------

	describe( 'rendering', () => {
		it( 'should render the panel dialog and heading', () => {
			render(
				<DesignSystemPanelContent onRequestClose={ onRequestClose } />
			);

			expect( screen.getByRole( 'dialog' ) ).toBeInTheDocument();
			expect(
				screen.getByRole( 'heading', { level: 2 } )
			).toHaveTextContent( 'Design system' );
		} );

		it( 'should render Variables and Classes tabs', () => {
			render(
				<DesignSystemPanelContent onRequestClose={ onRequestClose } />
			);

			const tabs = screen.getAllByRole( 'tab' );
			expect( tabs ).toHaveLength( 2 );
			expect( tabs[ 0 ] ).toHaveTextContent( 'Variables' );
			expect( tabs[ 1 ] ).toHaveTextContent( 'Classes' );
		} );

		it( 'should render a close button', () => {
			render(
				<DesignSystemPanelContent onRequestClose={ onRequestClose } />
			);

			expect(
				screen.getByRole( 'button', { name: 'Close' } )
			).toBeInTheDocument();
		} );
	} );

	// -------------------------------------------------------------------------
	// Default tab behavior — "open from top bar"
	// -------------------------------------------------------------------------

	describe( 'initial tab (top-bar open behavior)', () => {
		it( 'should show Variables content by default when no preference is stored', () => {
			jest
				.mocked( getInitialDesignSystemTab )
				.mockReturnValue( 'variables' );

			render(
				<DesignSystemPanelContent onRequestClose={ onRequestClose } />
			);

			expect(
				screen.getByTestId( 'variables-manager-embedded' )
			).toBeInTheDocument();
			expect(
				screen.queryByTestId( 'class-manager-embedded' )
			).not.toBeInTheDocument();
		} );

		it( 'should show Classes content when classes was the last persisted tab', () => {
			// Simulates: user switched to classes → closed → reopened from top bar
			jest.mocked( getInitialDesignSystemTab ).mockReturnValue( 'classes' );

			render(
				<DesignSystemPanelContent onRequestClose={ onRequestClose } />
			);

			expect(
				screen.getByTestId( 'class-manager-embedded' )
			).toBeInTheDocument();
			expect(
				screen.queryByTestId( 'variables-manager-embedded' )
			).not.toBeInTheDocument();
		} );

		it( 'should initialise from the pending tab when one was set before opening', () => {
			// Simulates: panel was opened via "open-classes" event which calls
			// setPendingDesignSystemTab('classes') before mount.
			jest.mocked( getInitialDesignSystemTab ).mockReturnValue( 'classes' );

			render(
				<DesignSystemPanelContent onRequestClose={ onRequestClose } />
			);

			expect(
				screen.getByTestId( 'class-manager-embedded' )
			).toBeInTheDocument();
		} );

		it( 'should notify tab change on mount with the initial tab', () => {
			jest
				.mocked( getInitialDesignSystemTab )
				.mockReturnValue( 'variables' );

			render(
				<DesignSystemPanelContent onRequestClose={ onRequestClose } />
			);

			expect( jest.mocked( notifyDesignSystemTabChange ) ).toHaveBeenCalledWith(
				'variables'
			);
		} );
	} );

	// -------------------------------------------------------------------------
	// Tab switching — UI click
	// -------------------------------------------------------------------------

	describe( 'tab switching via UI click', () => {
		it( 'should render class manager when Classes tab is clicked', () => {
			render(
				<DesignSystemPanelContent onRequestClose={ onRequestClose } />
			);

			const classesTab = screen
				.getAllByRole( 'tab' )
				.find( ( t ) => t.textContent === 'Classes' )!;

			act( () => {
				fireEvent.click( classesTab );
			} );

			expect(
				screen.getByTestId( 'class-manager-embedded' )
			).toBeInTheDocument();
			expect(
				screen.queryByTestId( 'variables-manager-embedded' )
			).not.toBeInTheDocument();
		} );

		it( 'should render variables manager when Variables tab is clicked after switching', () => {
			jest.mocked( getInitialDesignSystemTab ).mockReturnValue( 'classes' );

			render(
				<DesignSystemPanelContent onRequestClose={ onRequestClose } />
			);

			const variablesTab = screen
				.getAllByRole( 'tab' )
				.find( ( t ) => t.textContent === 'Variables' )!;

			act( () => {
				fireEvent.click( variablesTab );
			} );

			expect(
				screen.getByTestId( 'variables-manager-embedded' )
			).toBeInTheDocument();
			expect(
				screen.queryByTestId( 'class-manager-embedded' )
			).not.toBeInTheDocument();
		} );

		it( 'should persist the selected tab when clicking Classes', () => {
			render(
				<DesignSystemPanelContent onRequestClose={ onRequestClose } />
			);

			const classesTab = screen
				.getAllByRole( 'tab' )
				.find( ( t ) => t.textContent === 'Classes' )!;

			act( () => {
				fireEvent.click( classesTab );
			} );

			expect( jest.mocked( persistDesignSystemTab ) ).toHaveBeenCalledWith(
				'classes'
			);
		} );

		it( 'should notify tab change when switching via UI click', () => {
			render(
				<DesignSystemPanelContent onRequestClose={ onRequestClose } />
			);

			const classesTab = screen
				.getAllByRole( 'tab' )
				.find( ( t ) => t.textContent === 'Classes' )!;

			act( () => {
				fireEvent.click( classesTab );
			} );

			expect( jest.mocked( notifyDesignSystemTabChange ) ).toHaveBeenCalledWith(
				'classes'
			);
		} );
	} );

	// -------------------------------------------------------------------------
	// Tab switching — custom event
	// -------------------------------------------------------------------------

	describe( 'tab switching via custom event', () => {
		it( 'should switch to Classes tab when set-tab event fires with "classes"', () => {
			render(
				<DesignSystemPanelContent onRequestClose={ onRequestClose } />
			);

			act( () => {
				window.dispatchEvent(
					new CustomEvent( SET_TAB_EVENT, {
						detail: { tab: 'classes' },
					} )
				);
			} );

			expect(
				screen.getByTestId( 'class-manager-embedded' )
			).toBeInTheDocument();
			expect(
				screen.queryByTestId( 'variables-manager-embedded' )
			).not.toBeInTheDocument();
		} );

		it( 'should switch back to Variables tab when set-tab event fires with "variables"', () => {
			jest.mocked( getInitialDesignSystemTab ).mockReturnValue( 'classes' );

			render(
				<DesignSystemPanelContent onRequestClose={ onRequestClose } />
			);

			act( () => {
				window.dispatchEvent(
					new CustomEvent( SET_TAB_EVENT, {
						detail: { tab: 'variables' },
					} )
				);
			} );

			expect(
				screen.getByTestId( 'variables-manager-embedded' )
			).toBeInTheDocument();
			expect(
				screen.queryByTestId( 'class-manager-embedded' )
			).not.toBeInTheDocument();
		} );

		it( 'should persist tab when switching via custom event', () => {
			render(
				<DesignSystemPanelContent onRequestClose={ onRequestClose } />
			);

			act( () => {
				window.dispatchEvent(
					new CustomEvent( SET_TAB_EVENT, {
						detail: { tab: 'classes' },
					} )
				);
			} );

			expect( jest.mocked( persistDesignSystemTab ) ).toHaveBeenCalledWith(
				'classes'
			);
		} );

		it( 'should ignore set-tab event when detail is missing', () => {
			render(
				<DesignSystemPanelContent onRequestClose={ onRequestClose } />
			);

			act( () => {
				window.dispatchEvent( new CustomEvent( SET_TAB_EVENT ) );
			} );

			// Should remain on the default Variables tab
			expect(
				screen.getByTestId( 'variables-manager-embedded' )
			).toBeInTheDocument();
		} );

		it( 'should clean up the set-tab event listener on unmount', () => {
			const removeEventListenerSpy = jest.spyOn(
				window,
				'removeEventListener'
			);

			const { unmount } = render(
				<DesignSystemPanelContent onRequestClose={ onRequestClose } />
			);

			unmount();

			expect( removeEventListenerSpy ).toHaveBeenCalledWith(
				SET_TAB_EVENT,
				expect.any( Function )
			);

			removeEventListenerSpy.mockRestore();
		} );
	} );

	// -------------------------------------------------------------------------
	// Close button — delegation to embedded panel close attempts
	// -------------------------------------------------------------------------

	describe( 'close button behavior', () => {
		it( 'should delegate close to the variables close attempt when on variables tab', async () => {
			render(
				<DesignSystemPanelContent onRequestClose={ onRequestClose } />
			);

			// Wait for VariablesManagerPanelEmbedded to expose its close attempt
			await screen.findByTestId( 'variables-manager-embedded' );

			fireEvent.click( screen.getByRole( 'button', { name: 'Close' } ) );

			expect( mockVariablesCloseAttempt ).toHaveBeenCalled();
			expect( onRequestClose ).not.toHaveBeenCalled();
		} );

		it( 'should delegate close to the classes close attempt when on classes tab', async () => {
			jest.mocked( getInitialDesignSystemTab ).mockReturnValue( 'classes' );

			render(
				<DesignSystemPanelContent onRequestClose={ onRequestClose } />
			);

			await screen.findByTestId( 'class-manager-embedded' );

			fireEvent.click( screen.getByRole( 'button', { name: 'Close' } ) );

			expect( mockClassesCloseAttempt ).toHaveBeenCalled();
			expect( onRequestClose ).not.toHaveBeenCalled();
		} );

		it( 'should call onRequestClose directly when no close attempt is registered', async () => {
			// Override: embedded panel exposes null immediately (no dirty-check
			// guard — it handles its own close or has nothing to protect).
			mockVariablesManagerPanelEmbedded.mockImplementationOnce(
				( { onExposeCloseAttempt }: { onExposeCloseAttempt?: ( fn: null ) => void } ) => {
					React.useEffect( () => {
						onExposeCloseAttempt?.( null );
					}, [] );
					return <div data-testid="variables-manager-embedded" />;
				}
			);

			const freshOnRequestClose = jest.fn();
			render(
				<DesignSystemPanelContent
					onRequestClose={ freshOnRequestClose }
				/>
			);

			await screen.findByTestId( 'variables-manager-embedded' );

			fireEvent.click( screen.getByRole( 'button', { name: 'Close' } ) );

			expect( freshOnRequestClose ).toHaveBeenCalled();
		} );

		it( 'should switch close delegation target when tab changes', async () => {
			// Start on variables
			render(
				<DesignSystemPanelContent onRequestClose={ onRequestClose } />
			);
			await screen.findByTestId( 'variables-manager-embedded' );

			// Switch to classes via event
			act( () => {
				window.dispatchEvent(
					new CustomEvent( SET_TAB_EVENT, {
						detail: { tab: 'classes' },
					} )
				);
			} );

			await screen.findByTestId( 'class-manager-embedded' );

			fireEvent.click( screen.getByRole( 'button', { name: 'Close' } ) );

			// Now close should go to the classes panel, not variables
			expect( mockClassesCloseAttempt ).toHaveBeenCalled();
			expect( mockVariablesCloseAttempt ).not.toHaveBeenCalled();
			expect( onRequestClose ).not.toHaveBeenCalled();
		} );
	} );

	// -------------------------------------------------------------------------
	// Persistence: close → reopen keeps last tab
	// -------------------------------------------------------------------------

	describe( 'tab persistence across close and reopen', () => {
		it( 'should show the persisted classes tab after close and reopen', () => {
			// First open: render with variables (default)
			const { unmount } = render(
				<DesignSystemPanelContent onRequestClose={ onRequestClose } />
			);

			// User switches to classes
			act( () => {
				window.dispatchEvent(
					new CustomEvent( SET_TAB_EVENT, {
						detail: { tab: 'classes' },
					} )
				);
			} );

			expect( persistDesignSystemTab ).toHaveBeenCalledWith( 'classes' );

			// Panel closes
			unmount();

			// Second open: simulate that localStorage now returns 'classes'
			jest.mocked( getInitialDesignSystemTab ).mockReturnValue( 'classes' );

			render(
				<DesignSystemPanelContent onRequestClose={ onRequestClose } />
			);

			expect(
				screen.getByTestId( 'class-manager-embedded' )
			).toBeInTheDocument();
			expect(
				screen.queryByTestId( 'variables-manager-embedded' )
			).not.toBeInTheDocument();
		} );
	} );
} );
