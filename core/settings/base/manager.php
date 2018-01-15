<?php
namespace Elementor\Core\Settings\Base;

use Elementor\CSS_File;
use Elementor\Plugin;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

abstract class Manager {

	/**
	 * @var Model[]
	 */
	private $models_cache = [];

	/**
	 * @since 1.6.0
	 * @access public
	 */
	public function __construct() {
		if ( Utils::is_ajax() ) {
			add_action( 'wp_ajax_elementor_save_' . $this->get_name() . '_settings', [ $this, 'ajax_save_settings' ] );
		}

		add_action( 'elementor/init', [ $this, 'on_elementor_init' ] );

		add_action( 'elementor/' . $this->get_css_file_name() . '-css-file/parse', [ $this, 'add_settings_css_rules' ] );
	}

	/**
	 * @since 1.6.0
	 * @access public
	 * @abstract
	 * @return Model
	 */
	abstract public function get_model_for_config();

	/**
	 * @since 1.6.0
	 * @access public
	 * @abstract
	 * @return string
	 */
	abstract public function get_name();

	/**
	 * @since 1.6.0
	 * @access public
	 * @param int $id
	 *
	 * @return Model
	 */
	final public function get_model( $id = 0 ) {
		if ( ! isset( $this->models_cache[ $id ] ) ) {
			$this->create_model( $id );
		}

		return $this->models_cache[ $id ];
	}

	/**
	 * @since 1.6.0
	 * @access public
	 */
	final public function ajax_save_settings() {
		Plugin::$instance->editor->verify_ajax_nonce();

		$data = json_decode( stripslashes( $_POST['data'] ), true );

		$id = 0;

		if ( ! empty( $_POST['id'] ) ) {
			$id = $_POST['id'];
		}

		$this->ajax_before_save_settings( $data, $id );

		$this->save_settings( $data, $id );

		$settings_name = $this->get_name();

		$success_response_data = [];

		/**
		 * Settings success response data.
		 *
		 * Filters the success response data when saving settings using ajax.
		 *
		 * The dynamic portion of the hook name, `$settings_name`, refers to the settings name.
		 *
		 * @param array $success_response_data Success response data.
		 * @param int   $id                    Settings ID.
		 * @param array $data                  Settings data.
		 */
		$success_response_data = apply_filters( "elementor/{$settings_name}/settings/success_response_data", $success_response_data, $id, $data );

		wp_send_json_success( $success_response_data );
	}

	/**
	 * @since 1.6.0
	 * @access public
	 */
	final public function save_settings( array $settings, $id = 0 ) {
		$special_settings = $this->get_special_settings_names();

		$settings_to_save = $settings;

		foreach ( $special_settings as $special_setting ) {
			if ( isset( $settings_to_save[ $special_setting ] ) ) {
				unset( $settings_to_save[ $special_setting ] );
			}
		}

		$this->save_settings_to_db( $settings_to_save, $id );

		// Clear cache after save.
		if ( isset( $this->models_cache[ $id ] ) ) {
			unset( $this->models_cache[ $id ] );
		}

		$css_file = $this->get_css_file_for_update( $id );

		$css_file->update();
	}

	/**
	 * @since 1.6.0
	 * @access public
	 */
	public function add_settings_css_rules( CSS_File $css_file ) {
		$model = $this->get_model_for_css_file( $css_file );

		$css_file->add_controls_stack_style_rules(
			$model,
			$model->get_style_controls(),
			$model->get_settings(),
			[ '{{WRAPPER}}' ],
			[ $model->get_css_wrapper_selector() ]
		);
	}

	/**
	 * @since 1.6.0
	 * @access public
	 */
	public function on_elementor_init() {
		Plugin::$instance->editor->add_editor_template( $this->get_editor_template(), 'text' );
	}

	/**
	 * @since 1.6.0
	 * @access protected
	 * @abstract
	 * @param int $id
	 *
	 * @return array
	 */
	abstract protected function get_saved_settings( $id );

	/**
	 * @since 1.6.0
	 * @access protected
	 * @abstract
	 * @return string
	 */
	abstract protected function get_css_file_name();

	/**
	 * @since 1.6.0
	 * @access protected
	 * @abstract
	 * @param array $settings
	 * @param int   $id
	 *
	 * @return void
	 */
	abstract protected function save_settings_to_db( array $settings, $id );

	/**
	 * @since 1.6.0
	 * @access protected
	 * @abstract
	 * @param CSS_File $css_file
	 *
	 * @return Model
	 */
	abstract protected function get_model_for_css_file( CSS_File $css_file );

	/**
	 * @since 1.6.0
	 * @access protected
	 * @abstract
	 * @param int $id
	 *
	 * @return CSS_File
	 */
	abstract protected function get_css_file_for_update( $id );

	/**
	 * @since 1.6.0
	 * @access protected
	 */
	protected function get_special_settings_names() {
		return [];
	}

	/**
	 * @since 1.6.0
	 * @access protected
	 */
	protected function ajax_before_save_settings( array $data, $id ) {}

	/**
	 * @since 1.6.0
	 * @access protected
	 */
	protected function print_editor_template_content( $name ) {
		?>
		<div class="elementor-panel-navigation">
			<# _.each( elementor.config.settings.<?php echo $name; ?>.tabs, function( tabTitle, tabSlug ) { #>
				<div class="elementor-panel-navigation-tab elementor-tab-control-{{ tabSlug }}" data-tab="{{ tabSlug }}">
					<a href="#">{{{ tabTitle }}}</a>
				</div>
				<# } ); #>
		</div>
		<div id="elementor-panel-<?php echo $name; ?>-settings-controls"></div>
		<?php
	}

	/**
	 * @since 1.6.0
	 * @access private
	 * @param int $id
	 */
	private function create_model( $id ) {
		$class_parts = explode( '\\', get_called_class() );

		array_splice( $class_parts, count( $class_parts ) - 1, 1, 'Model' );

		$class_name = implode( '\\', $class_parts );

		$this->models_cache[ $id ] = new $class_name( [
			'id' => $id,
			'settings' => $this->get_saved_settings( $id ),
		] );
	}

	/**
	 * @since 1.6.0
	 * @access private
	 */
	private function get_editor_template() {
		$name = $this->get_name();

		ob_start();
		?>
		<script type="text/template" id="tmpl-elementor-panel-<?php echo $name; ?>-settings">
			<?php $this->print_editor_template_content( $name ); ?>
		</script>
		<?php

		return ob_get_clean();
	}
}
