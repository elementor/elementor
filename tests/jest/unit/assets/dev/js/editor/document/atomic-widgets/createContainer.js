import createModel from './createModel';

export default function createContainer( {
	elType,
	widgetType,
	id,
	settings = {},
	styles = {},
} = {} ) {
	const settingsModel = createModel( settings );

	return {
		id,
		settings: settingsModel,
		model: createModel( {
			elType,
			widgetType,
			styles,
			settings: settingsModel,
		} ),
	};
}
