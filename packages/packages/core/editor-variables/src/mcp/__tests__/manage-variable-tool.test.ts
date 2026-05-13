/* eslint-disable @typescript-eslint/no-explicit-any */
import { service } from '../../service';
import { initManageVariableTool } from '../manage-variable-tool';

jest.mock( '../../service' );

describe( 'manage-variable-tool validation', () => {
	let mockRegistryEntry: any;
	let toolHandler: any;

	beforeEach( () => {
		const mockService = {
			create: jest.fn().mockResolvedValue( { id: '123' } ),
			update: jest.fn().mockResolvedValue( { id: '123' } ),
			delete: jest.fn().mockResolvedValue( undefined ),
		};

		( service as any ).create = mockService.create;
		( service as any ).update = mockService.update;
		( service as any ).delete = mockService.delete;

		const tools: any[] = [];
		mockRegistryEntry = {
			addTool: ( tool: any ) => tools.push( tool ),
		};

		initManageVariableTool( mockRegistryEntry );
		const manageTool = tools[ 0 ];
		toolHandler = manageTool.handler;
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
