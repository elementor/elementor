import * as React from 'react';
import { useEffect } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';

import { getInitialDesignSystemTab, notifyDesignSystemTabChange, persistDesignSystemTab } from '../../initial-tab';
import { DesignSystemPanelContent } from '../design-system-panel-content';

const mockVariablesCloseAttempt = jest.fn();
const mockClassesCloseAttempt = jest.fn();

let capturedTabsOnChange: ( ( e: React.SyntheticEvent, val: string ) => void ) | undefined;

jest.mock( '@elementor/editor-panels', () => ( {
	Panel: ( { children }: { children: React.ReactNode } ) => <div role="dialog">{ children }</div>,
	PanelBody: ( { children }: { children: React.ReactNode } ) => <div>{ children }</div>,
	PanelHeader: ( { children }: { children: React.ReactNode } ) => <header>{ children }</header>,
	PanelHeaderTitle: ( { children }: { children: React.ReactNode } ) => <h2>{ children }</h2>,
} ) );

jest.mock( '@elementor/editor-ui', () => ( {
	ThemeProvider: ( { children }: { children: React.ReactNode } ) => <>{ children }</>,
} ) );

jest.mock( '@elementor/icons', () => ( {
	ColorFilterIcon: () => <span aria-hidden="true" />,
	ColorSwatchIcon: () => <span aria-hidden="true" />,
} ) );

jest.mock( '@wordpress/i18n', () => ( {
	__: ( str: string ) => str,
} ) );

jest.mock( '../../initial-tab', () => ( {
	getInitialDesignSystemTab: jest.fn( () => 'variables' ),
	notifyDesignSystemTabChange: jest.fn(),
	persistDesignSystemTab: jest.fn(),
} ) );

jest.mock( '@elementor/editor-global-classes', () => ( {
	ClassManagerPanelEmbedded: jest.fn(),
} ) );

jest.mock( '@elementor/editor-variables', () => ( {
	VariablesManagerPanelEmbedded: jest.fn(),
} ) );

