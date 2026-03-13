import { type ControlComponent, TextControl } from '@elementor/editor-controls';
import {
	booleanPropTypeUtil,
	imagePropTypeUtil,
	imageSrcPropTypeUtil,
	keyValuePropTypeUtil,
	linkPropTypeUtil,
	sizePropTypeUtil,
	stringArrayPropTypeUtil,
	stringPropTypeUtil,
} from '@elementor/editor-props';

import { ControlTypeAlreadyRegisteredError, ControlTypeNotRegisteredError } from '../../errors';
import { controlsRegistry, type ControlType } from '../controls-registry';

describe( 'Controls Registry', () => {
	describe( 'Registry Integrity', () => {
		const expectedPropTypeUtils = {
			image: imagePropTypeUtil,
			'svg-media': imageSrcPropTypeUtil,
			text: stringPropTypeUtil,
			textarea: stringPropTypeUtil,
			size: sizePropTypeUtil,
			select: stringPropTypeUtil,
			chips: stringArrayPropTypeUtil,
			link: linkPropTypeUtil,
			url: stringPropTypeUtil,
			switch: booleanPropTypeUtil,
			repeatable: undefined,
			'key-value': keyValuePropTypeUtil,
		};

		it( 'should have correct propTypeUtil for each control type', () => {
			Object.entries( expectedPropTypeUtils ).forEach( ( [ controlType, expectedPropTypeUtil ] ) => {
				expect( controlsRegistry.getPropTypeUtil( controlType as ControlType ) ).toBe( expectedPropTypeUtil );
			} );
		} );
	} );

	describe( 'Singleton Behavior', () => {
		it( 'should return the same instance', () => {
			const instance1 = controlsRegistry;
			const instance2 = controlsRegistry;

			expect( instance1 ).toBe( instance2 );
		} );
	} );

	describe( 'Control Registration', () => {
		const testControlType = 'test-custom-control';
		const testComponent = TextControl as ControlComponent;

		afterEach( () => {
			try {
				controlsRegistry.unregister( testControlType );
			} catch {}
		} );

		it( 'should register a new control type', () => {
			// Act
			controlsRegistry.register( testControlType, testComponent, 'full', stringPropTypeUtil );

			// Assert
			expect( controlsRegistry.get( testControlType as ControlType ) ).toBe( testComponent );
			expect( controlsRegistry.getLayout( testControlType as ControlType ) ).toBe( 'full' );
			expect( controlsRegistry.getPropTypeUtil( testControlType as ControlType ) ).toBe( stringPropTypeUtil );
		} );

		it( 'should register a control without propTypeUtil', () => {
			// Act
			controlsRegistry.register( testControlType, testComponent, 'two-columns' );

			// Assert
			expect( controlsRegistry.get( testControlType as ControlType ) ).toBe( testComponent );
			expect( controlsRegistry.getLayout( testControlType as ControlType ) ).toBe( 'two-columns' );
			expect( controlsRegistry.getPropTypeUtil( testControlType as ControlType ) ).toBeUndefined();
		} );

		it( 'should throw error when registering existing control type', () => {
			// Arrange
			controlsRegistry.register( testControlType, testComponent, 'full' );

			// Act & Assert
			expect( () => {
				controlsRegistry.register( testControlType, testComponent, 'full' );
			} ).toThrow( ControlTypeAlreadyRegisteredError );
		} );

		it( 'should throw error when registering built-in control type', () => {
			// Act & Assert
			expect( () => {
				controlsRegistry.register( 'text', testComponent, 'full' );
			} ).toThrow( ControlTypeAlreadyRegisteredError );
		} );
	} );

	describe( 'Control Unregistration', () => {
		const testControlType = 'test-unregister-control';
		const testComponent = TextControl as ControlComponent;

		beforeEach( () => {
			try {
				controlsRegistry.register( testControlType, testComponent, 'full' );
			} catch {}
		} );

		afterEach( () => {
			try {
				controlsRegistry.unregister( testControlType );
			} catch {}
		} );

		it( 'should unregister existing control type', () => {
			// Act
			controlsRegistry.unregister( testControlType );

			// Assert
			expect( controlsRegistry.get( testControlType as ControlType ) ).toBeUndefined();
		} );

		it( 'should throw error when unregistering non-existent control type', () => {
			// Arrange
			const nonExistentType = 'non-existent-control';

			// Act & Assert
			expect( () => {
				controlsRegistry.unregister( nonExistentType );
			} ).toThrow( ControlTypeNotRegisteredError );
		} );

		it( 'should throw error when unregistering already removed control type', () => {
			// Arrange
			controlsRegistry.unregister( testControlType );

			// Act & Assert
			expect( () => {
				controlsRegistry.unregister( testControlType );
			} ).toThrow( ControlTypeNotRegisteredError );
		} );
	} );
} );
