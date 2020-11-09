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

/**
 * Class Module
 *
 * @package ElementorLabs\Modules\Widgets
 */
class Module extends BaseModule {

	/**
	 * @var \WP_Query $recently_edited_query
	 */
	private $recently_edited_query = null;

	public function get_name() {
		return 'widgets';
	}

	public function __construct() {
		remove_action( 'welcome_panel', 'wp_welcome_panel' );
		add_action( 'welcome_panel', [ $this, 'welcome_dashboard_widget_render' ] );

		if ( is_network_admin() ) {
			add_action( 'wp_network_dashboard_setup', [ $this, 'add_dashboard_widgets' ] );
		} elseif ( is_user_admin() ) {
			add_action( 'wp_user_dashboard_setup', [ $this, 'add_dashboard_widgets' ] );
		} else {
			add_action( 'wp_dashboard_setup', [ $this, 'add_dashboard_widgets' ] );
		}
	}

	private function get_recently_edited_query() {
		if ( null === $this->recently_edited_query ) {
			$recently_edited_query_args = [
				'post_type' => 'any',
				'post_status' => [ 'publish', 'draft' ],
				'posts_per_page' => '3',
				'meta_key' => '_elementor_edit_mode',
				'meta_value' => 'builder',
				'orderby' => 'modified',
			];

			$this->recently_edited_query = new \WP_Query( $recently_edited_query_args );
		}

		return $this->recently_edited_query;
	}

	public function add_dashboard_widgets() {
		$widgets = [
			'e-dashboard-widget-quick-actions' => [
				'label' => esc_html__( 'Elementor Quick Actions', 'elementor' ),
				'callback' => [ $this, 'dashboard_quick_actions_render' ],
			],
			'e-dashboard-widget-resources' => [
				'label' => esc_html__( 'Elementor Resources', 'elementor' ),
				'callback' => [ $this, 'dashboard_resources_render' ],
			],
			'e-dashboard-widget-news-feed' => [
				'label' => esc_html__( 'Elementor News & Updates', 'elementor' ),
				'callback' => [ $this, 'dashboard_news_feed_render' ],
			],
		];

		$show_welcome_panel = get_user_meta( get_current_user_id(), 'show_welcome_panel', true );
		if ( ! $show_welcome_panel ) {
			$widgets['e-dashboard-widget-videos'] = array(
				'label' => esc_html__( 'Elementor Video Tutorials', 'elementor' ),
				'callback' => [ $this, 'dashboard_videos_render' ],
			);
		}

		$widget_backup = [];

		foreach ( $widgets as $widget_id => $widget ) {
			add_filter( "postbox_classes_dashboard_{$widget_id}", array( $this, 'add_global_widget_class' ) );

			wp_add_dashboard_widget( $widget_id, $widget['label'], $widget['callback'] );

			$widget_backup[] = $widget_id;
		}

		global $wp_meta_boxes;

		$default_dashboard = $wp_meta_boxes['dashboard']['normal']['core'];

		$temp_widget_backup = [];
		foreach ( $widget_backup as $widget_id ) {
			$temp_widget_backup[ $widget_id ] = $default_dashboard[ $widget_id ];
			unset( $default_dashboard[ $widget_id ] );
		}

		$sorted_dashboard = $temp_widget_backup + $default_dashboard;

		// Save the sorted array back into the original metaboxes.
		$wp_meta_boxes['dashboard']['normal']['core'] = $sorted_dashboard; // phpcs:ignore WordPress.WP.GlobalVariablesOverride.Prohibited
	}

	public function add_global_widget_class( $classes ) {
		$classes[] = 'e-dashboard-widget';

		return $classes;
	}

