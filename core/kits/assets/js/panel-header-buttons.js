const arrowIconClass = 'eicon-chevron-' + ( elementorCommon.config.isRTL ? 'right' : 'left' );

const buttonBack = `
<button id="elementor-panel-header-kit-back" class="elementor-header-button" aria-label="{{ Back }}">
	<i class="elementor-icon ${ arrowIconClass } tooltip-target" aria-hidden="true" data-tooltip="{{ Back }}"></i>
</button>
`;

const buttonClose = `
<button id="elementor-panel-header-kit-close" class="elementor-header-button" aria-label="{{ Close }}">
	<i class="elementor-icon eicon-close tooltip-target" aria-hidden="true" data-tooltip="{{ Close }}"></i>
</button>
`;

export { buttonBack, buttonClose };
