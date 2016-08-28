<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) exit; // Exit if accessed directly
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
		<i class="fa fa-<%= icon %>"></i>
	</div>
	<div class="elementor-panel-menu-item-title"><%= title %></div>
</script>

<script type="text/template" id="tmpl-elementor-panel-header">
	<div id="elementor-panel-header-menu-button" class="elementor-header-button">
		<i class="elementor-icon eicon-menu tooltip-target" data-tooltip="<?php esc_attr_e( 'Menu', 'elementor' ); ?>"></i>
	</div>
	<div id="elementor-panel-header-title"></div>
	<div id="elementor-panel-header-add-button" class="elementor-header-button">
		<i class="elementor-icon eicon-apps tooltip-target" data-tooltip="<?php esc_attr_e( 'Widgets Panel', 'elementor' ); ?>"></i>
	</div>
</script>

<script type="text/template" id="tmpl-elementor-panel-footer-content">
	<div id="elementor-panel-footer-exit" class="elementor-panel-footer-tool" title="<?php _e( 'Exit', 'elementor' ); ?>">
		<i class="fa fa-times"></i>
		<div class="elementor-panel-footer-sub-menu-wrapper">
			<div class="elementor-panel-footer-sub-menu">
				<a id="elementor-panel-footer-view-page" class="elementor-panel-footer-sub-menu-item" href="<?php the_permalink(); ?>" target="_blank">
					<i class="elementor-icon fa fa-external-link"></i>
					<span class="elementor-title"><?php _e( 'View Page', 'elementor' ); ?></span>
				</a>
				<a id="elementor-panel-footer-view-edit-page" class="elementor-panel-footer-sub-menu-item" href="<?php echo get_edit_post_link(); ?>">
					<i class="elementor-icon fa fa-wordpress"></i>
					<span class="elementor-title"><?php _e( 'Go to Dashboard', 'elementor' ); ?></span>
				</a>
			</div>
		</div>
	</div>
	<div id="elementor-panel-footer-responsive" class="elementor-panel-footer-tool" title="<?php esc_attr_e( 'Responsive Mode', 'elementor' ); ?>">
		<i class="fa fa-desktop"></i>
		<div class="elementor-panel-footer-sub-menu-wrapper">
			<div class="elementor-panel-footer-sub-menu">
				<div class="elementor-panel-footer-sub-menu-item" data-device-mode="desktop">
					<i class="elementor-icon fa fa-desktop"></i>
					<span class="elementor-title"><?php _e( 'Desktop', 'elementor' ); ?></span>
					<span class="elementor-description"><?php _e( '1024px > Up', 'elementor' ); ?></span>
				</div>
				<div class="elementor-panel-footer-sub-menu-item" data-device-mode="laptop">
					<i class="elementor-icon fa fa-laptop"></i>
					<span class="elementor-title"><?php _e( 'Laptop', 'elementor' ); ?></span>
					<span class="elementor-description"><?php _e( '1024px > 768px', 'elementor' ); ?></span>
				</div>
				<div class="elementor-panel-footer-sub-menu-item" data-device-mode="tablet">
					<i class="elementor-icon fa fa-tablet"></i>
					<span class="elementor-title"><?php _e( 'Tablet', 'elementor' ); ?></span>
					<span class="elementor-description"><?php _e( '768px > 1024px', 'elementor' ); ?></span>
				</div>
				<div class="elementor-panel-footer-sub-menu-item" data-device-mode="mobile-landscape">
					<i class="elementor-icon fa fa-mobile"></i>
					<span class="elementor-title"><?php _e( 'Mobile Landscape', 'elementor' ); ?></span>
					<span class="elementor-description"><?php _e( '767px > Down', 'elementor' ); ?></span>
				</div>
				<div class="elementor-panel-footer-sub-menu-item" data-device-mode="mobile">
					<i class="elementor-icon fa fa-mobile"></i>
					<span class="elementor-title"><?php _e( 'Mobile Portrait', 'elementor' ); ?></span>
					<span class="elementor-description"><?php _e( '479px > Down', 'elementor' ); ?></span>
				</div>
			</div>
		</div>
	</div>
	<div id="elementor-panel-footer-help" class="elementor-panel-footer-tool" title="<?php esc_attr_e( 'Help', 'elementor' ); ?>">
		<span class="elementor-screen-only"><?php _e( 'Help', 'elementor' ); ?></span>
		<i class="fa fa-question-circle"></i>
		<div class="elementor-panel-footer-sub-menu-wrapper">
			<div class="elementor-panel-footer-sub-menu">
				<div id="elementor-panel-footer-help-title"><?php _e( 'Need help?', 'elementor' ); ?></div>
				<div id="elementor-panel-footer-watch-tutorial" class="elementor-panel-footer-sub-menu-item">
					<i class="elementor-icon fa fa-video-camera"></i>
					<span class="elementor-title"><?php _e( 'Take a tour', 'elementor' ); ?></span>
				</div>
				<div class="elementor-panel-footer-sub-menu-item">
					<i class="elementor-icon fa fa-external-link"></i>
					<a class="elementor-title" href="https://go.elementor.com/docs" target="_blank"><?php _e( 'Go to the Documentation', 'elementor' ); ?></a>
				</div>
			</div>
		</div>
	</div>
	<div id="elementor-panel-footer-templates" class="elementor-panel-footer-tool" title="<?php esc_attr_e( 'Templates', 'elementor' ); ?>">
		<span class="elementor-screen-only"><?php _e( 'Templates', 'elementor' ); ?></span>
		<i class="fa fa-folder"></i>
		<div class="elementor-panel-footer-sub-menu-wrapper">
			<div class="elementor-panel-footer-sub-menu">
				<div id="elementor-panel-footer-templates-modal" class="elementor-panel-footer-sub-menu-item">
					<i class="elementor-icon fa fa-folder"></i>
					<span class="elementor-title"><?php _e( 'Templates Library', 'elementor' ); ?></span>
				</div>
				<div id="elementor-panel-footer-save-template" class="elementor-panel-footer-sub-menu-item">
					<i class="elementor-icon fa fa-save"></i>
					<span class="elementor-title"><?php _e( 'Save Template', 'elementor' ); ?></span>
				</div>
			</div>
		</div>
	</div>
	<div id="elementor-panel-footer-save" class="elementor-panel-footer-tool" title="<?php esc_attr_e( 'Save', 'elementor' ); ?>">
		<button class="elementor-button">
			<span class="elementor-state-icon">
				<i class="fa fa-spin fa-circle-o-notch "></i>
			</span>
			<?php _e( 'Save', 'elementor' ); ?>
		</button>
		<?php /*<div class="elementor-panel-footer-sub-menu-wrapper">
			<div class="elementor-panel-footer-sub-menu">
				<div id="elementor-panel-footer-publish" class="elementor-panel-footer-sub-menu-item">
					<i class="elementor-icon fa fa-check-circle"></i>
					<span class="elementor-title"><?php _e( 'Publish', 'elementor' ); ?></span>
				</div>
				<div id="elementor-panel-footer-discard" class="elementor-panel-footer-sub-menu-item">
					<i class="elementor-icon fa fa-times-circle"></i>
					<span class="elementor-title"><?php _e( 'Discard', 'elementor' ); ?></span>
				</div>
			</div>
		</div>*/ ?>
	</div>
