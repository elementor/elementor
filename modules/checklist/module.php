<?php

namespace Elementor\Modules\Checklist;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Experiments\Manager;
use Elementor\Core\Upgrade\Manager as Upgrade_Manager;
use Elementor\Core\Settings\Manager as SettingsManager;
use Elementor\Core\Isolation\Wordpress_Adapter;
use Elementor\Core\Isolation\Wordpress_Adapter_Interface;
use Elementor\Core\Isolation\Kit_Adapter;
use Elementor\Core\Isolation\Kit_Adapter_Interface;
use Elementor\Plugin;
use Elementor\Utils;
use Elementor\Modules\Checklist\Data\Controller;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends BaseModule implements Checklist_Module_Interface {
	const EXPERIMENT_ID = 'launchpad-checklist';
	const DB_OPTION_KEY = 'elementor_checklist';
	const VISIBILITY_SWITCH_ID = 'show_launchpad_checklist';
	const FIRST_CLOSED_CHECKLIST_IN_EDITOR = 'first_closed_checklist_in_editor';
	const LAST_OPENED_TIMESTAMP = 'last_opened_timestamp';
	const IS_POPUP_MINIMIZED_KEY = 'is_popup_minimized';
	const EDITOR_VISIT_COUNT = 'editor_visit_count';

	private Steps_Manager $steps_manager;
	private Wordpress_Adapter_Interface $wordpress_adapter;
	private Kit_Adapter_Interface $kit_adapter;
	private $user_progress = null;

	/**
	 * @param ?Wordpress_Adapter_Interface $wordpress_adapter
	 * @param ?Kit_Adapter_Interface $kit_adapter
	 *
	 * @return void
	 */
	public function __construct( ?Wordpress_Adapter_Interface $wordpress_adapter = null, ?Kit_Adapter_Interface $kit_adapter = null ) {
		$this->wordpress_adapter = $wordpress_adapter ?? new Wordpress_Adapter();
		$this->kit_adapter = $kit_adapter ?? new Kit_Adapter();
		parent::__construct();

		$this->register_experiment();
		$is_new_checklist_init = $this->init_user_progress();
		$this->handle_checklist_visibility_with_kit( $is_new_checklist_init );

		if ( ! $this->is_experiment_active() ) {
			return;
		}

		add_action( 'elementor/editor/init', [ $this, 'monitor_editor_visits' ] );

		Plugin::$instance->data_manager_v2->register_controller( new Controller() );
		$this->user_progress = $this->user_progress ?? $this->get_user_progress_from_db();
		$this->steps_manager = new Steps_Manager( $this );

		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}

		$this->enqueue_editor_scripts();
	}

	/**
	 * Get the module name.
	 *
	 * @return string
	 */
	public function get_name() : string {
		return 'e-checklist';
	}

	/**
	 * Checks if the experiment is active
	 *
	 * @return bool
	 */
	public function is_experiment_active() : bool {
		return Plugin::$instance->experiments->is_feature_active( self::EXPERIMENT_ID );
	}

	/**
	 * Gets user's progress from db
	 *
	 * @return array {
	 *      @type bool $is_hidden
	 *      @type int $last_opened_timestamp
	 *      @type array $steps {
	 *          @type string $step_id => {
	 *              @type bool $is_marked_completed
	 *              @type bool $is_absolute_competed
	 *              @type bool $is_immutable_completed
	 *          }
	 *      }
	 *  }
	 */
	public function get_user_progress_from_db() : array {
		return array_merge(
			$this->get_default_user_progress(),
			json_decode( $this->wordpress_adapter->get_option( self::DB_OPTION_KEY ), true )
		);
	}

	/**
	 * Using the step's ID, get the progress of the step should it exist
	 *
	 * @param $step_id
	 *
	 * @return null|array {
	 *      @type bool $is_marked_completed
	 *      @type bool $is_completed
	 *  }
	 */
	public function get_step_progress( $step_id ) : ?array {
		return $this->user_progress['steps'][ $step_id ] ?? null;
	}

	/**
	 * Update the progress of a step
	 *
	 * @param $step_id
	 * @param $step_progress
	 *
	 * @return void
	 */
	public function set_step_progress( $step_id, $step_progress ) : void {
		$this->user_progress['steps'][ $step_id ] = $step_progress;
		$this->update_user_progress_in_db();
	}

	public function update_user_progress( $new_data ) : void {
		$allowed_properties = [
			self::FIRST_CLOSED_CHECKLIST_IN_EDITOR => $new_data[ self::FIRST_CLOSED_CHECKLIST_IN_EDITOR ] ?? null,
			self::LAST_OPENED_TIMESTAMP => $new_data[ self::LAST_OPENED_TIMESTAMP ] ?? null,
			self::IS_POPUP_MINIMIZED_KEY => $new_data[ self::IS_POPUP_MINIMIZED_KEY ] ?? null,
			self::EDITOR_VISIT_COUNT => $new_data[ self::EDITOR_VISIT_COUNT ] ?? null,
		];

		foreach ( $allowed_properties as $key => $value ) {
			if ( null !== $value ) {
				$this->user_progress[ $key ] = $value;
			}
		}

		$this->update_user_progress_in_db();
	}

	/**
	 * @return Steps_Manager
	 */
	public function get_steps_manager() : Steps_Manager {
		return $this->steps_manager;
	}

	/**
	 * @return Wordpress_Adapter
	 */
	public function get_wordpress_adapter() : Wordpress_Adapter {
		return $this->wordpress_adapter;
	}

	/**
	 * @return Kit_Adapter
	 */
	public function get_kit_adapter() : Kit_Adapter {
		return $this->kit_adapter;
	}

	public function enqueue_editor_scripts() : void {
		add_action( 'elementor/editor/before_enqueue_scripts', function () {
			$min_suffix = Utils::is_script_debug() ? '' : '.min';

			wp_enqueue_script(
				$this->get_name(),
				ELEMENTOR_ASSETS_URL . 'js/checklist' . $min_suffix . '.js',
				[
					'react',
					'react-dom',
					'elementor-common',
					'elementor-v2-ui',
					'elementor-v2-icons',
					'elementor-v2-editor-app-bar',
					'elementor-web-cli',
				],
				ELEMENTOR_VERSION,
				true
			);

			wp_set_script_translations( $this->get_name(), 'elementor' );
		} );
	}

	public static function is_preference_switch_on() : bool {
		$user_preferences = SettingsManager::get_settings_managers( 'editorPreferences' )
			->get_model()
			->get_settings( self::VISIBILITY_SWITCH_ID );
		$is_new_installation = Upgrade_Manager::is_new_installation() ? 'yes' : '';
		$is_preference_switch_on = $user_preferences ?? $is_new_installation;

		return 'yes' === $is_preference_switch_on;
	}

	public function monitor_editor_visits() {
		if ( ! $this->is_experiment_active() || ! self::is_preference_switch_on() ) {
			return;
		}

		$progress = $this->get_user_progress_from_db();
		$progress[ self::EDITOR_VISIT_COUNT ] = $progress[ self::EDITOR_VISIT_COUNT ] ?? 0;

		if ( -1 === $progress[ self::EDITOR_VISIT_COUNT ] ) {
			return;
		}

		if ( 2 < ++$progress[ self::EDITOR_VISIT_COUNT ] ) {
			$progress[ self::EDITOR_VISIT_COUNT ] = -1;
		}

		$this->user_progress = $progress;
		$this->update_user_progress_in_db();
	}

	public static function is_active_kit_default() {
		$kit_id = Plugin::$instance->kits_manager->get_active_id();

		if ( false === $kit_id || null === $kit_id ) {
			return false;
		}

		return esc_html__( 'Default Kit', 'elementor' ) === get_post( $kit_id )->post_title;
	}

	private function register_experiment() : void {
		Plugin::$instance->experiments->add_feature( [
			'name' => self::EXPERIMENT_ID,
			'title' => esc_html__( 'Launchpad Checklist', 'elementor' ),
			'description' => esc_html__( 'Launchpad Checklist feature to boost productivity and deliver your site faster', 'elementor' ),
			'release_status' => Manager::RELEASE_STATUS_ALPHA,
			'hidden' => true,
		] );
	}

	private function init_user_progress() : bool {
		$default_settings = $this->get_default_user_progress();

		return (bool) $this->wordpress_adapter->add_option( self::DB_OPTION_KEY, wp_json_encode( $default_settings ) );
	}

	private function get_default_user_progress() : array {
		return [
			self::LAST_OPENED_TIMESTAMP => -1,
			self::FIRST_CLOSED_CHECKLIST_IN_EDITOR => false,
			self::IS_POPUP_MINIMIZED_KEY => false,
			self::EDITOR_VISIT_COUNT => 0,
			'steps' => [],
		];
	}

	private function update_user_progress_in_db() : void {
		$this->wordpress_adapter->update_option( self::DB_OPTION_KEY, wp_json_encode( $this->user_progress ) );
	}

	private function handle_checklist_visibility_with_kit( $is_new_checklist_init ) {
		if ( static::is_active_kit_default() ) {
			return;
		}

		add_action( 'elementor/init', function () use ( $is_new_checklist_init ) {
			$editor_visit_count = $this->user_progress[ self::EDITOR_VISIT_COUNT ] ?? 0;

			if ( $is_new_checklist_init || ( 0 <= $editor_visit_count && 2 >= $editor_visit_count ) ) {
				SettingsManager::get_settings_managers( 'editorPreferences' )
					->get_model()
					->set_settings( self::VISIBILITY_SWITCH_ID, '' );
			}
		} );
	}
}
