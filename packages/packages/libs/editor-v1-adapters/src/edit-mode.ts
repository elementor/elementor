import useListenTo from './hooks/use-listen-to';
import { windowEvent } from './listeners';

export type EditMode = 'edit' | 'preview' | 'picker' | ( string & {} );

export type ExtendedWindow = Window & {
	elementor: {
		changeEditMode: ( newMode: EditMode ) => void;
		channels: {
			dataEditMode: {
				request: ( key: 'activeMode' ) => EditMode;
			};
		};
	};
};

export function useEditMode() {
	return useListenTo( windowEvent( 'elementor/edit-mode/change' ), getCurrentEditMode );
}

function getCurrentEditMode() {
	const extendedWindow = window as unknown as ExtendedWindow;

	return extendedWindow.elementor.channels.dataEditMode.request( 'activeMode' );
}

export function changeEditMode( newMode: EditMode ) {
	const extendedWindow = window as unknown as ExtendedWindow;

	return extendedWindow.elementor.changeEditMode( newMode );
}
