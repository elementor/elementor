type ElementorWindow = Window & {
	elementor?: {
		config?: {
			is_angie_active?: boolean;
			user?: {
				is_administrator?: boolean;
			};
		};
	};
};

export const isAngiePluginActive = (): boolean => {
	const win = window as ElementorWindow;
	return win.elementor?.config?.is_angie_active === true;
};

export const isEditorUserAdministrator = (): boolean => {
	const win = window as ElementorWindow;
	return win.elementor?.config?.user?.is_administrator === true;
};

export const shouldShowAngieInstallPromotion = (): boolean => {
	return isAngiePluginActive() || isEditorUserAdministrator();
};
