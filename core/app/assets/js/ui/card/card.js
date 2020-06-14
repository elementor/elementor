import './card.scss';

export default class Card extends React.Component {
	static propTypes = {
		type: PropTypes.string,
		className: PropTypes.string,
		children: PropTypes.object,
		header: PropTypes.object,
		body: PropTypes.object,
		footer: PropTypes.object,
	};

	static defaultProps = {
		className: '',
	};

	getClassName() {
		return this.props.className;
	}

	getHeader() {
		if ( ! this.props.header ) {
			return '';
		}

		return this.props.header;
	}

	getBody() {
		if ( ! this.props.body ) {
			return '';
		}

		return this.props.body;
	}

	getFooter() {
		if ( ! this.props.footer ) {
			return '';
		}

		return this.props.footer;
	}

	render() {
		return (
			<article id={ `type-${ this.props.type }` } className={ `card ${ this.props.className }` }>
				{ this.getHeader() }
				{ this.getBody() }
				{ this.getFooter() }
			</article>
		);
	}
}
