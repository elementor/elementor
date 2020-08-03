import Card from 'elementor-app/ui/card/card';
import CardHeader from 'elementor-app/ui/card/card-header';
import CardBody from 'elementor-app/ui/card/card-body';
import CardImage from 'elementor-app/ui/card/card-image';
import Heading from 'elementor-app/ui/atoms/heading';

import './site-part.scss';

export default function SitePart( props ) {
	return (
		<Card className="e-site-part">
			<CardHeader>
				<Heading tag="h1" variant="text-sm" className="eps-card__headline">{ props.title }</Heading>
				{ props.actionButton }
			</CardHeader>
			<CardBody>
				<CardImage alt={ props.title } src={ props.thumbnail }>
					{ props.children }
				</CardImage>
			</CardBody>
		</Card>
	);
}

SitePart.propTypes = {
	thumbnail: PropTypes.string.isRequired,
	title: PropTypes.string.isRequired,
	children: PropTypes.object,
	showIndicator: PropTypes.bool,
	actionButton: PropTypes.object,
};
