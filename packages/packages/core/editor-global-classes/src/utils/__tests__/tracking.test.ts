import { getMixpanel } from '@elementor/events';
import { __getState as getState } from '@elementor/store';

import { fetchCssClassUsage } from '../../../service/css-class-usage-service';
import { selectClass } from '../../store';
import { trackGlobalClasses } from '../tracking';

jest.mock( '@elementor/events', () => ( {
	getMixpanel: jest.fn(),
} ) );

jest.mock( '@elementor/store', () => ( {
	__getState: jest.fn(),
} ) );

jest.mock( '../../store', () => ( {
	selectClass: jest.fn(),
	selectClassLabels: jest.fn(),
	placeholderDefinition: jest.fn(),
} ) );

jest.mock( '../../../service/css-class-usage-service', () => ( {
	fetchCssClassUsage: jest.fn(),
} ) );

describe( 'trackGlobalClasses - classCreated', () => {
	const mockDispatchEvent = jest.fn();

	beforeEach( () => {
		jest.clearAllMocks();

		jest.mocked( getMixpanel ).mockReturnValue( {
			dispatchEvent: mockDispatchEvent,
			config: {
				names: {
					global_classes: {
						classCreated: 'class_created',
						classApplied: 'class_applied',
					},
				},
			},
		} as never );

		jest.mocked( getState ).mockReturnValue( {} as never );
		jest.mocked( selectClass ).mockReturnValue( { id: 'g-1', label: 'my-button-class' } as never );
		jest.mocked( fetchCssClassUsage ).mockResolvedValue( {} );
	} );

	it( 'should dispatch class_created with source "imported"', async () => {
		await trackGlobalClasses( { event: 'classCreated', source: 'imported', classId: 'g-1' } );

		expect( mockDispatchEvent ).toHaveBeenCalledWith(
			'class_created',
			expect.objectContaining( { source: 'imported', classId: 'g-1' } )
		);
	} );

	it( 'should not fire class_applied when a class is imported', async () => {
		await trackGlobalClasses( { event: 'classCreated', source: 'imported', classId: 'g-1' } );

		expect( mockDispatchEvent ).not.toHaveBeenCalledWith( 'class_applied', expect.anything() );
	} );

	it( 'should fire class_applied for non-imported sources', async () => {
		await trackGlobalClasses( { event: 'classCreated', source: 'duplicated', classId: 'g-1' } );
		await Promise.resolve();
		await Promise.resolve();

		expect( mockDispatchEvent ).toHaveBeenCalledWith( 'class_applied', expect.anything() );
	} );
} );
