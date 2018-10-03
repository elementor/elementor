<?php

namespace Elementor\Modules\Assistant;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

?>
<script type="text/template" id="tmpl-elementor-assistant">
	<div id="elementor-assistant__search">
		<i class="eicon-search"></i>
		<input id="elementor-assistant__search__input" placeholder="<?php echo __( 'Search Elementor', 'elementor' ); ?>">
	</div>
	<div id="elementor-assistant__content"></div>
</script>
<script type="text/template" id="tmpl-elementor-assistant__results__category">
	<div class="elementor-assistant__results__category__title">{{{ title }}}</div>
	<div class="elementor-assistant__results__category__items"></div>
</script>

<script type="text/template" id="tmpl-elementor-assistant__results__item">
	<div class="elementor-assistant__results__item__icon">
		<i class="eicon-{{{ icon }}}"></i>
	</div>
	<div class="elementor-assistant__results__item__title">{{{ title }}}</div>
	<# if ( description ) { #>
		<div class="elementor-assistant__results__item__description">- {{{ description }}}</div>
	<# } #>
</script>
