global.Marionette = {
	Behavior: {
		extend( protoProps ) {
			const Child = function() {};
			Object.assign( Child.prototype, protoProps );
			return Child;
		},
	},
};

global.elementorModules = {
	editor: {
		utils: {
			Module: class {
			},
		},
	},
};

class Module {
	isAiImageGenerationEnabled( mediaTypes, controlType ) {
		return Boolean(
			mediaTypes.length &&
			mediaTypes.includes( 'image' ) &&
			! controlType.includes( 'media-preview' ),
		);
	}
}

jest.mock( 'react-markdown', () => {
	return function MockReactMarkdown() {
		return null;
	};
} );

jest.mock( 'elementor/modules/ai/assets/js/editor/ai-behavior', () => {
	return class MockAiBehavior {};
} );

describe( 'AI Module', () => {
	let module;

	beforeEach( () => {
		module = new Module();
	} );

	describe( 'isAiImageGenerationEnabled', () => {
		it( 'should return true for valid image media types without media-preview', () => {
			expect( module.isAiImageGenerationEnabled( [ 'image' ], 'media' ) ).toBe( true );
			expect( module.isAiImageGenerationEnabled( [ 'image', 'video' ], 'media' ) ).toBe( true );
		} );

		it( 'should return false when image is not in media types', () => {
			expect( module.isAiImageGenerationEnabled( [ 'video', 'audio' ], 'media' ) ).toBe( false );
			expect( module.isAiImageGenerationEnabled( [], 'media' ) ).toBe( false );
		} );

		it( 'should return false for media-preview control types', () => {
			expect( module.isAiImageGenerationEnabled( [ 'image' ], 'media-preview' ) ).toBe( false );
			expect( module.isAiImageGenerationEnabled( [ 'image' ], 'some-media-preview-type' ) ).toBe( false );
		} );
	} );
} );
