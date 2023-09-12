<?php
namespace Elementor\Core\Experiments;

use Elementor\Core\Base\Base_Object;
use Elementor\Core\Upgrade\Manager as Upgrade_Manager;
use Elementor\Core\Utils\Collection;
use Elementor\Modules\System_Info\Module as System_Info;
use Elementor\Plugin;
use Elementor\Settings;
use Elementor\Tracker;
use Elementor\Utils;

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

	const TYPE_HIDDEN = 'hidden';

	const OPTION_PREFIX = 'elementor_experiment-';

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
	 *     @type string $tag
	 *     @type array $tags
	 *     @type string $description
	 *     @type string $release_status
	 *     @type string $default
	 *     @type callable $on_state_change
	 * }
	 *
	 * @return array|null
	 * @throws \Exception
	 */
	public function add_feature( array $options ) {
		if ( isset( $this->features[ $options['name'] ] ) ) {
			return null;
		}

		$default_experimental_data = [
			'tag' => '', // Deprecated, use 'tags' instead.
			'tags' => [],
			'description' => '',
			'release_status' => self::RELEASE_STATUS_ALPHA,
			'default' => self::STATE_INACTIVE,
			'mutable' => true,
			static::TYPE_HIDDEN => false,
			'new_site' => [
				'default_active' => false,
				'always_active' => false,
				'minimum_installation_version' => null,
			],
			'on_state_change' => null,
			'generator_tag' => false,
		];

		$allowed_options = [ 'name', 'title', 'tag', 'tags', 'description', 'release_status', 'default', 'mutable', static::TYPE_HIDDEN, 'new_site', 'on_state_change', 'dependencies', 'generator_tag', 'messages' ];

		$experimental_data = $this->merge_properties( $default_experimental_data, $options, $allowed_options );

		$experimental_data = $this->unify_feature_tags( $experimental_data );

		$new_site = $experimental_data['new_site'];

		if ( $new_site['default_active'] || $new_site['always_active'] ) {
			$is_new_installation = Upgrade_Manager::install_compare( $new_site['minimum_installation_version'], '>=' );

			if ( $is_new_installation ) {
				if ( $new_site['always_active'] ) {
					$experimental_data['state'] = self::STATE_ACTIVE;

					$experimental_data['mutable'] = false;
				} elseif ( $new_site['default_active'] ) {
					$experimental_data['default'] = self::STATE_ACTIVE;
				}
			}
		}

		if ( $experimental_data['mutable'] ) {
			$experimental_data['state'] = $this->get_saved_feature_state( $options['name'] );
		}

		if ( empty( $experimental_data['state'] ) ) {
			$experimental_data['state'] = self::STATE_DEFAULT;
		}

		if ( ! empty( $experimental_data['dependencies'] ) ) {
			foreach ( $experimental_data['dependencies'] as $key => $dependency ) {
				$feature = $this->get_features( $dependency );

				if ( ! empty( $feature[ static::TYPE_HIDDEN ] ) ) {
					throw new Exceptions\Dependency_Exception( 'Depending on a hidden experiment is not allowed.' );
				}

				$experimental_data['dependencies'][ $key ] = $this->create_dependency_class( $dependency, $feature );
			}
		}

		$this->features[ $options['name'] ] = $experimental_data;

		if ( $experimental_data['mutable'] && is_admin() ) {
			$feature_option_key = $this->get_feature_option_key( $options['name'] );

			$on_state_change_callback = function( $old_state, $new_state ) use ( $experimental_data, $feature_option_key ) {
				try {
					$this->on_feature_state_change( $experimental_data, $new_state, $old_state );
				} catch ( Exceptions\Dependency_Exception $e ) {
					$message = sprintf(
						'<p>%s</p><p><a href="#" onclick="location.href=\'%s\'">%s</a></p>',
						esc_html( $e->getMessage() ),
						site_url( 'wp-admin/admin.php?page=elementor#tab-experiments' ),
						esc_html__( 'Back', 'elementor' )
					);

					wp_die( $message ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
				}
			};

			add_action( 'add_option_' . $feature_option_key, $on_state_change_callback, 10, 2 );
			add_action( 'update_option_' . $feature_option_key, $on_state_change_callback, 10, 2 );
		}

		do_action( 'elementor/experiments/feature-registered', $this, $experimental_data );

		return $experimental_data;
	}

	/**
	 * Combine 'tag' and 'tags' into one property.
	 *
	 * @param array $experimental_data
	 *
	 * @return array
	 */
	private function unify_feature_tags( array $experimental_data ) : array {
		foreach ( [ 'tag', 'tags' ] as $key ) {
			if ( empty( $experimental_data[ $key ] ) ) {
				continue;
			}

			$experimental_data[ $key ] = $this->format_feature_tags( $experimental_data[ $key ] );
		}

		if ( is_array( $experimental_data['tag'] ) ) {
			$experimental_data['tags'] = array_merge( $experimental_data['tag'], $experimental_data['tags'] );
		}

		return $experimental_data;
	}

	/**
	 * Format feature tags into the right format.
	 *
	 * @param string|array[
	 *    [
	 *       'type' => string,
	 *       'label' => string
	 *    ]
	 * ] $tag
	 *
	 * @return array
	 */
	private function format_feature_tags( $tags ) : array {
		if ( ! is_string( $tags ) && ! is_array( $tags ) ) {
			return [];
		}

		$default_tag = [
			'type' => 'default',
			'label' => '',
		];

		$allowed_tag_properties = [ 'type', 'label' ];

		// If $tags is string, explode by commas and convert to array.
		if ( is_string( $tags ) ) {
			$tags = array_filter( explode( ',', $tags ) );

			foreach ( $tags as $i => $tag ) {
				$tags[ $i ] = [ 'label' => trim( $tag ) ];
			}
		}

		foreach ( $tags as $i => $tag ) {
			if ( empty( $tag['label'] ) ) {
				unset( $tags[ $i ] );
				continue;
			}

			$tags[ $i ] = $this->merge_properties( $default_tag, $tag, $allowed_tag_properties );
		}

		return $tags;
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
	 * Get Active Features
	 *
	 * @since 3.1.0
	 * @access public
	 *
	 * @return array
	 */
	public function get_active_features() {
		return array_filter( $this->features, [ $this, 'is_feature_active' ], ARRAY_FILTER_USE_KEY );
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

		if ( ! $feature ) {
			return false;
		}

		return self::STATE_ACTIVE === $this->get_feature_actual_state( $feature );
	}

	/**
	 * Set Feature Default State
	 *
	 * @since 3.1.0
	 * @access public
	 *
	 * @param string $feature_name
	 * @param string $default_state
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
	 * @access public
	 *
	 * @param string $feature_name
	 *
	 * @return string
	 */
	public function get_feature_option_key( $feature_name ) {
		return static::OPTION_PREFIX . $feature_name;
	}

	private function add_default_features() {
		$this->add_feature( [
			'name' => 'e_dom_optimization',
			'title' => esc_html__( 'Optimized DOM Output', 'elementor' ),
			'tag' => esc_html__( 'Performance', 'elementor' ),
			'description' => esc_html__( 'Developers, Please Note! This experiment includes some markup changes. If you\'ve used custom code in Elementor, you might have experienced a snippet of code not running. Turning this experiment off allows you to keep prior Elementor markup output settings, and have that lovely code running again.', 'elementor' )
				. ' <a href="https://go.elementor.com/wp-dash-legacy-optimized-dom/" target="_blank">'
				. esc_html__( 'Learn More', 'elementor' ) . '</a>',
			'release_status' => self::RELEASE_STATUS_STABLE,
			'default' => self::STATE_ACTIVE,
			'generator_tag' => true,
		] );

		$this->add_feature( [
			'name' => 'e_optimized_assets_loading',
			'title' => esc_html__( 'Improved Asset Loading', 'elementor' ),
			'tag' => esc_html__( 'Performance', 'elementor' ),
			'description' => esc_html__( 'Please Note! The "Improved Asset Loading" mode reduces the amount of code that is loaded on the page by default. When activated, parts of the infrastructure code will be loaded dynamically, only when needed. Keep in mind that activating this experiment may cause conflicts with incompatible plugins.', 'elementor' )
				. ' <a href="https://go.elementor.com/wp-dash-improved-asset-loading/" target="_blank">'
				. esc_html__( 'Learn More', 'elementor' ) . '</a>',
			'release_status' => self::RELEASE_STATUS_STABLE,
			'default' => self::STATE_ACTIVE,
			'generator_tag' => true,
		] );

		$this->add_feature( [
			'name' => 'e_optimized_css_loading',
			'title' => esc_html__( 'Improved CSS Loading', 'elementor' ),
			'tag' => esc_html__( 'Performance', 'elementor' ),
			'description' => esc_html__( 'Please Note! The “Improved CSS Loading” mode reduces the amount of CSS code that is loaded on the page by default. When activated, the CSS code will be loaded, rather inline or in a dedicated file, only when needed. Activating this experiment may cause conflicts with incompatible plugins.', 'elementor' )
				. ' <a href="https://go.elementor.com/wp-dash-improved-css-loading/" target="_blank">'
				. esc_html__( 'Learn More', 'elementor' ) . '</a>',
			'release_status' => self::RELEASE_STATUS_STABLE,
			'default' => self::STATE_ACTIVE,
			'generator_tag' => true,
		] );

		$this->add_feature( [
			'name' => 'e_font_icon_svg',
			'title' => esc_html__( 'Inline Font Icons', 'elementor' ),
			'tag' => esc_html__( 'Performance', 'elementor' ),
			'description' => esc_html__( 'The “Inline Font Icons” will render the icons as inline SVG without loading the Font-Awesome and the eicons libraries and its related CSS files and fonts.', 'elementor' )
				. ' <a href="https://go.elementor.com/wp-dash-inline-font-awesome/" target="_blank">'
				. esc_html__( 'Learn More', 'elementor' ) . '</a>',
			'release_status' => self::RELEASE_STATUS_BETA,
			'generator_tag' => true,
		] );

		$this->add_feature( [
			'name' => 'additional_custom_breakpoints',
			'title' => esc_html__( 'Additional Custom Breakpoints', 'elementor' ),
			'tag' => esc_html__( 'Performance', 'elementor' ),
			'description' => esc_html__( 'Get pixel-perfect design for every screen size. You can now add up to 6 customizable breakpoints beyond the default desktop setting: mobile, mobile extra, tablet, tablet extra, laptop, and widescreen.', 'elementor' )
						. ' <a href="https://go.elementor.com/wp-dash-additional-custom-breakpoints/" target="_blank">'
						. esc_html__( 'Learn More', 'elementor' ) . '</a>',
			'release_status' => self::RELEASE_STATUS_STABLE,
			'default' => self::STATE_ACTIVE,
			'generator_tag' => true,
		] );

		$this->add_feature( [
			'name' => 'admin_menu_rearrangement',
			'mutable' => false,
		] );

		$this->add_feature( [
			'name' => 'container',
			'title' => esc_html__( 'Flexbox Container', 'elementor' ),
			'description' => sprintf( esc_html__(
				'Create advanced layouts and responsive designs with the new %1$sFlexbox Container element%2$s.
				This experiment replaces the current section/column structure, but you\'ll still keep your existing
				Sections, Inner Sections and Columns and be able to edit them. Ready to give it a try? Check out the %3$sFlexbox playground%4$s.',
				'elementor'
			), '<a target="_blank" href="https://go.elementor.com/wp-dash-flex-container/">', '</a>', '<a target="_blank" href="https://go.elementor.com/wp-dash-flex-container-playground/">', '</a>'),
			'release_status' => self::RELEASE_STATUS_STABLE,
			'default' => self::STATE_INACTIVE,
			'new_site' => [
				'default_active' => true,
				'minimum_installation_version' => '3.16.0',
			],
			'messages' => [
				'on_deactivate' => esc_html__(
					'If you deactivate Flexbox Container, you will permanently delete all content created with containers and lose access to container-based features like Tabs and Menu widgets',
					'elementor'
				),
			],
		] );

		$this->add_feature( [
			'name' => 'e_swiper_latest',
			'title' => esc_html__( 'Upgrade Swiper Library', 'elementor' ),
			'description' => esc_html__( 'Prepare your website for future improvements to carousel features by upgrading the Swiper library integrated into your site from v5.36 to v8.45. This experiment includes markup changes so it might require updating custom code and cause compatibility issues with third party plugins.', 'elementor' ),
			'release_status' => self::RELEASE_STATUS_STABLE,
			'new_site' => [
				'default_active' => true,
				'minimum_installation_version' => '3.11.0',
			],
			'default' => self::STATE_INACTIVE,
		] );

		$this->add_feature( [
			'name' => 'container_grid',
			'title' => esc_html__( 'Grid Container', 'elementor' ),
			'tag' => esc_html__( 'Feature', 'elementor' ),
			/* translators: %1$s Link open tag, %2$s: Link close tag. */
			'description' => sprintf( esc_html__(
				'Create pixel perfect layouts by placing elements in a customizable grid. Activate to add the CSS Grid option to container elements. %1$sLearn more%2$s',
				'elementor'
			), '<a target="_blank" href="https://go.elementor.com/wp-dash-grid-container/">', '</a>'),

			'release_status' => self::RELEASE_STATUS_BETA,
			'default' => self::STATE_INACTIVE,
			'hidden' => false,
			'dependencies' => [
				'container',
			],
		] );
	}

	/**
	 * Init States
	 *
	 * @since 3.1.0
	 * @access private
	 */
	private function init_states() {
		$this->states = [
			self::STATE_DEFAULT => esc_html__( 'Default', 'elementor' ),
			self::STATE_ACTIVE => esc_html__( 'Active', 'elementor' ),
			self::STATE_INACTIVE => esc_html__( 'Inactive', 'elementor' ),
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
			self::RELEASE_STATUS_DEV => esc_html__( 'Development', 'elementor' ),
			self::RELEASE_STATUS_ALPHA => esc_html__( 'Alpha', 'elementor' ),
			self::RELEASE_STATUS_BETA => esc_html__( 'Beta', 'elementor' ),
			self::RELEASE_STATUS_RC => esc_html__( 'Release Candidate', 'elementor' ),
			self::RELEASE_STATUS_STABLE => esc_html__( 'Stable', 'elementor' ),
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

		$this->add_default_features();

		do_action( 'elementor/experiments/default-features-registered', $this );
	}

	/**
	 * Register Settings Fields
	 *
	 * @param Settings $settings
	 *
	 * @since 3.1.0
	 * @access private
	 *
	 */
	private function register_settings_fields( Settings $settings ) {
		$features = $this->get_features();

		$fields = [];

		foreach ( $features as $feature_name => $feature ) {
			$is_hidden = $feature[ static::TYPE_HIDDEN ];
			$is_mutable = $feature['mutable'];
			$should_hide_experiment = ! $is_mutable || ( $is_hidden && ! $this->should_show_hidden() ) || $this->has_non_existing_dependency( $feature );

			if ( $should_hide_experiment ) {
				unset( $features[ $feature_name ] );

				continue;
			}

			$feature_key = 'experiment-' . $feature_name;

			$section = 'stable' === $feature['release_status'] ? 'stable' : 'ongoing';

			$fields[ $section ][ $feature_key ]['label'] = $this->get_feature_settings_label_html( $feature );

			$fields[ $section ][ $feature_key ]['field_args'] = $feature;

			$fields[ $section ][ $feature_key ]['render'] = function( $feature ) {
				$this->render_feature_settings_field( $feature );
			};
		}

		foreach ( [ 'stable', 'ongoing' ] as $section ) {
			if ( ! isset( $fields[ $section ] ) ) {
				$fields[ $section ]['no_features'] = [
					'label' => esc_html__( 'No available experiments', 'elementor' ),
					'field_args' => [
						'type' => 'raw_html',
						'html' => esc_html__( 'The current version of Elementor doesn\'t have any experimental features . if you\'re feeling curious make sure to come back in future versions.', 'elementor' ),
					],
				];
			}

			if ( ! Tracker::is_allow_track() && 'stable' === $section ) {
				$fields[ $section ] += $settings->get_usage_fields();
			}
		}

		$settings->add_tab(
			'experiments', [
				'label' => esc_html__( 'Features', 'elementor' ),
				'sections' => [
					'ongoing_experiments' => [
						'callback' => function() {
							$this->render_settings_intro();
						},
						'fields' => $fields['ongoing'],
					],
					'stable_experiments' => [
						'callback' => function() {
							$this->render_stable_section_title();
						},
						'fields' => $fields['stable'],
					],
				],
			]
		);
	}

	private function render_stable_section_title() {
		?>
		<hr>
		<h2>
			<?php echo esc_html__( 'Stable Features', 'elementor' ); ?>
		</h2>
		<?php
	}

	/**
	 * Render Settings Intro
	 *
	 * @since 3.1.0
	 * @access private
	 */
	private function render_settings_intro() {
		?>
		<h2>
			<?php echo esc_html__( 'Experiments and Features', 'elementor' ); ?>
		</h2>
		<p class="e-experiment__description">
			<?php
			printf(
			/* translators: %1$s Link open tag, %2$s: Link close tag. */
				esc_html__( 'Personalize your Elementor experience by controlling which features and experiments are active on your site. Help make Elementor better by %1$ssharing your experience and feedback with us%2$s.', 'elementor' ),
				'<a href="https://go.elementor.com/wp-dash-experiments-report-an-issue/" target="_blank">',
				'</a>'
			);
			?>
		</p>
		<p class="e-experiment__description">
			<?php
				printf(
					/* translators: %1$s Link open tag, %2$s: Link close tag. */
					esc_html__( 'To use an experiment or feature on your site, simply click on the dropdown next to it and switch to Active. You can always deactivate them at any time. %1$sLearn More.%2$s', 'elementor' ),
					'<a href="https://go.elementor.com/wp-dash-experiments/" target="_blank">',
					'</a>'
				);
			?>
		</p>

		<?php if ( $this->get_features() ) { ?>
			<button type="button" class="button e-experiment__button" value="active"><?php echo esc_html__( 'Activate All', 'elementor' ); ?></button>
			<button type="button" class="button e-experiment__button" value="inactive"><?php echo esc_html__( 'Deactivate All', 'elementor' ); ?></button>
			<button type="button" class="button e-experiment__button" value="default"><?php echo esc_html__( 'Back to default', 'elementor' ); ?></button>
		<?php } ?>
		<hr>
		<h2 class="e-experiment__table-title">
			<?php echo esc_html__( 'Ongoing Experiments', 'elementor' ); ?>
		</h2>
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
		$control_id = 'e-experiment-' . $feature['name'];
		$control_name = $this->get_feature_option_key( $feature['name'] );

		$status = sprintf(
			esc_html__( 'Status: %s', 'elementor' ),
			$this->release_statuses[ $feature['release_status'] ]
		);

		?>
		<div class="e-experiment__content">
			<select class="e-experiment__select"
				id="<?php echo esc_attr( $control_id ); ?>"
				name="<?php echo esc_attr( $control_name ); ?>"
				data-experiment-id="<?php echo esc_attr( $feature['name'] ); ?>"
			>
				<?php foreach ( $this->states as $state_key => $state_title ) { ?>
					<option value="<?php echo esc_attr( $state_key ); ?>"
						<?php selected( $state_key, $feature['state'] ); ?>
					>
						<?php echo esc_html( $state_title ); ?>
					</option>
				<?php } ?>
			</select>

			<p class="description">
				<?php Utils::print_unescaped_internal_string( $feature['description'] ); ?>
			</p>

			<?php $this->render_feature_dependency( $feature ); ?>

			<?php if ( 'stable' !== $feature['release_status'] ) { ?>
				<div class="e-experiment__status">
					<?php echo esc_html( $status ); ?>
				</div>
			<?php } ?>
		</div>
		<?php
	}

	private function render_feature_dependency( $feature ) {
		$dependencies = ( new Collection( $feature['dependencies'] ?? [] ) )
			->map( function ( $dependency ) {
				return $dependency->get_title();
			} )
			->implode( ', ' );

		if ( empty( $dependencies ) ) {
			return;
		}

		?>
			<div class="e-experiment__dependency">
				<strong class="e-experiment__dependency__title"><?php echo esc_html__( 'Requires', 'elementor' ); ?>:</strong>
				<span><?php echo esc_html( $dependencies ); ?></span>
			</div>
		<?php
	}

	private function has_non_existing_dependency( $feature ) {
		$non_existing_dep = ( new Collection( $feature['dependencies'] ?? [] ) )
			->find( function ( $dependency ) {
				return $dependency instanceof Non_Existing_Dependency;
			} );

		return ! ! $non_existing_dep;
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

		$is_feature_active = $this->is_feature_active( $feature['name'] );

		$indicator_classes = 'e-experiment__title__indicator';

		if ( $is_feature_active ) {
			$indicator_classes .= ' e-experiment__title__indicator--active';
		}

		$indicator_tooltip = $this->get_feature_state_label( $feature );

		?>
		<div class="e-experiment__title">
			<div class="<?php echo $indicator_classes; ?>" data-tooltip="<?php echo $indicator_tooltip; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>"></div>
			<label class="e-experiment__title__label" for="e-experiment-<?php echo $feature['name']; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>"><?php echo $feature['title']; ?></label>
			<?php foreach ( $feature['tags'] as $tag ) { ?>
				<span class="e-experiment__title__tag e-experiment__title__tag__<?php echo $tag['type']; ?>"><?php echo $tag['label']; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></span>
			<?php } ?>
		</div>
		<?php

		return ob_get_clean();
	}

	/**
	 * Get Feature State Label
	 *
	 * @param array $feature
	 *
	 * @return string
	 */
	public function get_feature_state_label( array $feature ) {
		$is_feature_active = $this->is_feature_active( $feature['name'] );

		if ( self::STATE_DEFAULT === $feature['state'] ) {
			$label = $is_feature_active ? esc_html__( 'Active by default', 'elementor' ) :
				esc_html__( 'Inactive by default', 'elementor' );
		} else {
			$label = self::STATE_ACTIVE === $feature['state'] ? esc_html__( 'Active', 'elementor' ) :
				esc_html__( 'Inactive', 'elementor' );
		}

		return $label;
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

	/**
	 * Get Feature Actual State
	 *
	 * @since 3.1.0
	 * @access private
	 *
	 * @param array $feature
	 *
	 * @return string
	 */
	private function get_feature_actual_state( array $feature ) {
		if ( ! empty( $feature['state'] ) && self::STATE_DEFAULT !== $feature['state'] ) {
			return $feature['state'];
		}

		return $feature['default'];
	}

	/**
	 * On Feature State Change
	 *
	 * @since 3.1.0
	 * @access private
	 *
	 * @param array $old_feature_data
	 * @param string $new_state
	 *
	 * @throws \Elementor\Core\Experiments\Exceptions\Dependency_Exception
	 */
	private function on_feature_state_change( array $old_feature_data, $new_state, $old_state ) {
		$new_feature_data = $this->get_features( $old_feature_data['name'] );
		$this->validate_dependency( $new_feature_data, $new_state );
		$this->features[ $old_feature_data['name'] ]['state'] = $new_state;
		if ( $old_state === $new_state ) {
			return;
		}

		Plugin::$instance->files_manager->clear_cache();
		if ( $new_feature_data['on_state_change'] ) {
			$new_feature_data['on_state_change']( $old_state, $new_state );
		}

		do_action( 'elementor/experiments/feature-state-change/' . $old_feature_data['name'], $old_state, $new_state );
	}

	/**
	 * @throws \Elementor\Core\Experiments\Exceptions\Dependency_Exception
	 */
	private function validate_dependency( array $feature, $new_state ) {
		$rollback = function ( $feature_option_key, $state ) {
			remove_all_actions( 'add_option_' . $feature_option_key );
			remove_all_actions( 'update_option_' . $feature_option_key );

			update_option( $feature_option_key, $state );
		};

		if ( self::STATE_DEFAULT === $new_state ) {
			$new_state = $this->get_feature_actual_state( $feature );
		}

		$feature_option_key = $this->get_feature_option_key( $feature['name'] );

		if ( self::STATE_ACTIVE === $new_state ) {
			if ( empty( $feature['dependencies'] ) ) {
				return;
			}

			// Validate if the current feature dependency is available.
			foreach ( $feature['dependencies'] as $dependency ) {
				$dependency_feature = $this->get_features( $dependency->get_name() );

				if ( ! $dependency_feature ) {
					$rollback( $feature_option_key, self::STATE_INACTIVE );

					throw new Exceptions\Dependency_Exception(
						sprintf(
							'The feature `%s` has a dependency `%s` that is not available.',
							$feature['name'],
							$dependency->get_name()
						)
					);
				}

				$dependency_state = $this->get_feature_actual_state( $dependency_feature );

				// If dependency is not active.
				if ( self::STATE_INACTIVE === $dependency_state ) {
					$rollback( $feature_option_key, self::STATE_INACTIVE );

					throw new Exceptions\Dependency_Exception(
						sprintf(
							'To turn on `%1$s`, Experiment: `%2$s` activity is required!',
							$feature['name'],
							$dependency_feature['name']
						)
					);
				}
			}
		} elseif ( self::STATE_INACTIVE === $new_state ) {
			// Make sure to deactivate a dependant experiment of the current feature when it's deactivated.
			foreach ( $this->get_features() as $current_feature ) {
				if ( empty( $current_feature['dependencies'] ) ) {
					continue;
				}

				$current_feature_state = $this->get_feature_actual_state( $current_feature );

				foreach ( $current_feature['dependencies'] as $dependency ) {
					if ( self::STATE_ACTIVE === $current_feature_state && $feature['name'] === $dependency->get_name() ) {
						update_option( $this->get_feature_option_key( $current_feature['name'] ), static::STATE_INACTIVE );
					}
				}
			}
		}
	}

	private function should_show_hidden() {
		return defined( 'ELEMENTOR_SHOW_HIDDEN_EXPERIMENTS' ) && ELEMENTOR_SHOW_HIDDEN_EXPERIMENTS;
	}

	private function create_dependency_class( $dependency_name, $dependency_args ) {
		if ( class_exists( $dependency_name ) ) {
			return $dependency_name::instance();
		}

		if ( ! empty( $dependency_args ) ) {
			return new Wrap_Core_Dependency( $dependency_args );
		}

		return new Non_Existing_Dependency( $dependency_name );
	}

	/**
	 * The experiments page is a WordPress options page, which means all the experiments are registered via WordPress' register_settings(),
	 * and their states are being sent in the POST request when saving.
	 * The options are being updated in a chronological order based on the POST data.
	 * This behavior interferes with the experiments dependency mechanism because the data that's being sent can be in any order,
	 * while the dependencies mechanism expects it to be in a specific order (dependencies should be activated before their dependents can).
	 * In order to solve this issue, we sort the experiments in the POST data based on their dependencies tree.
	 *
	 * @param $allowed_options
	 *
	 * @return mixed
	 */
	private function sort_allowed_options_by_dependencies( $allowed_options ) {
		if ( ! isset( $allowed_options['elementor'] ) ) {
			return $allowed_options;
		}

		$sorted = Collection::make();
		$visited = Collection::make();

		$sort = function ( $item ) use ( &$sort, $sorted, $visited ) {
			if ( $visited->contains( $item ) ) {
				return;
			}

			$visited->push( $item );

			$feature = $this->get_features( $item );

			if ( ! $feature ) {
				return;
			}

			foreach ( $feature['dependencies'] ?? [] as $dep ) {
				$name = is_string( $dep ) ? $dep : $dep->get_name();

				$sort( $name );
			}

			$sorted->push( $item );
		};

		foreach ( $allowed_options['elementor'] as $option ) {
			$is_experiment_option = strpos( $option, static::OPTION_PREFIX ) === 0;

			if ( ! $is_experiment_option ) {
				continue;
			}

			$sort(
				str_replace( static::OPTION_PREFIX, '', $option )
			);
		}

		$allowed_options['elementor'] = Collection::make( $allowed_options['elementor'] )
			->filter( function ( $option ) {
				return 0 !== strpos( $option, static::OPTION_PREFIX );
			} )
			->merge(
				$sorted->map( function ( $item ) {
					return static::OPTION_PREFIX . $item;
				} )
			)
			->values();

		return $allowed_options;
	}

	public function __construct() {
		$this->init_states();

		$this->init_release_statuses();

		$this->init_features();

		add_action( 'admin_init', function () {
			System_Info::add_report(
				'experiments', [
					'file_name' => __DIR__ . '/experiments-reporter.php',
					'class_name' => __NAMESPACE__ . '\Experiments_Reporter',
				]
			);
		}, 79 /* Before log */ );

		if ( is_admin() ) {
			$page_id = Settings::PAGE_ID;

			add_action( "elementor/admin/after_create_settings/{$page_id}", function( Settings $settings ) {
				$this->register_settings_fields( $settings );
			}, 11 );

			add_filter( 'allowed_options', function ( $allowed_options ) {
				return $this->sort_allowed_options_by_dependencies( $allowed_options );
			}, 11 );
		}

		// Register CLI commands.
		if ( Utils::is_wp_cli() ) {
			\WP_CLI::add_command( 'elementor experiments', WP_CLI::class );
		}
	}
}
