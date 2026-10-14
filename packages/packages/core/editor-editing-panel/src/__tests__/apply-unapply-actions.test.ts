import { createMockStyleDefinition, createMockStylesProvider } from 'test-utils';
import { setDocumentModifiedStatus } from '@elementor/editor-documents';
import { updateElementSettings } from '@elementor/editor-elements';
import { stylesRepository } from '@elementor/editor-styles-repository';

import { doApplyClasses } from '../apply-unapply-actions';

jest.mock( '@elementor/editor-documents' );
jest.mock( '@elementor/editor-elements' );
jest.mock( '@elementor/editor-styles-repository', () => ( {
	...jest.requireActual( '@elementor/editor-styles-repository' ),
	stylesRepository: {
		getProviderByKey: jest.fn(),
		getProviders: jest.fn(),
	},
} ) );

describe( 'apply-unapply-actions', () => {
	beforeEach( () => {
		jest.clearAllMocks();
		jest.mocked( stylesRepository.getProviderByKey ).mockReturnValue( undefined );
	} );

	it( 'calls the owning style provider actions.get for each applied class id', () => {
		// Arrange.
		const elementId = 'element-1';
		const appliedStyleId = 'global-class-a';
		const styleDefinition = createMockStyleDefinition( { id: appliedStyleId } );
		const owningProvider = createMockStylesProvider( { key: 'global-classes' }, [ styleDefinition ] );
		const otherProvider = createMockStylesProvider( { key: 'local-classes' }, [
			createMockStyleDefinition( { id: 'other-class' } ),
		] );

		jest.mocked( stylesRepository.getProviders ).mockReturnValue( [ owningProvider, otherProvider ] );

		// Act.
		doApplyClasses( elementId, [ appliedStyleId ] );

		// Assert.
		expect( owningProvider.actions.get ).toHaveBeenCalledWith( appliedStyleId );
		expect( otherProvider.actions.get ).not.toHaveBeenCalled();
		expect( updateElementSettings ).toHaveBeenCalled();
		expect( setDocumentModifiedStatus ).toHaveBeenCalledWith( true );
	} );
} );
