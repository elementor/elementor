<?php
namespace Elementor\Core\Experiments\Ui;

use Elementor\Core\Experiments\Exceptions\Dependency_Exception;
use Elementor\Core\Experiments\Manager as Experiments_Manager;
use Elementor\Plugin;
use WP_Error;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Renders a redesigned, card-based experiments page with auto-save,
 * dependency grouping, search, filtering, and bulk actions.
 *
 * Gated by the `e_experiments_ui` experiment.
 */
class Experiments_Ui {

	const EXPERIMENT_NAME = 'e_experiments_ui';
	const REST_NAMESPACE = 'elementor/v1';
	const REST_ROUTE = '/experiments-ui';

	public function register() {
		add_action( 'rest_api_init', [ $this, 'register_rest_routes' ] );
		add_action( 'admin_enqueue_scripts', [ $this, 'maybe_enqueue' ] );
	}

	private function is_active() {
		return Plugin::$instance->experiments->is_feature_active( self::EXPERIMENT_NAME );
	}

	public function maybe_enqueue( $hook_suffix ) {
		if ( 'elementor_page_elementor-settings' !== $hook_suffix ) {
			return;
		}

		if ( ! $this->is_active() ) {
			return;
		}

		$base_url = plugins_url( '', __FILE__ );

		wp_enqueue_style(
			'elementor-experiments-ui',
			$base_url . '/experiments-ui.css',
			[],
			ELEMENTOR_VERSION
		);

		wp_enqueue_script(
			'elementor-experiments-ui',
			$base_url . '/experiments-ui.js',
			[ 'wp-api-fetch' ],
			ELEMENTOR_VERSION,
			true
		);

		wp_localize_script( 'elementor-experiments-ui', 'ElementorExperimentsUi', [
			'restUrl' => esc_url_raw( rest_url( self::REST_NAMESPACE . self::REST_ROUTE ) ),
			'nonce' => wp_create_nonce( 'wp_rest' ),
			'features' => $this->collect_features_payload(),
			'i18n' => [
				'saved' => esc_html__( 'All changes saved', 'elementor' ),
				'saving' => esc_html__( 'Saving…', 'elementor' ),
				'saveFailed' => esc_html__( 'Save failed', 'elementor' ),
				'undo' => esc_html__( 'Undo', 'elementor' ),
				'pageTitle' => esc_html__( 'Experiments', 'elementor' ),
				'pageSubtitle' => esc_html__( 'Toggles save automatically. Some experiments require a page reload to fully apply.', 'elementor' ),
				'enabled' => esc_html__( 'enabled', 'elementor' ),
				'disabled' => esc_html__( 'disabled', 'elementor' ),
				'hiddenBadge' => esc_html__( 'Hidden', 'elementor' ),
				'searchPlaceholder' => esc_html__( 'Search experiments…', 'elementor' ),
				'filterAll' => esc_html__( 'All', 'elementor' ),
				'filterActive' => esc_html__( 'Active', 'elementor' ),
				'filterInactive' => esc_html__( 'Inactive', 'elementor' ),
				'noResults' => esc_html__( 'No experiments match your search.', 'elementor' ),
				'requires' => esc_html__( 'Requires', 'elementor' ),
				'requiredBy' => esc_html__( 'Required by', 'elementor' ),
				'ongoing' => esc_html__( 'Ongoing experiments', 'elementor' ),
				'stable' => esc_html__( 'Stable features', 'elementor' ),
				'cascadeMessage' => esc_html__( 'Also disabled dependent experiments:', 'elementor' ),
				'resetToDefault' => esc_html__( 'Reset to default', 'elementor' ),
				'resetAll' => esc_html__( 'Reset all to defaults', 'elementor' ),
				'resetAllConfirm' => esc_html__( 'Reset all experiments to their default state?', 'elementor' ),
				'resetDone' => esc_html__( 'Reset to default', 'elementor' ),
				'defaultBadge' => esc_html__( 'Default', 'elementor' ),
				'activateAll' => esc_html__( 'Activate all', 'elementor' ),
				'deactivateAll' => esc_html__( 'Deactivate all', 'elementor' ),
				'activateAllConfirm' => esc_html__( 'Activate all experiments? This may affect site behavior.', 'elementor' ),
				'deactivateAllConfirm' => esc_html__( 'Deactivate all experiments?', 'elementor' ),
			],
		] );
	}

