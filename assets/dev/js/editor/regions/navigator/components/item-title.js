import { useState } from 'react';
import PropTypes from 'prop-types';
import { selectElementContents } from 'elementor/assets/dev/js/editor/utils/select-element-contents';

export function ItemTitle( { title, onTitleEdit } ) {
	const [ editMode, setEditMode ] = useState( false );

	/**
	 * Trigger Edit-Mode (the span becomes content-editable) when the user double-clicks the element. Also focus the
	 * span element so editing is immediately possible.
	 *
	 * @void
	 */
	const handleDoubleClick = ( e ) => {
		if ( ! onTitleEdit ) {
			return;
		}

		setEditMode( true );

		// Since edit-mode only applied after component re-render, `setTimeout` is necessary.
		setTimeout( () => {
			e.target.focus();
			selectElementContents( e.target );
		} );
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
			handleBlur( e );
		}
	};

	/**
	 * Store the new title of the element when the user presses `Enter`.
	 *
	 * @param e
	 */
	const handleBlur = ( e ) => {
		const newTitle = e.target.innerText;

		if ( ! newTitle ) {
			e.target.innerText = title;
		} else {
			onTitleEdit( newTitle );
		}

		setEditMode( false );
	};

	return (
		<div className="elementor-navigator__element__title">
			<span
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
