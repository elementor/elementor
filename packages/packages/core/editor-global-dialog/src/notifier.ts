import { type ReactElement } from 'react';

import { publish } from './event-bus';

export const EVENT_TYPE = {
	OPEN: 'dialog:open',
	CLOSE: 'dialog:close',
};

export type DialogContent = {
	title: ReactElement;
	component: ReactElement;
	actions: ReactElement;
};

export const openDialog = ( { component, title , actions}: DialogContent ) => {
	publish( EVENT_TYPE.OPEN, { component, title, actions } );
};

export const closeDialog = () => {
	publish( EVENT_TYPE.CLOSE, null );
};
