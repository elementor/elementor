<?php
namespace Elementor;

use Elementor\Core\Editor\Editor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

$is_editor_v2_active = Plugin::$instance->experiments->is_feature_active( Editor::EDITOR_V2_EXPERIMENT_NAME );
?>
<script type="text/template" id="tmpl-elementor-navigator">
	<div id="elementor-navigator__header">
		<button id="elementor-navigator__toggle-all" data-elementor-action="expand">
			<i class="eicon-expand" aria-hidden="true"></i>
			<span class="elementor-screen-only"><?php esc_html__( 'Expand all elements', 'elementor' ); ?></span>
		</button>
		<h2 id="elementor-navigator__header__title"><?php
			echo $is_editor_v2_active
				? esc_html__( 'Structure', 'elementor' )
				: esc_html__( 'Navigator', 'elementor' );
		?></h2>
		<button id="elementor-navigator__close">
			<i class="eicon-close" aria-hidden="true"></i>
			<span class="elementor-screen-only"><?php
				echo $is_editor_v2_active
					? esc_html__( 'Close structure', 'elementor' )
					: esc_html__( 'Close navigator', 'elementor' );
			?></span>
		</button>
	</div>
	<div id="elementor-navigator__elements"></div>
	<div id="elementor-navigator__footer">
		<i class="eicon-ellipsis-h" aria-hidden="true"></i>
		<span class="elementor-screen-only"><?php
			echo $is_editor_v2_active
				? esc_html__( 'Resize structure', 'elementor' )
				: esc_html__( 'Resize navigator', 'elementor' );
		?></span>
	</div>
</script>

<script type="text/template" id="tmpl-elementor-navigator__elements">
	<# if ( obj.elType ) { #>
		<div class="elementor-navigator__item" data-locked="{{ obj.isLocked ? 'true' : 'false' }}" tabindex="0">
			<div class="elementor-navigator__element__list-toggle">
				<i class="eicon-sort-down" aria-hidden="true"></i>
				<span class="elementor-screen-only"><?php echo esc_html__( 'Show/hide inner elements', 'elementor' ); ?></span>
			</div>
			<#
			if ( icon ) { #>
				<div class="elementor-navigator__element__element-type">
					<i class="{{{ icon }}}" aria-hidden="true"></i>
				</div>
			<# } #>
			<div class="elementor-navigator__element__title">
				<span class="elementor-navigator__element__title__text">{{{ title }}}</span>
			</div>
			<div class="elementor-navigator__element__toggle">
				<i class="eicon-preview-medium" aria-hidden="true"></i>
				<span class="elementor-screen-only"><?php echo esc_html__( 'Show/hide Element', 'elementor' ); ?></span>
			</div>
			<div class="elementor-navigator__element__indicators"></div>
		</div>
	<# } #>
	<div class="elementor-navigator__elements"></div>
</script>

<script type="text/template" id="tmpl-elementor-navigator__elements--empty">
	<div class="elementor-empty-view__title"><?php echo esc_html__( 'Empty', 'elementor' ); ?></div>
</script>

<script type="text/template" id="tmpl-elementor-navigator__root--empty">
	<img class="elementor-nerd-box-icon" src="<?php echo ELEMENTOR_ASSETS_URL . 'images/information.svg'; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>" loading="lazy" />
	<div class="elementor-nerd-box-title"><?php echo esc_html__( 'Easy Navigation is Here!', 'elementor' ); ?></div>
	<div class="elementor-nerd-box-message"><?php echo esc_html__( 'Once you fill your page with content, this window will give you an overview display of all the page elements. This way, you can easily move around any section, column, or widget.', 'elementor' ); ?></div>
</script>
