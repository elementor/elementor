import Dialog from 'elementor-app/ui/dialog/dialog';

// In the current time there is no solution to use "getDerivedStateFromError" static method with functional component
// That is why this component is a class component.
// @link https://reactjs.org/docs/hooks-faq.html#do-hooks-cover-all-use-cases-for-classes
export default class ErrorBoundary extends React.Component {
	static propTypes = {
		children: PropTypes.any,
		title: PropTypes.string,
		text: PropTypes.string,
		learnMoreUrl: PropTypes.string,
	};

	static defaultProps = {
		title: __( 'App could not be loaded', 'elementor' ),
		text: __( 'We’re sorry, but something went wrong. Click on ‘Learn more’ and follow each of the steps to quickly solve it.', 'elementor' ),
		learnMoreUrl: 'https://go.elementor.com/app-general-load-issue/',
	};

	constructor( props ) {
		super( props );

		this.state = {
			hasError: null,
		};
	}

	static getDerivedStateFromError() {
		return { hasError: true };
	}

	goBack() {
		// If the app was opened inside an iframe, it will close it,
		// if not, it will redirect to the last location.
		if ( window.top !== window.self ) {
			window.top.$e.run( 'app/close' );
		}

		window.location = elementorAppConfig.return_url;
	}

	render() {
		if ( this.state.hasError ) {
			return <Dialog
				title={ this.props.title }
				text={ this.props.text }
				approveButtonUrl={ this.props.learnMoreUrl }
				approveButtonColor="link"
				approveButtonTarget="_blank"
				approveButtonText={ __( 'Learn More', 'elementor' ) }
				dismissButtonText={ __( 'Go Back', 'elementor' ) }
				dismissButtonOnClick={ this.goBack }
			/>;
		}

		return this.props.children;
	}
}
