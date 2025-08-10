import { type ReactElement } from 'react';

import { publish } from './event-bus';

export const EVENT_TYPE = {
	OPEN: 'dialog:open',
	CLOSE: 'dialog:close',
};

export type DialogContent = {
	title: ReactElement;
	component: ReactElement;
};

export const openDialog = ( { component, title }: DialogContent ) => {
	publish( EVENT_TYPE.OPEN, { component, title } );
};

export const closeDialog = () => {
	publish( EVENT_TYPE.CLOSE, null );
};
