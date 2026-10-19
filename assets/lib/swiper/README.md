# Swiper

The files in this directory are copied by hand from the Swiper release bundle.
`v8/swiper.js` is `swiper-bundle.js` and `v8/swiper.min.js` is `swiper-bundle.min.js`.

The `.map` files are not part of the plugin. If a file ends with a
`//# sourceMappingURL=` comment, browsers request the missing map and log a 404
in the developer tools. When you update Swiper, delete that comment from the
last line of both files and keep a trailing newline.
