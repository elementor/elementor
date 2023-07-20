export const redColour = 'rgb(217, 83, 79)';
export const blackColour = 'rgb(51, 51, 51)';

export const cardTypes = {
	spade: '♠',
	diamond: '♦',
	heart: '♥',
	club: '♣',
};

export const setCardProps = async ( editor, type, value ) => {
	await editor.setSelectControlValue( 'card_type', type );
	await editor.setSelectControlValue( 'card_value', value );
};
