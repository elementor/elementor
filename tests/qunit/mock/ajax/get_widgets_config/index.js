import config from 'elementor/tests/qunit/editor/config';

// eslint-disable-next-line no-unused-vars
export const getWidgetsConfig = ( action, fullParams ) => {
	return {
		success: true,
		code: 200,
		data: config.document.widgets,
	};
};

export default getWidgetsConfig;
