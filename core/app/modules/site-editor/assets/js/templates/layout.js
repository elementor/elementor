import Page from 'elementor-app/layout/page';
import Menu from '../organisms/menu';
import TemplateTypesContext from '../context/template-types';

import './site-editor.scss';

export default function Layout( props ) {
	const uiTheme = elementorAppConfig.ui_theme,
		config = {
			title: __( 'Site Editor', 'elementor' ),
			headerButtons: props.headerButtons,
			sidebar: <Menu allPartsButton={ props.allPartsButton } promotion={props.promotion} />,
			content: props.children,
		};

	let userPrefersTheme = '';

	if ( 'auto' === uiTheme ) {
		if ( window.matchMedia && window.matchMedia( '(prefers-color-scheme: dark)' ).matches ) {
			userPrefersTheme = 'dark';
		}
	} else if ( 'dark' === uiTheme ) {
		userPrefersTheme = 'dark';
	}

	return (
		<TemplateTypesContext theme={ userPrefersTheme }>
			<Page { ...config } />
		</TemplateTypesContext>
	);
}

Layout.propTypes = {
	headerButtons: PropTypes.arrayOf( PropTypes.object ),
	allPartsButton: PropTypes.element.isRequired,
	children: PropTypes.object.isRequired,
	promotion: PropTypes.bool,
};

Layout.defaultProps = {
	headerButtons: [],
};
