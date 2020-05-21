import SitePart from './../molecules/site-part';
import { Context as TemplateTypesContext } from '../context/template-types';
import './site-parts.scss';

export default function SiteParts( props ) {
	const { templateTypes } = React.useContext( TemplateTypesContext );

	return (
		<section className="elementor-app__site-editor__site-parts">
			{ (
				templateTypes.map( ( item ) => (
					<SitePart key={ item.type } { ...item }>
						{ React.createElement( props.hoverElement, item ) }
					</SitePart>
				) )
			) }
		</section>
	);
}

SiteParts.propTypes = {
	hoverElement: PropTypes.func.isRequired,
};
