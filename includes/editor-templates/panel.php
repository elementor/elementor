<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}
?>
<script type="text/template" id="tmpl-elementor-panel">
	<div id="elementor-mode-switcher"></div>
	<header id="elementor-panel-header-wrapper"></header>
	<main id="elementor-panel-content-wrapper"></main>
	<footer id="elementor-panel-footer">
		<div class="elementor-panel-container">
		</div>
	</footer>
</script>

<script type="text/template" id="tmpl-elementor-panel-menu-item">
	<div class="elementor-panel-menu-item-icon">
		<i class="{{ icon }}"></i>
	</div>
	<div class="elementor-panel-menu-item-title">{{{ title }}}</div>
</script>

<script type="text/template" id="tmpl-elementor-panel-header">
	<div id="elementor-panel-header-menu-button" class="elementor-header-button">
		<i class="elementor-icon eicon-menu-bar tooltip-target" data-tooltip="<?php esc_attr_e( 'Menu', 'elementor' ); ?>"></i>
	</div>
	<div id="elementor-panel-header-title"></div>
	<div id="elementor-panel-header-add-button" class="elementor-header-button">
		<i class="elementor-icon eicon-apps tooltip-target" data-tooltip="<?php esc_attr_e( 'Widgets Panel', 'elementor' ); ?>"></i>
	</div>
</script>

<script type="text/template" id="tmpl-elementor-panel-footer-content">
	<div id="elementor-panel-footer-settings" class="elementor-panel-footer-tool elementor-leave-open" title="<?php esc_html_e( 'Settings', 'elementor' ); ?>">
		<i class="fa fa-cog"></i>
	</div>
	<div id="elementor-panel-footer-responsive" class="elementor-panel-footer-tool" title="<?php esc_attr_e( 'Responsive Mode', 'elementor' ); ?>">
		<i class="eicon-device-desktop"></i>
		<div class="elementor-panel-footer-sub-menu-wrapper">
			<div class="elementor-panel-footer-sub-menu">
				<div class="elementor-panel-footer-sub-menu-item" data-device-mode="desktop">
					<i class="elementor-icon eicon-device-desktop"></i>
					<span class="elementor-title"><?php esc_html_e( 'Desktop', 'elementor' ); ?></span>
					<span class="elementor-description"><?php esc_html_e( 'Default Preview', 'elementor' ); ?></span>
				</div>
				<div class="elementor-panel-footer-sub-menu-item" data-device-mode="tablet">
					<i class="elementor-icon eicon-device-tablet"></i>
					<span class="elementor-title"><?php esc_html_e( 'Tablet', 'elementor' ); ?></span>
					<span class="elementor-description"><?php esc_html_e( 'Preview for 768px', 'elementor' ); ?></span>
				</div>
				<div class="elementor-panel-footer-sub-menu-item" data-device-mode="mobile">
					<i class="elementor-icon eicon-device-mobile"></i>
					<span class="elementor-title"><?php esc_html_e( 'Mobile', 'elementor' ); ?></span>
					<span class="elementor-description"><?php esc_html_e( 'Preview for 360px', 'elementor' ); ?></span>
				</div>
			</div>
		</div>
	</div>
	<div id="elementor-panel-footer-history" class="elementor-panel-footer-tool elementor-leave-open" title="<?php esc_attr_e( 'History', 'elementor' ); ?>">
		<span class="elementor-screen-only"><?php esc_html_e( 'History', 'elementor' ); ?></span>
		<i class="fa fa-history"></i>
	</div>
	<div id="elementor-panel-saver-button-preview" class="elementor-panel-footer-tool" title="<?php esc_attr_e( 'Preview Changes', 'elementor' ); ?>">
		<form style="display: none" method="post" action="<?php echo esc_attr( get_preview_post_link() ); ?>" target="wp-preview-<?php echo get_the_ID() ?>">
		</form>
		<span id="elementor-panel-saver-button-preview-label">
			<span class="elementor-screen-only"><?php esc_html_e( 'Preview', 'elementor' ); ?></span>
			<i class="fa fa-eye"></i>
		</span>
	</div>
	<div id="elementor-panel-saver-save" class="elementor-panel-footer-tool">
		<button id="elementor-panel-saver-button-save" class="elementor-button">
			<span class="elementor-state-icon">
				<i class="fa fa-spin fa-circle-o-notch"></i>
			</span>

			<span id="elementor-panel-saver-save-label">
				<?php esc_html_e( 'Save', 'elementor' ); ?>
			</span>
		</button>
	</div>
	<div id="elementor-panel-saver-publish" class="elementor-panel-footer-tool" title="<?php esc_attr_e( 'Save', 'elementor' ); ?>">
		<button id="elementor-panel-saver-button-publish" class="elementor-button elementor-button-success">
			<i class="fa fa-paper-plane"></i>
		</button>
		<div class="elementor-panel-footer-sub-menu-wrapper">
			<div class="elementor-panel-footer-sub-menu">
				<div id="elementor-panel-saver-menu-publish" class="elementor-panel-footer-sub-menu-item">
					<i class="elementor-icon fa fa-paper-plane"></i>
					<span class="elementor-title"><?php esc_html_e( 'Publish', 'elementor' ); ?></span>
				</div>
				<div id="elementor-panel-saver-menu-publish-changes" class="elementor-panel-footer-sub-menu-item">
					<i class="elementor-icon fa fa-paper-plane"></i>
					<span class="elementor-title"><?php esc_html_e( 'Publish Changes', 'elementor' ); ?></span>
				</div>
				<div id="elementor-panel-saver-menu-update" class="elementor-panel-footer-sub-menu-item">
					<i class="elementor-icon fa fa-save"></i>
					<span class="elementor-title"><?php esc_html_e( 'Update', 'elementor' ); ?></span>
				</div>
				<div id="elementor-panel-saver-menu-save-draft" class="elementor-panel-footer-sub-menu-item">
					<i class="elementor-icon fa fa-save"></i>
					<span class="elementor-title"><?php esc_html_e( 'Save Draft', 'elementor' ); ?></span>
				</div>
				<div id="elementor-panel-saver-menu-save-template" class="elementor-panel-footer-sub-menu-item">
					<i class="elementor-icon fa fa-save"></i>
					<span class="elementor-title"><?php esc_html_e( 'Save to Library', 'elementor' ); ?></span>
				</div>
				<a id="elementor-panel-footer-saver-exit" class="elementor-panel-footer-sub-menu-item" href="<?php echo esc_attr( get_edit_post_link() ); ?>">
					<i class="elementor-icon fa fa-times"></i>
					<span class="elementor-title"><?php esc_html_e( 'Exit to Dashboard', 'elementor' ); ?></span>
				</a>
			</div>
		</div>
	</div>
