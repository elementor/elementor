import { jQueryDeferred } from './types';

export type Commands = {
	'documents/save/auto': {
		args: undefined,
		returnValue: jQueryDeferred<string | SaveResponse>,
	},
};

type SaveResponse = {
	statusChanged: boolean,
	data: {
		status: 'draft' | 'publish' | 'pending' | 'future' | 'private' | 'inherit' | 'trash' | undefined,
		config: object,
	}
};
