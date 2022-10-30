import { ReducerUtils } from '../utils/reducer-utils';

export const reducer = ( state, { type, payload } ) => {
	switch ( type ) {
		case 'SET_FILE':
			return { ...state, file: payload };
		case 'ADD_OVERRIDE_CONDITION':
			return ReducerUtils.updateArray( state, 'overrideConditions', payload, 'add' );
		case 'REMOVE_OVERRIDE_CONDITION':
			return ReducerUtils.updateArray( state, 'overrideConditions', payload, 'remove' );
		case 'SET_UPLOADED_DATA':
			return { ...state, uploadedData: payload };
		case 'SET_IMPORTED_DATA':
			return { ...state, importedData: payload };
		case 'SET_PLUGINS':
			return { ...state, plugins: payload };
		case 'SET_REQUIRED_PLUGINS':
			return { ...state, requiredPlugins: payload };
		case 'SET_IMPORTED_PLUGINS':
			return { ...state, importedPlugins: payload };
		case 'SET_IS_PRO_INSTALLED_DURING_PROCESS':
			return { ...state, isProInstalledDuringProcess: payload };
		case 'SET_ACTION_TYPE':
			return { ...state, actionType: payload };
		case 'SET_IS_RESOLVED':
			return { ...state, isResolvedData: payload };
		case 'SET_PLUGINS_STATE':
			return { ...state, pluginsState: payload };
		default:
			return state;
	}
};
