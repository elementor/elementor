import SitePart from './../molecules/site-part';
import { TemplateTypesConsumer } from '../context/template-types';
import './site-parts.css';

export default function SiteParts( props ) {
	return (
		<section className="elementor-app__site-editor__site-parts">
			<TemplateTypesConsumer>
				{ ( state ) => (
					state.templateTypes.map( ( item ) => (
						<SitePart key={ item.type } { ...item }>
							{ React.createElement( props.hoverElement, item ) }
						</SitePart>
					) )
				) }
			</TemplateTypesConsumer>
		</section>
	);
}

SiteParts.propTypes = {
	hoverElement: PropTypes.func.isRequired,
};
