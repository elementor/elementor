type KitSettingsWindow = Window & {
	$e: {
		routes: {
			getCurrent: () => Record< string, string > | undefined;
		};
	};
};

export function getWindow() {
	return window as unknown as KitSettingsWindow;
}
