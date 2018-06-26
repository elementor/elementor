<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

/**
 * Elementor autoloader.
 *
 * Elementor autoloader handler class is responsible for loading the different
 * classes needed to run the plugin.
 *
 * @since 1.6.0
 */
class Autoloader {

	const ALIASES_DEPRECATION_RANGE = 0.2;

	/**
	 * Classes map.
	 *
	 * Maps Elementor classes to file names.
	 *
	 * @since 1.6.0
	 * @access private
	 * @static
	 *
	 * @var array Classes used by elementor.
	 */
	private static $classes_map = [
		'Admin' => 'includes/admin.php',
		'Api' => 'includes/api.php',
		'Base_Control' => 'includes/controls/base.php',
		'Base_Data_Control' => 'includes/controls/base-data.php',
		'Base_UI_Control' => 'includes/controls/base-ui.php',
		'Beta_Testers' => 'includes/beta-testers.php',
		'Compatibility' => 'includes/compatibility.php',
		'Conditions' => 'includes/conditions.php',
		'Control_Base_Multiple' => 'includes/controls/base-multiple.php',
		'Control_Base_Units' => 'includes/controls/base-units.php',
		'Controls_Manager' => 'includes/managers/controls.php',
		'Controls_Stack' => 'includes/base/controls-stack.php',
		'DB' => 'includes/db.php',
		'Debug\Debug' => 'includes/debug/debug.php',
		'Editor' => 'includes/editor.php',
		'Elements_Manager' => 'includes/managers/elements.php',
		'Embed' => 'includes/embed.php',
		'Fonts' => 'includes/fonts.php',
		'Frontend' => 'includes/frontend.php',
		'Group_Control_Background' => 'includes/controls/groups/background.php',
		'Group_Control_Base' => 'includes/controls/groups/base.php',
		'Group_Control_Border' => 'includes/controls/groups/border.php',
		'Group_Control_Box_Shadow' => 'includes/controls/groups/box-shadow.php',
		'Group_Control_Css_Filter' => 'includes/controls/groups/css-filter.php',
		'Group_Control_Image_Size' => 'includes/controls/groups/image-size.php',
		'Group_Control_Interface' => 'includes/interfaces/group-control.php',
		'Group_Control_Text_Shadow' => 'includes/controls/groups/text-shadow.php',
		'Group_Control_Typography' => 'includes/controls/groups/typography.php',
		'Heartbeat' => 'includes/heartbeat.php',
		'Images_Manager' => 'includes/managers/image.php',
		'Maintenance' => 'includes/maintenance.php',
		'Maintenance_Mode' => 'includes/maintenance-mode.php',
		'Posts_CSS_Manager' => 'includes/managers/css-files.php',
		'Preview' => 'includes/preview.php',
		'Rollback' => 'includes/rollback.php',
		'Scheme_Base' => 'includes/schemes/base.php',
		'Scheme_Color' => 'includes/schemes/color.php',
		'Scheme_Color_Picker' => 'includes/schemes/color-picker.php',
		'Scheme_Typography' => 'includes/schemes/typography.php',
		'Scheme_Interface' => 'includes/interfaces/scheme.php',
		'Schemes_Manager' => 'includes/managers/schemes.php',
		'Settings' => 'includes/settings/settings.php',
		'Settings_Controls' => 'includes/settings/controls.php',
		'Settings_Validations' => 'includes/settings/validations.php',
		'Settings_Page' => 'includes/settings/settings-page.php',
		'Shapes' => 'includes/shapes.php',
		'Skins_Manager' => 'includes/managers/skins.php',
		'Stylesheet' => 'includes/stylesheet.php',
		'System_Info\Main' => 'includes/settings/system-info/main.php',
		'TemplateLibrary\Classes\Import_Images' => 'includes/template-library/classes/class-import-images.php',
		'TemplateLibrary\Manager' => 'includes/template-library/manager.php',
		'TemplateLibrary\Source_Base' => 'includes/template-library/sources/base.php',
		'TemplateLibrary\Source_Local' => 'includes/template-library/sources/local.php',
		'TemplateLibrary\Source_Remote' => 'includes/template-library/sources/remote.php',
		'Tools' => 'includes/settings/tools.php',
		'Tracker' => 'includes/tracker.php',
		'Upgrades' => 'includes/upgrades.php',
		'User' => 'includes/user.php',
		'Utils' => 'includes/utils.php',
		'Widget_WordPress' => 'includes/widgets/wordpress.php',
		'Widgets_Manager' => 'includes/managers/widgets.php',
		'WordPress_Widgets_Manager' => 'includes/managers/wordpress-widgets.php',
	];

