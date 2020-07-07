import Footer from '../../ui/footer/footer';
import Grid from 'elementor-app/ui/grid/grid';

import './main-footer.scss';

export default function MainFooter( props ) {
	return (
		<Footer className={ `import-export-footer ${ props.className }` }>
			<Grid container justify="end">
				{ props.children }
			</Grid>
		</Footer>
	);
}

MainFooter.propTypes = {
	className: PropTypes.string,
	children: PropTypes.oneOfType( [
		PropTypes.string,
		PropTypes.object,
		PropTypes.arrayOf( PropTypes.object ),
	] ).isRequired,
};

MainFooter.defaultProps = {
	className: '',
};
