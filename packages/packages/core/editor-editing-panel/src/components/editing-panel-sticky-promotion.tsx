import * as React from 'react';

function getStickyPromotion() {
	return window.elementor?.config?.editingPanelStickyPromotion;
}

export const EditingPanelStickyPromotion = () => {
	const promotion = getStickyPromotion();

	if ( ! promotion ) {
		return null;
	}

	return (
		<div className="elementor-panel-editor-sticky-promotion">
			<div className="elementor-get-pro-sticky-message">
				{ promotion.message }{ ' ' }
				<a target="_blank" rel="noreferrer" href={ promotion.url }>
					{ promotion.button_text }
				</a>
			</div>
		</div>
	);
};
