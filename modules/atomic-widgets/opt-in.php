<?php

namespace Elementor\Modules\AtomicWidgets;

use Elementor\Core\Common\Modules\Ajax\Module as Ajax;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Modules\EditorAppBar\Module as EditorAppBarModule;
use Elementor\Modules\GlobalClasses\Module as GlobalClassesModule;
use Elementor\Modules\NestedElements\Module as NestedElementsModule;
use Elementor\Modules\AtomicWidgets\Module as AtomicWidgetsModule;
use Elementor\Plugin;

class Opt_In {
	const EXPERIMENT_NAME = 'atomic_widgets_opt_in';

	const OPT_IN_FEATURES = [
		self::EXPERIMENT_NAME,
		'container',
		NestedElementsModule::EXPERIMENT_NAME,
		EditorAppBarModule::EXPERIMENT_NAME,
		AtomicWidgetsModule::EXPERIMENT_NAME,
		GlobalClassesModule::NAME,
	];

	public function init() {
		$this->register_feature();

		add_action( 'elementor/ajax/register_actions', fn( Ajax $ajax ) => $this->add_ajax_actions( $ajax ) );
	}

	private function register_feature() {
		Plugin::$instance->experiments->add_feature([
			'name' => self::EXPERIMENT_NAME,
			'title' => esc_html__( 'Atomic Widgets Opt-In', 'elementor' ),
			'description' => esc_html__( 'Enable atomic widgets opt-in.', 'elementor' ),
			'hidden' => true,
			'default' => Experiments_Manager::STATE_INACTIVE,
			'release_status' => Experiments_Manager::RELEASE_STATUS_ALPHA,
		]);
	}

	private function set_v4_features_state( bool $activate ) {
		$state = $activate ? Experiments_Manager::STATE_ACTIVE : Experiments_Manager::STATE_INACTIVE;

		foreach ( self::OPT_IN_FEATURES as $feature ) {
			$feature_key = Plugin::$instance->experiments->get_feature_option_key( $feature );
			update_option( $feature_key, $state );
		}
	}

	public function ajax_set_v4_features_state( $activate = true ) {
		if ( ! current_user_can( 'manage_options' ) ) {
			throw new \Exception( 'Permission denied' );
		}

		$this->set_v4_features_state( $activate );
	}

	private function add_ajax_actions( Ajax $ajax ) {
		$ajax->register_ajax_action( 'atomic_widgets_opt_in', fn() => $this->ajax_set_v4_features_state() );
		$ajax->register_ajax_action( 'atomic_widgets_opt_out', fn() => $this->ajax_set_v4_features_state( false ) );
	}
}
