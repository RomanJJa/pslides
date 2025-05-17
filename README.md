# PSlides - A flexible JavaScript library for online experiments and surveys
A JavaScript library for programming powerful psychological experiments and surveys. PSlides makes it easy to integrate anything that HTML and vanilla JS have to offer.

## Include:
In order to use this library, clone the project, move the files into your preferred directory on the server, and include the following two elements in your document head:
```html
<script src="main.js">
<link type="text/css" rel="stylesheet" href="style.css">
```

## Goals
The goals of this library are:
- allowing a general-purpose application in which you can easily integrate your own features
- making programming mostly in HTML - and maybe very basic JavaScript
- making it easy to include your own custom code in the experiment
- making it easy for anyone who has little programming experience to read the code.
- Recording data automatically once you give a "name" to an HTML tag: We would rather record things that you are not interested in than you missing data in the end.
  You can export the results in JSON or CSV.
- We try to integrate more features over time to make new ways of running experiments easily accessible also to rather inexperienced programmers.
We try to fulfill these goals by taking over most actions concerning DOM manipulations such as moving to the next or previous slide. Once a slide is loaded, the JavaScript is also loaded from top to bottom, similar to the way a webpage is loaded.
If you would like to include any custom code for your specific purposes, you can do so without interfering with the library.

## Usage: Programming an experiment or a survey with PSlides
The library includes custom HTML tags that begin with "p-" like `<p-slide>` which are specific to the PSlides library. There exists pre-configured CSS for these tags.
### `<p-slide>`
The `<p-slide>` tag introduces a slide that is similar to a PowerPoint slide. When the URL to the experiment is opened, the library picks the first slide in the document by making only the contents of that slide visible to the client. There are some extra attributes that make it easier for you to navigate the slides:
- `keysnext` & `keysback`: You can write down any keys (such as "KeyS", "KeyK", "Space", "Enter", ...) on the keyboard
  that will navigate the client to the next (`keysnext`) or previous (`keysback`) slide. If you want to write multiple keys, separate them by spaces.
  ```html
  <p-slide keysback="KeyA ArrowLeft" keysnext="KeyD ArrowRight">
       ...
  </p-slide>
  ```
- `maxms`: You can define the maximum number of miliseconds that the slide will be presented.
  ```html
  <p-slide maxms="500">
     ...
  </p-slide>
  ```
  Because it moves on to the next slide with the `setTimeout()` function in JavaScript, it sets a minimum time until which it moves on. If you need the timing to be precise, you might want to subtract ~10ms from your
  original time frame but that depends on the machine, temporal screen resolution, and browser.
- `current`: This tag is automatically created by the library. Do not write this in your own HTML code.
  This tag makes it possible for JavaScript to query the slide (DOM element) which the client is currently looking at:
  `document.querySelector(p-slide[current])`. Nevertheless, it is usually quicker accessing the current slide's DOM element via the `pslides` object: `pslides.currentSlide`.
#### For JavaScript programming: 
If you wish to quickly access the DOM element of the current slide in JavaScript, consider `pslides.currentSlide` or `document.querySelector(p-slide[current])`.

