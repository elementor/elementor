import { type V1ElementConfig } from '@elementor/editor-elements';

import { RequiredChildrenEnforcer } from '../required-children-enforcer';

describe( 'RequiredChildrenEnforcer', () => {
	const FULL_FORM_DIRECT_CHILD_COUNT = 3;

	const createWidgetsCache = (): Record< string, V1ElementConfig > => ( {
		'e-form': {
			title: 'Form',
			controls: {},
			elType: 'widget',
			default_children: [
				{
					elType: 'e-form-success-message',
					meta: { required: true },
					elements: [],
				},
				{
					elType: 'e-form-error-message',
					meta: { required: true },
					elements: [],
				},
				{
					elType: 'widget',
					widgetType: 'e-form-input',
					elements: [],
				},
			],
		} as V1ElementConfig,
		'e-form-input': { title: 'Input', controls: {}, elType: 'widget' } as V1ElementConfig,
		'e-form-success-message': {
			title: 'Success',
			controls: {},
			elType: 'e-form-success-message',
		} as V1ElementConfig,
		'e-form-error-message': {
			title: 'Error',
			controls: {},
			elType: 'e-form-error-message',
		} as V1ElementConfig,
	} );

	it( 'throws when required direct children are missing', () => {
		// Arrange
		const xml = new DOMParser().parseFromString( '<e-form><e-form-input /></e-form>', 'application/xml' );
		const enforcer = new RequiredChildrenEnforcer( 'e-form', createWidgetsCache() );

		// Act & Assert
		expect( () => enforcer.enforce( xml ) ).toThrow(
			/Missing required direct child element tag\(s\): e-form-success-message, e-form-error-message/
		);
	} );

	it( 'throws when only some required direct children exist', () => {
		// Arrange
		const xml = new DOMParser().parseFromString( '<e-form><e-form-success-message /></e-form>', 'application/xml' );
		const enforcer = new RequiredChildrenEnforcer( 'e-form', createWidgetsCache() );

		// Act & Assert
		expect( () => enforcer.enforce( xml ) ).toThrow(
			/Missing required direct child element tag\(s\): e-form-error-message/
		);
	} );

	it( 'does not throw when all required direct children exist', () => {
		// Arrange
		const xmlStr = '<e-form><e-form-success-message /><e-form-error-message /><e-form-input /></e-form>';
		const xml = new DOMParser().parseFromString( xmlStr, 'application/xml' );
		const enforcer = new RequiredChildrenEnforcer( 'e-form', createWidgetsCache() );

		// Act
		expect( () => enforcer.enforce( xml ) ).not.toThrow();

		// Assert
		const form = xml.querySelector( 'e-form' );
		expect( form?.children.length ).toBe( FULL_FORM_DIRECT_CHILD_COUNT );
	} );
} );
