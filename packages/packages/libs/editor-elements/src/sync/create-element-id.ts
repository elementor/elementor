import { type ExtendedWindow } from './types';

export const createElementId = () => {
	const extendedWindow = window as unknown as ExtendedWindow;

	return extendedWindow.elementorCommon?.helpers?.getUniqueId?.() ?? `el-${ Date.now() }`;
};
