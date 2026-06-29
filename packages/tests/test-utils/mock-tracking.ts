import { jest } from '@jest/globals';

export const mockTracking = jest.fn( async ( payload: unknown & { runAction?: () => void } ) => {
	if ( payload && typeof payload === 'object' && 'runAction' in payload && typeof payload.runAction === 'function' ) {
		payload.runAction();
	}
} );

export const createMockTrackingModule = ( trackingFunctionName: string = 'track' ) => {
	return {
		[ trackingFunctionName ]: mockTracking,
	};
};

