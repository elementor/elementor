import { jQueryDeferred } from './util-types';

export type Commands = {
	'documents/save/auto': {
		args: {
			force?: boolean,
		},
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
