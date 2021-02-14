import { Link, LocationProvider } from '@reach/router';
import router from '@elementor/router';

import Utils from 'elementor-app/utils/utils.js';

import './inline-link.scss';

export default function InlineLink( props ) {
	const baseClassName = 'eps-inline-link',
		colorClassName = `${ baseClassName }__color--${ props.color || 'link' }`,
		classes = [ baseClassName, props.className, colorClassName ],
		className = Utils.arrayToClassName( classes ),
		style = { textDecoration: props.decoration || 'underline' },
		getRouterLink = () => (
			<LocationProvider history={ router.appHistory }>
				<Link
					{ ...props }
					style={ style }
					to={ props.url }
					className={ className }
				>
					{ props.children }
				</Link>
			</LocationProvider>
		),
		getExternalLink = () => (
			<a
				{ ...props }
				style={ style }
				className={ className }
				target={ props.target || '_blank' }
				rel="noopener noreferrer"
				href={ props.url }
			>
				{ props.children }
			</a>
		);

	return props.url.includes( 'http' ) ? getExternalLink() : getRouterLink();
}

InlineLink.propTypes = {
	className: PropTypes.string,
	url: PropTypes.string,
	target: PropTypes.string,
	text: PropTypes.string,
	color: PropTypes.oneOf( [ 'primary', 'secondary', 'cta', 'link', 'disabled' ] ),
	decoration: PropTypes.string,
};

InlineLink.defaultProps = {
	className: '',
};
