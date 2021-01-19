import Page from 'elementor-app/layout/page';
import KitContext from '../context/kit-context';

export default function Layout( props ) {
	const config = {
		title: 'import' === props.type ? __( 'Import Kit', 'elementor' ) : __( 'Export Kit', 'elementor' ),
		headerButtons: props.headerButtons,
		content: props.children,
		footer: props.footer,
	},
	Context = KitContext;

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
	footer: PropTypes.object,
};

Layout.defaultProps = {
	headerButtons: [],
};
