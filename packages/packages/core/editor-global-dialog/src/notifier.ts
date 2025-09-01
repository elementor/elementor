import { type ReactElement } from 'react';

import { publish } from './event-bus';

export const EVENT_TYPE = {
	OPEN: 'dialog:open',
	CLOSE: 'dialog:close',
};

export type DialogContent = {
	component: ReactElement;
};

export const openDialog = ( { component }: DialogContent ) => {
	publish( EVENT_TYPE.OPEN, { component } );
};

export const closeDialog = () => {
	publish( EVENT_TYPE.CLOSE, null );
};
