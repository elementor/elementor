import Header from './header';
import Sidebar from './sidebar';
import Content from './content';
import Footer from './footer';

export default function Page( props ) {
	const getSideBar = () => (
		<Sidebar>
			{ props.sidebar }
		</Sidebar>
	),
	getFooter = () => (
		<Footer>
			{ props.footer }
		</Footer>
	);

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
						{ props.sidebar && getSideBar() }
						<Content>
							{ props.content }
						</Content>
					</div>
					{ props.footer && getFooter() }
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
	footer: PropTypes.object,
};

Page.defaultProps = {
	className: '',
};
