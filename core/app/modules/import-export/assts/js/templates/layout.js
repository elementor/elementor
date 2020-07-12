import Page from 'elementor-app/layout/page';
import ImportContext from '../context/import';
import ExportContext from '../context/export';

export default function Layout( props ) {
	const config = {
		title: 'import' === props.type ? __( 'Import Kit', 'elementor' ) : __( 'Export Kit', 'elementor' ),
		headerButtons: props.headerButtons,
		content: props.children,
	},
	Context = 'import' === props.type ? ImportContext : ExportContext;

	return (
		<Context>
			<Page { ...config } />
		</Context>
	);
}

Layout.propTypes = {
	type: PropTypes.string.isRequired,
	headerButtons: PropTypes.arrayOf( PropTypes.object ),
	children: PropTypes.object.isRequired,
};

Layout.defaultProps = {
	headerButtons: [],
};
