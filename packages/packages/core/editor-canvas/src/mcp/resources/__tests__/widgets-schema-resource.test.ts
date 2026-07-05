import { type V1ElementConfig } from '@elementor/editor-elements';

import { buildLlmGuidance, enrichPropertiesWithBaseSettingsHints, mergeInstructions } from '../build-llm-guidance';

const mockEmailBaseSettings = {
	email: {
		$$type: 'emails',
		value: {
			to: {
				$$type: 'string-array',
				value: [ { $$type: 'string', value: 'admin@example.com' } ],
			},
			from: { $$type: 'string', value: 'email@example.com' },
			message: { $$type: 'string', value: '[all-fields]' },
		},
	},
};

const mockFormWidgetData = {
	title: 'Form',
	controls: {},
	elType: 'widget',
	meta: { is_container: true },
	base_settings: mockEmailBaseSettings,
	atomic_props_schema: {
		email: { kind: 'object', key: 'emails' },
		'form-name': { kind: 'string', key: 'string' },
	},
} as unknown as V1ElementConfig;

describe( 'build-llm-guidance', () => {
	it( 'mergeInstructions combines existing and additional instructions', () => {
		expect( mergeInstructions( 'First.', 'Second.' ) ).toBe( 'First. Second.' );
		expect( mergeInstructions( undefined, 'Only.' ) ).toBe( 'Only.' );
	} );

	it( 'buildLlmGuidance exposes default_settings for widgets with base_settings', () => {
		const guidance = buildLlmGuidance( mockFormWidgetData, 'e-form', {} );

		expect( guidance.default_settings ).toEqual( mockEmailBaseSettings );
		expect( guidance.instructions ).toContain( 'Omit them from elementConfig unless the user explicitly asks' );
		expect( guidance.can_have_children ).toBe( true );
	} );

	it( 'buildLlmGuidance merges style and settings instructions when both exist', () => {
		const widgetData = {
			...mockFormWidgetData,
			base_styles: {
				'e-form-base': {
					variants: [
						{
							props: {
								display: { $$type: 'string', value: 'flex' },
							},
						},
					],
				},
			},
		} as unknown as V1ElementConfig;

		const guidance = buildLlmGuidance( widgetData, 'e-form', {} );

		expect( guidance.default_styles ).toEqual( { display: { $$type: 'string', value: 'flex' } } );
		expect( guidance.default_settings ).toEqual( mockEmailBaseSettings );
		expect( guidance.instructions ).toContain( 'default styles' );
		expect( guidance.instructions ).toContain( 'default settings' );
	} );

	it( 'enrichPropertiesWithBaseSettingsHints adds omit guidance to base setting props', () => {
		const enriched = enrichPropertiesWithBaseSettingsHints(
			{
				email: { type: 'object' },
				'form-name': { type: 'object' },
			},
			[ 'email' ]
		);

		expect( enriched.email.description ).toContain( 'llm_guidance.default_settings' );
		expect( enriched[ 'form-name' ].description ).toBeUndefined();
	} );
} );

describe( 'widgets-schema-resource base_settings integration', () => {
	it( 'keeps base setting props in schema while enriching descriptions', () => {
		const properties = enrichPropertiesWithBaseSettingsHints(
			{
				email: { type: 'object', properties: {} },
			},
			Object.keys( mockEmailBaseSettings )
		);

		expect( properties ).toHaveProperty( 'email' );
		expect( properties.email.description ).toContain( 'omit unless user explicitly requests' );
	} );
} );