</script>

<script type="text/template" id="tmpl-elementor-mode-switcher-content">
	<input id="elementor-mode-switcher-preview-input" type="checkbox">
	<label for="elementor-mode-switcher-preview-input" id="elementor-mode-switcher-preview" title="<?php esc_attr_e( 'Preview', 'elementor' ); ?>">
		<span class="elementor-screen-only"><?php esc_html_e( 'Preview', 'elementor' ); ?></span>
		<i class="fa"></i>
	</label>
</script>

<script type="text/template" id="tmpl-editor-content">
	<div class="elementor-panel-navigation">
		<# _.each( elementData.tabs_controls, function( tabTitle, tabSlug ) { #>
		<div class="elementor-panel-navigation-tab elementor-tab-control-{{ tabSlug }}" data-tab="{{ tabSlug }}">
			<a href="#">{{{ tabTitle }}}</a>
		</div>
		<# } ); #>
	</div>
	<# if ( elementData.reload_preview ) { #>
		<div class="elementor-update-preview">
			<div class="elementor-update-preview-title"><?php echo __( 'Update changes to page', 'elementor' ); ?></div>
			<div class="elementor-update-preview-button-wrapper">
				<button class="elementor-update-preview-button elementor-button elementor-button-success"><?php echo __( 'Apply', 'elementor' ); ?></button>
			</div>
		</div>
	<# } #>
	<div id="elementor-controls"></div>
</script>

<script type="text/template" id="tmpl-elementor-panel-schemes-disabled">
	<i class="elementor-panel-nerd-box-icon eicon-nerd"></i>
	<div class="elementor-panel-nerd-box-title">{{{ '<?php echo __( '{0} are disabled', 'elementor' ); ?>'.replace( '{0}', disabledTitle ) }}}</div>
	<div class="elementor-panel-nerd-box-message"><?php printf( __( 'You can enable it from the <a href="%s" target="_blank">Elementor settings page</a>.', 'elementor' ), Settings::get_url() ); ?></div>
