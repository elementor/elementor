import { apiClient } from '../../../api';
import { fetchCssClassUsage } from '../service/css-class-usage-service';
import { transformData } from '../utils';

jest.mock( '../../../api', () => ( {
	apiClient: {
		usage: jest.fn(),
	},
} ) );

jest.mock( '../utils', () => ( {
	transformData: jest.fn(),
} ) );

describe( 'fetchCssClassUsage', () => {
	it( 'fetches and transforms data', async () => {
		const fakeRawData = { data: { some: 'raw' } };
		const fakeTransformed = { 'css-id': { total: 1, content: [] } };

		( apiClient.usage as jest.Mock ).mockResolvedValue( { data: fakeRawData } );
		( transformData as jest.Mock ).mockReturnValue( fakeTransformed );

		const result = await fetchCssClassUsage();

		expect( apiClient.usage ).toHaveBeenCalled();
		expect( transformData ).toHaveBeenCalledWith( fakeRawData.data );
		expect( result ).toBe( fakeTransformed );
	} );
} );
