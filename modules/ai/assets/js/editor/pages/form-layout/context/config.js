import React from 'react';
import PropTypes from 'prop-types';

const ConfigContext = React.createContext( {} );

export const useConfig = () => React.useContext( ConfigContext );

export const ConfigProvider = ( props ) => {
	return (
		<ConfigContext.Provider
			value={ {
				attachmentsTypes: props.attachmentsTypes,
				onClose: props.onClose,
				onConnect: props.onConnect,
				onData: props.onData,
				onInsert: props.onInsert,
				onSelect: props.onSelect,
				onGenerate: props.onGenerate,
			} }
		>
			{ props.children }
		</ConfigContext.Provider>
	);
};

ConfigProvider.propTypes = {
	children: PropTypes.node.isRequired,
	attachmentsTypes: PropTypes.object.isRequired,
	onClose: PropTypes.func.isRequired,
	onConnect: PropTypes.func.isRequired,
	onData: PropTypes.func.isRequired,
	onInsert: PropTypes.func.isRequired,
	onSelect: PropTypes.func.isRequired,
	onGenerate: PropTypes.func.isRequired,
};

export default ConfigContext;
