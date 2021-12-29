import { useState, useRef } from 'react';
import PropTypes from 'prop-types';

export function ItemTitle( { title, onTitleEdit } ) {
	const titleRef = useRef(),
		[ editMode, setEditMode ] = useState( false );

	/**
	 * Trigger Edit-Mode (the span becomes content-editable) when the user double-clicks the element. Also focus the
	 * span element so editing is immediately possible.
	 *
	 * @void
	 */
	const handleDoubleClick = () => {
		if ( ! onTitleEdit ) {
			return;
		}

		setEditMode( true );
		setTimeout( () => titleRef.current.focus() );
	};

	/**
	 * Store the new title of the element when the user presses `Enter`. Also blur the span element to exit Edit-Mode.
	 *
	 * @param e Event
	 *
	 * @void
	 */
	const handleKeyPress = ( e ) => {
		if ( 'Enter' === e.key ) {
			titleRef.current.blur();
			onTitleEdit( titleRef.current.innerText );
		}
	};

	return (
		<div className="elementor-navigator__element__title">
			<span
				ref={ titleRef }
				className="elementor-navigator__element__title__text"
				contentEditable={ editMode }
				spellCheck={ false }
				suppressContentEditableWarning={ true }
				onDoubleClick={ handleDoubleClick }
				onBlur={ () => setEditMode( false ) }
				onKeyPress={ handleKeyPress }>{ title }</span>
		</div>
	);
}

ItemTitle.propTypes = {
	title: PropTypes.string,
	onTitleEdit: PropTypes.func,
};

export default ItemTitle;
