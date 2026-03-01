import * as React from 'react';
import { injectIntoTop } from '@elementor/editor';
import { __privateListenTo as listenTo, v1ReadyEvent } from '@elementor/editor-v1-adapters';

import { NoticePortal } from './components/notice-portal';
import { createNoticeView } from './utils/create-notice-view';

export function init( Component: React.ComponentType ) {
	injectIntoTop( {
		id: 'editor-elements-panel-notice',
		component: () => <NoticePortal component={ Component } />,
	} );

	listenTo( v1ReadyEvent(), () => {
		window.elementor?.hooks?.addFilter( 'panel/elements/regionViews', ( regionViews, { notice }: Record<string, unknown> ) => {
			regionViews.notice = {
				region: notice,
				view: createNoticeView(),
			};

			return regionViews;
		} );
	} );
}
