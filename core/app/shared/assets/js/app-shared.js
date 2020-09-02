import { AppLayoutRefsProvider, useAppLayoutRefs } from './context/app-layout-refs';

window.elementorAppShared = {
	context: {
		appLayoutRefs: {
			useAppLayoutRefs: useAppLayoutRefs,
			AppLayoutRefsProvider: AppLayoutRefsProvider,
		},
	},
};
