import * as React from 'react';
import { renderWithTheme } from 'test-utils';
import { screen } from '@testing-library/react';

import { useElement } from '../../contexts/element-context';
import { useStyleSectionName } from '../../contexts/style-section-name-context';
import {
	flushSectionInjections,
	getSettingsSectionInjections,
	getStyleControlInjections,
	getStyleSectionInjections,
	injectAfterStyleControl,
	injectIntoSettingsSection,
	injectIntoStyleSection,
} from '../section-injections';
import { SettingsSectionInjectionSlot } from '../settings-section-injection-slot';
import { StyleControlInjectionSlot } from '../style-control-injection-slot';
import { StyleSectionInjectionSlot } from '../style-section-injection-slot';

jest.mock( '../../contexts/element-context' );
jest.mock( '../../contexts/style-section-name-context' );

const mockElement = ( type: string ) =>
	jest.mocked( useElement ).mockReturnValue( {
		element: { type, id: 'el-id' },
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		elementType: {} as any,
		settings: {},
	} );

const mockStyleSectionName = ( name: string | null ) =>
	jest.mocked( useStyleSectionName ).mockReturnValue( name );

describe( 'section-injections', () => {
	afterEach( () => {
		flushSectionInjections();
		jest.clearAllMocks();
	} );

	describe( 'registry', () => {
		it( 'returns settings injections filtered by element type', () => {
			const Comp = () => <span>x</span>;

			injectIntoSettingsSection( {
				id: 'a',
				elementType: 'e-collection-loop',
				sectionId: 'structure',
				component: Comp,
			} );
			injectIntoSettingsSection( {
				id: 'b',
				elementType: 'other',
				sectionId: 'structure',
				component: Comp,
			} );

			const result = getSettingsSectionInjections( 'e-collection-loop', 'structure' );

			expect( result.map( ( i ) => i.id ) ).toEqual( [ 'a' ] );
		} );

		it( 'supports wildcard element type', () => {
			injectIntoSettingsSection( {
				id: 'all',
				elementType: '*',
				sectionId: 'settings',
				component: () => null,
			} );

			expect( getSettingsSectionInjections( 'any-type', 'settings' ) ).toHaveLength( 1 );
		} );

		it( 'sorts by priority ascending', () => {
			injectIntoSettingsSection( {
				id: 'lo',
				elementType: 'x',
				sectionId: 's',
				component: () => null,
				options: { priority: 20 },
			} );
			injectIntoSettingsSection( {
				id: 'hi',
				elementType: 'x',
				sectionId: 's',
				component: () => null,
				options: { priority: 5 },
			} );

			expect( getSettingsSectionInjections( 'x', 's' ).map( ( i ) => i.id ) ).toEqual( [ 'hi', 'lo' ] );
		} );

		it( 'warns on duplicate id and ignores unless overwrite', () => {
			const warn = jest.spyOn( console, 'warn' ).mockImplementation( () => {} );

			const First = () => <span>first</span>;
			const Second = () => <span>second</span>;

			injectIntoSettingsSection( {
				id: 'dup',
				elementType: 'x',
				sectionId: 's',
				component: First,
			} );
			injectIntoSettingsSection( {
				id: 'dup',
				elementType: 'x',
				sectionId: 's',
				component: Second,
			} );

			expect( warn ).toHaveBeenCalled();
			expect( getSettingsSectionInjections( 'x', 's' )[ 0 ].component ).toBe( First );

			injectIntoSettingsSection( {
				id: 'dup',
				elementType: 'x',
				sectionId: 's',
				component: Second,
				options: { overwrite: true },
			} );

			expect( getSettingsSectionInjections( 'x', 's' )[ 0 ].component ).toBe( Second );

			warn.mockRestore();
		} );

		it( 'filters settings injections by position', () => {
			injectIntoSettingsSection( {
				id: 'before-item',
				elementType: 'x',
				sectionId: 's',
				component: () => null,
				options: { position: 'before' },
			} );
			injectIntoSettingsSection( {
				id: 'after-item',
				elementType: 'x',
				sectionId: 's',
				component: () => null,
				options: { position: 'after' },
			} );
			injectIntoSettingsSection( {
				id: 'default-item',
				elementType: 'x',
				sectionId: 's',
				component: () => null,
			} );

			expect( getSettingsSectionInjections( 'x', 's', 'before' ).map( ( i ) => i.id ) ).toEqual( [ 'before-item' ] );
			expect( getSettingsSectionInjections( 'x', 's', 'after' ).map( ( i ) => i.id ) ).toEqual( [ 'after-item', 'default-item' ] );
			expect( getSettingsSectionInjections( 'x', 's' ) ).toHaveLength( 3 );
		} );

		it( 'keeps settings and style registries separate', () => {
			injectIntoSettingsSection( {
				id: 'a',
				elementType: 'x',
				sectionId: 'foo',
				component: () => null,
			} );
			injectIntoStyleSection( {
				id: 'a',
				elementType: 'x',
				sectionName: 'foo',
				component: () => null,
			} );

			expect( getSettingsSectionInjections( 'x', 'foo' ) ).toHaveLength( 1 );
			expect( getStyleSectionInjections( 'x', 'foo' ) ).toHaveLength( 1 );
		} );
	} );

	describe( 'SettingsSectionInjectionSlot', () => {
		it( 'renders matching injected components', () => {
			mockElement( 'e-collection-loop' );

			injectIntoSettingsSection( {
				id: 'inj-1',
				elementType: 'e-collection-loop',
				sectionId: 'structure',
				component: () => <div>Injected A</div>,
			} );

			renderWithTheme( <SettingsSectionInjectionSlot sectionId="structure" /> );

			expect( screen.getByText( 'Injected A' ) ).toBeInTheDocument();
		} );

		it( 'renders only injections matching the given position', () => {
			mockElement( 'e-collection-loop' );

			injectIntoSettingsSection( {
				id: 'before-inj',
				elementType: 'e-collection-loop',
				sectionId: 'structure',
				component: () => <div>Before Content</div>,
				options: { position: 'before' },
			} );
			injectIntoSettingsSection( {
				id: 'after-inj',
				elementType: 'e-collection-loop',
				sectionId: 'structure',
				component: () => <div>After Content</div>,
			} );

			renderWithTheme( <SettingsSectionInjectionSlot sectionId="structure" position="before" /> );

			expect( screen.getByText( 'Before Content' ) ).toBeInTheDocument();
			expect( screen.queryByText( 'After Content' ) ).not.toBeInTheDocument();
		} );

		it( 'renders nothing when element type does not match', () => {
			mockElement( 'other-element' );

			injectIntoSettingsSection( {
				id: 'inj-1',
				elementType: 'e-collection-loop',
				sectionId: 'structure',
				component: () => <div>Should not render</div>,
			} );

			renderWithTheme( <SettingsSectionInjectionSlot sectionId="structure" /> );

			expect( screen.queryByText( 'Should not render' ) ).not.toBeInTheDocument();
		} );
	} );

	describe( 'StyleSectionInjectionSlot', () => {
		it( 'renders matching injected components for the current element', () => {
			mockElement( 'e-collection-loop' );

			injectIntoStyleSection( {
				id: 'layout-info',
				elementType: 'e-collection-loop',
				sectionName: 'Layout',
				component: () => <div>Layout Alert</div>,
			} );

			renderWithTheme( <StyleSectionInjectionSlot sectionName="Layout" /> );

			expect( screen.getByText( 'Layout Alert' ) ).toBeInTheDocument();
		} );

		it( 'does not render injections for unrelated sections', () => {
			mockElement( 'e-collection-loop' );

			injectIntoStyleSection( {
				id: 'layout-info',
				elementType: 'e-collection-loop',
				sectionName: 'Layout',
				component: () => <div>Layout Alert</div>,
			} );

			renderWithTheme( <StyleSectionInjectionSlot sectionName="Typography" /> );

			expect( screen.queryByText( 'Layout Alert' ) ).not.toBeInTheDocument();
		} );
	} );

	describe( 'StyleControlInjectionSlot', () => {
		it( 'renders injections matching element type, section, and control', () => {
			mockElement( 'e-collection-loop' );
			mockStyleSectionName( 'Layout' );

			injectAfterStyleControl( {
				id: 'layout-alert',
				elementType: 'e-collection-loop',
				sectionName: 'Layout',
				afterControl: 'flex-direction',
				component: () => <div>Direction Alert</div>,
			} );

			renderWithTheme( <StyleControlInjectionSlot controlId="flex-direction" /> );

			expect( screen.getByText( 'Direction Alert' ) ).toBeInTheDocument();
		} );

		it( 'supports multiple control IDs', () => {
			mockElement( 'e-collection-loop' );
			mockStyleSectionName( 'Layout' );

			injectAfterStyleControl( {
				id: 'layout-alert',
				elementType: 'e-collection-loop',
				sectionName: 'Layout',
				afterControl: [ 'flex-direction', 'grid-auto-flow' ],
				component: () => <div>Direction Alert</div>,
			} );

			renderWithTheme( <StyleControlInjectionSlot controlId="grid-auto-flow" /> );

			expect( screen.getByText( 'Direction Alert' ) ).toBeInTheDocument();
		} );

		it( 'does not render when control ID does not match', () => {
			mockElement( 'e-collection-loop' );
			mockStyleSectionName( 'Layout' );

			injectAfterStyleControl( {
				id: 'layout-alert',
				elementType: 'e-collection-loop',
				sectionName: 'Layout',
				afterControl: 'flex-direction',
				component: () => <div>Direction Alert</div>,
			} );

			renderWithTheme( <StyleControlInjectionSlot controlId="justify-content" /> );

			expect( screen.queryByText( 'Direction Alert' ) ).not.toBeInTheDocument();
		} );

		it( 'does not render when section name is null', () => {
			mockElement( 'e-collection-loop' );
			mockStyleSectionName( null );

			injectAfterStyleControl( {
				id: 'layout-alert',
				elementType: 'e-collection-loop',
				sectionName: 'Layout',
				afterControl: 'flex-direction',
				component: () => <div>Direction Alert</div>,
			} );

			renderWithTheme( <StyleControlInjectionSlot controlId="flex-direction" /> );

			expect( screen.queryByText( 'Direction Alert' ) ).not.toBeInTheDocument();
		} );

		it( 'returns control injections filtered by element type and section via getter', () => {
			injectAfterStyleControl( {
				id: 'a',
				elementType: 'e-collection-loop',
				sectionName: 'Layout',
				afterControl: 'flex-direction',
				component: () => null,
			} );
			injectAfterStyleControl( {
				id: 'b',
				elementType: 'other',
				sectionName: 'Layout',
				afterControl: 'flex-direction',
				component: () => null,
			} );

			expect( getStyleControlInjections( 'e-collection-loop', 'Layout', 'flex-direction' ).map( ( i ) => i.id ) ).toEqual( [ 'a' ] );
		} );
	} );
} );
