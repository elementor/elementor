import Header from './header/header';
import Sidebar from './sidebar/sidebar';
import Content from './content/content';
import './page.scss';

export default function Page( props ) {
	return (
		<div className={ props.className }>
			<div className="e-app__view">
				<div className="e-app__view__content">
					<Header title={ props.title } buttons={ props.headerButtons } />
					<div className="e-app__view__content__main">
						<Sidebar>
							{ props.sidebar }
						</Sidebar>
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
	sidebar: PropTypes.object.isRequired,
	content: PropTypes.object.isRequired,
};

Page.defaultProps = {
	className: '',
};
