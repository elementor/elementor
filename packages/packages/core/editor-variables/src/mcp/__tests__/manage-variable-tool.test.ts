/* eslint-disable @typescript-eslint/no-explicit-any */
import { isProActive } from '@elementor/utils';

import { service } from '../../service';
import { initManageVariableTool } from '../manage-variable-tool';
import { generateVariablesPrompt } from '../variable-tool-prompt';

jest.mock( '../../service' );
jest.mock( '../../sync/get-font-configs', () => ( {
	getFontConfigs: jest.fn( () => ( {
		Inter: 'google-font',
		Roboto: 'google-font',
	} ) ),
} ) );
jest.mock( '@elementor/utils', () => ( {
	...jest.requireActual( '@elementor/utils' ),
	isProActive: jest.fn( () => true ),
} ) );
jest.mock( '../variable-tool-prompt', () => ( {
	MANAGE_VARIABLES_GUIDE_URI: 'elementor://variables/tools/manage-global-variable-guide',
	generateVariablesPrompt: jest.fn( () => 'mock guide' ),
} ) );

function createMockRegistryAndGetHandler(): { handler: any; getRegisteredTool: () => any } {
	let registeredTool: any = null;
	const reg = {
		addTool: ( tool: any ) => {
			registeredTool = tool;
		},
		resource: jest.fn(),
		setMCPDescription: jest.fn(),
		sendResourceUpdated: jest.fn(),
		waitForReady: jest.fn(),
	};
	initManageVariableTool( reg as any );
	return {
		handler: registeredTool?.handler,
		getRegisteredTool: () => registeredTool,
	};
}

