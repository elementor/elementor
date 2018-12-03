<?php
namespace Elementor;

use Elementor\Control_Icons;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

$tabs_list = [];
foreach ( Control_Icons::get_icon_manager_tabs() as $tab_key => $icons_tab ) {
	$icons_tab['name'] = $tab_key;
	$tabs_list[] = [
		'label' => $icons_tab['label'],
		'key' => $tab_key,
		'settings' => $icons_tab,
	];
}
?>
<script type="text/template" id="tmpl-elementor-icons-manager">
	<div id="elementor-icon-manager__content">
		<div class="elementor-icon-manager-tabs">
			<input type="search" class="icons-search" placeholder="<?php esc_attr_e( 'Search...', 'elementor' ); ?>">
			<ul class="elementor-icon-manager-tabs-list">
				<?php foreach ( $tabs_list as $tab ) : ?>
					<li class="icon-type-tab-label" data-tab="<?php echo $tab['key']; ?>" data-settings="<?php echo esc_attr( wp_json_encode( $tab['settings'] ) ); ?>"><?php echo $tab['label']; ?></li>
				<?php endforeach; ?>
			</ul>
            <input type="hidden" name="icon_value" id="icon_value" value="">
            <input type="hidden" name="icon_type" id="icon_type" value="">
			<div class="elementor-icon-manager-tabs-content"></div>
		</div>
	</div>
</script>
