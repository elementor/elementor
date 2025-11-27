import { jest } from '@jest/globals';

export const mockTrackGlobalClasses = jest.fn( async ( payload: unknown & { runAction: () => void } ) => {
	if ( payload?.runAction ) {
		payload.runAction();
	}
} );

export const mockTrackingModule = {
	trackGlobalClasses: mockTrackGlobalClasses,
};

