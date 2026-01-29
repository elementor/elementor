/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { EditorOneEventManager } from 'elementor-editor-utils/editor-one-events';

export default function EmptyComponent() {
	const handleClick = () => {
		EditorOneEventManager.sendCanvasEmptyBoxAction( {
			targetName: 'add_container',
		} );
		$e.route( 'panel/elements/categories' );
	};

	return (
		<div className="elementor-first-add">
			<div className="elementor-icon eicon-plus" onClick={ handleClick } />
		</div>
	);
}
