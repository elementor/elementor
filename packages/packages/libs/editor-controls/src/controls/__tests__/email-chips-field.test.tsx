import * as React from 'react';
import { createMockPropType, renderWithTheme } from 'test-utils';
import { isTransformable, type ObjectPropType, type PropValue, type UnionPropType } from '@elementor/editor-props';
import { screen } from '@testing-library/react';

import { PropKeyProvider, PropProvider } from '../../bound-prop-context';
import { ControlActionsProvider } from '../../control-actions/control-actions-context';
import { ControlReplacementsProvider, createControlReplacementsRegistry } from '../../control-replacements';
import { EmailChipsField } from '../email-form-action-control/email-chips-field';

const wrap = ( val: string ) => ( { $$type: 'string' as const, value: val } );

const wrapStringArray = ( vals: string[] ) => ( {
	$$type: 'string-array' as const,
	value: vals.map( ( v ) => wrap( v ) ),
} );

const wrapDynamic = ( name: string, group = 'post' ) => ( {
	$$type: 'dynamic' as const,
	value: {
		name,
		group,
		settings: { label: 'Author Email' },
	},
} );

const createStringPropType = () => createMockPropType( { kind: 'plain', key: 'string' } );

const createStringArrayPropType = () =>
	createMockPropType( {
		kind: 'array',
		key: 'string-array',
		item_prop_type: createStringPropType(),
	} );

const createRecipientUnionPropType = (): UnionPropType =>
	createMockPropType( {
		kind: 'union',
		prop_types: {
			'string-array': createStringArrayPropType(),
			dynamic: createMockPropType( {
				kind: 'plain',
				key: 'dynamic',
				settings: { categories: [ 'text' ] },
			} ),
		},
	} ) as UnionPropType;

const emailsPropType = createMockPropType( {
	kind: 'object',
	key: 'emails',
	shape: {
		to: createRecipientUnionPropType(),
		cc: createRecipientUnionPropType(),
		bcc: createRecipientUnionPropType(),
	},
} );

const DynamicRecipientControl = () => (
	<div role="status" aria-label="Dynamic recipient tag">
		Author Email
	</div>
);

const { registerControlReplacement, getControlReplacements } = createControlReplacementsRegistry();

registerControlReplacement( {
	component: DynamicRecipientControl,
	condition: ( { value } ) => isTransformable( value ) && value.$$type === 'dynamic',
} );

type RenderRecipientFieldArgs = {
	fieldBind: 'to' | 'cc' | 'bcc';
	fieldValue: PropValue;
};

const renderRecipientField = ( { fieldBind, fieldValue }: RenderRecipientFieldArgs ) => {
	const setValue = jest.fn();

	renderWithTheme(
		<PropProvider propType={ emailsPropType } value={ { [ fieldBind ]: fieldValue } } setValue={ setValue }>
			<PropKeyProvider bind={ fieldBind }>
				<ControlReplacementsProvider replacements={ getControlReplacements() }>
					<ControlActionsProvider items={ [] }>
						<EmailChipsField fieldLabel="Recipients" />
					</ControlActionsProvider>
				</ControlReplacementsProvider>
			</PropKeyProvider>
		</PropProvider>
	);

	return { setValue };
};

describe( 'EmailChipsField dynamic tags', () => {
	it( 'should render chips when the recipient value is a string array', () => {
		// Arrange & Act
		renderRecipientField( {
			fieldBind: 'to',
			fieldValue: wrapStringArray( [ 'admin@test.com' ] ),
		} );

		// Assert
		expect( screen.getByText( 'admin@test.com' ) ).toBeInTheDocument();
		expect( screen.getByRole( 'combobox' ) ).toBeInTheDocument();
		expect( screen.queryByRole( 'status', { name: 'Dynamic recipient tag' } ) ).not.toBeInTheDocument();
	} );

	it( 'should replace chips with the dynamic tag control when the recipient value is dynamic', () => {
		// Arrange & Act
		renderRecipientField( {
			fieldBind: 'to',
			fieldValue: wrapDynamic( 'author-email' ),
		} );

		// Assert
		expect( screen.getByRole( 'status', { name: 'Dynamic recipient tag' } ) ).toBeInTheDocument();
		expect( screen.queryByRole( 'combobox' ) ).not.toBeInTheDocument();
		expect( screen.queryByText( 'admin@test.com' ) ).not.toBeInTheDocument();
	} );

	it.each( [ 'cc', 'bcc' ] as const )( 'should support dynamic tags for the %s field', ( fieldBind ) => {
		// Arrange & Act
		renderRecipientField( {
			fieldBind,
			fieldValue: wrapDynamic( 'author-email' ),
		} );

		// Assert
		expect( screen.getByRole( 'status', { name: 'Dynamic recipient tag' } ) ).toBeInTheDocument();
		expect( screen.queryByRole( 'combobox' ) ).not.toBeInTheDocument();
	} );

	it( 'should expose dynamic support on the recipient union prop type', () => {
		// Arrange
		const shape = ( emailsPropType as ObjectPropType ).shape;

		// Assert
		for ( const fieldBind of [ 'to', 'cc', 'bcc' ] as const ) {
			const fieldPropType = shape[ fieldBind ];

			expect( fieldPropType.kind ).toBe( 'union' );

			if ( fieldPropType.kind !== 'union' ) {
				throw new Error( `Expected ${ fieldBind } to be a union prop type` );
			}

			expect( fieldPropType.prop_types.dynamic?.key ).toBe( 'dynamic' );
			expect( fieldPropType.prop_types[ 'string-array' ]?.key ).toBe( 'string-array' );
		}
	} );
} );