</script>

<script type="text/template" id="tmpl-elementor-mode-switcher-content">
	<input id="elementor-mode-switcher-preview-input" type="checkbox">
	<label for="elementor-mode-switcher-preview-input" id="elementor-mode-switcher-preview" title="<?php esc_attr_e( 'Preview', 'elementor' ); ?>">
		<span class="elementor-screen-only"><?php _e( 'Preview', 'elementor' ); ?></span>
		<i class="fa"></i>
	</label>
</script>

<script type="text/template" id="tmpl-editor-content">
	<div class="elementor-tabs-controls">
		<ul>
			<% _.each( elementData.tabs_controls, function( tabTitle, tabSlug ) { %>
			<li class="elementor-tab-control-<%- tabSlug %>">
				<a href="#" data-tab="<%= tabSlug %>">
					<%= tabTitle %>
				</a>
			</li>
			<% } ); %>
		</ul>
	</div>
	<div class="elementor-controls"></div>
</script>

<script type="text/template" id="tmpl-elementor-panel-schemes-typography">
	<div class="elementor-panel-scheme-buttons">
		<div class="elementor-panel-scheme-button-wrapper elementor-panel-scheme-reset">
			<button class="elementor-button">
				<i class="fa fa-undo"></i>
				<?php _e( 'Reset', 'elementor' ); ?>
			</button>
		</div>
		<div class="elementor-panel-scheme-button-wrapper elementor-panel-scheme-discard">
			<button class="elementor-button">
				<i class="fa fa-times"></i>
				<?php _e( 'Discard', 'elementor' ); ?>
			</button>
		</div>
		<div class="elementor-panel-scheme-button-wrapper elementor-panel-scheme-save">
			<button class="elementor-button elementor-button-success" disabled><?php _e( 'Apply', 'elementor' ); ?></button>
		</div>
	</div>
	<div class="elementor-panel-scheme-items"></div>
</script>

