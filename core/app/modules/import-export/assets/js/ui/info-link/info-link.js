import Utils from 'elementor-app/utils/utils.js';

import './info-link.scss';

export default function InfoLink( props ) {
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

InfoLink.propTypes = {
	className: PropTypes.string,
	url: PropTypes.string,
	target: PropTypes.string,
	text: PropTypes.string,
};

InfoLink.defaultProps = {
	className: '',
	target: '_blank',
};
