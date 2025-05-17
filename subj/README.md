# About

PSlides does not require PHP to run on the server if you run experiments offline. Conditions will be sampled randomly instead of checking the sample of participants, and data can still be downloaded from the broswer.

If you try to exploit the PHP features, you are welcome to use these functionalities too. Make sure to adapt the `pslides.phpSubjPath` in main.js file according to where you will leave the `/subj/` directory on the server. This is where all PHP scripts are located, concerned with storing participant data, starting sessions, checking conditions and so forth.

Currently, data are organized so that there is a user > projects > app > all experiment files. When data get stored, they end up in the user's path.
If you have your own server, then simply create a directory `/u/<my-initials>/<my-project-name>/app/` and fill it up with all experiment files (HTML, CSS, stimuli and so on).
