import Header from './header';
import Sidebar from './sidebar';
import Content from './content';

export default function Page( props ) {
	return (
		<div className={ props.className }>
			<div className="e-app__view">
				<div className="e-app__view__content">
					<Header title={ props.title } buttons={ props.headerButtons } />
					<div className="e-app__main">
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
