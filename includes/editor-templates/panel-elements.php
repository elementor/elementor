<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}
?>
<script type="text/template" id="tmpl-elementor-panel-elements">
	<div id="elementor-panel-elements-navigation" class="elementor-panel-navigation">
		<div class="elementor-component-tab elementor-panel-navigation-tab" data-tab="categories"><?php echo esc_html__( 'Elements', 'elementor' ); ?></div>
		<div class="elementor-component-tab elementor-panel-navigation-tab" data-tab="global"><?php echo esc_html__( 'Global', 'elementor' ); ?></div>
	</div>
	<div id="elementor-panel-elements-search-area"></div>
	<div id="elementor-panel-elements-wrapper"></div>
</script>

<script type="text/template" id="tmpl-elementor-panel-categories">
	<div id="elementor-panel-categories"></div>

	<div id="elementor-panel-get-pro-elements" class="elementor-nerd-box">
		<img class="elementor-nerd-box-icon" src="<?php echo ELEMENTOR_ASSETS_URL . 'images/go-pro.svg'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>" />
		<div class="elementor-nerd-box-message"><?php echo esc_html__( 'Get more with Elementor Pro', 'elementor' ); ?></div>
		<a class="elementor-button go-pro" target="_blank" href="https://go.elementor.com/pro-widgets/"><?php echo esc_html__( 'Upgrade Now', 'elementor' ); ?></a>
	</div>
</script>

<script type="text/template" id="tmpl-elementor-panel-elements-category">
	<div class="elementor-panel-heading elementor-panel-category-title">
		<div class="elementor-panel-heading-toggle">
			<i class="eicon" aria-hidden="true"></i>
		</div>
		<div class="elementor-panel-heading-title">{{{ title }}}</div>
	</div>
	<div class="elementor-panel-category-items elementor-responsive-panel"></div>
</script>

<script type="text/template" id="tmpl-elementor-panel-elements-category-empty">
	<div class="elementor-panel-category-items-empty elementor-panel-alert elementor-panel-alert-info">
		<?php echo esc_html__( 'For easy access, favorite the widgets you use most often by right clicking > Add to Favorites.', 'elementor' ); ?>
	</div>
</script>

<script type="text/template" id="tmpl-elementor-panel-element-search">
	<label for="elementor-panel-elements-search-input" class="screen-reader-text"><?php echo esc_html__( 'Search Widget:', 'elementor' ); ?></label>
	<input type="search" id="elementor-panel-elements-search-input" placeholder="<?php esc_attr_e( 'Search Widget...', 'elementor' ); ?>" autocomplete="off"/>
	<i class="eicon-search-bold" aria-hidden="true"></i>
</script>

<script type="text/template" id="tmpl-elementor-element-library-element">
	<div class="elementor-element">
		<# if ( false === obj.editable ) { #>
			<i class="eicon-lock"></i>
		<# } #>
		<div class="icon">
			<i class="{{ icon }}" aria-hidden="true"></i>
		</div>
		<div class="title-wrapper">
			<div class="title">{{{ title }}}</div>
		</div>
	</div>
</script>

<script type="text/template" id="tmpl-elementor-panel-global">
	<div class="elementor-nerd-box">
		<img class="elementor-nerd-box-icon" src="<?php echo ELEMENTOR_ASSETS_URL . 'images/information.svg'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>" />
		<div class="elementor-nerd-box-title"><?php echo esc_html__( 'Meet Our Global Widget', 'elementor' ); ?></div>
		<div class="elementor-nerd-box-message"><?php echo esc_html__( 'With this feature, you can save a widget as global, then add it to multiple areas. All areas will be editable from one single place.', 'elementor' ); ?></div>
		<a class="elementor-button go-pro" target="_blank" href="https://go.elementor.com/pro-global/"><?php echo esc_html__( 'Upgrade Now', 'elementor' ); ?></a>
	</div>
</script>