describe( 'manage-variable-tool validation', () => {
	let toolHandler: any;
	let mockVariables: Record< string, any >;

	beforeEach( () => {
		mockVariables = {};

		const mockService = {
			create: jest.fn().mockResolvedValue( { id: '123' } ),
			update: jest.fn().mockResolvedValue( { id: '123' } ),
			delete: jest.fn().mockResolvedValue( undefined ),
			variables: jest.fn( () => mockVariables ),
		};

		( service as any ).create = mockService.create;
		( service as any ).update = mockService.update;
		( service as any ).delete = mockService.delete;
		( service as any ).variables = mockService.variables;

		( isProActive as jest.Mock ).mockReturnValue( true );
		const { handler } = createMockRegistryAndGetHandler();
		toolHandler = handler;
	} );

	describe( 'create action', () => {
		it( 'should reject label with spaces', async () => {
			await expect(
				toolHandler( {
					action: 'create',
					type: 'global-color-variable',
					label: 'Headline Primary',
					value: '#000',
				} )
			).rejects.toThrow( 'Use letters, numbers, dashes (-), or underscores (_) for the name.' );

			expect( service.create ).not.toHaveBeenCalled();
		} );

		it( 'should reject label with special characters', async () => {
			await expect(
				toolHandler( { action: 'create', type: 'global-color-variable', label: 'font!@#$', value: '#000' } )
			).rejects.toThrow( 'Use letters, numbers, dashes (-), or underscores (_) for the name.' );

			expect( service.create ).not.toHaveBeenCalled();
		} );

		it( 'should reject label with only dashes/underscores', async () => {
			await expect(
				toolHandler( { action: 'create', type: 'global-color-variable', label: '---', value: '#000' } )
			).rejects.toThrow( 'Names have to include at least one non-special character.' );

			expect( service.create ).not.toHaveBeenCalled();
		} );

		it( 'should allow valid label', async () => {
			await toolHandler( {
				action: 'create',
				type: 'global-color-variable',
				label: 'headline-primary',
				value: '#000',
			} );

			expect( service.create ).toHaveBeenCalledWith( {
				type: 'global-color-variable',
				label: 'headline-primary',
				value: '#000',
			} );
		} );

		it( 'should allow label with underscores', async () => {
			await toolHandler( {
				action: 'create',
				type: 'global-color-variable',
				label: 'headline_primary',
				value: '#000',
			} );

			expect( service.create ).toHaveBeenCalledWith( {
				type: 'global-color-variable',
				label: 'headline_primary',
				value: '#000',
			} );
		} );

		it( 'should reject empty label', async () => {
			await expect(
				toolHandler( { action: 'create', type: 'global-color-variable', label: '', value: '#000' } )
			).rejects.toThrow();

			expect( service.create ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'size variable Pro gating', () => {
		it( 'should allow size variable creation when Pro is active', async () => {
			// toolHandler in beforeEach is initialized with isProActive() = true
			await toolHandler( {
				action: 'create',
				type: 'global-size-variable',
				label: 'spacing-md',
				value: '16px',
			} );

			expect( service.create ).toHaveBeenCalledWith( {
				type: 'global-size-variable',
				label: 'spacing-md',
				value: '16px',
			} );
		} );

		it( 'should block size variable creation when Pro is not active at call time', async () => {
			// The Pro check happens inside the handler on every call, not at init time,
			// so flipping the mock here (after init) is enough to simulate a free-tier user.
			( isProActive as jest.Mock ).mockReturnValue( false );

			await expect(
				toolHandler( {
					action: 'create',
					type: 'global-size-variable',
					label: 'spacing-md',
					value: '16px',
				} )
			).rejects.toThrow( 'Creating size variables requires Elementor Pro.' );

			expect( service.create ).not.toHaveBeenCalled();
		} );

		it( 'should generate prompt without global-size-variable when Pro is not active', () => {
			( isProActive as jest.Mock ).mockReturnValue( false );
			( generateVariablesPrompt as jest.Mock ).mockRestore?.();

			const { generateVariablesPrompt: realPrompt } = jest.requireActual( '../variable-tool-prompt' );
			const prompt = ( realPrompt as typeof generateVariablesPrompt )();

			expect( prompt ).not.toContain( '**global-size-variable**' );
			expect( prompt ).toContain( 'requires Elementor Pro' );
		} );

		it( 'should generate prompt with global-size-variable when Pro is active', () => {
			( isProActive as jest.Mock ).mockReturnValue( true );

			const { generateVariablesPrompt: realGeneratePrompt } = jest.requireActual( '../variable-tool-prompt' );
			const prompt = ( realGeneratePrompt as typeof generateVariablesPrompt )();

			expect( prompt ).toContain( '**global-size-variable**' );
		} );
	} );

	describe( 'value type validation on create', () => {
		it( 'should reject px value for a font variable', async () => {
			await expect(
				toolHandler( {
					action: 'create',
					type: 'global-font-variable',
					label: 'heading-font',
					value: '24px',
				} )
			).rejects.toThrow( 'Font variable value must be a font family name' );

			expect( service.create ).not.toHaveBeenCalled();
		} );

		it( 'should reject rem value for a font variable', async () => {
			await expect(
				toolHandler( {
					action: 'create',
					type: 'global-font-variable',
					label: 'heading-font',
					value: '1.5rem',
				} )
			).rejects.toThrow( 'Font variable value must be a font family name' );

			expect( service.create ).not.toHaveBeenCalled();
		} );

		it( 'should allow a font family name for a font variable', async () => {
			await toolHandler( {
				action: 'create',
				type: 'global-font-variable',
				label: 'heading-font',
				value: 'Roboto',
			} );

			expect( service.create ).toHaveBeenCalledWith( {
				type: 'global-font-variable',
				label: 'heading-font',
				value: 'Roboto',
			} );
		} );

		it( 'should reject unsupported font family on create', async () => {
			await expect(
				toolHandler( {
					action: 'create',
					type: 'global-font-variable',
					label: 'heading-font',
					value: 'NonExistentFont',
				} )
			).rejects.toThrow(
				'Font "NonExistentFont" is not supported in WordPress. Please choose one of the available font families.'
			);

			expect( service.create ).not.toHaveBeenCalled();
		} );

		it( 'should allow px value for a size variable', async () => {
			await toolHandler( {
				action: 'create',
				type: 'global-size-variable',
				label: 'spacing-md',
				value: '24px',
			} );

			expect( service.create ).toHaveBeenCalledWith( {
				type: 'global-size-variable',
				label: 'spacing-md',
				value: '24px',
			} );
		} );

		it( 'should reject non-unit value for a size variable', async () => {
			await expect(
				toolHandler( {
					action: 'create',
					type: 'global-size-variable',
					label: 'spacing-md',
					value: 'Roboto',
				} )
			).rejects.toThrow( 'Size variable value should include a CSS unit' );

			expect( service.create ).not.toHaveBeenCalled();
		} );

		it( 'should reject non-color value for a color variable', async () => {
			await expect(
				toolHandler( {
					action: 'create',
					type: 'global-color-variable',
					label: 'brand-primary',
					value: '24px',
				} )
			).rejects.toThrow( 'Color variable value should be a CSS color' );

			expect( service.create ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'value type validation on update', () => {
		it( 'should reject px value when updating a font variable', async () => {
			mockVariables[ '123' ] = { type: 'global-font-variable', label: 'heading-font', value: 'Roboto' };

			await expect(
				toolHandler( { action: 'update', id: '123', label: 'heading-font', value: '24px' } )
			).rejects.toThrow( 'Font variable value must be a font family name' );

			expect( service.update ).not.toHaveBeenCalled();
		} );

		it( 'should allow font family when updating a font variable', async () => {
			mockVariables[ '123' ] = { type: 'global-font-variable', label: 'heading-font', value: 'Roboto' };

			await toolHandler( { action: 'update', id: '123', label: 'heading-font', value: 'Inter' } );

			expect( service.update ).toHaveBeenCalledWith( '123', { label: 'heading-font', value: 'Inter' } );
		} );

		it( 'should reject unsupported font family on update', async () => {
			mockVariables[ '123' ] = { type: 'global-font-variable', label: 'heading-font', value: 'Roboto' };

			await expect(
				toolHandler( { action: 'update', id: '123', label: 'heading-font', value: 'NonExistentFont' } )
			).rejects.toThrow(
				'Font "NonExistentFont" is not supported in WordPress. Please choose one of the available font families.'
			);

			expect( service.update ).not.toHaveBeenCalled();
		} );
	} );

	describe( 'update action', () => {
		it( 'should reject label with spaces', async () => {
			await expect(
				toolHandler( { action: 'update', id: '123', label: 'Headline Primary', value: '#000' } )
			).rejects.toThrow( 'Use letters, numbers, dashes (-), or underscores (_) for the name.' );

			expect( service.update ).not.toHaveBeenCalled();
		} );

		it( 'should reject label with special characters', async () => {
			await expect(
				toolHandler( { action: 'update', id: '123', label: 'font!@#', value: '#000' } )
			).rejects.toThrow( 'Use letters, numbers, dashes (-), or underscores (_) for the name.' );

			expect( service.update ).not.toHaveBeenCalled();
		} );

		it( 'should allow valid label', async () => {
			await toolHandler( { action: 'update', id: '123', label: 'headline-primary', value: '#000' } );

			expect( service.update ).toHaveBeenCalledWith( '123', {
				label: 'headline-primary',
				value: '#000',
			} );
		} );
	} );
} );