	private function collect_features_payload() {
		$experiments = Plugin::$instance->experiments;
		$features_raw = $experiments->get_features();

		$dependents_index = $this->build_dependents_index( $features_raw );

		$payload = [];

		foreach ( $features_raw as $name => $feature ) {
			if ( ! $experiments->is_feature_manageable( $name ) ) {
				continue;
			}

			$is_hidden = ! empty( $feature[ Experiments_Manager::TYPE_HIDDEN ] );

			$dependencies = [];
			if ( ! empty( $feature['dependencies'] ) ) {
				foreach ( $feature['dependencies'] as $dep ) {
					$dependencies[] = [
						'name' => $dep->get_name(),
						'title' => $dep->get_title(),
					];
				}
			}

			$payload[] = [
				'name' => $name,
				'title' => wp_strip_all_tags( $feature['title'] ),
				'description' => $feature['description'],
				'releaseStatus' => $feature['release_status'],
				'state' => $feature['state'],
				'actualState' => $experiments->is_feature_active( $name ) ? 'active' : 'inactive',
				'default' => $feature['default'],
				'tags' => array_values( $feature['tags'] ?? [] ),
				'dependencies' => $dependencies,
				'dependents' => $dependents_index[ $name ] ?? [],
				'isHidden' => $is_hidden,
			];
		}

		return $payload;
	}

	private function build_dependents_index( array $features ) {
		$index = [];

		foreach ( $features as $name => $feature ) {
			if ( empty( $feature['dependencies'] ) ) {
				continue;
			}

			foreach ( $feature['dependencies'] as $dep ) {
				$dep_name = $dep->get_name();
				if ( ! isset( $index[ $dep_name ] ) ) {
					$index[ $dep_name ] = [];
				}
				$index[ $dep_name ][] = [
					'name' => $name,
					'title' => wp_strip_all_tags( $feature['title'] ),
				];
			}
		}

		return $index;
	}

	public function register_rest_routes() {
		$permission = function () {
			return current_user_can( 'manage_options' );
		};

		register_rest_route( self::REST_NAMESPACE, self::REST_ROUTE . '/toggle', [
			'methods' => WP_REST_Server::EDITABLE,
			'callback' => [ $this, 'rest_toggle' ],
			'permission_callback' => $permission,
			'args' => [
				'name' => [
					'type' => 'string',
					'required' => true,
					'sanitize_callback' => 'sanitize_key',
				],
				'state' => [
					'type' => 'string',
					'required' => true,
					'enum' => [ 'active', 'inactive', 'default' ],
				],
			],
		] );

		register_rest_route( self::REST_NAMESPACE, self::REST_ROUTE . '/bulk', [
			'methods' => WP_REST_Server::EDITABLE,
			'callback' => [ $this, 'rest_bulk' ],
			'permission_callback' => $permission,
			'args' => [
				'names' => [
					'type' => 'array',
					'required' => true,
					'items' => [ 'type' => 'string' ],
				],
				'state' => [
					'type' => 'string',
					'required' => true,
					'enum' => [ 'active', 'inactive', 'default' ],
				],
			],
		] );
	}

	public function rest_toggle( WP_REST_Request $request ) {
		$experiments = Plugin::$instance->experiments;
		$snapshot_before = $this->snapshot_states( $experiments );

		$result = $this->apply_state_change( $experiments, $request->get_param( 'name' ), $request->get_param( 'state' ) );

		if ( $result instanceof WP_Error ) {
			return $result;
		}

		$snapshot_after = $this->snapshot_states( $experiments );
		$result['cascaded'] = $this->collect_cascade_diff( $experiments, $snapshot_before, $snapshot_after, [ $result['name'] ] );

		return new WP_REST_Response( $result );
	}