	/**
	 * Classes aliases.
	 *
	 * Maps Elementor classes to aliases.
	 *
	 * @since 1.6.0
	 * @access private
	 * @static
	 *
	 * @var array Classes aliases.
	 */
	private static $classes_aliases = [
		'Control_Base' => [
			'replacement' => 'Base_Data_Control',
			'version' => '1.6.0',
		],
		'PageSettings\Manager' => [
			'replacement' => 'Core\Settings\Page\Manager',
			'version' => '1.6.0',
		],
		'Revisions_Manager' => [
			'replacement' => 'Modules\History\Revisions_Manager',
			'version' => '1.7.0',
		],
		'CSS_File' => [
			'replacement' => 'Core\Files\CSS\Base',
			'version' => '2.1.0',
		],
		'Global_CSS_File' => [
			'replacement' => 'Core\Files\CSS\Global_CSS',
			'version' => '2.1.0',
		],
		'Post_CSS_File' => [
			'replacement' => 'Core\Files\CSS\Post',
			'version' => '2.1.0',
		],
		'Posts_CSS_Manager' => [
			'replacement' => 'Core\Files\Manager',
			'version' => '2.1.0',
		],
		'Post_Preview_CSS' => [
			'replacement' => 'Core\Files\CSS\Post_Preview',
			'version' => '2.1.0',
		],
		'Responsive' => [
			'replacement' => 'Core\Responsive\Responsive',
			'version' => '2.1.0',
		],
	];

	/**
	 * Run autoloader.
	 *
	 * Register a function as `__autoload()` implementation.
	 *
	 * @since 1.6.0
	 * @access public
	 * @static
	 */
	public static function run() {
		spl_autoload_register( [ __CLASS__, 'autoload' ] );
	}

	/**
	 * Get classes aliases.
	 *
	 * Retrieve the classes aliases names.
	 *
	 * @since 1.6.0
	 * @access public
	 * @static
	 *
	 * @return array Classes aliases.
	 */
	public static function get_classes_aliases() {
		return self::$classes_aliases;
	}

	/**
	 * Load class.
	 *
	 * For a given class name, require the class file.
	 *
	 * @since 1.6.0
	 * @access private
	 * @static
	 *
	 * @param string $relative_class_name Class name.
	 */
	private static function load_class( $relative_class_name ) {
		if ( isset( self::$classes_map[ $relative_class_name ] ) ) {
			$filename = ELEMENTOR_PATH . '/' . self::$classes_map[ $relative_class_name ];
		} else {
			$filename = strtolower(
				preg_replace(
					[ '/([a-z])([A-Z])/', '/_/', '/\\\/' ],
					[ '$1-$2', '-', DIRECTORY_SEPARATOR ],
					$relative_class_name
				)
			);

			$filename = ELEMENTOR_PATH . $filename . '.php';
		}

		if ( is_readable( $filename ) ) {
			require $filename;
		}
	}

	/**
	 * Autoload.
	 *
	 * For a given class, check if it exist and load it.
	 *
	 * @since 1.6.0
	 * @access private
	 * @static
	 *
	 * @param string $class Class name.
	 */
	private static function autoload( $class ) {
		if ( 0 !== strpos( $class, __NAMESPACE__ . '\\' ) ) {
			return;
		}

		$relative_class_name = preg_replace( '/^' . __NAMESPACE__ . '\\\/', '', $class );

		$has_class_alias = isset( self::$classes_aliases[ $relative_class_name ] );

		// Backward Compatibility: Save old class name for set an alias after the new class is loaded
		if ( $has_class_alias ) {
			$alias_data = self::$classes_aliases[ $relative_class_name ];

			$relative_class_name = $alias_data['replacement'];
		}

		$final_class_name = __NAMESPACE__ . '\\' . $relative_class_name;

		if ( ! class_exists( $final_class_name ) ) {
			self::load_class( $relative_class_name );
		}

		if ( $has_class_alias ) {
			class_alias( $final_class_name, $class );

			preg_match( '/^[0-9]+\.[0-9]+/', ELEMENTOR_VERSION, $current_version_as_float );

			$current_version_as_float = (float) $current_version_as_float[0];

			preg_match( '/^[0-9]+\.[0-9]+/', $alias_data['version'], $alias_version_as_float );

			$alias_version_as_float = (float) $alias_version_as_float[0];

			if ( $current_version_as_float - $alias_version_as_float >= self::ALIASES_DEPRECATION_RANGE ) {
				_deprecated_file( $class, $alias_data['version'], $final_class_name );
			}
		}
	}
}
