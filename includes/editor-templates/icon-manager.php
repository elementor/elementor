<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

?>
<script type="text/template" id="tmpl-elementor-icons-manager">

    <div id="elementor--icon--manager--placeholder"></div>
    <!--<div id="elementor-icon-manager__content">
		<div class="elementor-icon-manager-tabs">
            <input type="hidden" name="icon_value" id="icon_value" value="">
            <input type="hidden" name="icon_type" id="icon_type" value="">
            <div class="elementor-icon-manager__sidebar">
                <ul class="elementor-icon-manager-tabs-list">
                    <li class="icon-type-tab-label" data-tab="all"><?php esc_html_e( 'All Icons', 'elementor' ); ?></li>
                    <?php foreach ( Icons_Manager::get_icon_manager_tabs() as $tab_key => $icons_tab ) : ?>
                        <li class="icon-type-tab-label" data-tab="<?php echo $tab_key; ?>"><i class="<?php echo $icons_tab['displayPrefix'] . ' ' . $icons_tab['labelIcon']; ?>"></i><?php echo $icons_tab['label']; ?></li>
                    <?php endforeach; ?>
                </ul>
            </div>
			<div class="elementor-icon-manager-tabs__container">
                <input type="search" class="icons-search" id="icons-search" placeholder="<?php esc_attr_e( 'Search...', 'elementor' ); ?>">
				<ul class="elementor-icon-manager-tabs-content"></ul>
			</div>
		</div>
	</div>-->
</script>
