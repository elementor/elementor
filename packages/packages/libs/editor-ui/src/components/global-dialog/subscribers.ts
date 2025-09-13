import { type ReactElement } from 'react';

type DialogState = {
	component: ReactElement;
} | null;

export type DialogStateCallback = ( state: DialogState ) => void;

let currentDialogState: DialogState = null;

const stateSubscribers = new Set< DialogStateCallback >();

export const subscribeToDialogState = ( callback: DialogStateCallback ) => {
	stateSubscribers.add( callback );

	callback( currentDialogState );
	return () => stateSubscribers.delete( callback );
};

const notifySubscribers = () => {
	stateSubscribers.forEach( ( callback ) => callback( currentDialogState ) );
};

export type DialogContent = {
	component: ReactElement;
};

export const openDialog = ( { component }: DialogContent ) => {
	currentDialogState = { component };
	notifySubscribers();
};

export const closeDialog = () => {
	currentDialogState = null;
	notifySubscribers();
};
