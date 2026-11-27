import * as React from 'react';
import { useEffect } from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';

import { getInitialDesignSystemView, notifyDesignSystemViewChange, persistDesignSystemTab } from '../../initial-tab';
import { DesignSystemPanelContent } from '../design-system-panel-content';

const EVENT_SET_TAB = 'elementor/design-system/set-tab';

const mockDefaultStylesTabEmbedded = jest.fn();
const mockTrackDefaultStyles = jest.fn();

jest.mock( '@elementor/editor-default-styles', () => ( {
	DefaultStylesTabEmbedded: ( props: unknown ) => mockDefaultStylesTabEmbedded( props ),
	trackDefaultStyles: ( ...args: unknown[] ) => mockTrackDefaultStyles( ...args ),
} ) );

jest.mock( '../design-system-header-menu', () => ( {
	DesignSystemHeaderMenu: () => null,
} ) );

const mockDefaultsCloseAttempt = jest.fn();
const mockVariablesCloseAttempt = jest.fn();
const mockClassesCloseAttempt = jest.fn();

jest.mock( '@elementor/editor-panels', () => ( {
	Panel: ( { children }: { children: React.ReactNode } ) => <div role="dialog">{ children }</div>,
	PanelBody: ( { children }: { children: React.ReactNode } ) => <div>{ children }</div>,
	PanelHeader: ( { children }: { children: React.ReactNode } ) => <header>{ children }</header>,
	PanelHeaderTitle: ( { children }: { children: React.ReactNode } ) => <h2>{ children }</h2>,
} ) );

jest.mock( '@elementor/editor-ui', () => ( {
	ThemeProvider: ( { children }: { children: React.ReactNode } ) => <>{ children }</>,
} ) );

jest.mock( '@wordpress/i18n', () => ( {
	__: ( str: string ) => str,
} ) );

jest.mock( '../../initial-tab', () => ( {
	...jest.requireActual( '../../initial-tab' ),
	getInitialDesignSystemView: jest.fn( () => null ),
	notifyDesignSystemViewChange: jest.fn(),
	persistDesignSystemTab: jest.fn(),
} ) );

const mockTrackGlobalClasses = jest.fn();

jest.mock( '@elementor/editor-global-classes', () => ( {
	ClassManagerPanelEmbedded: jest.fn(),
	trackGlobalClasses: ( ...args: unknown[] ) => mockTrackGlobalClasses( ...args ),
} ) );

const mockTrackVariablesManagerEvent = jest.fn();

jest.mock( '@elementor/editor-variables', () => ( {
	VariablesManagerPanelEmbedded: jest.fn(),
	trackVariablesManagerEvent: ( ...args: unknown[] ) => mockTrackVariablesManagerEvent( ...args ),
} ) );

const mockVariablesManagerPanelEmbedded = require( '@elementor/editor-variables' )
	.VariablesManagerPanelEmbedded as jest.Mock;

const mockClassManagerPanelEmbedded = require( '@elementor/editor-global-classes' )
	.ClassManagerPanelEmbedded as jest.Mock;

jest.mock( '@elementor/editor-sidebar', () => ( {
	isSidebarEnabled: () => false,
} ) );

jest.mock( '@elementor/icons', () => ( {
	ArrowLeftIcon: () => <span aria-hidden="true" />,
	ChevronRightIcon: () => <span aria-hidden="true" />,
	ColorFilterIcon: () => <span aria-hidden="true" />,
	ColorSwatchIcon: () => <span aria-hidden="true" />,
	TextIcon: () => <span aria-hidden="true" />,
} ) );

