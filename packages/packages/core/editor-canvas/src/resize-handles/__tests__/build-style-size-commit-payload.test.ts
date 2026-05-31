import { getContainer, getElementSetting, getElementStyles } from '@elementor/editor-elements';
import { sizePropTypeUtil } from '@elementor/editor-props';
import { getSessionStorageItem } from '@elementor/session';
import { stylesRepository } from '@elementor/editor-styles-repository';

import { getClassesProp } from '../../utils/command-utils';
import { buildStyleSizeCommitPayload, createSizePropFromPixels } from '../commit-active-style-size';

jest.mock( '@elementor/editor-elements' );
jest.mock( '@elementor/session' );
jest.mock( '@elementor/editor-styles-repository', () => ( {
	stylesRepository: {
		getProviders: jest.fn(),
	},
} ) );
jest.mock( '../../utils/command-utils' );

describe( 'buildStyleSizeCommitPayload', () => {
	beforeEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should update the existing local style when provider lookup succeeds via get', () => {
		const elementId = 'el-1';
		const localStyleId = 'local-1';
		const provider = {
			actions: {
				all: () => [],
				get: ( id: string, meta?: { elementId?: string } ) =>
					id === localStyleId && meta?.elementId === elementId ? { id: localStyleId } : null,
				updateProps: jest.fn(),
			},
		};

		jest.mocked( getContainer ).mockReturnValue( { id: elementId } as never );
		jest.mocked( getClassesProp ).mockReturnValue( 'classes' );
		jest.mocked( getSessionStorageItem ).mockReturnValue( null );
		jest.mocked( getElementSetting ).mockReturnValue( { value: [ localStyleId ] } );
		jest.mocked( getElementStyles ).mockReturnValue( {
			[ localStyleId ]: { id: localStyleId, label: 'local', type: 'class', variants: [] },
		} );
		jest.mocked( stylesRepository.getProviders ).mockReturnValue( [ provider ] as never );

		const payload = buildStyleSizeCommitPayload( {
			elementId,
			props: { width: createSizePropFromPixels( 120 ) },
			propDisplayName: 'Width',
		} );

		expect( payload ).toEqual( {
			styleId: localStyleId,
			provider,
			props: { width: createSizePropFromPixels( 120 ) },
			propDisplayName: 'Width',
		} );
		expect( sizePropTypeUtil.extract( payload?.props.width ) ).toEqual( { size: 120, unit: 'px' } );
	} );
} );
