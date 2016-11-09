<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly
?>
<script type="text/template" id="tmpl-elementor-panel-elements">
	<div id="elementor-panel-elements-navigation" class="elementor-panel-navigation">
		<div id="elementor-panel-elements-navigation-all" class="elementor-panel-navigation-tab active"><?php echo __( 'Elements', 'elementor' ); ?></div>
		<div id="elementor-panel-elements-navigation-global" class="elementor-panel-navigation-tab" data-view="global"><?php echo __( 'Global', 'elementor' ); ?></div>
	</div>
	<div id="elementor-panel-elements-search-area"></div>
	<div id="elementor-panel-elements-wrapper"></div>
</script>

<script type="text/template" id="tmpl-elementor-panel-elements-category">
	<# if ( title ) { #>
		<div class="panel-elements-category-title">{{{ title }}}</div>
	<# } #>
	<div class="panel-elements-category-items"></div>
</script>

<script type="text/template" id="tmpl-elementor-panel-element-search">
	<input id="elementor-panel-elements-search-input" placeholder="<?php _e( 'Search Widget...', 'elementor' ); ?>" />
	<i class="fa fa-search"></i>
</script>

<script type="text/template" id="tmpl-elementor-element-library-element">
	<div class="elementor-element">
		<div class="icon">
			<i class="eicon-{{ icon }}"></i>
		</div>
		<div class="elementor-element-title-wrapper">
			<div class="title">{{{ title }}}</div>
		</div>
	</div>
</script>

<script type="text/template" id="tmpl-elementor-panel-global">
	<div class="elementor-panel-nerd-box">
		<i class="elementor-panel-nerd-box-icon eicon-hypster"></i>
		<div class="elementor-panel-nerd-box-title"><?php echo __( 'What about you?', 'elementor' ); ?></div>
		<div class="elementor-panel-nerd-box-message"><?php echo __( 'This is where your templates should be. Design it. Save it. Reuse it.', 'elementor' ); ?></div>
		<a class="elementor-panel-nerd-box-link" href="https://go.elementor.com/pro/" target="_blank"><?php echo __( 'Get Elementor Pro', 'elementor' ); ?></a>
	</div>
</script>