const mockVariablesManagerPanelEmbedded = require( '@elementor/editor-variables' )
	.VariablesManagerPanelEmbedded as jest.Mock;

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
		<button role="tab" onClick={ () => capturedTabsOnChange?.( {} as React.SyntheticEvent, value ) }>
			{ label }
		</button>
	),
	Box: ( { children, role }: { children: React.ReactNode; role?: string } ) => <div role={ role }>{ children }</div>,
	Stack: ( { children }: { children: React.ReactNode } ) => <div>{ children }</div>,
	Divider: () => <hr />,
	CloseButton: ( { onClick, 'aria-label': ariaLabel }: { onClick: () => void; 'aria-label'?: string } ) => (
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

		mockVariablesManagerPanelEmbedded.mockImplementation(
			( {
				onExposeCloseAttempt,
			}: {
				onRequestClose: () => void;
				onExposeCloseAttempt?: ( fn: ( () => void ) | null ) => void;
			} ) => {
				useEffect( () => {
					onExposeCloseAttempt?.( mockVariablesCloseAttempt );
					return () => onExposeCloseAttempt?.( null );
				}, [ onExposeCloseAttempt ] );
				return (
					<div role="region" aria-label="Variables Manager">
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
				useEffect( () => {
					onExposeCloseAttempt?.( mockClassesCloseAttempt );
					return () => onExposeCloseAttempt?.( null );
				}, [ onExposeCloseAttempt ] );
				return (
					<div role="region" aria-label="Classes Manager">
						Class Manager Content
					</div>
				);
			}
		);
	} );

	describe( 'rendering', () => {
		it( 'should render the panel dialog and heading', () => {
			render( <DesignSystemPanelContent onRequestClose={ onRequestClose } /> );

			expect( screen.getByRole( 'dialog' ) ).toBeInTheDocument();
			expect( screen.getByRole( 'heading', { level: 2 } ) ).toHaveTextContent( 'Design system' );
		} );

		it( 'should render Variables and Classes tabs', () => {
			render( <DesignSystemPanelContent onRequestClose={ onRequestClose } /> );

			const tabs = screen.getAllByRole( 'tab' );
			expect( tabs ).toHaveLength( 2 );
			expect( tabs[ 0 ] ).toHaveTextContent( 'Variables' );
			expect( tabs[ 1 ] ).toHaveTextContent( 'Classes' );
		} );

		it( 'should render a close button', () => {
			render( <DesignSystemPanelContent onRequestClose={ onRequestClose } /> );

			expect( screen.getByRole( 'button', { name: 'Close' } ) ).toBeInTheDocument();
		} );
	} );

	describe( 'initial tab (top-bar open behavior)', () => {
		it( 'should show Variables content by default when no preference is stored', () => {
			jest.mocked( getInitialDesignSystemTab ).mockReturnValue( 'variables' );

			render( <DesignSystemPanelContent onRequestClose={ onRequestClose } /> );

			expect( screen.getByRole( 'region', { name: 'Variables Manager' } ) ).toBeInTheDocument();
			expect( screen.queryByRole( 'region', { name: 'Classes Manager' } ) ).not.toBeInTheDocument();
		} );

		it( 'should show Classes content when classes was the last persisted tab', () => {
			jest.mocked( getInitialDesignSystemTab ).mockReturnValue( 'classes' );

			render( <DesignSystemPanelContent onRequestClose={ onRequestClose } /> );

			expect( screen.getByRole( 'region', { name: 'Classes Manager' } ) ).toBeInTheDocument();
			expect( screen.queryByRole( 'region', { name: 'Variables Manager' } ) ).not.toBeInTheDocument();
		} );

		it( 'should notify tab change on mount with the initial tab', () => {
			jest.mocked( getInitialDesignSystemTab ).mockReturnValue( 'variables' );

			render( <DesignSystemPanelContent onRequestClose={ onRequestClose } /> );

			expect( jest.mocked( notifyDesignSystemTabChange ) ).toHaveBeenCalledWith( 'variables' );
		} );
	} );

	describe( 'tab switching via UI click', () => {
		it( 'should render class manager when Classes tab is clicked', () => {
			render( <DesignSystemPanelContent onRequestClose={ onRequestClose } /> );

			fireEvent.click( screen.getByRole( 'tab', { name: 'Classes' } ) );

			expect( screen.getByRole( 'region', { name: 'Classes Manager' } ) ).toBeInTheDocument();
			expect( screen.queryByRole( 'region', { name: 'Variables Manager' } ) ).not.toBeInTheDocument();
		} );

		it( 'should render variables manager when Variables tab is clicked after switching', () => {
			jest.mocked( getInitialDesignSystemTab ).mockReturnValue( 'classes' );

			render( <DesignSystemPanelContent onRequestClose={ onRequestClose } /> );

			fireEvent.click( screen.getByRole( 'tab', { name: 'Variables' } ) );

			expect( screen.getByRole( 'region', { name: 'Variables Manager' } ) ).toBeInTheDocument();
			expect( screen.queryByRole( 'region', { name: 'Classes Manager' } ) ).not.toBeInTheDocument();
		} );

		it( 'should persist the selected tab when clicking Classes', () => {
			render( <DesignSystemPanelContent onRequestClose={ onRequestClose } /> );

			fireEvent.click( screen.getByRole( 'tab', { name: 'Classes' } ) );

			expect( jest.mocked( persistDesignSystemTab ) ).toHaveBeenCalledWith( 'classes' );
		} );

		it( 'should notify tab change when switching via UI click', () => {
			render( <DesignSystemPanelContent onRequestClose={ onRequestClose } /> );

			fireEvent.click( screen.getByRole( 'tab', { name: 'Classes' } ) );

			expect( jest.mocked( notifyDesignSystemTabChange ) ).toHaveBeenCalledWith( 'classes' );
		} );
	} );

	describe( 'tab switching via custom event', () => {
		it( 'should switch to Classes tab when set-tab event fires with "classes"', () => {
			render( <DesignSystemPanelContent onRequestClose={ onRequestClose } /> );

			act( () => {
				window.dispatchEvent(
					new CustomEvent( SET_TAB_EVENT, {
						detail: { tab: 'classes' },
					} )
				);
			} );

			expect( screen.getByRole( 'region', { name: 'Classes Manager' } ) ).toBeInTheDocument();
			expect( screen.queryByRole( 'region', { name: 'Variables Manager' } ) ).not.toBeInTheDocument();
		} );

		it( 'should switch back to Variables tab when set-tab event fires with "variables"', () => {
			jest.mocked( getInitialDesignSystemTab ).mockReturnValue( 'classes' );

			render( <DesignSystemPanelContent onRequestClose={ onRequestClose } /> );

			act( () => {
				window.dispatchEvent(
					new CustomEvent( SET_TAB_EVENT, {
						detail: { tab: 'variables' },
					} )
				);
			} );

			expect( screen.getByRole( 'region', { name: 'Variables Manager' } ) ).toBeInTheDocument();
			expect( screen.queryByRole( 'region', { name: 'Classes Manager' } ) ).not.toBeInTheDocument();
		} );

		it( 'should persist tab when switching via custom event', () => {
			render( <DesignSystemPanelContent onRequestClose={ onRequestClose } /> );

			act( () => {
				window.dispatchEvent(
					new CustomEvent( SET_TAB_EVENT, {
						detail: { tab: 'classes' },
					} )
				);
			} );

			expect( jest.mocked( persistDesignSystemTab ) ).toHaveBeenCalledWith( 'classes' );
		} );

		it( 'should ignore set-tab event when detail is missing', () => {
			render( <DesignSystemPanelContent onRequestClose={ onRequestClose } /> );

			act( () => {
				window.dispatchEvent( new CustomEvent( SET_TAB_EVENT ) );
			} );

			expect( screen.getByRole( 'region', { name: 'Variables Manager' } ) ).toBeInTheDocument();
		} );

		it( 'should clean up the set-tab event listener on unmount', () => {
			const removeEventListenerSpy = jest.spyOn( window, 'removeEventListener' );

			const { unmount } = render( <DesignSystemPanelContent onRequestClose={ onRequestClose } /> );

			unmount();

			expect( removeEventListenerSpy ).toHaveBeenCalledWith( SET_TAB_EVENT, expect.any( Function ) );

			removeEventListenerSpy.mockRestore();
		} );
	} );

	describe( 'close button behavior', () => {
		it( 'should delegate close to the variables close attempt when on variables tab', async () => {
			render( <DesignSystemPanelContent onRequestClose={ onRequestClose } /> );

			await screen.findByRole( 'region', { name: 'Variables Manager' } );

			fireEvent.click( screen.getByRole( 'button', { name: 'Close' } ) );

			expect( mockVariablesCloseAttempt ).toHaveBeenCalled();
			expect( onRequestClose ).not.toHaveBeenCalled();
		} );

		it( 'should delegate close to the classes close attempt when on classes tab', async () => {
			jest.mocked( getInitialDesignSystemTab ).mockReturnValue( 'classes' );

			render( <DesignSystemPanelContent onRequestClose={ onRequestClose } /> );

			await screen.findByRole( 'region', { name: 'Classes Manager' } );

			fireEvent.click( screen.getByRole( 'button', { name: 'Close' } ) );

			expect( mockClassesCloseAttempt ).toHaveBeenCalled();
			expect( onRequestClose ).not.toHaveBeenCalled();
		} );

		it( 'should call onRequestClose directly when no close attempt is registered', async () => {
			mockVariablesManagerPanelEmbedded.mockImplementationOnce(
				( { onExposeCloseAttempt }: { onExposeCloseAttempt?: ( fn: null ) => void } ) => {
					useEffect( () => {
						onExposeCloseAttempt?.( null );
					}, [ onExposeCloseAttempt ] );
					return <div role="region" aria-label="Variables Manager" />;
				}
			);

			const freshOnRequestClose = jest.fn();
			render( <DesignSystemPanelContent onRequestClose={ freshOnRequestClose } /> );

			await screen.findByRole( 'region', { name: 'Variables Manager' } );

			fireEvent.click( screen.getByRole( 'button', { name: 'Close' } ) );

			expect( freshOnRequestClose ).toHaveBeenCalled();
		} );

		it( 'should switch close delegation target when tab changes', async () => {
			render( <DesignSystemPanelContent onRequestClose={ onRequestClose } /> );
			await screen.findByRole( 'region', { name: 'Variables Manager' } );

			act( () => {
				window.dispatchEvent(
					new CustomEvent( SET_TAB_EVENT, {
						detail: { tab: 'classes' },
					} )
				);
			} );

			await screen.findByRole( 'region', { name: 'Classes Manager' } );

			fireEvent.click( screen.getByRole( 'button', { name: 'Close' } ) );

			expect( mockClassesCloseAttempt ).toHaveBeenCalled();
			expect( mockVariablesCloseAttempt ).not.toHaveBeenCalled();
			expect( onRequestClose ).not.toHaveBeenCalled();
		} );
	} );

} );
