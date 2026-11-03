import { fetchPromotionConfigAfterConnect } from '../fetch-promotion-config-after-connect';

describe( 'fetchPromotionConfigAfterConnect', () => {
	beforeEach( () => {
		jest.useFakeTimers();
	} );

	afterEach( () => {
		jest.useRealTimers();
	} );

	it( 'returns null immediately when setup is complete', async () => {
		const fetchConfig = jest.fn().mockResolvedValue( null );

		await expect( fetchPromotionConfigAfterConnect( fetchConfig ) ).resolves.toBeNull();
		expect( fetchConfig ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'retries when state stays connect then returns last connect config', async () => {
		const fetchConfig = jest.fn().mockResolvedValue( { state: 'connect' } );

		const resultPromise = fetchPromotionConfigAfterConnect( fetchConfig );

		await jest.runAllTimersAsync();

		await expect( resultPromise ).resolves.toEqual( { state: 'connect' } );
		expect( fetchConfig ).toHaveBeenCalledTimes( 12 );
	} );

	it( 'returns non-connect state without further retries', async () => {
		const fetchConfig = jest
			.fn()
			.mockResolvedValueOnce( { state: 'connect' } )
			.mockResolvedValueOnce( { state: 'install' } );

		const resultPromise = fetchPromotionConfigAfterConnect( fetchConfig );

		await jest.runAllTimersAsync();

		await expect( resultPromise ).resolves.toEqual( { state: 'install' } );
		expect( fetchConfig ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'retries after a failed fetch and succeeds on a later attempt', async () => {
		const fetchConfig = jest
			.fn()
			.mockRejectedValueOnce( new Error( 'network' ) )
			.mockResolvedValueOnce( { state: 'install' } );

		const resultPromise = fetchPromotionConfigAfterConnect( fetchConfig );

		await jest.runAllTimersAsync();

		await expect( resultPromise ).resolves.toEqual( { state: 'install' } );
		expect( fetchConfig ).toHaveBeenCalledTimes( 2 );
	} );
} );
