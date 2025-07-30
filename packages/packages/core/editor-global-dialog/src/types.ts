import type * as React from 'react';

export type DialogData = {
	title: string;
	content: React.ReactNode;
	actions: {
		text: string;
		type: string;
		value: string;
	}[];
};

export type DialogState = {
	activeDialog: DialogData | null;
};
