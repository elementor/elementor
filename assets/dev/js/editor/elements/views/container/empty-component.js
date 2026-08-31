/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import PropTypes from 'prop-types';
import { EditorOneEventManager } from 'elementor-editor-utils/editor-one-events';

export default function EmptyComponent( { container } = {} ) {
	const handleClick = () => {
		// Align click-to-add with drag-and-drop: target the empty slot's owner container.
		if ( container ) {
			$e.run( 'document/elements/select', { container } );
		}

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

EmptyComponent.propTypes = {
	container: PropTypes.object,
};
