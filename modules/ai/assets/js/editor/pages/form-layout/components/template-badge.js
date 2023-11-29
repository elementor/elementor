import PropTypes from 'prop-types';
import { useConfig } from '../context/config';
import { ProTemplateIndicator } from './pro-template-indicator';

const TemplateBadge = ( props ) => {
	const { hasPro } = useConfig();

	switch ( props.type ) {
		case 'Pro':
			return hasPro ? null : <ProTemplateIndicator />;
	}

	return null;
};

export default TemplateBadge;

TemplateBadge.propTypes = {
	type: PropTypes.string,
};
