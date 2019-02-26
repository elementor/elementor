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
	private static $classes_map;

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
	private static $classes_aliases;

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
		if ( ! self::$classes_aliases ) {
			self::init_classes_aliases();
		}

		return self::$classes_aliases;
	}

	public static function get_classes_map() {
		if ( ! self::$classes_map ) {
			self::init_classes_map();
		}

		return self::$classes_map;
	}

	private static function init_classes_map() {
		self::$classes_map = [
			'Admin' => 'includes/admin.php',
			'Api' => 'includes/api.php',
			'Base_Control' => 'includes/controls/base.php',
			'Base_Data_Control' => 'includes/controls/base-data.php',
			'Base_UI_Control' => 'includes/controls/base-ui.php',
			'Beta_Testers' => 'includes/beta-testers.php',
			'Compatibility' => 'includes/compatibility.php',
			'Conditions' => 'includes/conditions.php',
			'Controls_Manager' => 'includes/managers/controls.php',
			'Controls_Stack' => 'includes/base/controls-stack.php',
			'DB' => 'includes/db.php',
			'Debug\Debug' => 'includes/debug/debug.php',
			'Editor' => 'includes/editor.php',
			'Elements_Manager' => 'includes/managers/elements.php',
			'Embed' => 'includes/embed.php',
			'Fonts' => 'includes/fonts.php',
			'Frontend' => 'includes/frontend.php',
			'Group_Control_Base' => 'includes/controls/groups/base.php',
			'Group_Control_Interface' => 'includes/interfaces/group-control.php',
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

		$controls_names = Controls_Manager::get_controls_names();

		$controls_names = array_merge( $controls_names, [
			'base_multiple',
			'base_units',
		] );

		foreach ( $controls_names as $control_name ) {
			$class_name = 'Control_' . ucwords( $control_name, '_' );

			self::$classes_map[ $class_name ] = 'includes/controls/' . str_replace( '_', '-', $control_name ) . '.php';
		}

		$controls_groups_names = Controls_Manager::get_groups_names();

		foreach ( $controls_groups_names as $group_name ) {
			$class_name = 'Group_Control_' . ucwords( str_replace( '-', '_', $group_name ), '_' );

			self::$classes_map[ $class_name ] = 'includes/controls/groups/' . $group_name . '.php';
		}
	}

	private static function init_classes_aliases() {
		self::$classes_aliases = [
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
			'Admin' => [
				'replacement' => 'Core\Admin\Admin',
				'version' => '2.2.0',
			],
			'Core\Ajax' => [
				'replacement' => 'Core\Common\Modules\Ajax\Module',
				'version' => '2.3.0',
			],
		];
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
		$classes_map = self::get_classes_map();

		if ( isset( $classes_map[ $relative_class_name ] ) ) {
			$filename = ELEMENTOR_PATH . '/' . $classes_map[ $relative_class_name ];
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

		$classes_aliases = self::get_classes_aliases();

		$has_class_alias = isset( $classes_aliases[ $relative_class_name ] );

		// Backward Compatibility: Save old class name for set an alias after the new class is loaded
		if ( $has_class_alias ) {
			$alias_data = $classes_aliases[ $relative_class_name ];

			$relative_class_name = $alias_data['replacement'];
		}

		$final_class_name = __NAMESPACE__ . '\\' . $relative_class_name;

		if ( ! class_exists( $final_class_name ) ) {
			self::load_class( $relative_class_name );
		}

		if ( $has_class_alias ) {
			class_alias( $final_class_name, $class );

			preg_match( '/^[0-9]+\.[0-9]+/', ELEMENTOR_VERSION, $current_version );

			$current_version_as_float = (float) $current_version[0];

			preg_match( '/^[0-9]+\.[0-9]+/', $alias_data['version'], $alias_version );

			$alias_version_as_float = (float) $alias_version[0];

			if ( $current_version_as_float - $alias_version_as_float >= self::ALIASES_DEPRECATION_RANGE ) {
				_deprecated_file( $class, $alias_data['version'], $final_class_name );
			}
		}
	}
}
