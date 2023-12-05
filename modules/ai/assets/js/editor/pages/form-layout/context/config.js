import React from 'react';
import PropTypes from 'prop-types';

export const MODE_LAYOUT = 'layout';
export const MODE_VARIATION = 'variation';
export const LAYOUT_APP_MODES = [ MODE_LAYOUT, MODE_VARIATION ];

const ConfigContext = React.createContext( {} );

export const useConfig = () => React.useContext( ConfigContext );

export const ConfigProvider = ( props ) => {
	return (
		<ConfigContext.Provider
			value={ {
				mode: props.mode,
				attachmentsTypes: props.attachmentsTypes,
				onClose: props.onClose,
				onConnect: props.onConnect,
				onData: props.onData,
				onInsert: props.onInsert,
				onSelect: props.onSelect,
				onGenerate: props.onGenerate,
				currentContext: props.currentContext,
				hasPro: props.hasPro,
			} }
		>
			{ props.children }
		</ConfigContext.Provider>
	);
};

ConfigProvider.propTypes = {
	mode: PropTypes.oneOf( LAYOUT_APP_MODES ).isRequired,
	children: PropTypes.node.isRequired,
	attachmentsTypes: PropTypes.object.isRequired,
	onClose: PropTypes.func.isRequired,
	onConnect: PropTypes.func.isRequired,
	onData: PropTypes.func.isRequired,
	onInsert: PropTypes.func.isRequired,
	onSelect: PropTypes.func.isRequired,
	onGenerate: PropTypes.func.isRequired,
	currentContext: PropTypes.object,
	hasPro: PropTypes.bool,
};

export default ConfigContext;
