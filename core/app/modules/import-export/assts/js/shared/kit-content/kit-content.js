import Consumer from './consumer/consumer';

import KitContentList from './kit-content-list/kit-content-list';

export default function KitContent( props ) {
	console.log( 'RE-RENDERS: KitContent() - as a function component' );

	return (
		<Consumer type={ props.type }>
			{ ( context ) => <KitContentList type={ props.type } setIncludes={ context.setIncludes } /> }
		</Consumer>
	);
}

KitContent.propTypes = {
	classname: PropTypes.string,
	type: PropTypes.string.isRequired,
};

KitContent.defaultProps = {
	className: '',
};
