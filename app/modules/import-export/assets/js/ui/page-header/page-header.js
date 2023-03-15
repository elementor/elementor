import { arrayToClassName } from 'elementor-app/utils/utils.js';

import Grid from 'elementor-app/ui/grid/grid';
import Heading from 'elementor-app/ui/atoms/heading';
import Text from 'elementor-app/ui/atoms/text';

import './page-header.scss';

// Page header.
export default function PageHeader( props ) {
	const baseClassName = 'e-app-import-export-page-header',
		classes = [ baseClassName, props.className ];

	const handleMultiLine = ( content ) => {
		if ( Array.isArray( content ) ) {
			const multiLineArray = [];

			content.forEach( ( line, index ) => {
				if ( index ) {
					multiLineArray.push( <br key={ index } /> );
				}

				multiLineArray.push( line );
			} );

			return multiLineArray;
		}

		return content;
	};

	return (
		<div className={ arrayToClassName( classes ) }>
			<Grid container>
				<Grid item className="e-app-import-export-page-header__content-wrapper">
					{ props.heading && <Heading variant="display-3" className="e-app-import-export-page-header__heading">{ props.heading }</Heading> }
					{ props.description && <Text className="e-app-import-export-page-header__description">{ handleMultiLine( props.description ) }</Text> }
				</Grid>
			</Grid>
		</div>
	);
}

PageHeader.propTypes = {
	className: PropTypes.string,
	heading: PropTypes.string,
	description: PropTypes.oneOfType( [
		PropTypes.string,
		PropTypes.array,
		PropTypes.object,
	] ),
};

PageHeader.defaultProps = {
	className: '',
};
