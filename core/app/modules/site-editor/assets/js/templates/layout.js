import Page from 'elementor-app/layout/page';
import Menu from '../organisms/menu';
import TemplateTypesContext from '../context/template-types';

import './site-editor.scss';

export default function Layout( props ) {
	const config = {
		title: __( 'Theme Builder', 'elementor' ),
		headerButtons: props.headerButtons,
		sidebar: <Menu allPartsButton={ props.allPartsButton } promotion={ props.promotion } />,
		content: props.children,
	};

	if ( props.titleRedirectRoute ) {
		config.titleRedirectRoute = props.titleRedirectRoute;
	}

	return (
		<TemplateTypesContext>
			<Page { ...config } />
		</TemplateTypesContext>
	);
}

Layout.propTypes = {
	headerButtons: PropTypes.arrayOf( PropTypes.object ),
	allPartsButton: PropTypes.element.isRequired,
	children: PropTypes.object.isRequired,
	promotion: PropTypes.bool,
	titleRedirectRoute: PropTypes.string,
};

Layout.defaultProps = {
	headerButtons: [],
};
