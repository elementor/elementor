import { __privateListenTo as listenTo, commandEndEvent, type CommandEvent } from '@elementor/editor-v1-adapters';
import { __dispatch as dispatch } from '@elementor/store';

import { slice } from './store/slice';

export function syncReportStaleness() {
	listenTo( commandEndEvent( 'document/save/set-is-modified' ), ( e ) => {
		const event = e as CommandEvent< { status: boolean } >;

		if ( event.args?.status ) {
			dispatch( slice.actions.reportStale() );
		}
	} );

	listenTo( commandEndEvent( 'document/save/save' ), ( e ) => {
		const event = e as CommandEvent< { status: string } >;

		if ( event.args?.status !== 'autosave' ) {
			dispatch( slice.actions.reportStale() );
		}
	} );
}
