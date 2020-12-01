<?php

namespace Elementor\Core\Experiments;

use Elementor\Core\Base\Base_Object;
use Elementor\Tools;
use Elementor\Tracker;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}

class Manager extends Base_Object {

	const RELEASE_STATUS_DEV = 'dev';

	const RELEASE_STATUS_ALPHA = 'alpha';

	const RELEASE_STATUS_BETA = 'beta';

	const RELEASE_STATUS_RC = 'rc';

	const RELEASE_STATUS_STABLE = 'stable';

	const STATE_DEFAULT = 'default';

	const STATE_ACTIVE = 'active';

	const STATE_INACTIVE = 'inactive';

	private $states;

	private $release_statuses;

	private $features;

	/**
	 * Add Feature
	 *
	 * @since 3.1.0
	 * @access public
	 *
	 * @param array $options {
	 *     @type string $name
	 *     @type string $title
	 *     @type string $description
	 *     @type string $status
	 *     @type string $default
	 * }
	 *
	 * @return array|null
	 */
	public function add_feature( array $options ) {
		if ( isset( $this->features[ $options['name'] ] ) ) {
			return null;
		}

		$default_experimental_data = [
			'description' => '',
			'release_status' => self::RELEASE_STATUS_ALPHA,
			'default' => self::STATE_INACTIVE,
		];

		$allowed_options = [ 'name', 'title', 'description', 'release_status', 'default' ];

		$experimental_data = $this->merge_properties( $default_experimental_data, $options, $allowed_options );

		$experimental_data = array_merge( $default_experimental_data, $experimental_data );

		$state = $this->get_saved_feature_state( $options['name'] );

		if ( ! $state ) {
			$state = self::STATE_DEFAULT;
		}

		$experimental_data['state'] = $state;

		$this->features[ $options['name'] ] = $experimental_data;

		do_action( 'elementor/experiments/feature-registered', $this, $experimental_data );

		return $experimental_data;
	}

	/**
	 * Remove Feature
	 *
	 * @since 3.1.0
	 * @access public
	 *
	 * @param string $feature_name
	 */
	public function remove_feature( $feature_name ) {
		unset( $this->features[ $feature_name ] );
	}

	/**
	 * Get Features
	 *
	 * @since 3.1.0
	 * @access public
	 *
	 * @param string $feature_name Optional. Default is null
	 *
	 * @return array|null
	 */
	public function get_features( $feature_name = null ) {
		return self::get_items( $this->features, $feature_name );
	}

	/**
	 * Is Feature Active
	 *
	 * @since 3.1.0
	 * @access public
	 *
	 * @param string $feature_name
	 *
	 * @return bool
	 */
	public function is_feature_active( $feature_name ) {
		$feature = $this->get_features( $feature_name );

		if ( ! $feature || self::STATE_INACTIVE === $feature['state'] ) {
			return false;
		}

		if ( self::STATE_DEFAULT === $feature['state'] ) {
			return self::STATE_ACTIVE === $feature['default'];
		}

		return true;
	}

	/**
	 * Set Feature Default State
	 *
	 * @since 3.1.0
	 * @access public
	 *
	 * @param string $feature_name
	 * @param int $default_state
	 */
	public function set_feature_default_state( $feature_name, $default_state ) {
		$feature = $this->get_features( $feature_name );

		if ( ! $feature ) {
			return;
		}

		$this->features[ $feature_name ]['default'] = $default_state;
	}

	/**
	 * Get Feature Option Key
	 *
	 * @since 3.1.0
	 * @access private
	 *
	 * @param string $feature_name
	 *
	 * @return string
	 */
	private function get_feature_option_key( $feature_name ) {
		return 'elementor_experiment-' . $feature_name;
	}

	/**
	 * Init States
	 *
	 * @since 3.1.0
	 * @access private
	 */
	private function init_states() {
		$this->states = [
			self::STATE_DEFAULT => __( 'Default', 'elementor' ),
			self::STATE_ACTIVE => __( 'Active', 'elementor' ),
			self::STATE_INACTIVE => __( 'Inactive', 'elementor' ),
		];
	}

	/**
	 * Init Statuses
	 *
	 * @since 3.1.0
	 * @access private
	 */
	private function init_release_statuses() {
		$this->release_statuses = [
			self::RELEASE_STATUS_DEV => __( 'Development', 'elementor' ),
			self::RELEASE_STATUS_ALPHA => __( 'Alpha', 'elementor' ),
			self::RELEASE_STATUS_BETA => __( 'Beta', 'elementor' ),
			self::RELEASE_STATUS_RC => __( 'Release Candidate', 'elementor' ),
			self::RELEASE_STATUS_STABLE => __( 'Stable', 'elementor' ),
		];
	}

	/**
	 * Init Features
	 *
	 * @since 3.1.0
	 * @access private
	 */
	private function init_features() {
		$this->features = [];

		do_action( 'elementor/experiments/default-features-registered', $this );
	}

