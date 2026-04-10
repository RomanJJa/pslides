# PSlides: A flexible JavaScript library for online experiments and surveys
A JavaScript library for programming powerful psychological experiments and surveys. PSlides makes it easy to integrate anything that HTML and vanilla JS have to offer.

## Include:
In order to use this library, clone the project, move the files into your preferred directory on the server, and include the following two elements in your document head:
```html
<script src="main.js"></script>
<link type="text/css" rel="stylesheet" href="style.css"/>
```

If you have stable internet connection, you can also include the current version (here: version 0.3) by including the URL to romans.cc:
```html
<script src="https://www.romans.cc/lib/pslides/v0.3/main.js"></script>
<link type="text/css" rel="stylesheet" href="https://www.romans.cc/lib/pslides/v0.3/style.css"/>
```
Because loading the style from the main.js file might cause problems in offline mode (in the `file://` protocol), it is better to just load them separately in the document's head.

## Goals
The goals of PSlides are:
- allowing a general-purpose application in which you can easily integrate your own features
- making programming mostly in HTML - and maybe very basic JavaScript
- making it easy to include your own custom code in the experiment
- making it easy for anyone who has little programming experience to read the code.
- Recording data automatically once you give a "name" to an HTML tag: We would rather record things that you are not interested in than miss data in the end.
  You can export the results in JSON or CSV.
- We try to integrate more features over time to make new ways of running experiments easily accessible also to rather inexperienced programmers.
We try to fulfill these goals by taking over most actions concerning DOM manipulations such as moving to the next or previous slide. 
Once a slide is loaded, the JavaScript is also loaded from top to bottom, similar to the way a webpage is loaded.
Experimenters can still integrate their own event listeners
If you would like to include any custom code for your specific purposes, you can do so without interfering with the library.


## Usage: Programming an experiment or a survey with PSlides
The library includes custom HTML tags that begin with "p-" like `<p-slide>` which are specific to the PSlides library. There exists pre-configured CSS for these tags.


### `<p-slide>`
The `<p-slide>` tag introduces a slide that is similar to a PowerPoint slide. When the URL to the experiment is opened, the library picks the first slide in the document by making only the contents of that slide visible to the client. There are some extra attributes that make it easier for you to navigate the slides.
**Attributes**
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
```javascript
document.querySelector("p-slide[current]")
```
  Nevertheless, it is usually quicker accessing the current slide's DOM element via the `pslides` object: `pslides.currentSlide`.
#### For JavaScript programming: 
If you wish to quickly access the DOM element of the current slide in JavaScript, you can either access `pslides.currentSlide` or query `document.querySelector(p-slide[current])`.

### `<p-next>` and `<p-back>`
`<p-next>` and `<p-back>` act as navigation buttons to move to the next or previous slide.
**Attributes**
- `to`: this allows you insert a number where to navigate to. The default value for `<p-next>` is `1` and for `<p-back>` is `-1`.
  However, you can also insert an ID of a slide which will be interpreted as a string.
  This way, pressing the button will navigate you to the slide which has this ID.

### `<p-center>`
This tag allows you to present, for instance, a stimulus at the center of the screen. For instance, you might wish to present a fixation cross in the center of the screen for 300 milliseconds:
```html
<p-slide maxms="300">
   <p-center>+</p-center>
</p-slide>
```

### `<p-upload>`
This might be the most important tag of them all. After all, you wish to store your data somewhere.

```html
<p-upload>Upload data</p-upload>
```
**Attributes**
- `format`: Indicate which format the data should be uploaded and stored in (`json` or `csv`). The default is `json`.
- `js`: If you wish to upload your own data object, indicate it here by writing the name of the variable or constant as a string.
  Remember that when uploading a CSV file of your own object, you need to parse the object as a CSV file. To do so, create an object array and then parse it with `pslides.stringifyCSV(myArrayOfObjects)`.
