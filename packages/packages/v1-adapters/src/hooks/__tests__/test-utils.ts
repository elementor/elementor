import { EditMode, ExtendedWindow } from '../../readers/types';

const extendedWindow = window as unknown as ExtendedWindow;

export function mockIsRouteActive( implementation: ( route: string ) => boolean ) {
	extendedWindow.$e = {
		routes: {
			isPartOf: jest.fn( implementation ),
		},
	};
}

export function mockGetCurrentEditMode( implementation: () => EditMode ) {
	extendedWindow.elementor = {
		channels: {
			dataEditMode: {
				request: jest.fn( implementation ),
			},
		},
	};
}
