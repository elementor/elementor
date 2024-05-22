const arrowIconClass = 'eicon-chevron-' + ( elementorCommon.config.isRTL ? 'right' : 'left' );

const buttonBack = `
<button id="elementor-panel-header-kit-back" class="elementor-header-button">
	<i class="elementor-icon ${ arrowIconClass } tooltip-target" aria-hidden="true" data-tooltip="{{ Back }}"></i>
	<span class="elementor-screen-only">{{ Back }}</span>
</button>
`;

const buttonClose = `
<button id="elementor-panel-header-kit-close" class="elementor-header-button">
	<i class="elementor-icon eicon-close tooltip-target" aria-hidden="true" data-tooltip="{{ Close }}"></i>
	<span class="elementor-screen-only">{{ Close }}</span>
</button>
`;

export { buttonBack, buttonClose };