Simply pressing the upload button does not indicate to the client if the upload was successful or is still in progress.
The client will not check the browser console to see if the upload was successful.
This is why you can include a `<p-message>` on the slide (maybe right below the upload button) which indicates the state of the upload to the client.
Simply give the `<p-upload>` button a unique `id` (unique to this element in the entire document). 
```html
<p-upload id="data_upload0" format="csv">Upload data</p-upload>
<p-message for="data_upload0">No upload yet</p-message>
```
When the client clicks on the `<p-upload>` element,
it will message the state of the upload. An error will be written in red font, a successful upload in blue font, and any progress in-between in orange font.

### `<p-download>`
If you are running the experiment offline, debug output files or if you would like to allow clients to download their own data, you can use the `<p-download>` tag.

```html
<p-download>Upload data</p-download>
```
**Attributes**
- `format`: Indicate which format the data should be downloaded as (`json` or `csv`). The default is `json`.
- `js`: If you wish to download a separate object, indicate it here by writing the name of the variable or constant as a string. 
  This string will be evaluated upon button press.
  Remember that when downloading a CSV file of your own object, you need to parse the object as a CSV file. To do so, create an object array and then parse it with `pslides.stringifyCSV(myArrayOfObjects)`.
You can include feedback (error or success) with a `<p-message>` tag which indicates the state of the download to the client.
Simply give the `<p-download>` button a unique `id` (unique to this element in the entire document). 
```html
<p-download id="data_download0" format="csv">Download data</p-download>
<p-message for="data_download0">Not downloaded yet</p-message>
```
When the client clicks on the `<p-download>` element,
it will message the state of the download. An error will be written in red font, a successful upload in blue font, and any progress in-between in orange font.
If you wish to give summary statistics to the participant:
```html
<p-download id="stats_download1" js="userSummary">Download my test performance</p-download>
<p-message for="stats_download1">Not downloaded yet</p-message>
```

### `<p-input>`
Some standard HTML elements like `<input>` do not look particularly nice to use in surveys.
We too often need to program the spacing between input buttons and text or have likert scales. Although not necessary, the `<p-input>` tag is meant to save time in programming.
This element can be used to implement "checkbox" items (for yes/no questions), "radio" items that only allow a single answer (like gender, or highest educational attainment), likert scales or much more.
In the following example for radio button, we ask for people's gender. They can only pick one response (similar to common `<input type="radio">`. 
```html
<p-input type="radio" name="gender">
   <label for="gender_male">I am male.</label>
   <label for="gender_female">I am female.</label>
   <label for="gender_diverse">I am diverse.</label>
</p-input>
```
The attribute `for` in the label will tell PSlides to create an input element:

`<input type="radio" id="gender_male" name="gender">`
The necessary features are implemented in a MutationObserver so that such items could also be added dynamically.
**Attributes**
- `type="checkbox"`: Implement checkboxes. 
- `type="radio"`: Implement radio buttons (only one item can be picked, similar to an old cassette recorder).
- `type="likert"`: Create a likert scale
  - `options`: Quickly implement the likert scale with a number rating
    ```html
	<p>How do you feel right now on a scale of 1-9?</p>
    <p-input type="likert" name="feeling" options="1 2 3 4 5 6 7 8 9"></p-input>
	```
    Options are here space-separated. They can also be semicolon-separated.

### `<p-dragdrop>`
Drag and drop elements within or between containers. For instance, one could sort or rank items.
Here is an example of a `<p-dragdrop>` element with shuffled child elements:
```html
<p-dragdrop id="dragdrop_container" order="shuffle">
   <div name="item_A">Item A</div>
   <div name="item_B" draggable="false">Item B</div>
   <div name="item_C">Item C</div>
   <div name="item_D">Item D</div>
</p-dragdrop>
```
"Item B" cannot be dragged (because of `draggable="false"`) but its order can be affected by dragging and dropping the other items.
**Attributes**
- `import`: Can the `<p-dragdrop>` accept ("import") external draggable elements? It can be "true" if it can or "false" if it cannot.
  The experimenter can also set an element ID or a list of element IDs that the current `<p-dragdrop>` element can import elements from.
