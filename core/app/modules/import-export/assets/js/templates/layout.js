import Page from 'elementor-app/layout/page';
import ContentLayout from '../shared/content-layout/content-layout';

export default function Layout( props ) {
	const config = {
		title: 'import' === props.type ? __( 'Import', 'elementor' ) : __( 'Export', 'elementor' ),
		headerButtons: props.headerButtons,
		content: <ContentLayout>{ props.children }</ContentLayout>,
		footer: props.footer,
	};

	return <Page { ...config } />;
}

Layout.propTypes = {
	type: PropTypes.string.isRequired,
	headerButtons: PropTypes.arrayOf( PropTypes.object ),
	children: PropTypes.object.isRequired,
	footer: PropTypes.object,
};

Layout.defaultProps = {
	headerButtons: [],
};
