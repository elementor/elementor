import { injectIntoTop } from '@elementor/editor';
import { __privateListenTo as listenTo, v1ReadyEvent } from '@elementor/editor-v1-adapters';

import { NoticePortal } from './components/notice-portal';
import { createNoticeView } from './utils/create-notice-view';

export function init() {
	injectIntoTop( {
		id: 'editor-elements-panel-notice',
		component: NoticePortal,
	} );

	listenTo( v1ReadyEvent(), () => {
		window.elementor?.hooks?.addFilter( 'panel/elements/regionViews', ( regionViews, { notice } ) => {
			regionViews.notice = {
				region: notice,
				view: createNoticeView(),
			};

			return regionViews;
		} );
	} );
}
