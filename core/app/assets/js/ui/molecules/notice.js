import { arrayToClassName } from 'elementor-app/utils/utils.js';

import Text from 'elementor-app/ui/atoms/text';
import Icon from 'elementor-app/ui/atoms/icon';

import './notice.scss';

export default function Notice( props ) {
	const baseClassName = 'eps-notice',
		classes = [ baseClassName, props.className ];

	if ( props.color ) {
		classes.push( baseClassName + '--' + props.color );
	}

	return (
		<div className={ arrayToClassName( classes ) }>
			<Text variant="xs" className="eps-notice__text">
				{ props.color && <Icon className={ arrayToClassName( [ 'eicon-warning', 'eps-notice__icon' ] ) } /> }

				{ props.label && <strong>{ props.label + ' ' }</strong> }

				{ props.children }
			</Text>
		</div>
	);
}

Notice.propTypes = {
	className: PropTypes.string,
	color: PropTypes.string,
	label: PropTypes.string,
	children: PropTypes.any.isRequired,
	icon: PropTypes.string,
	withIcon: PropTypes.bool,
};

Notice.defaultProps = {
	className: '',
	withIcon: true,
};
