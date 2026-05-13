import { getElementorConfig } from '@elementor/editor-v1-adapters';

import { getLicenseConfig } from '../../../hooks/use-license-config';
import { type DynamicTags } from '../../types';
import { getAtomicDynamicTags } from '../get-atomic-dynamic-tags';

jest.mock( '@elementor/editor-v1-adapters', () => ( {
	getElementorConfig: jest.fn(),
} ) );
jest.mock( '../../../hooks/use-license-config' );

describe( 'getAtomicDynamicTags', () => {
	const mockTags: DynamicTags = {
		'core-tag': {
			name: 'core-tag',
			label: 'Core Tag',
			group: 'core',
			categories: [ 'text' ],
			atomic_controls: [],
			props_schema: {},
		},
		'pro-free-tag': {
			name: 'pro-free-tag',
			label: 'Pro Free Tag',
			group: 'pro',
			categories: [ 'text' ],
			atomic_controls: [],
			props_schema: {},
		},
		'pro-paid-tag': {
			meta: { origin: 'elementor', required_license: 'dynamic-tags' },
			name: 'pro-paid-tag',
			label: 'Pro Paid Tag',
			group: 'pro',
			categories: [ 'text' ],
			atomic_controls: [],
			props_schema: {},
		},
	};

	const mockGroups = {
		core: { title: 'Core', color: '#000' },
		pro: { title: 'Pro', color: '#f00' },
	};

	beforeEach( () => {
		jest.mocked( getElementorConfig ).mockReturnValue( {
			atomicDynamicTags: {
				tags: mockTags,
				groups: mockGroups,
			},
		} as never );
	} );

	afterEach( () => {
		jest.clearAllMocks();
	} );

	it( 'should return null if atomicDynamicTags is not available', () => {
		// Arrange.
		jest.mocked( getElementorConfig ).mockReturnValue( {} as never );

		// Act.
		const result = getAtomicDynamicTags();

		// Assert.
		expect( result ).toBeNull();
	} );

	it( 'should return all tags when license is not expired', () => {
		// Arrange.
		jest.mocked( getLicenseConfig ).mockReturnValue( { expired: false } );

		// Act.
		const result = getAtomicDynamicTags();

		// Assert.
		expect( result ).toEqual( {
			tags: mockTags,
			groups: mockGroups,
		} );
	} );

	it( 'should filter out pro tags requiring license when expired', () => {
		// Arrange.
		jest.mocked( getLicenseConfig ).mockReturnValue( { expired: true } );

		// Act.
		const result = getAtomicDynamicTags();

		// Assert.
		expect( result ).toEqual( {
			tags: {
				'core-tag': mockTags[ 'core-tag' ],
				'pro-free-tag': mockTags[ 'pro-free-tag' ],
				// 'pro-paid-tag' should be filtered out
			},
			groups: mockGroups,
		} );
		expect( result?.tags[ 'pro-paid-tag' ] ).toBeUndefined();
	} );

	it( 'should keep tags with origin !== elementor when expired', () => {
		// Arrange.
		jest.mocked( getLicenseConfig ).mockReturnValue( { expired: true } );

		// Act.
		const result = getAtomicDynamicTags();

		// Assert.
		expect( result?.tags[ 'core-tag' ] ).toBeDefined();
	} );

	it( 'should keep pro tags not requiring license when expired', () => {
		// Arrange.
		jest.mocked( getLicenseConfig ).mockReturnValue( { expired: true } );

		// Act.
		const result = getAtomicDynamicTags();

		// Assert.
		expect( result?.tags[ 'pro-free-tag' ] ).toBeDefined();
	} );

	it( 'should handle tags with missing meta gracefully', () => {
		// Arrange.
		const tagsWithMissingMeta: DynamicTags = {
			'tag-no-meta': {
				name: 'tag-no-meta',
				label: 'Tag No Meta',
				group: 'test',
				categories: [],
				atomic_controls: [],
				props_schema: {},
			},
		};

		jest.mocked( getElementorConfig ).mockReturnValue( {
			atomicDynamicTags: {
				tags: tagsWithMissingMeta,
				groups: mockGroups,
			},
		} as never );
		jest.mocked( getLicenseConfig ).mockReturnValue( { expired: true } );

		// Act.
		const result = getAtomicDynamicTags();

		// Assert.
		expect( result?.tags[ 'tag-no-meta' ] ).toBeDefined();
	} );
} );
