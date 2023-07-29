export const redColour = 'rgb(217, 83, 79)';
export const blackColour = 'rgb(0, 0, 0)';
export const whiteColour = 'rgb(255, 255, 255)';
export const purpleColour = 'rgb(177, 0, 255)';

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