</script>

<script type="text/template" id="tmpl-elementor-panel-scheme-color-item">
	<div class="elementor-panel-scheme-color-input-wrapper">
		<input type="text" class="elementor-panel-scheme-color-value" value="{{ value }}" data-alpha="true" />
	</div>
	<div class="elementor-panel-scheme-color-title">{{{ title }}}</div>
</script>

<script type="text/template" id="tmpl-elementor-panel-scheme-typography-item">
	<div class="elementor-panel-heading">
		<div class="elementor-panel-heading-toggle">
			<i class="fa"></i>
		</div>
		<div class="elementor-panel-heading-title">{{{ title }}}</div>
	</div>
	<div class="elementor-panel-scheme-typography-items elementor-panel-box-content">
		<?php
		$scheme_fields_keys = Group_Control_Typography::get_scheme_fields_keys();

		$typography_group = Plugin::$instance->controls_manager->get_control_groups( 'typography' );

		$typography_fields = $typography_group->get_fields();

		$scheme_fields = array_intersect_key( $typography_fields, array_flip( $scheme_fields_keys ) );

		$system_fonts = Fonts::get_fonts_by_groups( [ Fonts::SYSTEM ] );

		$google_fonts = Fonts::get_fonts_by_groups( [ Fonts::GOOGLE, Fonts::EARLYACCESS ] );

		foreach ( $scheme_fields as $option_name => $option ) :
		?>
			<div class="elementor-panel-scheme-typography-item">
				<div class="elementor-panel-scheme-item-title elementor-control-title"><?php echo $option['label']; ?></div>
				<div class="elementor-panel-scheme-typography-item-value">
					<?php if ( 'select' === $option['type'] ) : ?>
						<select name="<?php echo $option_name; ?>" class="elementor-panel-scheme-typography-item-field">
							<?php foreach ( $option['options'] as $field_key => $field_value ) : ?>
								<option value="<?php echo $field_key; ?>"><?php echo $field_value; ?></option>
							<?php endforeach; ?>
						</select>
					<?php elseif ( 'font' === $option['type'] ) : ?>
						<select name="<?php echo $option_name; ?>" class="elementor-panel-scheme-typography-item-field">
							<option value=""><?php esc_html_e( 'Default', 'elementor' ); ?></option>

							<optgroup label="<?php esc_html_e( 'System', 'elementor' ); ?>">
								<?php foreach ( $system_fonts as $font_title => $font_type ) : ?>
									<option value="<?php echo esc_attr( $font_title ); ?>"><?php echo $font_title; ?></option>
								<?php endforeach; ?>
							</optgroup>

							<optgroup label="<?php esc_html_e( 'Google', 'elementor' ); ?>">
								<?php foreach ( $google_fonts as $font_title => $font_type ) : ?>
									<option value="<?php echo esc_attr( $font_title ); ?>"><?php echo $font_title; ?></option>
								<?php endforeach; ?>
							</optgroup>
						</select>
					<?php elseif ( 'text' === $option['type'] ) : ?>
						<input name="<?php echo $option_name; ?>" class="elementor-panel-scheme-typography-item-field" />
					<?php endif; ?>
				</div>
			</div>
		<?php endforeach; ?>
	</div>
</script>

<script type="text/template" id="tmpl-elementor-control-responsive-switchers">
	<div class="elementor-control-responsive-switchers">
		<#
			var devices = responsive.devices || [ 'desktop', 'tablet', 'mobile' ];

			_.each( devices, function( device ) { #>
				<a class="elementor-responsive-switcher elementor-responsive-switcher-{{ device }}" data-device="{{ device }}">
					<i class="eicon-device-{{ device }}"></i>
				</a>
			<# } );
		#>
	</div>
</script>

<script type="text/template" id="tmpl-elementor-panel-page-settings">
	<div class="elementor-panel-navigation">
		<# _.each( elementor.config.page_settings.tabs, function( tabTitle, tabSlug ) { #>
			<div class="elementor-panel-navigation-tab elementor-tab-control-{{ tabSlug }}" data-tab="{{ tabSlug }}">
				<a href="#">{{{ tabTitle }}}</a>
			</div>
			<# } ); #>
	</div>
	<div id="elementor-panel-page-settings-controls"></div>
</script>
