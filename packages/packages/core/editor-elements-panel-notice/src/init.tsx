import * as React from 'react';
import { injectIntoTop } from '@elementor/editor';
import { __privateListenTo as listenTo, v1ReadyEvent } from '@elementor/editor-v1-adapters';

import { NoticePortal } from './components/notice-portal';
import { createNoticeView } from './utils/create-notice-view';

type RegisterOptions = {
	overwrite?: boolean;
};

export function register( Component: React.ComponentType, options: RegisterOptions = {} ) {
	injectIntoTop( {
		id: 'editor-elements-panel-notice',
		component: () => <NoticePortal component={ Component } />,
		options: { overwrite: options.overwrite ?? false },
	} );

	listenTo( v1ReadyEvent(), () => {
		window.elementor?.hooks?.addFilter(
			'panel/elements/regionViews',
			( regionViews, { notice }: Record< string, unknown > ) => {
				regionViews.notice = {
					region: notice,
					view: createNoticeView(),
				};

				return regionViews;
			}
		);
	} );
}
