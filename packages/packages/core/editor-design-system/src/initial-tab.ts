export type DesignSystemTab = 'variables' | 'classes';

let pendingTab: DesignSystemTab = 'variables';

export function setInitialDesignSystemTab( tab: DesignSystemTab ) {
	pendingTab = tab;
}

export function consumeInitialDesignSystemTab(): DesignSystemTab {
	const value = pendingTab;
	pendingTab = 'variables';
	return value;
}
