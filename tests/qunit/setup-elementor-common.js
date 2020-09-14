// Common.
// eslint-disable-next-line no-unused-vars
const elementorCommonConfig = {
	isTesting: true,
	activeModules: [],
	ajax: { url: '-' },
	i18n: {},
	urls: {
		rest: 'http://localtest/wp-json/',
	},
};

// Common-Admin.
const elementorCommonAdminConfig = {
	activeModules: [ 'ajax' ],
	ajax: { url: '-' },
	i18n: {},
};
