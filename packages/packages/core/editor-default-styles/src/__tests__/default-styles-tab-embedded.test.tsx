import * as React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { renderWithStore } from 'test-utils';
import { QueryClient, QueryClientProvider } from '@elementor/query';
import { setSessionStorageItem } from '@elementor/session';
import { __createStore as createStore, __registerSlice as registerSlice, type Store } from '@elementor/store';

import { DefaultStylesTabEmbedded } from '../components/default-styles-tab-embedded';
import { slice } from '../store';

jest.mock( '@elementor/editor-controls', () => ( {
	ControlActionsProvider: ( { children }: React.PropsWithChildren ) => children,
	ControlReplacementsProvider: ( { children }: React.PropsWithChildren ) => children,
	getControlReplacements: () => ( {} ),
} ) );

jest.mock( '@elementor/editor-editing-panel', () => ( {
	ClassesPropProvider: ( { children }: React.PropsWithChildren ) => children,
	CreatableAutocomplete: ( { selected }: { selected: { label: string }[] } ) => <div>{ selected[ 0 ]?.label }</div>,
	ElementProvider: ( { children }: React.PropsWithChildren ) => children,
	SectionsList: ( { children }: React.PropsWithChildren ) => children,
	StyleInheritanceProvider: ( { children }: React.PropsWithChildren ) => children,
	StyleProvider: ( { children }: React.PropsWithChildren ) => children,
	StyleSections: () => null,
} ) );

jest.mock( '@elementor/editor-responsive', () => ( {
	useActiveBreakpoint: () => 'desktop',
} ) );

jest.mock( '@elementor/menus', () => ( {
	controlActionsMenu: {
		useMenuItems: () => ( { default: [] } ),
	},
} ) );

jest.mock( '@elementor/editor-ui', () => ( {
	...jest.requireActual( '@elementor/editor-ui' ),
	ThemeProvider: ( { children }: { children: React.ReactNode } ) => <>{ children }</>,
} ) );

jest.mock( '../allowed-tags', () => ( {
	getAllowedDefaultStyleTags: () => [ 'h1', 'h2', 'h3' ],
	getDefaultActiveTag: ( tags: string[] ) => tags[ 0 ],
	isAllowedDefaultStyleTag: ( tag: string, tags: string[] ) => tags.includes( tag ),
} ) );

jest.mock( '../save-default-styles', () => ( {
	saveDefaultStyles: jest.fn(),
} ) );

describe( 'DefaultStylesTabEmbedded', () => {
	let store: Store;
	const queryClient = new QueryClient( {
		defaultOptions: {
			queries: {
				retry: false,
			},
		},
	} );

	beforeEach( () => {
		(
			window as unknown as {
				elementor: {
					config: {
						atomic: { default_styles: { allowed_tags: string[] } };
					};
				};
			}
		 ).elementor = {
			config: {
				atomic: {
					default_styles: {
						allowed_tags: [ 'h1', 'h2', 'h3' ],
					},
				},
			},
		};

		registerSlice( slice );
		store = createStore();
		sessionStorage.clear();
	} );

	it( 'should render the stored active tag on the first paint', () => {
		setSessionStorageItem( 'default-styles/last-active-tag', 'h3' );

		renderWithStore(
			<QueryClientProvider client={ queryClient }>
				<DefaultStylesTabEmbedded onRequestClose={ jest.fn() } />
			</QueryClientProvider>,
			store
		);

		expect( screen.getByText( 'h3' ) ).toBeInTheDocument();
	} );

	it( 'should expose a close attempt that calls onRequestClose when clean', () => {
		const onRequestClose = jest.fn();
		let closeAttempt: ( () => void ) | null = null;

		renderWithStore(
			<QueryClientProvider client={ queryClient }>
				<DefaultStylesTabEmbedded
					onRequestClose={ onRequestClose }
					onExposeCloseAttempt={ ( fn ) => {
						closeAttempt = fn;
					} }
				/>
			</QueryClientProvider>,
			store
		);

		act( () => {
			closeAttempt?.();
		} );

		expect( onRequestClose ).toHaveBeenCalled();
	} );

	it( 'should expose a close attempt that opens save dialog when dirty', () => {
		const onRequestClose = jest.fn();
		let closeAttempt: ( () => void ) | null = null;

		renderWithStore(
			<QueryClientProvider client={ queryClient }>
				<DefaultStylesTabEmbedded
					onRequestClose={ onRequestClose }
					onExposeCloseAttempt={ ( fn ) => {
						closeAttempt = fn;
					} }
				/>
			</QueryClientProvider>,
			store
		);

		act( () => {
			store.dispatch(
				slice.actions.load( {
					data: {
						h1: {
							id: 'h1',
							label: 'h1',
							type: 'class',
							variants: [],
						},
					},
				} )
			);
			store.dispatch(
				slice.actions.update( {
					style: {
						id: 'h1',
						label: 'h1',
						type: 'class',
						variants: [
							{
								meta: { breakpoint: 'desktop', state: null },
								props: {},
								custom_css: null,
							},
						],
					},
				} )
			);
		} );

		act( () => {
			closeAttempt?.();
		} );

		expect( screen.getByRole( 'dialog', { name: 'You have unsaved changes' } ) ).toBeInTheDocument();
		expect( onRequestClose ).not.toHaveBeenCalled();
	} );

	it( 'should render a save changes button', () => {
		renderWithStore(
			<QueryClientProvider client={ queryClient }>
				<DefaultStylesTabEmbedded onRequestClose={ jest.fn() } />
			</QueryClientProvider>,
			store
		);

		expect( screen.getByRole( 'button', { name: 'Save changes' } ) ).toBeDisabled();
	} );
} );
