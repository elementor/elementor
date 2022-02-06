import config from 'elementor/tests/qunit/editor/config';

export const getWidgetsConfig = () => {
	return {
		success: true,
		code: 200,
		data: config.document.widgets,
	};
};

export default getWidgetsConfig;