	/**
	 * Register Settings Fields
	 *
	 * @since 3.1.0
	 * @access private
	 *
	 * @param Tools $tools
	 */
	private function register_settings_fields( Tools $tools ) {
		$features = $this->get_features();

		$fields = [];

		foreach ( $features as $feature_name => $feature ) {
			$feature_key = 'experiment-' . $feature_name;

			$fields[ $feature_key ]['label'] = $this->get_feature_settings_label_html( $feature );

			$fields[ $feature_key ]['field_args'] = $feature;

			$fields[ $feature_key ]['render'] = function( $feature ) {
				$this->render_feature_settings_field( $feature );
			};
		}

		if ( ! $features ) {
			$fields['no_features'] = [
				'label' => __( 'No available experiments', 'elementor' ),
				'field_args' => [
					'type' => 'raw_html',
					'html' => __( 'The current version of Elementor doesn\'t have any experimental features . if you\'re feeling curious make sure to come back in future versions.', 'elementor' ),
				],
			];
		}

		if ( ! Tracker::is_allow_track() ) {
			$fields += $tools->get_usage_fields();
		}

		$tools->add_tab(
			'experiments', [
				'label' => __( 'Experiments', 'elementor' ),
				'sections' => [
					'experiments' => [
						'callback' => function() {
							$this->render_settings_intro();
						},
						'fields' => $fields,
					],
				],
			]
		);
	}

	/**
	 * Render Settings Intro
	 *
	 * @since 3.1.0
	 * @access private
	 */
	private function render_settings_intro() {
		?>
		<h2><?php echo __( 'Elementor Experiments', 'elementor' ); ?></h2>
		<p class="e-experiments__description"><?php echo sprintf( __( 'Access new and experimental features from Elementor before they\'re officially released. As these features are still in development, they are likely to change, evolve or even be removed  altogether. <a href="%s">Learn More.</a>', 'elementor' ), 'https://go.elementor.com/wp-dash-experiments/' ); ?></p>
		<p class="e-experiments__description"><?php echo __( 'To use an experiment on your site, simply click on the dropdown next to it and switch to Active. You can always deactivate them at any time.', 'elementor' ); ?></p>
		<p class="e-experiments__description"><?php echo sprintf( __( 'Your feedback is important - <a href="%s">help us</a> improve these features by sharing your thoughts and inputs.', 'elementor' ), 'https://github.com/elementor/elementor/issues' ); ?></p>
		<?php
	}

	/**
	 * Render Feature Settings Field
	 *
	 * @since 3.1.0
	 * @access private
	 *
	 * @param array $feature
	 */
	private function render_feature_settings_field( array $feature ) {
		?>
		<div class="e-experiment__content">
			<select id="e-experiment-<?php echo $feature['name']; ?>" class="e-experiment__select" name="<?php echo $this->get_feature_option_key( $feature['name'] ); ?>">
				<?php foreach ( $this->states as $state_key => $state_title ) { ?>
					<option value="<?php echo $state_key; ?>" <?php selected( $state_key, $feature['state'] ); ?>><?php echo $state_title; ?></option>
				<?php } ?>
			</select>
			<div class="e-experiment__description"><?php echo $feature['description']; ?></div>
			<div class="e-experiment__status"><?php echo sprintf( __( 'Status: %s', 'elementor' ), $this->release_statuses[ $feature['release_status'] ] ); ?></div>
		</div>
		<?php
	}

	/**
	 * Get Feature Settings Label HTML
	 *
	 * @since 3.1.0
	 * @access private
	 *
	 * @param array $feature
	 *
	 * @return string
	 */
	private function get_feature_settings_label_html( array $feature ) {
		ob_start();

		$indicator_classes = 'e-experiment__title__indicator';

		if ( $this->is_feature_active( $feature['name'] ) ) {
			$indicator_classes .= ' e-experiment__title__indicator--active';
		}
		?>
		<div class="e-experiment__title">
			<div class="<?php echo $indicator_classes; ?>"></div>
			<label class="e-experiment__title__label" for="e-experiment-<?php echo $feature['name']; ?>"><?php echo $feature['title']; ?></label>
		</div>
		<?php

		return ob_get_clean();
	}

	/**
	 * Get Feature Settings Label HTML
	 *
	 * @since 3.1.0
	 * @access private
	 *
	 * @param string $feature_name
	 *
	 * @return int
	 */
	private function get_saved_feature_state( $feature_name ) {
		return get_option( $this->get_feature_option_key( $feature_name ) );
	}

	public function __construct() {
		$this->init_states();

		$this->init_release_statuses();

		$this->init_features();

		if ( is_admin() ) {
			$page_id = Tools::PAGE_ID;

			add_action( "elementor/admin/after_create_settings/{$page_id}", function( Tools $tools ) {
				$this->register_settings_fields( $tools );
			}, 11 );
		}
	}
}
