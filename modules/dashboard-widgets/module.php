<?php
namespace Elementor\Modules\DashboardWidgets;

use Elementor\Api;
use Elementor\Core\Base\Module as BaseModule;
use Elementor\Plugin;
use Elementor\TemplateLibrary\Source_Local;
use Elementor\User;
use Elementor\Utils;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class Module extends BaseModule {

	private $default_hidden_dashboard_widgets = [];

	public function get_name() {
		return 'widgets';
	}

	public function __construct() {
		remove_action( 'welcome_panel', 'wp_welcome_panel' );
		add_action( 'welcome_panel', [ $this, 'welcome_dashboard_widget_render' ] );

		add_action( 'wp_dashboard_setup', [ $this, 'add_dashboard_widgets' ], 100 );

		add_filter( 'default_hidden_meta_boxes', [ $this, 'hook_default_hidden_meta_boxes' ], 10, 2 );
	}

	public function hook_default_hidden_meta_boxes( $hidden, $screen ) {
		if ( empty( $screen->id ) || 'dashboard' !== $screen->id ) {
			return $hidden;
		}

		return array_unique( array_merge( $hidden, $this->default_hidden_dashboard_widgets ) );
	}

	public function add_dashboard_widgets() {
		$widgets = [
			'e-dashboard-widget-quick-actions' => [
				'label' => esc_html__( 'Elementor Quick Actions', 'elementor' ),
				'location' => 'normal',
				'callback' => [ $this, 'dashboard_quick_actions_render' ],
			],
			'e-dashboard-widget-resources' => [
				'label' => esc_html__( 'Elementor Resources', 'elementor' ),
				'location' => 'side',
				'callback' => [ $this, 'dashboard_resources_render' ],
			],
			'e-dashboard-widget-news-feed' => [
				'label' => esc_html__( 'Elementor News & Updates', 'elementor' ),
				'location' => 'normal',
				'callback' => [ $this, 'dashboard_news_feed_render' ],
			],
		];

		$show_welcome_panel = get_user_meta( get_current_user_id(), 'show_welcome_panel', true );
		if ( ! $show_welcome_panel ) {
			$widgets['e-dashboard-widget-videos'] = array(
				'label' => esc_html__( 'Elementor Video Tutorials', 'elementor' ),
				'location' => 'side',
				'callback' => [ $this, 'dashboard_videos_render' ],
			);
		}

		foreach ( $widgets as $widget_id => $widget ) {
			add_filter( "postbox_classes_dashboard_{$widget_id}", array( $this, 'add_global_widget_class' ) );
			wp_add_dashboard_widget( $widget_id, $widget['label'], $widget['callback'] );
		}

		global $wp_meta_boxes;

		// Remove Legacy Elementor Widget
		unset( $wp_meta_boxes['dashboard']['normal']['core']['e-dashboard-overview'] );

		// Rearrange the widgets
		$widgets_locations = wp_list_pluck( $widgets, 'location' );
		$elementor_widgets_data = [];

		$locations = [ 'normal', 'side' ];
		foreach ( $locations as $location ) {
			foreach ( $wp_meta_boxes['dashboard'][ $location ]['core'] as $dashboard_widget_id => $dashboard_widget ) {
				if ( isset( $widgets_locations[ $dashboard_widget_id ] ) ) {
					if ( ! isset( $elementor_widgets_data[ $widgets_locations[ $dashboard_widget_id ] ] ) ) {
						$elementor_widgets_data[ $widgets_locations[ $dashboard_widget_id ] ] = [];
					}
					$elementor_widgets_data[ $widgets_locations[ $dashboard_widget_id ] ][ $dashboard_widget_id ] = $dashboard_widget;
					unset( $wp_meta_boxes['dashboard'][ $location ]['core'][ $dashboard_widget_id ] );
				} else {
					$this->default_hidden_dashboard_widgets[] = $dashboard_widget_id;
				}
			}
		}

		foreach ( $locations as $location ) {
			$wp_meta_boxes['dashboard'][ $location ]['core'] = array_merge( $elementor_widgets_data[ $location ], $wp_meta_boxes['dashboard'][ $location ]['core'] ); // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited
		}
	}

	public function add_global_widget_class( $classes ) {
		$classes[] = 'e-dashboard-widget';

		return $classes;
	}

	public function welcome_dashboard_widget_render() {
		$create_page_url = Utils::get_create_new_post_url();

		$action_links = [
			'global_settings' => [
				'icon' => 'dashicons-admin-site-alt3',
				'label' => esc_html__( 'Global Settings', 'elementor' ),
				'url' => admin_url( 'options-general.php' ),
			],
			'theme_builder' => [
				'icon' => 'dashicons-networking',
				'label' => esc_html__( 'Create your website\'s insructure with Theme Builder', 'elementor' ),
				'url' => Plugin::$instance->app->get_settings( 'menu_url' ),
			],
			'home_page' => [
				'icon' => 'dashicons-admin-home',
				'label' => esc_html__( 'Set up your homepage', 'elementor' ),
				'url' => admin_url( 'options-reading.php' ),
			],
			'view_site' => [
				'icon' => 'dashicons-list-view',
				'label' => esc_html__( 'Add a website menu', 'elementor' ),
				'url' => admin_url( 'nav-menus.php' ),
			],
		];
		?>
		<div class="welcome-panel-content">
			<div id="e-dashboard-widget-welcome" class="e-dashboard-widget">
				<div class="flex inside">
					<div class="video flex-child">
						<iframe width="560" height="315" src="https://www.youtube.com/embed/_X0eYtY8T_U" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen=""></iframe>
					</div>
					<div class="intro flex-child">
						<h3><?php esc_html_e( 'Welcome to Elementor', 'elementor' ); ?></h3>
						<p><?php esc_html_e( 'You\'re about to create your professional WordPress website with Elementor. From here, you can quickly start working on your website, watch video tutorials, read up on news updates and much more. Let\'s get started!', 'elementor' ); ?></p>
						<p>
							<a class="button button-primary button-large" href="<?php echo esc_url( $create_page_url ); ?>"><?php esc_html_e( 'Create a new page', 'elementor' ); ?></a>
						</p>
					</div>
					<div class="next-steps flex-child">
						<h4><?php esc_html_e( 'Start With the Essentials', 'elementor' ); ?></h4>
						<ul class="e-action-list">
							<?php foreach ( $action_links as $action_link ) : ?>
								<li>
									<span class="dashicons <?php echo $action_link['icon']; ?>"></span>
									<a href="<?php echo esc_url( $action_link['url'] ); ?>"><?php echo $action_link['label']; ?></a>
								</li>
							<?php endforeach; ?>
						</ul>
					</div>
				</div>
			</div>
		</div>
		<?php
	}

	private function get_post_types_action_linkt() {
		$elementor_supported_post_types = get_post_types_by_support( 'elementor' );

		$items = [];

		foreach ( $elementor_supported_post_types as $post_type ) {
			if ( ! User::is_current_user_can_edit_post_type( $post_type ) ) {
				continue;
			}

			$post_type_object = get_post_type_object( $post_type );

			// If there is an old post type from inactive plugins
			if ( ! $post_type_object ) {
				continue;
			}

			if ( Source_Local::CPT === $post_type ) {
				$url = admin_url( Source_Local::ADMIN_MENU_SLUG . '#add_new' );
			} else {
				$url = Utils::get_create_new_post_url( $post_type );
			}

			$items[] = [
				/* translators: %s the title of the post type */
				'title' => $post_type_object->labels->singular_name,
				'url' => $url,
			];
		}

		if ( defined( 'ELEMENTOR_PRO_VERSION' ) ) {
			$base_url = admin_url( Source_Local::ADMIN_MENU_SLUG );
			$url = add_query_arg(
				[
					'tabs_group' => 'popup',
					'elementor_library_type' => 'popup',
				],
				$base_url
			);

			$items[] = [
				'title' => __( 'Popup', 'elementor' ),
				'url' => $url . '#add_new',
			];
		}

		return $items;
	}

	public function dashboard_quick_actions_render() {
		$action_links = $this->get_post_types_action_linkt();
		?>
		<div class="e-quick-actions-wrap">
			<div class="flex">
				<?php if ( ! empty( $action_links ) ) : ?>
				<div class="flex-child">
					<h3 class="e-heading"><?php esc_html_e( 'Create', 'elementor' ); ?></h3>
					<ul class="e-action-list">
						<?php foreach ( $action_links as $action_link ) : ?>
							<li>
								<span class="dashicons dashicons-plus"></span>
								<a href="<?php echo esc_url( $action_link['url'] ); ?>"><?php echo $action_link['title']; ?></a>
							</li>
						<?php endforeach; ?>
					</ul>
				</div>
				<?php endif; ?>

				<div class="flex-child">
					<h3 class="e-heading"><?php esc_html_e( 'Manage', 'elementor' ); ?></h3>
					<ul class="e-action-list">
						<?php
						$action_links = [
							'elementor-finder' => [
								'icon' => 'dashicons-search',
								'label' => __( 'Finder', 'elementor' ),
								'url' => '#',
							],
							'site-menu' => [
								'icon' => 'dashicons-list-view',
								'label' => __( 'Setup website menu', 'elementor' ),
								'url' => 'nav-menus.php',
							],
							'global-settings' => [
								'icon' => 'dashicons-admin-site-alt3',
								'label' => __( 'Global Settings', 'elementor' ),
								'url' => 'options-general.php',
							],
							'theme-builder' => [
								'icon' => 'dashicons-networking',
								'label' => __( 'Theme Builder', 'elementor' ),
								'url' => Plugin::$instance->app->get_settings( 'menu_url' ),
							],
							'view-site' => [
								'icon' => 'dashicons-welcome-view-site',
								'label' => __( 'View your website', 'elementor' ),
								'url' => get_site_url(),
							],
						];

						foreach ( $action_links as $css_class => $action_link ) :
							?>
							<li>
								<span class="dashicons <?php echo $action_link['icon']; ?>"></span>
								<a class="<?php echo $css_class; ?>" href="<?php echo esc_url( $action_link['url'] ); ?>"><?php echo $action_link['label']; ?></a>
							</li>
						<?php endforeach; ?>
					</ul>
				</div>
			</div>

			<?php
			$recently_edited_query_args = [
				'post_type' => 'any',
				'post_status' => [ 'publish', 'draft' ],
				'posts_per_page' => '3',
				'meta_key' => '_elementor_edit_mode',
				'meta_value' => 'builder',
				'orderby' => 'modified',
			];

			$recently_edited_query = new \WP_Query( $recently_edited_query_args );

			if ( $recently_edited_query->have_posts() ) : ?>
				<div class="e-recently-edited">
					<h3 class="e-heading e-divider_top"><?php echo __( 'Recently Edited', 'elementor' ); ?></h3>
					<ul class="e-posts">
						<?php
						while ( $recently_edited_query->have_posts() ) :
							$recently_edited_query->the_post();
							$document = Plugin::$instance->documents->get( get_the_ID() );

							$date = date_i18n( _x( 'M jS', 'Dashboard Overview Widget Recently Date', 'elementor' ), get_the_modified_time( 'U' ) );
							?>
							<li class="e-post">
								<a href="<?php echo esc_attr( $document->get_edit_url() ); ?>" class="e-post-link"><?php echo esc_html( get_the_title() ); ?> <span class="dashicons dashicons-edit"></span></a> <span><?php echo $date; ?>, <?php the_time(); ?></span>
							</li>
						<?php endwhile; ?>
					</ul>
				</div>
			<?php endif; ?>

			<div class="e-version-updates e-divider_top flex">
				<h3 class="e-heading flex-child"><?php esc_html_e( 'Versions', 'elementor' ); ?></h3>
				<div class="e-versions flex-child">
					<span class="e-overview__version"><?php echo __( 'Elementor', 'elementor' ); ?> v<?php echo ELEMENTOR_VERSION; ?></span>
					<?php
					/**
					 * Elementor dashboard widget after the version.
					 *
					 * Fires after Elementor version display in the dashboard widget.
					 *
					 * @since 1.9.0
					 */
					do_action( 'elementor/admin/dashboard_overview_widget/after_version' );
					?>
				</div>
			</div>
		</div>
		<?php
	}

	public function dashboard_resources_render() {
		$sections = [
			'knowledge_base' => [
				'heading' => __( 'Knowledge Base', 'elementor' ),
				'links' => [
					[
						'icon' => 'dashicons-video-alt2',
						'text' => __( 'Video Tutorials', 'elementor' ),
						'url' => 'https://go.elementor.com/wp-dash-video-tutorials/',
						'description' => __( 'Develop your Elementor skills with dozens of helpful videos', 'elementor' ),
					],
					[
						'icon' => 'dashicons-media-document',
						'text' => __( 'Help Center', 'elementor' ),
						'url' => 'https://go.elementor.com/wp-dash-technical-docs/',
						'description' => __( 'Read our documentation & find what you\'re looking for', 'elementor' ),
					],
					[
						'icon' => 'dashicons-editor-help',
						'text' => __( 'FAQs', 'elementor' ),
						'url' => 'https://go.elementor.com/wp-dash-faq/',
						'description' => __( 'Find answers to the most common Elementor questions', 'elementor' ),
					],
				],
			],
			'community' => [
				'heading' => __( 'Community', 'elementor' ),
				'links' => [
					[
						'icon' => 'dashicons-id',
						'text' => __( 'Find an Expert', 'elementor' ),
						'url' => 'https://go.elementor.com/wp-dash-experts/',
						'description' => __( 'Get your project off the ground with certified Elementor expert', 'elementor' ),
					],
					[
						'icon' => 'dashicons-facebook',
						'text' => __( 'Facebook Community', 'elementor' ),
						'url' => 'https://go.elementor.com/wp-dash-facebook-community/',
						'description' => __( 'Connect with web creators to learn, support & be inspired', 'elementor' ),
					],
					[
						'icon' => 'dashicons-groups',
						'text' => __( 'Elementor Meetups', 'elementor' ),
						'url' => 'https://go.elementor.com/wp-dash-meetups/',
						'description' => __( 'Expand your abilities and professional network', 'elementor' ),
					],
				],
			],
		];
		?>
		<div class="e-resources-wrap">
			<?php foreach ( $sections as $section ) : ?>
				<h3 class="e-heading"><?php echo $section['heading']; ?></h3>
				<?php foreach ( $section['links'] as $link ) : ?>
					<div class="resource-link">
						<div class="icon">
							<span class="dashicons <?php echo $link['icon']; ?>"></span>
						</div>
						<div class="text">
							<a target="_blank" href="<?php echo $link['url']; ?>"><?php echo $link['text']; ?></a>
							<p><?php echo $link['description']; ?></p>
						</div>
					</div>
				<?php endforeach; ?>
			<?php endforeach; ?>
		</div>
		<?php
	}

	public function dashboard_news_feed_render() {
		?>
		<div class="e-news-feed-wrap">
			<?php
			$elementor_feed = Api::get_feed_data();

			if ( ! empty( $elementor_feed ) ) : ?>
				<div class="e-feed">
					<ul class="e-posts">
						<?php foreach ( $elementor_feed as $feed_item ) : ?>
							<li class="e-post">
								<a href="<?php echo esc_url( $feed_item['url'] ); ?>" class="e-post-link" target="_blank">
									<?php if ( ! empty( $feed_item['badge'] ) ) : ?>
										<span class="e-badge"><?php echo esc_html( $feed_item['badge'] ); ?></span>
									<?php endif; ?>
									<?php echo esc_html( $feed_item['title'] ); ?>
								</a>
								<p class="e-post-description"><?php echo esc_html( $feed_item['excerpt'] ); ?></p>
							</li>
						<?php endforeach; ?>
					</ul>
					<div class="e-footer e-divider_top">
						<a target="_blank" href="https://go.elementor.com/overview-widget-blog/">
							<?php esc_html_e( 'Vist Blog', 'elementor' ); ?> <span class="screen-reader-text"><?php echo __( '(opens in a new window)', 'elementor' ); ?></span><span aria-hidden="true" class="dashicons dashicons-external"></span>
						</a>
					</div>
				</div>
			<?php endif; ?>
		</div>
		<?php
	}

	public function dashboard_videos_render() {
		$links = [
			[
				'text' => 'How to Use Elementor Site Settings',
				'url' => 'https://go.elementor.com/wp-dash-video-site-settings/',
			],
			[
				'text' => 'Elementor Theme Builder Overview',
				'url' => 'https://go.elementor.com/wp-dash-video-theme-builder/',
			],
			[
				'text' => 'Global Colors & Fonts: Creating a Design System With Elementor',
				'url' => 'https://go.elementor.com/wp-dash-video-design-system/',
			],
			[
				'text' => 'Elementor Pro Live Webinar: Create a Lead Generating Form Popup',
				'url' => 'https://go.elementor.com/wp-dash-video-lead-generation/',
			],
			[
				'text' => 'How to Use Elementor\'s Lottie Widget',
				'url' => 'https://go.elementor.com/wp-dash-video-lottie-widget/',
			],
		]
		?>
		<div class="e-video-tutorials-wrap">
			<div class="embed">
				<iframe width="560" height="315" src="https://www.youtube.com/embed/GX4AKb2mYHw?controls=0" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen=""></iframe>
			</div>
			<div class="links">
				<ul>
					<?php foreach ( $links as $link ) : ?>
						<li>
							<span class="dashicons dashicons-video-alt3"></span>
							<a href="<?php echo $link['url']; ?>" target="_blank"><?php echo $link['text']; ?></a>
						</li>
					<?php endforeach; ?>
				</ul>
			</div>
		</div>
		<?php
	}
}
