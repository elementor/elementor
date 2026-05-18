import { type V1ElementConfig } from '@elementor/editor-elements';

import { getRequiredDefaultChildTypes } from '../required-default-child-tags';

describe( 'required-default-child-tags', () => {
	it( 'returns XML tag names for default children marked meta.required', () => {
		// Arrange
		const config = {
			title: 'Form',
			controls: {},
			default_children: [
				{
					elType: 'e-form-success-message',
					meta: { required: true },
					elements: [],
				},
				{
					elType: 'widget',
					widgetType: 'e-form-input',
					meta: { required: true },
				},
				{
					elType: 'e-form-label',
					elements: [],
				},
			],
		} as unknown as V1ElementConfig;

		// Act
		const tags = getRequiredDefaultChildTypes( config );

		// Assert
		expect( tags ).toEqual( [ 'e-form-success-message', 'e-form-input' ] );
	} );
} );
