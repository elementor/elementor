import { arrayToClassName } from 'elementor-app/utils/utils.js';

import Text from 'elementor-app/ui/atoms/text';

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
				{ props.label && <strong>{ props.label + ': ' }</strong> } { props.children }
			</Text>
		</div>
	);
}

Notice.propTypes = {
	className: PropTypes.string,
	color: PropTypes.string,
	label: PropTypes.string,
	children: PropTypes.oneOfType( [
		PropTypes.string,
		PropTypes.object,
		PropTypes.arrayOf( PropTypes.object ),
	] ).isRequired,
};

Notice.defaultProps = {
	className: '',
};