describe( 'DesignSystemPanelContent', () => {
	const onRequestClose = jest.fn();

	beforeEach( () => {
		jest.clearAllMocks();
		jest.mocked( getInitialDesignSystemView ).mockReturnValue( null );

		mockDefaultStylesTabEmbedded.mockImplementation(
			( {
				onExposeCloseAttempt,
			}: {
				onRequestClose: () => void;
				onExposeCloseAttempt?: ( fn: ( () => void ) | null ) => void;
			} ) => {
				useEffect( () => {
					onExposeCloseAttempt?.( mockDefaultsCloseAttempt );
					return () => onExposeCloseAttempt?.( null );
				}, [ onExposeCloseAttempt ] );
				return <div>Default Styles Content</div>;
			}
		);

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
				return <div>Variables Manager Content</div>;
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
				return <div>Class Manager Content</div>;
			}
		);
	} );

	describe( 'rendering', () => {
		it( 'should render the panel dialog and heading', () => {
			render( <DesignSystemPanelContent onRequestClose={ onRequestClose } /> );

			expect( screen.getByRole( 'dialog' ) ).toBeInTheDocument();
			expect( screen.getByRole( 'heading', { level: 2 } ) ).toHaveTextContent( 'Design system' );
		} );

		it( 'should render home navigation for Variables, Classes and Default styles', () => {
			render( <DesignSystemPanelContent onRequestClose={ onRequestClose } /> );

			expect( screen.getByRole( 'list', { name: 'Design system sections' } ) ).toBeInTheDocument();
			expect( screen.getByRole( 'button', { name: 'Variables' } ) ).toBeInTheDocument();
			expect( screen.getByRole( 'button', { name: 'Classes' } ) ).toBeInTheDocument();
			expect( screen.getByRole( 'button', { name: 'Default styles' } ) ).toBeInTheDocument();
		} );

		it( 'should render a close button', () => {
			render( <DesignSystemPanelContent onRequestClose={ onRequestClose } /> );

			expect( screen.getByRole( 'button', { name: 'Close' } ) ).toBeInTheDocument();
		} );

		it( 'should always mount all three panels (inactive ones hidden via display:none)', () => {
			render( <DesignSystemPanelContent onRequestClose={ onRequestClose } /> );

			expect( mockDefaultStylesTabEmbedded ).toHaveBeenCalled();
			expect( mockVariablesManagerPanelEmbedded ).toHaveBeenCalled();
			expect( mockClassManagerPanelEmbedded ).toHaveBeenCalled();
		} );
	} );

	describe( 'initial view', () => {
		it( 'should show home and hide section content when opening to the hub', () => {
			jest.mocked( getInitialDesignSystemView ).mockReturnValue( null );

			render( <DesignSystemPanelContent onRequestClose={ onRequestClose } /> );

			expect( screen.getByRole( 'list', { name: 'Design system sections' } ) ).toBeVisible();
			expect( screen.getByText( 'Default Styles Content' ) ).not.toBeVisible();
			expect( screen.getByText( 'Variables Manager Content' ) ).not.toBeVisible();
			expect( screen.getByText( 'Class Manager Content' ) ).not.toBeVisible();
		} );

		it( 'should open directly into Variables when a deep link requests it', () => {
			jest.mocked( getInitialDesignSystemView ).mockReturnValue( 'variables' );

			render( <DesignSystemPanelContent onRequestClose={ onRequestClose } /> );

			expect( screen.getByRole( 'region', { name: 'Variables Manager' } ) ).toBeVisible();
		} );

		it( 'should notify view change on mount with home', () => {
			render( <DesignSystemPanelContent onRequestClose={ onRequestClose } /> );

			expect( jest.mocked( notifyDesignSystemViewChange ) ).toHaveBeenCalledWith( null );
		} );
	} );

	describe( 'home navigation', () => {
		it( 'should show class manager when Classes is chosen from home', () => {
			render( <DesignSystemPanelContent onRequestClose={ onRequestClose } /> );

			fireEvent.click( screen.getByRole( 'button', { name: 'Classes' } ) );

			expect( screen.getByRole( 'region', { name: 'Classes Manager' } ) ).toBeVisible();
		} );

		it( 'should persist the selected section when opening Classes from home', () => {
			render( <DesignSystemPanelContent onRequestClose={ onRequestClose } /> );

			fireEvent.click( screen.getByRole( 'button', { name: 'Classes' } ) );

			expect( jest.mocked( persistDesignSystemTab ) ).toHaveBeenCalledWith( 'classes' );
		} );

		it( 'should track classManagerOpened with system-panel when Classes is chosen from home', () => {
			render( <DesignSystemPanelContent onRequestClose={ onRequestClose } /> );

			fireEvent.click( screen.getByRole( 'button', { name: 'Classes' } ) );

			expect( mockTrackGlobalClasses ).toHaveBeenCalledWith( {
				event: 'classManagerOpened',
				source: 'system-panel',
			} );
		} );

		it( 'should track panelOpened when Default styles is chosen from home', () => {
			render( <DesignSystemPanelContent onRequestClose={ onRequestClose } /> );

			fireEvent.click( screen.getByRole( 'button', { name: 'Default styles' } ) );

			expect( mockTrackDefaultStyles ).toHaveBeenCalledWith( { event: 'panelOpened' } );
		} );

		it( 'should track openManager with system-panel when Variables is chosen from home', () => {
			render( <DesignSystemPanelContent onRequestClose={ onRequestClose } /> );

			fireEvent.click( screen.getByRole( 'button', { name: 'Variables' } ) );

			expect( mockTrackVariablesManagerEvent ).toHaveBeenCalledWith( {
				action: 'openManager',
				source: 'system-panel',
			} );
		} );
	} );

	describe( 'tab switching via custom event', () => {
		it( 'should switch to Classes tab when set-tab event fires with "classes"', () => {
			render( <DesignSystemPanelContent onRequestClose={ onRequestClose } /> );

			act( () => {
				window.dispatchEvent(
					new CustomEvent( EVENT_SET_TAB, {
						detail: { tab: 'classes' },
					} )
				);
			} );

			expect( screen.getByRole( 'region', { name: 'Classes Manager' } ) ).toBeVisible();
			expect( screen.getByText( 'Variables Manager Content' ) ).not.toBeVisible();
		} );

		it( 'should switch to Variables when set-tab event fires with "variables"', () => {
			render( <DesignSystemPanelContent onRequestClose={ onRequestClose } /> );

			act( () => {
				window.dispatchEvent(
					new CustomEvent( EVENT_SET_TAB, {
						detail: { tab: 'variables' },
					} )
				);
			} );

			expect( screen.getByRole( 'region', { name: 'Variables Manager' } ) ).toBeVisible();
			expect( screen.getByText( 'Class Manager Content' ) ).not.toBeVisible();
		} );

		it( 'should persist tab when switching via custom event', () => {
			render( <DesignSystemPanelContent onRequestClose={ onRequestClose } /> );

			act( () => {
				window.dispatchEvent(
					new CustomEvent( EVENT_SET_TAB, {
						detail: { tab: 'classes' },
					} )
				);
			} );

			expect( jest.mocked( persistDesignSystemTab ) ).toHaveBeenCalledWith( 'classes' );
		} );

		it( 'should ignore set-tab event when detail is missing', () => {
			render( <DesignSystemPanelContent onRequestClose={ onRequestClose } /> );

			act( () => {
				window.dispatchEvent( new CustomEvent( EVENT_SET_TAB ) );
			} );

			expect( screen.getByRole( 'list', { name: 'Design system sections' } ) ).toBeVisible();
		} );

		it( 'should clean up the set-tab event listener on unmount', () => {
			const removeEventListenerSpy = jest.spyOn( window, 'removeEventListener' );

			const { unmount } = render( <DesignSystemPanelContent onRequestClose={ onRequestClose } /> );

			unmount();

			expect( removeEventListenerSpy ).toHaveBeenCalledWith( EVENT_SET_TAB, expect.any( Function ) );

			removeEventListenerSpy.mockRestore();
		} );
	} );

	describe( 'close button behavior', () => {
		it( 'should close the panel from home without delegating to sections', () => {
			render( <DesignSystemPanelContent onRequestClose={ onRequestClose } /> );

			fireEvent.click( screen.getByRole( 'button', { name: 'Close' } ) );

			expect( onRequestClose ).toHaveBeenCalled();
		} );

		it( 'should delegate close to the defaults close attempt when on default styles', async () => {
			jest.mocked( getInitialDesignSystemView ).mockReturnValue( 'defaults' );

			render( <DesignSystemPanelContent onRequestClose={ onRequestClose } /> );

			await screen.findByRole( 'region', { name: 'Default Styles' } );

			fireEvent.click( screen.getByRole( 'button', { name: 'Close' } ) );

			expect( mockDefaultsCloseAttempt ).toHaveBeenCalled();
			expect( onRequestClose ).not.toHaveBeenCalled();
		} );

		it( 'should delegate close to the variables close attempt when on variables', async () => {
			jest.mocked( getInitialDesignSystemView ).mockReturnValue( 'variables' );

			render( <DesignSystemPanelContent onRequestClose={ onRequestClose } /> );

			await screen.findByRole( 'region', { name: 'Variables Manager' } );

			fireEvent.click( screen.getByRole( 'button', { name: 'Close' } ) );

			expect( mockVariablesCloseAttempt ).toHaveBeenCalled();
			expect( onRequestClose ).not.toHaveBeenCalled();
		} );

		it( 'should delegate close to the classes close attempt when on classes', async () => {
			jest.mocked( getInitialDesignSystemView ).mockReturnValue( 'classes' );

			render( <DesignSystemPanelContent onRequestClose={ onRequestClose } /> );

			await screen.findByRole( 'region', { name: 'Classes Manager' } );

			fireEvent.click( screen.getByRole( 'button', { name: 'Close' } ) );

			expect( mockClassesCloseAttempt ).toHaveBeenCalled();
			expect( onRequestClose ).not.toHaveBeenCalled();
		} );

		it( 'should call onRequestClose directly when no close attempt is registered', async () => {
			mockDefaultStylesTabEmbedded.mockImplementationOnce(
				( { onExposeCloseAttempt }: { onExposeCloseAttempt?: ( fn: null ) => void } ) => {
					useEffect( () => {
						onExposeCloseAttempt?.( null );
					}, [ onExposeCloseAttempt ] );
					return <div>Default Styles Content</div>;
				}
			);

			mockVariablesManagerPanelEmbedded.mockImplementationOnce(
				( { onExposeCloseAttempt }: { onExposeCloseAttempt?: ( fn: null ) => void } ) => {
					useEffect( () => {
						onExposeCloseAttempt?.( null );
					}, [ onExposeCloseAttempt ] );
					return <div>Variables Manager Content</div>;
				}
			);

			mockClassManagerPanelEmbedded.mockImplementationOnce(
				( { onExposeCloseAttempt }: { onExposeCloseAttempt?: ( fn: null ) => void } ) => {
					useEffect( () => {
						onExposeCloseAttempt?.( null );
					}, [ onExposeCloseAttempt ] );
					return <div>Class Manager Content</div>;
				}
			);

			jest.mocked( getInitialDesignSystemView ).mockReturnValue( 'defaults' );

			const freshOnRequestClose = jest.fn();
			render( <DesignSystemPanelContent onRequestClose={ freshOnRequestClose } /> );

			await screen.findByRole( 'region', { name: 'Default Styles' } );

			fireEvent.click( screen.getByRole( 'button', { name: 'Close' } ) );

			expect( freshOnRequestClose ).toHaveBeenCalled();
		} );
	} );
} );
