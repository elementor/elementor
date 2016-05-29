<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly

$structures = [ 10, 20, 21, 22, 30, 40 ,50, 60, 70, 80, 90, 100 ];
?>
<script type="text/template" id="tmpl-elementor-empty-preview">
	<div class="elementor-first-add">
		<div class="elementor-icon eicon-plus"></div>
	</div>
</script>

<script type="text/template" id="tmpl-elementor-preview">
	<div id="elementor-section-wrap"></div>
	<div id="elementor-add-section" class="elementor-visible-desktop">
		<div id="elementor-add-section-inner">
			<div id="elementor-add-new-section">
				<button class="elementor-button elementor-add-section-button"><?php _e( 'Add New Section', 'elementor' ); ?></button>
				<div id="elementor-add-section-drag-title"><?php _e( 'Or drag widget here', 'elementor' ); ?></div>
			</div>
			<div id="elementor-select-preset">
				<div id="elementor-select-preset-close">
					<i class="fa fa-times"></i>
				</div>
				<div id="elementor-select-preset-title"><?php _e( 'SELECT YOUR STRUCTURE', 'elementor' ); ?></div>
				<ul id="elementor-select-preset-list">
					<?php foreach ( $structures as $structure ) :
						$preset = Element_Section::get_preset_by_structure( $structure );
						?>
						<li class="elementor-preset elementor-column elementor-col-16" data-structure="<?php echo $structure; ?>">
							<i class="eicon-<?php echo $preset['icon']; ?>"></i>
						</li>
					<?php endforeach; ?>
				</ul>
			</div>
		</div>
	</div>
</script>
