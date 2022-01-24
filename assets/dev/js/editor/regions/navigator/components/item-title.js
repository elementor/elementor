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
	 * Trigger blur event on the span element to exit Edit-Mode and store the title.
	 *
	 * @param e
	 *
	 * @void
	 */
	const handleKeyPress = ( e ) => {
		if ( 'Enter' === e.key ) {
			titleRef.current.blur();
		}
	};

	/**
	 * Store the new title of the element when the user presses `Enter`.
	 *
	 * @param e
	 */
	const handleBlur = ( e ) => {
		const newTitle = titleRef.current.innerText;

		if ( ! newTitle ) {
			titleRef.current.innerText = title;
		} else {
			onTitleEdit( newTitle );
		}

		setEditMode( false );
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
				onBlur={ handleBlur }
				onKeyPress={ handleKeyPress }>{ title }</span>
		</div>
	);
}

ItemTitle.propTypes = {
	title: PropTypes.string,
	onTitleEdit: PropTypes.func,
};

export default ItemTitle;
