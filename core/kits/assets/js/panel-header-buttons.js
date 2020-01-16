/* global ElementorConfig */
const arrowIconClass = 'eicon-arrow-' + ( elementorCommon.config.isRTL ? 'right' : 'left' );

const buttonBack = `
<div id="elementor-panel-header-kit-back" class="elementor-header-button">
	<i class="elementor-icon ${ arrowIconClass } tooltip-target" aria-hidden="true" data-tooltip="${ ElementorConfig.i18n.Back }"></i>
	<span class="elementor-screen-only">${ ElementorConfig.i18n.Back }</span>
</div>
`;

const buttonClose = `
<div id="elementor-panel-header-kit-close" class="elementor-header-button">
	<i class="elementor-icon eicon-close tooltip-target" aria-hidden="true" data-tooltip="${ ElementorConfig.i18n.Close }"></i>
	<span class="elementor-screen-only">${ ElementorConfig.i18n.Close }</span>
</div>
`;

export { buttonBack, buttonClose };
