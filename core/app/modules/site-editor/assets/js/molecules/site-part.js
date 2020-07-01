import Card from 'elementor-app/ui/card/card';
import CardHeader from 'elementor-app/ui/card/card-header';
import CardBody from 'elementor-app/ui/card/card-body';
import CardImage from 'elementor-app/ui/card/card-image';
import Typography from 'elementor-app/ui/atoms/typography';

import './site-part.scss';

export default class SitePart extends Card {
	getHeader() {
		const Indicator = () => {
			if ( ! this.props.showIndicator ) {
				return '';
			}

			const active = this.props.isActive ? 'indicator-bullet--active' : '';

			return <i className={`indicator-bullet ${ active }`}/>;
		};

		const ActionButton = () => {
			if ( ! this.props.actionButton ) {
				return '';
			}

			return ( this.props.actionButton );
		};

		return (
			<CardHeader>
				<>
					<Indicator/>
					<Typography tagName="h1" className="card__headline">{ this.props.title }</Typography>
					<ActionButton/>
				</>
			</CardHeader>
		);
	}

	getBody() {
		return (
			<CardBody>
				<CardImage alt={ this.props.title } src={ this.props.thumbnail }>
					{ this.props.children }
				</CardImage>
			</CardBody>
		);
	}
}

SitePart.propTypes = {
	thumbnail: PropTypes.string.isRequired,
	title: PropTypes.string.isRequired,
	children: PropTypes.object,
	showIndicator: PropTypes.bool,
	isActive: PropTypes.bool,
	actionButton: PropTypes.object,
};
