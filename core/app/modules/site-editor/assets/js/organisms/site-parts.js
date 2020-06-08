import Card from 'elementor-app/ui/card/card';
import CardHeader from 'elementor-app/ui/card/card-header';
import CardBody from 'elementor-app/ui/card/card-body';
import CardImage from 'elementor-app/ui/card/card-image';
import CardOverlay from 'elementor-app/ui/card/card-overlay';
import { Context as TemplateTypesContext } from '../context/template-types';
import './site-parts.scss';

export default function SiteParts( props ) {
	const { templateTypes } = React.useContext( TemplateTypesContext );

	return (
		<section className="elementor-app__site-editor__site-parts">
			{ (
				templateTypes.map( ( item ) => (
					<Card key={ item.type } { ...item }>
						<CardHeader>
							<h1>Title</h1>
						</CardHeader>
						<CardBody>
							<CardImage alt={ item.type } src={ `./molecules/images/${ item.type }.svg` }>
								<CardOverlay>{ React.createElement( props.hoverElement, item ) }</CardOverlay>
							</CardImage>
						</CardBody>
					</Card>
				) )
			) }
		</section>
	);
}

SiteParts.propTypes = {
	hoverElement: PropTypes.func.isRequired,
};