- `export`: This is the opposite of the `import` attribute. One can disallow exporting elements to other `<p-dragdrop>` containers by setting `export="false"`.
  One can also decide specifically to which container one could export elements to by creating a list of unique element IDs.
- `intraport`: When the movement of elements within the `<p-dragdrop>` container should be prohibited, one can set `intraport="false"`.
An example where one can drag elements from "bucket_1" to "bucket_2" but *not* vice versa:
```html
<p>This container "bucket_1" can export to "bucket_2":</p>
<p-dragdrop id="bucket_1" export="bucket_2" order="shuffle">
   <div name="item_A">Item A</div>
   <div name="item_B">Item B</div>
   <div name="item_C">Item C</div>
   <div name="item_D">Item D</div>
</p-dragdrop>
<p>This container "bucket_2" can only import items from but not export items to "bucket_1":</p>
<p-dragdrop id="bucket_2" export="false">
   <div name="item_1">Item 1</div>
   <div name="item_2">Item 2</div>
   <div name="item_3">Item 3</div>
</p-dragdrop>
```

### `<p-subjcode>`
If you, for instance, plan to run longitudinal studies, you might want to present participants 
a way to "log in" later on into the experiment. In this case, you might want to present to them
their participant code. You can do so by showing them the `<p-subjcode>` tag.
```html
<p-subjcode></p-subjcode>
```
***Attributes***
- `copyable`: If you simply write the attribute `copyable` without a value, you can provide a 
  button to participants with which they can copy their participant code.
  ```html
  <p-subjcode copyable></p-subjcode>
  ```
  If you set `copyable="false"` or remove the attribute, only the participant's code will be 
  displayed.

### `<p-if> <p-elif> <p-else>`
If you would like to present content depending on previous input or other JavaScript variables,
you can concatinate `<p-if>`, `<p-elif>`, and `<p-else>` similar to any other programming language.
Suppose that you ran a test and estimated the test score using a JavaScript variable.
You could now display different content within the slide depending on a condition attribute `cond`
that accepts JavaScript. Here is an example:
```html
<script>
   let score = 9;
</script>
<p-if cond="typeof score !== 'number' || score < 0">
   <p><b>Come on!</b> Give me an actual score - a positive number!</p>
</p-if>
<p-elif cond="score > 9">
   <p><b>Wow!</b> you had a perfect score!</p>
</p-elif>
<p-elif cond="score > 5">
   <p>Very well done!</p>
</p-elif>
<p-else>
   <p>We must practice some more!</p>
</p-else>
```
You can use `<p-if>`, `<p-elif>`, and `<p-else>` within `<p-slide>` to manage slide contents 
or across many slides to manage which slide the user will see next.

### `<p-while>`
If you have an array over which to loop without repeating the same set of slides over and over again,
you can use a `<p-while>` element. Then define the `cond` attribute to describe under which condition
this while loop will keep executing:
```html
<script>
   let sentence = ["You","can","keep","reading","a","new","word","until","the","sentence","is","over."];
   let Iterator = 0;
</script>
<p-while cond="Iterator < sentence.length>">
   <p-slide maxms="500">
      <p-center jsfill="sentence[Iterator]">No content</p-center>
   </p-slide>
</p-while>
<p-slide>
   <p-center><b>Sentence over.</b></p-center>
</p-slide>
```
We are making use of the attribute `jsfill` in the `<p-center>` element to insert contents 
from the JavaScript array. Every 500 miliseconds, a new word from the sentence will be presented.
When the sentence is over, a bold notice will appear: "Sentence over."
After the sentence has been presented, a bold message will remain on the screen: "Sentence over".

