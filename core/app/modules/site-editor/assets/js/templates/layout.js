import Page from 'elementor-app/layout/page';
import Menu from '../organisms/menu';
import TemplateTypesContext from '../context/template-types';

export default function Layout( props ) {
	const config = {
		title: __( 'Site Editor', 'elementor' ),
		headerButtons: props.headerButtons,
		sidebar: <Menu allPartsButton={ props.allPartsButton } />,
		content: props.children,
	};

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
};

Layout.defaultProps = {
	headerButtons: [],
};
