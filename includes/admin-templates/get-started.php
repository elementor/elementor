<?php
namespace Elementor;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}
?>
<script type="text/template" id="tmpl-elementor-get-started">
	<div id="elementor-get-started__content-area">
		<div id="elementor-get-started__sidebar">
			<div id="elementor-get-started__title"><?php echo __( 'Let\'s Start!', 'elementor' ); ?></div>
			<div id="elementor-get-started__menu">
				<div class="elementor-get-started__menu__item" data-elementor-action="welcome">
					<i class="eicon-home-heart"></i>
					<span class="elementor-get-started__menu__item__text"><?php echo __( 'Welcome', 'elementor' ); ?></span>
				</div>
				<div class="elementor-get-started__menu__item" data-elementor-action="dnd">
					<i class="eicon-drag-n-drop"></i>
					<span class="elementor-get-started__menu__item__text"><?php echo __( 'Drag & Drop', 'elementor' ); ?></span>
				</div>
				<div class="elementor-get-started__menu__item" data-elementor-action="layout">
					<i class="eicon-column"></i>
					<span class="elementor-get-started__menu__item__text"><?php echo __( 'Layout', 'elementor' ); ?></span>
				</div>
				<div class="elementor-get-started__menu__item" data-elementor-action="customize">
					<i class="eicon-edit"></i>
					<span class="elementor-get-started__menu__item__text"><?php echo __( 'Customize', 'elementor' ); ?></span>
				</div>
				<div class="elementor-get-started__menu__item" data-elementor-action="publish">
					<i class="eicon-cloud-check"></i>
					<span class="elementor-get-started__menu__item__text"><?php echo __( 'Publish', 'elementor' ); ?></span>
				</div>
			</div>
		</div>
		<div id="elementor-get-started__content">
			<div id="elementor-get-started__item-welcome" class="elementor-get-started__item">
				<div class="elementor-get-started__item__content-area">
					<div class="elementor-get-started__item__title"><?php echo __( 'Welcome to Elementor Builder', 'elementor' ); ?></div>
					<div class="elementor-get-started__item__content"><?php echo __( 'With Elementor you will be able to create, edit and design beautiful websites like never before. A page builder that delivers high-end page designs and advanced capabilities.', 'elementor' ); ?></div>
				</div>
				<div class="elementor-get-started__item__image">
					<img src="<?php echo ELEMENTOR_ASSETS_URL; ?>images/placeholder.png">
				</div>
			</div>
			<div id="elementor-get-started__item-dnd" class="elementor-get-started__item">
				<div class="elementor-get-started__item__content-area">
					<div class="elementor-get-started__item__title"><?php echo __( 'Drag & Drop Widgets into Your Page', 'elementor' ); ?></div>
					<div class="elementor-get-started__item__content"><?php echo __( 'With Elementor you will be able to create, edit and design beautiful websites like never before. A page builder that delivers high-end page designs and advanced capabilities.', 'elementor' ); ?></div>
				</div>
				<div class="elementor-get-started__item__image">
					<img src="<?php echo ELEMENTOR_ASSETS_URL; ?>images/placeholder.png">
				</div>
			</div>
			<div id="elementor-get-started__item-layout" class="elementor-get-started__item">
				<div class="elementor-get-started__item__content-area">
					<div class="elementor-get-started__item__title"><?php echo __( 'Grid Layout For Pixel Pefect Websites', 'elementor' ); ?></div>
					<div class="elementor-get-started__item__content"><?php echo __( 'With Elementor you will be able to create, edit and design beautiful websites like never before. A page builder that delivers high-end page designs and advanced capabilities.', 'elementor' ); ?></div>
				</div>
				<div class="elementor-get-started__item__image">
					<img src="<?php echo ELEMENTOR_ASSETS_URL; ?>images/placeholder.png">
				</div>
			</div>
			<div id="elementor-get-started__item-customize" class="elementor-get-started__item">
				<div class="elementor-get-started__item__content-area">
					<div class="elementor-get-started__item__title"><?php echo __( 'Customize Widgets to Suit Your Needs', 'elementor' ); ?></div>
					<div class="elementor-get-started__item__content"><?php echo __( 'With Elementor you will be able to create, edit and design beautiful websites like never before. A page builder that delivers high-end page designs and advanced capabilities.', 'elementor' ); ?></div>
				</div>
				<div class="elementor-get-started__item__image">
					<img src="<?php echo ELEMENTOR_ASSETS_URL; ?>images/placeholder.png">
				</div>
			</div>
			<div id="elementor-get-started__item-publish" class="elementor-get-started__item">
				<div class="elementor-get-started__item__content-area">
					<div class="elementor-get-started__item__title"><?php echo __( 'Publish Your New Website in a Brize', 'elementor' ); ?></div>
					<div class="elementor-get-started__item__content"><?php echo __( 'With Elementor you will be able to create, edit and design beautiful websites like never before. A page builder that delivers high-end page designs and advanced capabilities.', 'elementor' ); ?></div>
				</div>
				<div class="elementor-get-started__item__image">
					<img src="<?php echo ELEMENTOR_ASSETS_URL; ?>images/placeholder.png">
				</div>
			</div>
			<div id="elementor-get-started__item-video-tour" class="elementor-get-started__item elementor-aspect-ratio-169">
				<div class="elementor-fit-aspect-ratio">
					<iframe src="https://www.youtube.com/embed/43j6h3oCm0U?feature=oembed&rel=0" allowfullscreen></iframe>
				</div>
			</div>
		</div>
	</div>
	<div id="elementor-get-started__footer">
		<div id="elementor-get-started__video-button" data-elementor-action="video-tour">
			<i class="eicon-play-o"></i>
			<span id="elementor-get-started__video-button__text"><?php echo __( 'Video Tour', 'elementor' ); ?></span>
		</div>
		<?php
		if ( User::is_current_user_can_edit_post_type( 'page' ) ) {
			$post_type = 'page';
		} else {
			$post_type = 'post';
		}
		?>
		<a href="<?php echo esc_url( Utils::get_create_new_post_url( $post_type ) ); ?>">
			<button id="elementor-get-started__start-button" class="elementor-button elementor-button-success"><?php echo __( 'Start Creating', 'elementor' ); ?></button>
		</a>
	</div>
</script>
