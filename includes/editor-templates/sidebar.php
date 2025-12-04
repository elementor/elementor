<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

$document = Plugin::$instance->documents->get( Plugin::$instance->editor->get_post_id() );
?>
<script type="text/template" id="tmpl-elementor-sidebar">
	<h2 id="elementor-sidebar-heading" class="elementor-screen-only"><?php echo esc_attr__( 'Panel Sidebar', 'elementor' ); ?></h2>
	<div id="elementor-sidebar-actions">
		<button id="elementor-sidebar-elements" class="elementor-sidebar-command tooltip-target" data-tooltip="<?php echo esc_attr__( 'Add Element', 'elementor' ); ?>" aria-label="<?php echo esc_attr__( 'Add Element', 'elementor' ); ?>" onClick="javascript: $e.route( 'panel/elements/categories' );">
			<i class="eicon-plus" aria-hidden="true"></i>
		</button>
		<button id="elementor-sidebar-page-settings" class="elementor-sidebar-command tooltip-target" data-tooltip="<?php printf( esc_attr__( '%s Settings', 'elementor' ), esc_attr( $document::get_title() ) ); ?>" aria-label="<?php printf( esc_attr__( '%s Settings', 'elementor' ), esc_attr( $document::get_title() ) ); ?>" onClick="javascript: $e.route( 'panel/page-settings/settings' );">
			<i class="eicon-document-file" aria-hidden="true"></i>
		</button>
		<button id="elementor-sidebar-site-settings" class="elementor-sidebar-command tooltip-target" data-tooltip="<?php echo esc_attr__( 'Site Settings', 'elementor' ); ?>" aria-label="<?php echo esc_attr__( 'Site Settings', 'elementor' ); ?>" onClick="javascript: $e.run( 'panel/global/open' );">
			<i class="eicon-globe" aria-hidden="true"></i>
		</button>
	</div>
	<div id="elementor-sidebar-tools">
		<button id="elementor-sidebar-navigator" class="elementor-sidebar-command tooltip-target" data-tooltip="<?php echo esc_attr__( 'Structure', 'elementor' ); ?>" aria-label="<?php echo esc_attr__( 'Structure', 'elementor' ); ?>" onClick="javascript: $e.run( 'navigator/toggle' );">
			<i class="eicon-navigator" aria-hidden="true"></i>
		</button>
		<button id="elementor-sidebar-history" class="elementor-sidebar-command tooltip-target" data-tooltip="<?php echo esc_attr__( 'History', 'elementor' ); ?>" aria-label="<?php echo esc_attr__( 'History', 'elementor' ); ?>" onClick="javascript: $e.route( 'panel/history/revisions' );">
			<i class="eicon-history" aria-hidden="true"></i>
		</button>
		<button id="elementor-sidebar-theme-builder" class="elementor-sidebar-command tooltip-target" data-tooltip="<?php echo esc_attr__( 'Theme Builder', 'elementor' ); ?>" aria-label="<?php echo esc_attr__( 'Theme Builder', 'elementor' ); ?>" onClick="javascript: $e.run( 'app/open' );">
			<i class="eicon-theme-builder" aria-hidden="true"></i>
		</button>
		<button id="elementor-sidebar-library" class="elementor-sidebar-command tooltip-target" data-tooltip="<?php echo esc_attr__( 'Templates Library', 'elementor' ); ?>" aria-label="<?php echo esc_attr__( 'Templates Library', 'elementor' ); ?>" onClick="javascript: $e.run( 'library/open' );">
			<i class="eicon-folder" aria-hidden="true"></i>
		</button>
		<button id="elementor-sidebar-notes" class="elementor-sidebar-command tooltip-target" data-tooltip="<?php echo esc_attr__( 'Notes', 'elementor' ); ?>" aria-label="<?php echo esc_attr__( 'Notes', 'elementor' ); ?>" onClick="javascript: $e.route( 'notes' );">
			<i class="eicon-notes" aria-hidden="true"></i>
		</button>
	</div>
	<div id="elementor-sidebar-addons"></div>
	<div id="elementor-sidebar-utils">
		<button id="elementor-sidebar-whats-new" class="elementor-sidebar-command tooltip-target" data-tooltip="<?php echo esc_attr__( "What's New", 'elementor' ); ?>" aria-label="<?php echo esc_attr__( "What's New", 'elementor' ); ?>" onClick="javascript: elementor.trigger( 'elementor/editor/panel/whats-new/clicked' );">
			<i class="eicon-speakerphone" aria-hidden="true"></i>
		</button>
		<button id="elementor-sidebar-shortcuts" class="elementor-sidebar-command tooltip-target" data-tooltip="<?php echo esc_attr__( 'Keyboard Shortcuts', 'elementor' ); ?>" aria-label="<?php echo esc_attr__( 'Keyboard Shortcuts', 'elementor' ); ?>" onClick="javascript: $e.run( 'shortcuts/open' );">
			<i class="eicon-click" aria-hidden="true"></i>
		</button>
		<button id="elementor-sidebar-finder" class="elementor-sidebar-command tooltip-target" data-tooltip="<?php echo esc_attr__( 'Finder', 'elementor' ); ?>" aria-label="<?php echo esc_attr__( 'Finder', 'elementor' ); ?>" onClick="javascript: $e.run( 'finder/toggle' );">
			<i class="eicon-search-bold" aria-hidden="true"></i>
		</button>
		<button id="elementor-sidebar-user-preferences" class="elementor-sidebar-command tooltip-target" data-tooltip="<?php echo esc_attr__( 'User Preferences', 'elementor' ); ?>" aria-label="<?php echo esc_attr__( 'User Preferences', 'elementor' ); ?>" onClick="javascript: $e.route( 'panel/editor-preferences' );">
			<i class="eicon-user-circle-o" aria-hidden="true"></i>
		</button>
	</div>
</script>
