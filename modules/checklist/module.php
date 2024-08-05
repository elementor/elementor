<?php

namespace Elementor\Modules\Checklist;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Experiments\Manager;
use Elementor\Core\Isolation\Wordpress_Adapter;
use Elementor\Modules\Checklist\Steps\Step_Base;
use Elementor\Plugin;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends BaseModule {
	const EXPERIMENT_ID = 'launchpad-checklist';
	const DB_OPTION_KEY = 'e-checklist';

	private $user_progress = null;

	private Steps_Manager $steps_manager;

	private Wordpress_Adapter $wordpress_adapter;

	/**
	 * @param Wordpress_Adapter|null $wordpress_adapter
	 *
	 * @return void
	 */
	public function __construct( $wordpress_adapter = null ) {
		$this->wordpress_adapter = $wordpress_adapter ?? new Wordpress_Adapter();
		parent::__construct();

		$this->register_experiment();

		if ( ! $this->is_experiment_active() ) {
			return;
		}

		$this->setup();
	}

	/**
	 * Get the module name.
	 *
	 * @return string
	 */
	public function get_name() {
		return 'e-checklist';
	}

	/**
	 * Checks if the experiment is active
	 *
	 * @return bool
	 */
	public function is_experiment_active(): bool {
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
	 *              @type bool $is_marked_done
	 *              @type bool $is_completed
	 *          }
	 *      }
	 *  }
	 */
	public function get_user_progress_from_db() {
		return json_decode( get_option( self::DB_OPTION_KEY ), true );
	}

	/**
	 * Using the step's ID, get the progress of the step should it exist
	 *
	 * @param $step_id
	 *
	 * @return null|array {
	 *      @type bool $is_marked_done
	 *      @type bool $is_completed
	 *  }
	 */
	public function get_step_progress( $step_id ) {
		foreach ( $this->user_progress['steps'] as $id ) {
			if ( $id === $step_id ) {
				return $this->user_progress['steps'][ $step_id ] ?? null;
			}
		}

		return null;
	}

	/**
	 * Update the progress of a step
	 *
	 * @param $step_id
	 * @param $step_progress
	 * @param bool $should_update_db
	 *
	 * @return void
	 */
	public function set_step_progress( $step_id, $step_progress, $should_update_db = false ) {
		$this->user_progress['steps'][ $step_id ] = $step_progress;

		if ( $should_update_db ) {
			$this->update_user_progress_in_db();
		}
	}

	/**
	 * @return Steps_Manager
	 */
	public function get_steps_manager() {
		return $this->steps_manager;
	}

	/**
	 * @return Wordpress_Adapter
	 */
	public function get_wordpress_adapter() {
		return $this->wordpress_adapter;
	}

	public function enqueue_editor_scripts() {
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
				],
				ELEMENTOR_VERSION,
				true
			);

			wp_set_script_translations( $this->get_name(), 'elementor' );
		} );
	}

	private function setup() {
		$this->init_user_progress();
		$this->user_progress = $this->get_user_progress_from_db();
		$this->steps_manager = new Steps_Manager( $this );
		$this->enqueue_editor_scripts();
	}

	private function register_experiment() {
		Plugin::$instance->experiments->add_feature( [
			'name' => self::EXPERIMENT_ID,
			'title' => esc_html__( 'Launchpad Checklist', 'elementor' ),
			'description' => esc_html__( 'Launchpad Checklist feature to boost productivity and deliver your site faster', 'elementor' ),
			'release_status' => Manager::RELEASE_STATUS_ALPHA,
			'hidden' => true,
		] );
	}

	private function init_user_progress() {
		$default_settings = [
			'is_hidden' => false,
			'last_opened_timestamp' => time(),
			'steps' => [],
		];

		add_option( self::DB_OPTION_KEY, wp_json_encode( $default_settings ) );
	}

	private function update_user_progress_in_db() {
		update_option( self::DB_OPTION_KEY, wp_json_encode( $this->user_progress ) );
	}
}