	public function rest_bulk( WP_REST_Request $request ) {
		$experiments = Plugin::$instance->experiments;
		$state = $request->get_param( 'state' );
		$names = array_map( 'sanitize_key', (array) $request->get_param( 'names' ) );

		$snapshot_before = $this->snapshot_states( $experiments );

		$results = [];
		$errors = [];
		$primary_names = [];

		foreach ( $names as $name ) {
			$result = $this->apply_state_change( $experiments, $name, $state );

			if ( $result instanceof WP_Error ) {
				$errors[] = [
					'name' => $name,
					'code' => $result->get_error_code(),
					'message' => $result->get_error_message(),
				];
				continue;
			}

			$results[] = $result;
			$primary_names[] = $result['name'];
		}

		$snapshot_after = $this->snapshot_states( $experiments );
		$cascaded = $this->collect_cascade_diff( $experiments, $snapshot_before, $snapshot_after, $primary_names );

		return new WP_REST_Response( [
			'updated' => $results,
			'cascaded' => $cascaded,
			'errors' => $errors,
		] );
	}

	private function apply_state_change( Experiments_Manager $experiments, $name, $state ) {
		$feature = $experiments->get_features( $name );

		if ( ! $feature ) {
			return new WP_Error( 'experiment_not_found', 'Experiment not found: ' . $name, [ 'status' => 404 ] );
		}

		if ( ! $experiments->is_feature_manageable( $name ) ) {
			return new WP_Error( 'experiment_not_allowed', 'Experiment cannot be changed: ' . $name, [ 'status' => 403 ] );
		}

		$option_key = $experiments->get_feature_option_key( $name );

		$die_message = null;
		$die_handler_factory = function () use ( &$die_message ) {
			return function ( $msg ) use ( &$die_message ) {
				$die_message = wp_strip_all_tags( (string) $msg );
				throw new \RuntimeException( $die_message ); // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped
			};
		};

		add_filter( 'wp_die_handler', $die_handler_factory );
		add_filter( 'wp_die_ajax_handler', $die_handler_factory );
		add_filter( 'wp_die_json_handler', $die_handler_factory );

		try {
			update_option( $option_key, $state );
		} catch ( \RuntimeException $e ) {
			remove_filter( 'wp_die_handler', $die_handler_factory );
			remove_filter( 'wp_die_ajax_handler', $die_handler_factory );
			remove_filter( 'wp_die_json_handler', $die_handler_factory );

			$error_message = $die_message ? $die_message : $e->getMessage();

			return new WP_Error(
				'experiment_dependency_conflict',
				$error_message,
				[ 'status' => 409 ]
			);
		}

		remove_filter( 'wp_die_handler', $die_handler_factory );
		remove_filter( 'wp_die_ajax_handler', $die_handler_factory );
		remove_filter( 'wp_die_json_handler', $die_handler_factory );

		$experiments->sync_feature_state_from_saved_option( $name );

		return [
			'name' => $name,
			'state' => get_option( $option_key, $feature['default'] ),
			'actualState' => $experiments->is_feature_active( $name ) ? 'active' : 'inactive',
		];
	}

	private function collect_cascade_diff( Experiments_Manager $experiments, array $before, array $after, array $exclude_names ) {
		$cascaded = [];
		$exclude = array_flip( $exclude_names );

		foreach ( $after as $feat_name => $after_state ) {
			if ( isset( $exclude[ $feat_name ] ) ) {
				continue;
			}
			if ( ( $before[ $feat_name ] ?? null ) !== $after_state ) {
				$feat = $experiments->get_features( $feat_name );
				$cascaded[] = [
					'name' => $feat_name,
					'title' => wp_strip_all_tags( $feat['title'] ),
					'state' => $after_state,
					'actualState' => $experiments->is_feature_active( $feat_name ) ? 'active' : 'inactive',
				];
			}
		}

		return $cascaded;
	}

	private function snapshot_states( Experiments_Manager $experiments ) {
		$out = [];
		foreach ( $experiments->get_features() as $name => $feature ) {
			$out[ $name ] = get_option( $experiments->get_feature_option_key( $name ), $feature['default'] );
		}
		return $out;
	}
}
