import Header from './header';
import Sidebar from './sidebar';
import Content from './content';

export default function Page( props ) {
	const getSideBar = () => {
		if ( ! props.sidebar ) {
			return '';
		}

		return (
			<Sidebar>
				{ props.sidebar }
			</Sidebar>
		);
	};

	const uiTheme = elementorAppConfig.ui_theme;
	let userPrefersTheme = '';

	if ( 'auto' === uiTheme ) {
		if ( window.matchMedia && window.matchMedia( '(prefers-color-scheme: dark)' ).matches ) {
			userPrefersTheme = ' dark';
		}
	} else if ( 'dark' === uiTheme ) {
		userPrefersTheme = ' dark';
	}

	return (
		<div className={ props.className + userPrefersTheme }>
			<div className="eps-app__lightbox">
				<div className="eps-app">
					<Header title={ props.title } buttons={ props.headerButtons } />
					<div className="eps-app__main">
						{ getSideBar() }
						<Content>
							{ props.content }
						</Content>
					</div>
				</div>
			</div>
		</div>
	);
}

Page.propTypes = {
	title: PropTypes.string,
	className: PropTypes.string,
	headerButtons: PropTypes.arrayOf( PropTypes.object ),
	sidebar: PropTypes.object,
	content: PropTypes.object.isRequired,
};

Page.defaultProps = {
	className: '',
};