<script type="text/template" id="tmpl-elementor-panel-schemes-color">
	<div class="elementor-panel-scheme-buttons">
		<div class="elementor-panel-scheme-button-wrapper elementor-panel-scheme-reset">
			<button class="elementor-button">
				<i class="fa fa-undo"></i>
				<?php _e( 'Reset', 'elementor' ); ?>
			</button>
		</div>
		<div class="elementor-panel-scheme-button-wrapper elementor-panel-scheme-discard">
			<button class="elementor-button">
				<i class="fa fa-times"></i>
				<?php _e( 'Discard', 'elementor' ); ?>
			</button>
		</div>
		<div class="elementor-panel-scheme-button-wrapper elementor-panel-scheme-save">
			<button class="elementor-button elementor-button-success" disabled><?php _e( 'Apply', 'elementor' ); ?></button>
		</div>
	</div>
	<div class="elementor-panel-scheme-content elementor-panel-box">
		<div class="elementor-panel-heading">
			<div class="elementor-panel-heading-title"><?php _e( 'Color Palette', 'elementor' ); ?></div>
		</div>
		<div class="elementor-panel-scheme-items elementor-panel-box-content"></div>
	</div>
	<div class="elementor-panel-scheme-colors-more-palettes elementor-panel-box">
		<div class="elementor-panel-heading">
			<div class="elementor-panel-heading-title"><?php _e( 'More Palettes', 'elementor' ); ?></div>
		</div>
		<div class="elementor-panel-box-content">
			<?php foreach ( Scheme_Color::get_system_schemes() as $scheme_name => $scheme ) : ?>
				<div class="elementor-panel-scheme-color-system-scheme" data-scheme-name="<?php echo $scheme_name; ?>">
					<div class="elementor-panel-scheme-color-system-items">
						<?php
						$print_colors_index = [
							Scheme_Color::COLOR_1,
							Scheme_Color::COLOR_2,
							Scheme_Color::COLOR_3,
							Scheme_Color::COLOR_4,
						];
						$colors_to_print = [];
						foreach ( $print_colors_index as $color_name ) {
							$colors_to_print[ $color_name ] = $scheme['items'][ $color_name ];
						}

						foreach ( $colors_to_print as $color_value ) : ?>
							<div class="elementor-panel-scheme-color-system-item" style="background-color: <?php echo esc_attr( $color_value ); ?>;"></div>
						<?php endforeach; ?>
					</div>
					<div class="elementor-title"><?php echo $scheme['title']; ?></div>
				</div>
			<?php endforeach; ?>
		</div>
	</div>
</script>

<script type="text/template" id="tmpl-elementor-panel-schemes-disabled">
	<%= '<?php printf( __( '{0} are disabled. You can enable it from the <a href="%s">Elementor settings page</a>.', 'elementor' ), Settings::get_url() ); ?>'.replace( '{0}', disabledTitle ) %>
</script>

<script type="text/template" id="tmpl-elementor-panel-scheme-color-item">
	<div class="elementor-panel-scheme-color-input-wrapper">
		<input type="text" class="elementor-panel-scheme-color-value" value="<%= value %>" />
	</div>
	<div class="elementor-panel-scheme-color-title"><%= title %></div>
</script>

<script type="text/template" id="tmpl-elementor-panel-scheme-typography-item">
	<div class="elementor-panel-heading">
		<div class="elementor-panel-heading-toggle">
			<i class="fa"></i>
		</div>
		<div class="elementor-panel-heading-title"><%= title %></div>
	</div>
	<div class="elementor-panel-scheme-typography-items elementor-panel-box-content">
		<?php
		$scheme_fields_keys = Group_Control_Typography::get_scheme_fields_keys();

		$typography_fields = Group_Control_Typography::get_fields();

		$scheme_fields = array_intersect_key( $typography_fields, array_flip( $scheme_fields_keys ) );

		foreach ( $scheme_fields as $option_name => $option ) : ?>
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
							<option value=""><?php _e( 'Default', 'elementor' ); ?></option>

							<optgroup label="<?php _e( 'System', 'elementor' ); ?>">
								<?php foreach ( Fonts::get_fonts_by_groups( [ Fonts::SYSTEM ] ) as $font_title => $font_type ) : ?>
									<option value="<?php echo esc_attr( $font_title ); ?>"><?php echo $font_title; ?></option>
								<?php endforeach; ?>
							</optgroup>

							<optgroup label="<?php _e( 'Google', 'elementor' ); ?>">
								<?php foreach ( Fonts::get_fonts_by_groups( [ Fonts::GOOGLE, Fonts::EARLYACCESS ] ) as $font_title => $font_type ) : ?>
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
