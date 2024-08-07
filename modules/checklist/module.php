<?php

namespace Elementor\Modules\Checklist;

use Elementor\Core\Base\Module as BaseModule;
use Elementor\Core\Experiments\Manager;
use Elementor\Modules\Checklist\Steps\Step_Base;
use Elementor\Plugin;
use Elementor\Utils;
use Elementor\Core\Admin\Menu\Admin_Menu_Manager;


if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends BaseModule {
	const EXPERIMENT_ID = 'launchpad-checklist';
	const DB_OPTION_KEY = 'e-checklist';

	private $user_progress = null;

	/** @var Steps_Manager $steps_manager */
	private $steps_manager;

	public function __construct() {
		parent::__construct();

		$this->register_experiment();

		if ( ! $this->is_experiment_active() ) {
			return;
		}

		$this->init_default_steps_data();
		$this->enqueue_editor_scripts();
		$this->validate_user_progress_property();
		$this->steps_manager = new Steps_Manager( $this );
//		add_action( 'elementor/admin/menu/after_register', function( Admin_Menu_Manager $admin_menu, array $hooks ) {
//			$hook_suffix = 'toplevel_page_elementor';
//			add_action( "admin_print_scripts-{$hook_suffix}", [ $this, 'enqueue_checklist_scripts' ] );
//		}, 10, 2 );

		//		$this->enqueue_checklist_scripts();
		add_action( 'elementor/admin/menu/after_register', function ( Admin_Menu_Manager $admin_menu, array $hooks ) {
			$hook_suffix = 'toplevel_page_elementor';
			add_action( "admin_print_scripts-{$hook_suffix}", [ $this, 'enqueue_editor_scripts' ] );
		}, 10, 2 );



		add_action( 'current_screen', function () {
			$this->render_checklist();
		} );
		add_action( 'current_screen', [ $this, 'enqueue_editor_scripts' ] );
	}

	public function get_name() {
		return 'checklist';
	}

	public function is_experiment_active(): bool {
		return Plugin::$instance->experiments->is_feature_active( self::EXPERIMENT_ID );
	}

	public function get_user_progress() {
		return json_decode( get_option( self::DB_OPTION_KEY ), true );
	}

	public function get_step_progress( $step_id ) {
		$this->validate_user_progress_property();

		foreach ( $this->user_progress['steps'] as $id ) {
			if ( $id === $step_id ) {
				return $this->user_progress['steps'][ $step_id ];
			}
		}

		$this->user_progress['steps'][ $step_id ] = $this->get_step_initial_progress( $step_id );

		return $this->user_progress['steps'][ $step_id ];
	}

	public function update_step_progress( $step_id, $setting_key, $value, $should_update_db = false  ) {
		$step = $this->get_step_progress( $step_id );
		$step[ $setting_key ] = $value;
		$this->user_progress['steps'][ $step_id ] = $step;

		if ( $should_update_db ) {
			$this->update_user_progress_in_db();
		}
	}

	private function register_experiment() {
		Plugin::$instance->experiments->add_feature( [
			'name' => self::EXPERIMENT_ID,
			'title' => esc_html__( 'Launchpad App', 'elementor' ),
			'description' => esc_html__( 'Launchpad App feature to boost productivity and deliver your site faster', 'elementor' ),
			'release_status' => Manager::RELEASE_STATUS_ALPHA,
			'hidden' => true,
		] );
	}

	public function enqueue_editor_scripts() {
//		$deps = [
//			'react',
//			'react-dom',
//			'elementor-common',
//			'elementor-v2-ui',
//			'elementor-v2-icons',
//		];
//
//		$is_editor_v2 = current_action() === 'elementor/editor/v2/scripts/enqueue';
//
//		if ( $is_editor_v2 ) {
//			$deps[] = 'elementor-v2-editor-app-bar';
//		}

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
					'elementor-v2-editor-app-bar'
				],
				ELEMENTOR_VERSION,
				true
			);

			wp_set_script_translations( $this->get_name(), 'elementor' );
		} );
	}

	private function init_default_steps_data() {
		$default_settings = [
			'is_hidden' => false,
			'last_opened_timestamp' => null,
			'steps' => [],
		];

		add_option( self::DB_OPTION_KEY, wp_json_encode( $default_settings ) );
	}

	private function update_user_progress_in_db() {
		update_option( self::DB_OPTION_KEY, wp_json_encode( $this->user_progress ) );
	}

	private function validate_user_progress_property() {
		if ( ! $this->user_progress ) {
			$this->user_progress = $this->get_user_progress();
		}
	}

	private function get_step_initial_progress( $id ) {
		return [
			'id' => $id,
			Step_Base::MARKED_AS_DONE_KEY => false,
			Step_Base::COMPLETED_KEY => false,
		];
	}

	private function render_checklist() {
		?>
		<div id="e-checklist">
		</div>
		<?php
	}
}
