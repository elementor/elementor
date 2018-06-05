<?php
/**
 * The header for our theme
 *
 * This is the template that displays all of the <head> section and everything up until <div id="content">
 *
 * @link       https://developer.wordpress.org/themes/basics/template-files/#template-partials
 *
 * @package    WordPress
 * @subpackage Twenty_Seventeen
 * @since      1.0
 * @version    1.0
 */

?><!DOCTYPE html>
<html <?php language_attributes(); ?> class="no-js no-svg">
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<link rel="profile" href="http://gmpg.org/xfn/11">

	<?php wp_head(); ?>
</head>

<body <?php body_class(); ?>>
<div id="page" class="site">
	<a class="skip-link screen-reader-text" href="#content"><?php _e( 'Skip to content', 'twentyseventeen' ); ?></a>

	<header id="masthead" class="site-header" role="banner">
		<div id="logo">
			<?php the_custom_logo(); ?>
		</div>
	</header><!-- #masthead -->

	<div class="site-content-contain">
		<div id="content" class="site-content">
			<div class="wrap">
				<?php if ( is_home() && ! is_front_page() ) : ?>
					<header class="page-header">
						<h1 class="page-title"><?php single_post_title(); ?></h1>
					</header>
				<?php else : ?>
					<header class="page-header">
						<h2 class="page-title"><?php _e( 'Posts', 'twentyseventeen' ); ?></h2>
					</header>
				<?php endif; ?>

				<div id="primary" class="content-area">
					<main id="main" class="site-main" role="main">

						<?php
						if ( have_posts() ) :

							/* Start the Loop */
							while ( have_posts() ) : the_post();

								/*
								 * Include the Post-Format-specific template for the content.
								 * If you want to override this in a child theme, then include a file
								 * called content-___.php (where ___ is the Post Format name) and that will be used instead.
								 */
								?>

								<article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>

									<header class="entry-header">
										<?php
										if ( is_single() ) {
											the_title( '<h1 class="entry-title">', '</h1>' );
										} elseif ( is_front_page() && is_home() ) {
											the_title( '<h3 class="entry-title"><a href="' . esc_url( get_permalink() ) . '" rel="bookmark">', '</a></h3>' );
										} else {
											the_title( '<h2 class="entry-title"><a href="' . esc_url( get_permalink() ) . '" rel="bookmark">', '</a></h2>' );
										}
										?>
									</header><!-- .entry-header -->

									<?php if ( '' !== get_the_post_thumbnail() ) : ?>
										<div class="post-thumbnail">
											<a href="<?php the_permalink(); ?>">
												<?php the_post_thumbnail( 'twentyseventeen-featured-image' ); ?>
											</a>
										</div><!-- .post-thumbnail -->
									<?php endif; ?>

									<div class="entry-content">
										<?php
										/* translators: %s: Name of current post */
										the_content( sprintf(
											__( 'Continue reading<span class="screen-reader-text"> "%s"</span>', 'twentyseventeen' ),
											get_the_title()
										) );

										wp_link_pages( array(
											'before'      => '<div class="page-links">' . __( 'Pages:', 'twentyseventeen' ),
											'after'       => '</div>',
											'link_before' => '<span class="page-number">',
											'link_after'  => '</span>',
										) );
										?>
									</div><!-- .entry-content -->


								</article><!-- #post-## -->
								<?php

							endwhile;

						else :

							?>

							<section class="no-results not-found">
								<header class="page-header">
									<h1 class="page-title"><?php _e( 'Nothing Found', 'twentyseventeen' ); ?></h1>
								</header>
								<div class="page-content">
									<?php
									if ( is_home() && current_user_can( 'publish_posts' ) ) : ?>

										<p><?php printf( __( 'Ready to publish your first post? <a href="%1$s">Get started here</a>.', 'twentyseventeen' ), esc_url( admin_url( 'post-new.php' ) ) ); ?></p>

									<?php else : ?>

										<p><?php _e( 'It seems we can&rsquo;t find what you&rsquo;re looking for. Perhaps searching can help.', 'twentyseventeen' ); ?></p>
										<?php
										get_search_form();

									endif; ?>
								</div><!-- .page-content -->
							</section><!-- .no-results -->

							<?php

						endif;
						?>

					</main><!-- #main -->
				</div><!-- #primary -->
			</div><!-- .wrap -->

			<?php
			/**
			 * The template for displaying the footer
			 *
			 * Contains the closing of the #content div and all content after.
			 *
			 * @link       https://developer.wordpress.org/themes/basics/template-files/#template-partials
			 *
			 * @package    WordPress
			 * @subpackage Twenty_Seventeen
			 * @since      1.0
			 * @version    1.2
			 */

			?>

		</div><!-- #content -->

		<footer id="colophon" class="site-footer" role="contentinfo">
			<div class="wrap">

			</div><!-- .wrap -->
		</footer><!-- #colophon -->
	</div><!-- .site-content-contain -->
</div><!-- #page -->
<?php wp_footer(); ?>

</body>
</html>

