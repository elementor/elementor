import { Link, LocationProvider } from '@reach/router';
import router from '@elementor/router';
import Icon from 'elementor-app/ui/atoms/icon';
import Typography from 'elementor-app/ui/atoms/typography';

export default class Button extends React.Component {
	static propTypes = {
		text: PropTypes.string.isRequired,
		hideText: PropTypes.bool,
		icon: PropTypes.string,
		tooltip: PropTypes.string,
		id: PropTypes.string,
		className: PropTypes.string,
		url: PropTypes.string,
		onClick: PropTypes.func,
	};

	static defaultProps = {
		id: '',
		className: '',
	};

	getCssId() {
		return this.props.id;
	}

	getClassName() {
		return this.props.className;
	}

	getIcon() {
		if ( this.props.icon ) {
			const tooltip = this.props.tooltip || this.props.text;
			const icon = <Icon className={ this.props.icon } aria-hidden="true" title={ tooltip } />;
			let screenReaderText = '';

			if ( this.props.hideText ) {
				screenReaderText = <Typography className="sr-only" >{ tooltip }</Typography>;
			}

			return (
				<>
					{ icon }
					{ screenReaderText }
				</>
			);
		}
		return '';
	}

	getText() {
		return this.props.hideText ? '' : <Typography>{ this.props.text }</Typography>;
	}

	render() {
		const attributes = {},
			id = this.getCssId(),
			className = this.getClassName();

		// Add attributes only if they are not empty.
		if ( id ) {
			attributes.id = id;
		}

		if ( className ) {
			attributes.className = className;
		}
		if ( this.props.onClick ) {
			attributes.onClick = this.props.onClick;
		}

		const buttonContent = (
			<>
				{ this.getIcon() }
				{ this.getText() }
			</>
		);

		if ( this.props.url ) {
			if ( 0 === this.props.url.indexOf( 'http' ) ) {
				return (
					<a href={ this.props.url } target="_parent" { ...attributes }>
						{ buttonContent }
					</a>
				);
			}

			// @see https://reach.tech/router/example/active-links.
			attributes.getProps = ( props ) => {
				if ( props.isCurrent ) {
					attributes.className += ' active';
				}

				return {
					className: attributes.className,
				};
			};

			return (
			<LocationProvider history={ router.appHistory }>
				<Link to={ this.props.url } { ...attributes } >
					{ buttonContent }
				</Link>
			</LocationProvider>
			);
		}

		return (
			<div { ...attributes }>
				{ buttonContent }
			</div>
		);
	}
}
