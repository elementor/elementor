import React, { useState, useRef } from 'react';
import PropTypes from 'prop-types';

const ItemTitle = React.memo( function ItemTitle( { title, onTitleEdit } ) {
	const titleRef = useRef(),
		[ editMode, setEditMode ] = useState( false );

	const handleDoubleClick = () => {
		setEditMode( true );
		setTimeout( () => titleRef.current.focus() );
	};

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
} );

ItemTitle.propTypes = {
	title: PropTypes.string,
	onTitleEdit: PropTypes.func,
};

export default ItemTitle;
