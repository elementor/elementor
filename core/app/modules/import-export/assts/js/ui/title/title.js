import Utils from 'elementor-app/utils/utils.js';

import Heading from 'elementor-app/ui/atoms/heading';
import Text from 'elementor-app/ui/atoms/text';

import './title.scss';

export default function Title( props ) {
	const baseClassName = 'import-export-title',
		classes = [ baseClassName, props.className ];

	return (
		<div className={ Utils.arrayToClassName( classes ) }>
			{ props.primary && <Heading variant="h3" className="import-export-title__primary">{ props.primary }</Heading> }
			{ props.secondary && <Text className="import-export-title__secondary">{ props.secondary }</Text> }
		</div>
	);
}

Title.propTypes = {
	className: PropTypes.string,
	primary: PropTypes.string,
	secondary: PropTypes.string,
};

Title.defaultProps = {
	className: '',
};
