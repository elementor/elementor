export {
	registerLink,
	registerAction,
	registerToggleAction,
	injectIntoCanvasDisplay,
	injectIntoPrimaryAction,
} from './locations/index';

export * from './types';

import init from './init';

init();