	public function welcome_dashboard_widget_render() {
		$create_page_url = Utils::get_create_new_post_url();
		$create_post_url = Utils::get_create_new_post_url( 'post' );

		$action_links = [
			'write_blog' => [
				'icon' => 'dashicons-welcome-write-blog',
				'label' => esc_html__( 'Create your first blog page', 'elementor' ),
				'url' => esc_url( $create_post_url ),
			],
			'about_page' => [
				'icon' => 'dashicons-plus-alt2',
				'label' => esc_html__( 'Add an about page', 'elementor' ),
				'url' => esc_url( $create_page_url ),
			],
			'home_page' => [
				'icon' => 'dashicons-admin-home',
				'label' => esc_html__( 'Setup your homepage', 'elementor' ),
				'url' => esc_url( admin_url( 'options-reading.php' ) ),
			],
			'view_site' => [
				'icon' => 'dashicons-welcome-view-site',
				'label' => esc_html__( 'View your site', 'elementor' ),
				'url' => esc_url( get_site_url() ),
			],
		];
		?>
		<div class="welcome-panel-content">
			<div id="e-dashboard-widget-welcome" class="postbox e-dashboard-widget">
				<div class="flex inside">
					<div class="video flex-child">
						<iframe width="560" height="315" src="https://www.youtube.com/embed/_X0eYtY8T_U" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen=""></iframe>
					</div>
					<div class="intro flex-child">
						<h3><?php esc_html_e( 'Welcome to Elementor', 'elementor' ); ?></h3>
						<p><?php esc_html_e( 'You\'re about to create your professional WordPress site with Elementor. From here, you can quickly start working on your site, watch video tutorials, read up on news updates and much more. Let\'s get started!', 'elementor' ); ?></p>
						<p>
							<a class="button button-primary button-large" href="<?php echo esc_url( $create_page_url ); ?>"><?php esc_html_e( 'Create a new page', 'elementor' ); ?></a>
						</p>
					</div>
					<div class="next-steps flex-child">
						<h4><?php esc_html_e( 'Next steps', 'elementor' ); ?></h4>
						<ul class="e-action-list">
							<?php foreach ( $action_links as $action_link ) : ?>
								<li>
									<span class="dashicons <?php echo $action_link['icon']; ?>"></span>
									<a href="<?php echo $action_link['url']; ?>"><?php echo $action_link['label']; ?></a>
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
					<h3 class="e-heading"><?php esc_html_e( 'Add New', 'elementor' ); ?></h3>
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
								'label' => __( 'Find Anything', 'elementor' ),
								'url' => '#',
							],
							'site-menu' => [
								'icon' => 'dashicons-list-view',
								'label' => __( 'Setup site menu', 'elementor' ),
								'url' => 'nav-menus.php',
							],
							'global-settings' => [
								'icon' => 'dashicons-admin-site',
								'label' => __( 'Global Settings', 'elementor' ),
								'url' => 'options-general.php',
							],
							'theme-builder' => [
								'icon' => 'dashicons-networking',
								'label' => __( 'Theme builder', 'elementor' ),
								'url' => 'edit.php?post_type=elementor_library&tabs_group=theme',
							],
							'view-site' => [
								'icon' => 'dashicons-welcome-view-site',
								'label' => __( 'View your site', 'elementor' ),
								'url' => get_site_url(),
							],
						];

						if ( ! defined( 'ELEMENTOR_PRO_VERSION' ) ) {
							unset( $action_links['theme-builder'] );
						}

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
			$recently_edited_query = $this->get_recently_edited_query();

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

			<div class="e-version-updates e-divider_top">
				<h3 class="e-heading"><?php esc_html_e( 'Versions Updates', 'elementor' ); ?></h3>
				<div class="e-overview__versions">
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
						'description' => __( 'Browse a lot of videos Browse a lot of videos Browse a lot of videos', 'elementor' ),
					],
					[
						'icon' => 'dashicons-media-document',
						'text' => __( 'Technical docs', 'elementor' ),
						'url' => 'https://go.elementor.com/wp-dash-technical-docs/',
						'description' => __( 'Browse a lot of docs Browse a lot of docs Browse a lot of docs', 'elementor' ),
					],
					[
						'icon' => 'dashicons-editor-help',
						'text' => __( 'FAQs', 'elementor' ),
						'url' => 'https://go.elementor.com/wp-dash-faq/',
						'description' => __( 'Answer your questions Answer your questions Answer your questions', 'elementor' ),
					],
				],
			],
			'community' => [
				'heading' => __( 'Community', 'elementor' ),
				'links' => [
					[
						'icon' => 'dashicons-money',
						'text' => __( 'Hire an expert', 'elementor' ),
						'url' => 'https://go.elementor.com/wp-dash-experts/',
						'description' => __( 'Browse a lot of videos', 'elementor' ),
					],
					[
						'icon' => 'dashicons-media-document',
						'text' => __( 'Facebook Community', 'elementor' ),
						'url' => 'https://go.elementor.com/wp-dash-facebook-community/',
						'description' => __( 'Browse a lot of docs', 'elementor' ),
					],
					[
						'icon' => 'dashicons-editor-help',
						'text' => __( 'Upcoming Meetups', 'elementor' ),
						'url' => 'https://go.elementor.com/wp-dash-meetups/',
						'description' => __( 'Answer your questions', 'elementor' ),
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
				'url' => 'https://youtu.be/GX4AKb2mYHw',
			],
			[
				'text' => 'Elementor Theme Builder Overview',
				'url' => 'https://youtu.be/BWx8NQm2hdI',
			],
			[
				'text' => 'Global Colors & Fonts: Creating a Design System With Elementor',
				'url' => 'https://youtu.be/OvETB43I7_w',
			],
			[
				'text' => 'Elementor Pro Live Webinar: Create a Lead Generating Form Popup',
				'url' => 'https://youtu.be/3jAGJtPb0Us',
			],
			[
				'text' => 'How to Use Elementor\'s Lottie Widget',
				'url' => 'https://youtu.be/5m8G57735fQ',
			],
		]
		?>
		<div class="e-video-tutorials-wrap">
			<div class="embed">
				<iframe width="560" height="315" src="https://www.youtube.com/embed/nZlgNmbC-Cw?controls=0" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen=""></iframe>
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
