import Utils from 'elementor-app/utils/utils.js';

import './inline-link.scss';

export default function InlineLink( props ) {
	const baseClassName = 'e-app-import-export-click-here',
		classes = [ baseClassName, props.className ];

	return (
		<a
			className={ Utils.arrayToClassName( classes ) }
			target={ props.target }
			rel="noopener noreferrer"
			href={ props.url }>
			{ props.text }
		</a>
	);
}

InlineLink.propTypes = {
	className: PropTypes.string,
	url: PropTypes.string,
	target: PropTypes.string,
	text: PropTypes.string,
};

InlineLink.defaultProps = {
	className: '',
	target: '_blank',
};
