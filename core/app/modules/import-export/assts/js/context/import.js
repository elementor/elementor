export const Context = React.createContext();

class ImportContext extends React.Component {
	static propTypes = {
		children: PropTypes.object.isRequired,
	};

	constructor( props ) {
		super( props );
//
		this.state = {
			importContent: [
				{
					type: 'templates',
					data: {
						title: 'Global Templates',
						description: 'Saved Templates, Site Parts, Popups, Global Widgets',
						notice: 'Site Parts, Global widgets and Popups will are available only when Elementor Pro license is Connected',
					},
				},
				{
					type: 'styles',
					data: {
						title: 'Global Styles And Settings',
						description: 'Theme Style, Global Colors and Typography, Layout, Lightbox and Site Identity settings',
					},
				},
				{
					type: 'content',
					data: {
						title: 'Content',
						description: 'Published pages, posts, related taxonomies, menu and custom post types.',
					},
				},
			],
			importSuccessContent: [
				{
					type: 'templates',
					data: {
						title: 'Global Templates',
						items: [ '4 Headers', '3 Footers', '2 Posts', '1 Product' ],
					},
				},
				{
					type: 'styles',
					data: {
						title: 'Styles and Settings',
						items: [ 'Colors', 'Typography', 'Site Layout' ],
					},
				},
				{
					type: 'content',
					data: {
						title: 'Content',
						items: [ 'Pages', 'Posts', 'Menu' ],
					},
				},
			],
		};
	}

	componentDidMount() {
	}

	render() {
		return (
			<Context.Provider value={ this.state }>
				{ this.props.children }
			</Context.Provider>
		);
	}
}

export const ImportConsumer = Context.Consumer;
export default ImportContext;
