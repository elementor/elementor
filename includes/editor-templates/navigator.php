<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

?>
<script type="text/template" id="tmpl-elementor-navigator">
	<div id="elementor-navigator__header">
		<i id="elementor-navigator__toggle-all" class="eicon-menu-bar" data-elementor-action="expand"></i>
		<div id="elementor-navigator__header__title"><?php echo __( 'Navigator', 'elementor' ); ?></div>
		<i id="elementor-navigator__close" class="eicon-close"></i>
	</div>
	<div id="elementor-navigator__elements"></div>
	<div id="elementor-navigator__footer">
		<i class="eicon-handle"></i>
	</div>
</script>

<script type="text/template" id="tmpl-elementor-navigator__elements">
	<# if ( obj.elType ) { #>
		<div class="elementor-navigator__item">
			<i class="eicon-sort-down elementor-navigator__element__list-toggle"></i>
			<#
			var icon;

			if ( 'column' === elType ) {
				icon = 'eicon-column';
			} else if ( 'widget' === elType ) {
				icon = elementor.config.widgets[ widgetType ].icon;
			}

			if ( icon ) { #>
				<i class="{{{ icon }}} elementor-navigator__element__element-type"></i>
			<# } #>
			<div class="elementor-navigator__element__title">{{{ elementor.helpers.firstLetterUppercase( obj.widgetType || elType ) }}}</div>
			<# if ( 'section' === elType ) { #>
				<i class="elementor-navigator__element__toggle fa fa-eye"></i>
			<# } #>
		</div>
	<# } #>
	<div class="elementor-navigator__elements"></div>
</script>

<script type="text/template" id="tmpl-elementor-navigator__elements--empty">
	<div class="elementor-empty-view__title"><?php echo __( 'Empty', 'elementor' ); ?></div>
</script>