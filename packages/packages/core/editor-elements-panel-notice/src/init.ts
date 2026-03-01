import { injectIntoTop } from '@elementor/editor';
import { __privateListenTo as listenTo, v1ReadyEvent } from '@elementor/editor-v1-adapters';

import { NoticePortal } from './components/notice-portal';
import { createNoticeView } from './utils/create-notice-view';

declare global {
	interface Window {
		elementor: {
			hooks: {
				addFilter: (
					filterName: string,
					callback: (
						regionViews: Record< string, unknown >,
						options: { notice: unknown }
					) => Record< string, unknown >
				) => void;
			};
		};
	}
}

export function init() {
	// eslint-disable-next-line no-console
	console.log( '[notice] init() called' );

	injectIntoTop( {
		id: 'editor-elements-panel-notice',
		component: NoticePortal,
	} );

	// eslint-disable-next-line no-console
	console.log( '[notice] NoticePortal injected into top slot' );

	listenTo( v1ReadyEvent(), () => {
		// eslint-disable-next-line no-console
		console.log( '[notice] v1ReadyEvent fired — registering panel/elements/regionViews filter' );

		window.elementor.hooks.addFilter(
			'panel/elements/regionViews',
			( regionViews, { notice } ) => {
				// eslint-disable-next-line no-console
				console.log( '[notice] panel/elements/regionViews filter called', { notice, regionViews } );

				regionViews.notice = {
					region: notice,
					view: createNoticeView(),
				};

				// eslint-disable-next-line no-console
				console.log( '[notice] regionViews.notice set', regionViews.notice );

				return regionViews;
			}
		);
	} );
}