### General attributes
- `jsfill`: This will fill the HTML element with the value of any JavaScript expression provided.
  ```html
  <script>
    let myObject = [1, 2, 3];
  </script>
  <p jsfill="myObject.join(', ')">
     <b>Nothing</b> to see here!
  </p>
  ```
  The upper example would delete anything between the paragraph's opening tag `<p>` and closing tag `</p>` and instead insert "1, 2, 3".
- `idfill`: Upon loading the document, the contents of the element with the referred to `id` will be inserted into this element,
  overwriting any inner HTML it has (above: `<b>Nothing</b> to see here!`).
  This can be useful to prevent reusing HTML code which makes the HTML code easier to read.
- `order`: order at which the child elements are displayed. By default, child elements are displayed sequentially (in the order in which they are written in HTML).
  However, it is also possible to shuffle the child elements by setting `order="shuffle"`:
  ```html
  <p-slide>
     <p-formframe>
       <ul order="shuffle">
          <li>Apples</li>
          <li>Oranges</li>
          <li>Pineapples</li>
       </ul>
     </p-formframe>
  </p-slide>
  ```
  If you would like to pseudoshuffle the elements
  (shuffle without more than __m__ repititions), set `order=pseudoshuffle(m)`. For instance, if you do not wish the `group` of elements to repeat more than 3 times,
  you can set `order=pseudoshuffle(m)`. The groups (categories of elements) can be set with the `group` attribute in child elements.
  ```html
  <p-slide>
     <p-formframe>
        <ul order="pseudoshuffle(2)">
           <li>Apples</li>
           <li group="citrus">Oranges</li>
           <li>Pears</li>
           <li group="citrus">Grapefruit</li>
           <li group="citrus">Lemons</li>
           <li>Pineapples</li>
           <li>Plums</li>
           <li>Pineapples</li>
        </ul>
     </p-formframe>
  </p-slide>
  ```
  Finally, if you do not wish for an item to be shuffled at all, you can set `group="fixed"`. This will fix the element child at the current position.
  This can give you some control to manipulate the position of some items of interest.
### `<meta>` tags
In order to store, and manage meta data, so-called `<meta>` tags are used. These store, for instance, the participant code, 
experimental condition **(currently not fully implemented)**, session, agenda etc. The name attributes of tags which are used by PSlides always begin with `pslides:`.
- `name="pslides:subj"`: A meta tag with this `name` contains the participant's code in the `content` attribute. This will be tracked throughout the experiment and sessions.
- `name="pslides:session"`: A meta tag with this `name` contains the session code. Imagine running a longitudinal study where a participant completes multiple sessions.
  The session code will differ but the subject code will stay the same. The participant needs to see their code and save it somewhere, of course.
- `name="pslides:agenda"`: The contents space-separated URIs which will navigate the client throughout the experiment.
  Include this at the beginning of each experiment (e.g., the information sheet). Every time the user presses the `<p-redirect>` tag, the user will be directed to the next URL.
  This way, you can program multiple tasks and reuse them later on without copying and pasting code. You could also reference someone else's task and would not have to reprogram it yourself.
  Simply include the URL to the task. The agenda will be added to the redirected URL as a __URI parameter__ so that the client can leap from one questionnaire or task to the other.
  If the other document allows uploads, you will have access to the resulting data.
  Make sure to redirect participants to a debriefing or concluding page at the end of the agenda to not confuse the client.
- `name="pslides:cond"`: Choose an experimental condition at the beginning of the experiment. Provide __non-obvious__ options to pick from in the `options` attribute.
  The different options must be separated by space. Here is an example:
  ```html
  <meta name="pslides:cond" options="neutral-left neutral-right">
  ```
  The `content` attribute will be automatically filled by choosing one of the conditions.
  ```html
  <meta name="pslides:cond" options="neutral-left neutral-right" content="neutral-right">
  ```
  If a person redirects to a new task or questionnaire, a __URI parameter__ `cond` will be created.

