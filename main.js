
// presurex
//
// To Do: 
//        
// SubjCode code: first check if a URL variable is "?subj=...". If not existent, create the code. Otherwise, there is no continuity between surveys if there are different SubjCodes.
//      
//      
//      X p-timer tag: somewhere on the page <timer></timer>
//      X p-timer attribute: start: time in seconds, eval() --> and save
//      X p-timer attribute: on-expiry: execute javascript in string
//      X p-timer attribute: visible='true', if false --> 
//
//        p-if tag:
//        p-if attribute: cond
//
//        p-elif tag:
//        p-elif attribute: cond: condition that will be evaluated and returns a boolean value (true or false)
//
//        p-else tag: last possible case for a tag
//
//        attribute beforeload: 
//
//        p-slide tag:
//        p-slide attribute: maxms: time limit for a p-slide
//        p-slide attribute: keysnext: Keyboard keys that introduce next p-slide "none", "all", "[32,34]" --> eval
//        p-slide attribute: fullscreen: false (gehe aus dem Vollbildmodus), true (Vollbildmodus)
//  
//      X p-while: for adaptive tests
//      X p-while attribute: crit      --> eval
//
//        var attribute: 
//      
//        general attribute: group: if parent tag is "p-set", 
//                                  it is an item group used for pseudo-randomization.
//        general attribute: required: input, textarea, or select necessary to continue to next page?
//        general attribute: beforeload="name"; 
//                           from input, textarea, select, or var: go backwards from current p-slide and look for name.
//        p-set tag: affects all direct (immediate) children and manages the order of sequences,
//                   can be used to sequence/shuffle slides and 
//        p-set attribute: order: in which order should groups be presented? 
//                                for elements within the p-set group="fixed" -> it will not be affected by the shuffling
//                                "shuffle", just mix up all 
//      X                         "latin" (Latin square),
//      X                         "pseudo(2)" (pseudo-random, "2" --> allow two consecutive repeats of an item of the same group), if no "group" attribute in array's children, random)
//      X p-set attribute: sample: "evenly" / "randomly" (depends on group attribute)
//      X p-set attribute: n: "all"/"1" (or any other number): for between subject-designs; 
//                            the first x number of items will be picked
//                            "n" will decide how often the set is being replicated (if sample='evenly')
//        p-set timeline of rendering = 1. sample and n 2. order.
//      X p-progress tag: show how many more pages/questions to go. <p-progress type='bar'/'count'></p-progress>
//        p-next: button to continue to the next page: insert where? <next-button></next-button>
//        p-back: button to go to the previous page: insert where? <back-button></back-button> 
// before the experiment starts: (on window load)

// deal with sequences: <p-set>

// INSERT: based on previous data (conditions), distribute participants evenly.
// if all conditions have same number, add to a random pot. Otherwise, add to another conditions.
// on each sendOutData(), change the json file
// if file cannot be reached, do it randomly

// first, start the pslides object.
const pslides = {fullscreen: false, data: {}, slides: [], slideTimerTimeout:null, autoplayed:[],
                 slideStartTime: new Date(), slideEndTime: new Date(),
				 messageTexts: {
					"beforeunload": {
						"en":"Are you sure you want to quit? You will <b>not</b> be able to continue with this survey at a later point.",
						"de":"Sind Sie sicher, dass Sie abbrechen möchten? Sie können diese Umfrage danach <b>nicht</b> fortsetzen.",
						"fr":"Êtes-vous sûr de vouloir quitter ? Vous ne pourrez <b>pas</b> poursuivre ce sondage.",
					},
					"missingResponses": {
						"en":"Please fill out all mandatory fields. Then you can continue to the next page.",
						"de":"Bitte füllen Sie alle Pflichtfelder aus. Dann können Sie fortfahren.",
						"fr":"Veuillez remplir tous les champs obligatoires. Vous pourrez ensuite passer à la page suivante.",
					},
					"sendDataLocalToExternal": {
						"en":"You cannot send data to an external server when the current survey is on a local file.\nThe current link starts with \"file://…\" and does not follow the HTTP protocol\n(starting with \"http://…\" or \"https://…\").",
						"de":"Beim Verwenden lokaler Dateien können keine Daten an externe Server gesendet werden.\nDer Link beginnt mit \"file://…\" und entspricht nicht dem HTTP-Protokoll\n(beginnend mit \"http://…\" oder \"https://…\").",
						"fr":"Vous ne pouvez pas envoyer de données à un serveur externe lorsque vous naviguez dans des fichiers locaux.\nLe lien commence par « file://… » et ne suit pas le protocole HTTP (commençant par « http://… » ou « https://… »).",
					},
					"sendDataOnFirstSlide": {
						"en":"You cannot send data on the first slide (<code>&lt;p-slide&gt;</code>) of the page.",
						"de":"Auf der ersten Slide (<code>&lt;p-slide&gt;</code>) der Seite können keine Daten gesendet werden.",
						"fr":"Vous ne pouvez pas envoyer de données sur la première page (<code>&lt;p-slide&gt;</code>) du site.",
					},
					"sendDataError": {
						"en":"An error has occured when trying to upload the data:",
						"de":"Ein Fehler ist beim Hochladen der Daten aufgetreten:",
						"fr":"Une erreur s'est produite lors de la tentative de chargement des données:",
					},
					"RequestNotSent": {
						"en":"Request not sent.",
						"de":"Anfrage nicht gesendet.",
						"fr":"Requête non envoyée …"
					},
					"PreparingRequest": {
						"en":"Preparing request …",
						"de":"Bereite Anfrage vor …",
						"fr":"Préparation de la demande …"
					},
					"WaitingForServer": {
						"en":"Waiting for server to respond …",
						"de":"Warte auf Antwort des Servers …",
						"fr":"En attente de la réponse du serveur …"
					},
					"DownloadingData": {
						"en":"Downloading data …",
						"de":"Lade Daten herunter …",
						"fr":"Téléchargement des données sur l'ordinateur …"
					},
					"UploadingData": {
						"en":"Uploading data …",
						"de":"Lade Daten hoch …",
						"fr":"Téléchargement des données sur le serveur …"
					},
					"ServerProcessingDate": {
						"en":"Server is processing the data …",
						"de":"Server verarbeitet Daten …",
						"fr":"Le serveur traite les données …"
					},
					"BeforeClosingWindow": {
						"en":"Are you sure you want to close the window? All progress will be lost and you will not be able to continue the survey at a later time.",
						"de":"Möchten Sie das Fenster wirklich schließen? Alle Fortschritte gehen verloren und Sie werden die Umfrage nicht fortgesetzen können.",
						"fr":"Êtes-vous sûr de vouloir fermer la fenêtre ? Toute votre progression sera perdue et vous ne pourrez pas reprendre le sondage ultérieurement."
					},
					"UnansweredQuestions": {
						"en":"Please provide an answer to the questions marked in red.",
						"de":"Bitte machen Sie eine Angabe bei den rot markierten Fragen.",
						"fr":"Veuillez répondre aux questions marquées en rouge."
					},
					"Status": {
						"en":"Status",
						"de":"Status",
						"fr":"Statut",
						"zh":"状态"
					},
					"DownloadSuccessful": {
						"en":"Download successful",
						"de":"Herunterladen erfolgreich",
						"fr":"Téléchargement réussi",
						"zh":"下载成功"
					},
					"FindDownload": {
						"en":"You can find the downloaded file in your \"Downloads\" folder.",
						"de":"Sie können die heruntergeladenen Daten im Ordner \"Downloads\" finden.",
						"fr":"Vous trouverez le fichier téléchargé dans votre dossier <p-nobr>« Téléchargements »</p-nobr>.",
						"zh":"您可以在“下载”文件夹中找到下载的文件。"
					}
				 },
				 language: {lang: "en", script: null, region: null},
				 settings: {pointerTemporalResolution: 20},
				 lastSubmission: Number(new Date())*2,
				 key: {down:{t:[],k:[]},up:{t:[],k:[]}}, visibility : {t:[],state:[]},
				 pointer: {t:[],x:[],y:[],f:[],rx:[],ry:[],ang:[],el0:[],el1:[],type:[]}, activePointers: new Map(),
                 nextSlideKeys: [], backSlideKeys: [], slideNumber: 0, isClickedDown: false,
				 serverSubjPath: "access/subj/", serverRootPath: "/u", 
				 eventListeners: {onmousedown:null,onmouseup:null,onmousemove:null,
				                  onkeydown:null,onkeyup:null,
								  onpointermove:null,onpointerdown:null,onpointerup:null,onpointercancel:null,
								  onfullscreenenter:null,onfullscreenexit:null},
				dropIndicator: document.createElement("p-dropindicator")
				};


pslides.setLanguage = function() {
	// match BCP-47 language tag components:
	// - Language: 2-3 lowercase letters
	// - Optional Script: 4 letters, titlecase (first capital, rest lowercase)
	// - Optional Region: 2 uppercase letters or 3 digits
	
	pslides.language.lang = "en";
	let str = document.documentElement.lang;
	if (isEmpty(str)) str = document.body.getAttribute("lang");	
	if (isEmpty(str)) str = navigator.languages[0];	
	let spl = str.replaceAll(/[ \t\n_-]{1,}/g, "-").split("-").filter((x) => x !== "");
	if (spl.length == 0) return;
	pslides.language.lang = spl[0].toLowerCase();
	if (spl.length == 1) return;

	let isScript = true;
	// is it a script?
	if (spl[1].length == 2 && // is it a region?
		spl[1].substring(0,2) == spl[1].substring(0,2).toUpperCase()) {
		pslides.language.region = spl[1];
	} else if (spl[1][0] == spl[1][0].toUpperCase() && // is it a script?
		spl[1].substring(1) == spl[1].substring(1).toLowerCase()) {
		pslides.language.script = spl[1];
		isScript = false;
	}
	
	if (spl.length==2) return;
	
	if (isScript) {
		pslides.language.script = spl[2]
	} else if (spl[2].length == 2) {
		pslides.language.region = spl[2]
	}
}

pslides.printLanguage = function() {
	let res = pslides.language.lang;
	if (!isEmpty(pslides.language.script)) res += "-"+pslides.language.script;
	if (!isEmpty(pslides.language.region)) res += "-"+pslides.language.region;
	return res;
}

// try looking through region and script before going through normal country codes.
pslides.setLanguage();

// define pdata if it hasn't been created yet
//if (typeof pslides.data !== 'object') pslides.data = {};

history.scrollRestoration = "manual";

// window.performance.toJSON()
var outObj = {meta:{}, 
              userAgent: window.navigator.userAgent, url: window.location.href, startTimestamp:String(pslides.slideStartTime),
              maxScreenHeight: window.screen.height, maxScreenWidth: window.screen.availWidth, 
			  colorDepth: window.screen.colorDepth, pixelDepth: window.screen.pixelDepth, 
			  isTouchScreen: ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0),
			  language: window.navigator.language, slides: []}


// get a string which decribes the HTML branch
function currentHTMLbranch() {
	return nestedness(document.querySelector("p-slide[current]"), false)
}


function pushSlide(x={}) {
	outObj.slides.push({slide:outObj.slides.length, fullscreen:null, content:{}, HTMLbranch:currentHTMLbranch(),
					   screen_height: window.screen.availHeight, screen_width: window.screen.availWidth, 
					   screen_orientation: window.screen.orientation.type,
	                   attributes: {fullscreen:false, maxms:Infinity}, custom: {},
					   //pointer: {x:[],y:[],t:[],el0:[],el1:[],type:[],rx:[],ry:[],f:[],rx:[]},
					   key:{down:{k:[],t:[]}, up:{k:[],t:[]}}, ...x})
}


function ifNullStr(obj, str="") {
	var res = str;
	if (typeof obj === "string" || obj instanceof String) {
		res = obj;
	} else if (obj !== null && obj !== undefined) {
		res = str;
	} else if (typeof obj === "object") {
		try {
			res = obj.innerHTML;
		} catch {
			res = str;
		}
	} else {
		res = str;
	}
	return(res);
}

// Escape a string. For example. \" in a string becomes \\\"
function escapeString(str) {
	return stringify(str).replaceAll("\\","\\\\").replaceAll("\"","\\\"")
	          .replaceAll("\t","\\\t").replaceAll("\n","\\\n")
			  .replaceAll("\r","\\\r").replaceAll("\'","\\\'");
}

function stringify(x) {
	var res = "Error: Data could not be rendered.";
	if (typeof x === "undefined") {
		res = "Undefined variable"
	} else if (typeof x === "string") {
		res = x
	} else if (["object","number","boolean"].includes(typeof x)) {
		res = JSON.stringify(x)
	}
	return res;
}

function displayMessage(message, id=null, type=null) {
	type = ifNullStr(type).toLowerCase();
	var query = "p-message[for=\""+escapeString(id)+"\"]";
	if (isEmpty(id) || document.querySelector(query) === null) {
		if (type==="error") {
			console.error(message);
		} else if (type.indexOf("warn")>-1) {
			console.warn(message);
		} else {
			console.log(message);
		}
	} else {
		var d = document.querySelectorAll(query);
		for (var i=0; i<d.length; i++) {
			if (type==="error") {
				d[i].style.color = "#EF0000";
			} else if (type.indexOf("warn")>-1) {
				d[i].style.color = "#FF7700";
			} else {
				d[i].style.color = "#0000EF";
			}
			d[i].innerHTML = message.replaceAll("\n","<br/>");
		}
	}
}

pslides.loadFile = function(filename, attributes={}) {
	if (typeof filename !== "string" || filename.indexOf(".")==-1) {
		throw new Error("Argument \"filename\" must be a valid filename, \""+
		                stringify(filename)+"\" provided.");
	}
	let script = document.location.href, node = null,
		tag = "script", type = "text/javascript", rel = "stylesheet",
		format = filename.split(".").pop().toLowerCase().replaceAll(/[^a-z0-9]/g,"");
	if (document.currentScript !== null) script = document.currentScript.src;
	let src = script.split("/").slice(0, -1).join("/")+"/"+filename;
	
	if (["css","html","xml"].includes(format)) {
		node = document.createElement("link")
		node.setAttribute("href", src)
	} else {
		node = document.createElement("script")
		node.setAttribute("src", src)
	}
	
	if (format === "css") {
		node.setAttribute("rel","stylesheet")
	} else if (format === "js") {
		type = "text/javascript"
	} else if (format === "json") {
		type = "application/json"
	} else if (format==="wasm") {
		type = "application/wasm"
	} else {
		type = "text/"+format
	}
	
	node.setAttribute("type", type)
	for (const [key, value] of Object.entries(attributes)) {
		node.setAttribute(key, stringify(value))
	}
	
	node.setAttribute("crossorigin", "anonymous")
	node.setAttribute("referrerpolicy", "strict-origin-when-cross-origin")
	document.head.appendChild(node)
	console.log("Loading "+format.toUpperCase()+" file \""+filename+"\" from:", src)
	return node;
}

// add "style.css" from the pslides library:
// pslides.loadFile("style.css");

function splitWhitespace(x, ignoreQuotes=true) {
	if (x === undefined || x === null) {
		return null;
	} else if (typeof x !== "string") {
		x = stringify(x);
	}
	
	if (ignoreQuotes) {
		return x.trim().split(/[\s\n\r\t]+/).filter((x) => x !== "");
	} else {
		const result = [];
		let current = '';
		let inQuotes = false;
		let quoteChar = '';
		let escaped = false;
		for (let i = 0; i < x.length; i++) {
			const char = x[i];
			if (escaped) {
				current += char;
				escaped = false;
				continue;
			}
			if (char === '\\') {
				escaped = true;
				current += char;
				continue;
			}
			if (char === '"' || char === "'") {
				if (inQuotes && char === quoteChar) {
					inQuotes = false;
					quoteChar = '';
					continue; // Skip adding the closing quote
				} else if (!inQuotes) {
					inQuotes = true;
					quoteChar = char;
					continue; // Skip adding the opening quote
				}
			}
			if (char.match(/\s/) && !inQuotes) {
				if (current) {
					result.push(current);
					current = '';
				}
				continue;
			}
			current += char;
		}
		if (current) result.push(current);
		return result;
	}
}

function stringifyNodeTag(node) {
	var res  = "<"+node.tagName.toLowerCase(),
		attr = node.attributes;
	for (var i=0; i<attr.length; i++) {
		if (attr[i].value==="") {
			res += " "+attr[i].name
		} else {
			res += " "+attr[i].name+"=\""+escapeString(attr[i].value)+"\""
		}
	}
	res += ">";
	return res;
}

function escapeHTML(str) {
	return str.replaceAll("<","&lt;").replaceAll(">","&gt;");
}

function isDOMElement(obj) {
	return (typeof HTMLElement === "object" ? obj instanceof HTMLElement : //DOM2
		obj && typeof obj === "object" && obj !== null && obj.nodeType === 1 && typeof obj.nodeName==="string"
	);
}

// evaluate a string:
function tryEval(str, at="", ifError=null) {
	var res = null;
	if (typeof at === "string" && at !== "") at = document.getElementById(at);
	try {
		res = eval(str);
		if (isDOMElement(at) && at.id !== "") {
			displayMessage("Successfully evaluated JavaScript fragment at id=\""+
			               escapeString(at.id)+"\".", id=at.id)
		}
		return res;
	} catch(e) {
		if (isDOMElement(at)) {
			// at = " at " + stringifyNodeTag(at)
			displayMessage("Error when evaluating the element where <p-nobr>id=\""+
						   at.id+"\":</p-nobr>\n"+e, id=at.id, type="error")
		} else if (typeof at === "string" && at.trim().length>0) {
			at = " "+at.trim();
		}
		
		if (typeof ifError === "function") {
			return ifError();
		} else if (typeof ifError === "string") {
			console.error("Error when evaluating \""+str+"\""+String(at)+".\n", ifError, "\n", e);
		} else if (![undefined,null,""].includes(ifError)) {
			console.error("Error when evaluating \""+str+"\""+String(at)+".\n", stringify(ifError), "\n", e);
		} else {
			console.error("Error when evaluating \""+str+"\""+String(at)+".\n", e);
		}
	}
}

function evalScript(node) {
	displayMessage("Could not evaluate \"jsfill\" in element with <p-nobr>id=\""+
						   node.id+"\":</p-nobr>\n"+e, id=node.id, type="error")
}

// split string into an array: split by ";", otherwise whitespace
function stringToArray(value) {
	let res = null, n = null;
	if (isEmpty(value)) return null;
	
	value = value.trim();
	n = value.match(/[0-9]+/g);
	
	if (value.indexOf(";")>-1) {
		res = value.split(";")
		for (val of res) val = val.trim();
	} else if (value.match(/[ \n\t]/g)!== null) {
		res = splitWhitespace(value, ignoreQuotes=true);
	} else if (n!==null) {
		n = Number(n.join(""))
		if (!isNaN(Number(n)) && n > 0) {
			res = rangeIndex(1, n);
		}
	}
	//console.log("value: ", value)
	return res
}

function unpackPInput(node) {
	console.log("unpackPInput() called.")
	/*
		rendered on document load.
		
		// subj:
		<p-input type="subj" name="subject-code"></p-input>
		
		// Radio:
		<p-input type="radio" name="question_name" js=""><label for="ID"></label>...</p-input>
		
		// Likert scale:
		<p-input type="likert" name="" options="" n=""></p-input> // js are the labels, overwrites steps
		
		// Checkbox:
		<p-input type="checkbox" for="" name=""></p-input>
		// also multiple check
		                     Î
		<label></label>     /|\ --> label (each row)
		<p-mold spots="1"> //|\\ anything in a mold could be picked up.
	*/
	if (!isDOMElement(node)) return; // node.querySelector("input")!==null
		
	let arr = [], newId = "", inner="",
		name    = escapeString(ifNullStr(node.getAttribute("name"))), 
		pid     = node.getAttribute("for"), // for attribute
		type    = ifNullStr(node.getAttribute("type")).trim().toLowerCase(),
		forStr  = stringifyHTMLAttribute("for", pid),
		nameStr = stringifyHTMLAttribute("name", name),
		idStr   = stringifyHTMLAttribute("id", pid),
		req     = "";
	
	if (node.getAttribute("required") !== null) req = " required";
	
	if (type==="checkbox" && node.querySelector("label")===null) {
		node.innerHTML = "<label"+forStr+nameStr+">"+
							"<input type=\"checkbox\""+nameStr+idStr+req+"/><span>"+node.innerHTML+"</span>"+
						 "</label>";
	} else if (type==="checkbox") {
		arr = node.querySelectorAll("label");
		for (var i=0;i<arr.length;i++) {
			pid  = arr[i].getAttribute("for");
			if ([undefined,null,""].includes(pid)) pid = name+":"+i;
			arr[i].innerHTML = "<input type='checkbox'"+nameStr+stringifyHTMLAttribute("id", pid)+req+"/>"+
							   "<span>"+arr[i].innerHTML+"</span>"
		}
	} else if (type==="radio") {
		arr = node.querySelectorAll("label"); //////////////////////////// What if someone forgot to set an ID?
		for (var i=0;i<arr.length;i++) {
			arr[i].setAttribute("name", name);
			pid = arr[i].getAttribute("for")
			if ([undefined,null,""].includes(pid)) {
				pid = name+":"+arr[i].innerText
					  .replaceAll(/[\/\\\$\%\}\{\#\+\~\*\§\<\&\)\(\=\>\|\"\!\^\°\?\`\_\-\.\:\;\']/g," ")
					  .trim().replaceAll(/[\s\n\r\t]+/g, "_");
			}
			arr[i].innerHTML = "<input type='radio'"+nameStr+stringifyHTMLAttribute("id", pid)+req+"/>"+
							   "<span>"+arr[i].innerHTML+"</span>"
		}
	} else if (type==="likert" && node.querySelector("label") === null) {
		
		// label
		
		var options = stringToArray(node.getAttribute("options"))
		
		if (options !== null) {
			for (var i=0; i<options.length; i++) {
				newId = name+":"+escapeString(options[i])
						.replaceAll(/[\/\\\$\%\}\{\#\+\~\*\§\<\&\)\(\=\>\|\"\!\^\°\?\`\_\-\.\:\;\']/g," ")
						.trim().replaceAll(/[\s\n\r\t]+/g, "_");
				inner += "<label for=\""+newId+"\">"+
							 "<input type='radio' id=\""+newId+"\""+nameStr+req+"/>"+
							 "<span>"+options[i]+"</span>"+
						 "</label>"
			}
		}
		node.innerHTML = inner;
	} else if (type === "subj") {
		//node.setAttribute("contenteditable","true")
		let label = node.querySelector("label")
		if (label===null) { 
			label = document.createElement("label");
			if (![undefined, null, ""].includes(pid)) label.setAttribute("for", pid);
			label.innerHTML = node.innerHTML
			node.appendChild(label);
		}
		if (label.getAttribute("for")!==null) label.setAttribute("for",pid);
		idStr = stringifyHTMLAttribute("id", label.getAttribute("for"))
		//console.log("idStr: ", idStr)
		label.innerHTML = label.innerHTML+"<input type=\"text\""+idStr+"/>"
		label.querySelector("input[type=text]").addEventListener("keyup", (event) => {
			let textInput = event.target.value
			                     .toUpperCase().replace(/[^A-Z0-9]/g, "-").replace(/[-]{2,}/g, "-");
			let textInputSplit = textInput.split("-");
			textInput = textInputSplit.slice(0,-1).concat(textInputSplit.slice(-1)[0].match(/.{1,3}/g)).join("-")
			event.target.value = textInput;
			
			// Save the input subject code?
			if (textInput.split("-").length<3) { // change back to original subj code.
				textInput = outObj.meta.origSubjCode;
			}
			
			// Change subject code in the <head> and outObj:
			outObj.meta.subj = textInput;			
			let metaSubj = document.head.querySelector("[name='pslides:subj']");
			if (metaSubj !== null) {
				metaSubj.setAttribute("content", textInput)
			}
			// setMetaElement(name="subj", content=); // will block changing subject code
		});
	}
}

// Handle p-next, p-back, p-exit
function unpackSlideNavigation(node) {
	var empty = node.innerHTML.trim() === "" && node.className=="", 
		url   = window.location.origin+window.location.pathname,
		urlq  = window.location.search,
		moreclick = node.getAttribute("onclick")+";";
	if (node.getAttribute("href") !== null) {
		var urls = splitWhitespace(node.getAttribute("href"))
		url = urls[Math.floor(Math.random() * urls.length)]
		url = url + urlq.replace("?","&");
	}
	
	/*
	var send = node.getAttribute("send");
	if (send !== null && send.trim() === "") {
		moreclick += "sendOutData(element=this);";
	} else if (send !== null && send.trim() !== "") {
		var format = "";
		if (![null,""].includes(node.getAttribute("format"))) {
			format = ","+node.getAttribute("format");
		}
		moreclick += "sendOutData("+send+",element=this"+format+");";
	}*/
	if (node.tagName === "P-NEXT")  {
		if (empty) node.innerHTML = "&gt;&gt;&gt;";
	} else if (node.tagName === "P-BACK") {
		if (empty) node.innerHTML = "&lt;&lt;&lt;";
	} else if (node.tagName === "P-EXIT") {
		if (empty) node.innerHTML = "&nbsp;&nbsp;x&nbsp;&nbsp;";
		//node.setAttribute("onclick", moreclick+"window.location.href=\""+url+"\";")
	} else if (node.tagName === "P-REDIRECT") {
		if (empty) node.innerHTML = "<svg height='35px' width='35px' viewBox='0 0 16 16' xmlns='http://www.w3.org/2000/svg' fill='none'><path fill='black' fill-rule='evenodd' d='M8 3.517a1 1 0 011.62-.784l5.348 4.233a1 1 0 010 1.568l-5.347 4.233A1 1 0 018 11.983v-1.545c-.76-.043-1.484.003-2.254.218-.994.279-2.118.857-3.506 1.99a.993.993 0 01-1.129.096.962.962 0 01-.445-1.099c.415-1.5 1.425-3.141 2.808-4.412C4.69 6.114 6.244 5.241 8 5.042V3.517zm1.5 1.034v1.2a.75.75 0 01-.75.75c-1.586 0-3.066.738-4.261 1.835a8.996 8.996 0 00-1.635 2.014c.878-.552 1.695-.916 2.488-1.138 1.247-.35 2.377-.33 3.49-.207a.75.75 0 01.668.745v1.2l4.042-3.2L9.5 4.55z' clip-rule='evenodd'/></svg>"
	}
}



function unpackDataid(node=document) {
	// download csv file onto the html
	
	// fill in the csv files
	var d = document.querySelectorAll("p-set[dataid],p-template");
	for (var i=0; i<d.length; i++) {
		var template = d[i].innerHTML, res = "", data = "";
		var delim = d[i].getAttribute("delim"); 
			if (delim===null) delim = "{{ }}"; delim = splitWhitespace(delim.trim())
				
		var dataid = ifNullStr(d[i].getAttribute("dataid"));
		if (dataid !== "") { // fill the template with data from p-data
			data = document.getElementById(dataid);
			content = pslides.data[dataid] // data.innerHTML // the content should be saved to a JS object!
			var format = getFormatAttribute(d[i])[0];
			
			// var format = dataid.substring(dataid.lastIndexOf("."),dataid.length).toLowerCase();
			// fetch(dataid).then((response) => response.text()).then((text) => {data = text});
			
			if (content !== undefined && ["json","csv","tsv"].includes(format)) {
				for (var j=0;j<content.length;j++) { // over j rows
					var current_template = template
					for (let k in content[j]) { // over k columns
						if (Array.isArray(content[j][k]) || typeof content[j][k] === 'object') {
							current_template = current_template.replaceAll(delim[0]+k+delim[1], stringify(content[j][k]));
						} else {
							current_template = current_template.replaceAll(delim[0]+k+delim[1], String(content[j][k]));
						}
					}
					res += current_template;
				}
			} else if (![undefined,null].includes(content)) {
				if (Array.isArray(content)) {
					for (var j=0;j<content.length;j++) { // over j rows
						var current_template = template
							current_template = current_template.replace(delim[0]+"i"+delim[1], stringify(content[j][k]))
						res += current_template;
					}
				}
			}
			d[i].innerHTML = res;
		}
	}
}



async function unpackPData(node) {
	var src    = node.getAttribute("src"),
		onld   = node.getAttribute("onload"),
		key    = ifNullStr(node.getAttribute("id")),
		format = getFormatAttribute(node)[0];
	
	if (src !== null && src.trim() !== "") {
		console.log("Fetching data for "+stringifyNodeTag(node)+" …")
		var str = await getData(src);
	} else {
		var str = node.textContent.trim(); // previously used innerHTML!
	}
	
	// determine the format of the src
	if (format==="" && src !== null && src.lastIndexOf("/") < src.lastIndexOf("\.") && 
		src.lastIndexOf("\.")+1 !== src.lengh) {
		format = src.substring(src.lastIndexOf("\.")+1, src.lengh)
	}
	
	// Now go through the formats TSV, CSV and JSON
	if (["csv","tsv"].includes(format) && pslides.data[key] === undefined) {
		if (format === "tsv") {
			pslides.data[key] = CSVToArray(str, "\t");
		} else if (format === "csv") {
			let sep = 
			pslides.data[key] = CSVToArray(str, ",");
		}
		var header = pslides.data[key][0], pjson = [], temp = {};
		pslides.data[key].shift();
		for (var row=0;row<pslides.data[key].length;row++) {
			for (col=0;col<pslides.data[key][row].length;col++) {
				temp[header[col]] = pslides.data[key][row][col];
			}
			pjson.push(temp); temp = {};
		}
		pslides.data[key] = pjson;
	} else if (format === "json" && pslides.data[key] === undefined) {
		pslides.data[key] = JSON.parse(str);
	} else if (pslides.data[key] === undefined) {
		pslides.data[key] = str.trim().split("\n");
	}
	
	// order arguments
	var order = node.getAttribute("order"), groups = node.getAttribute("groups");
	if (order !== null && order.indexOf("shuffle")>-1 && Array.isArray(pslides.data[key])) {
		var garr = []; for (var j=0;j<pslides.data[key].length;j++) garr.push(pslides.data[key][j][groups]);
		//console.log("garr:\n",garr);
		pslides.data[key] = shuffleArray(pslides.data[key], garr)
		if (order.indexOf("pseudoshuffle")>-1) {
			var tol = 2;
			if (order.lastIndexOf(")") > -1) {
				tol = tryEval(order.substring(order.indexOf("(")+1,order.lastIndexOf(")")));
				//console.error("tol: ", tol);
			}
			garr = []; for (var j=0;j<pslides.data[key].length;j++) garr.push(pslides.data[key][j][groups]);
			pslides.data[key] = pseudoOrderArray(array=pslides.data[key], group=garr, tolerance=tol)
		}
	}
	
	// number of items
	var n = tryEval(node.getAttribute("n"), at=node,
					ifError="when evaluating the Attribute \"n\"");
	if (typeof n !== "number") n = -1;
	if (n >= 0) pslides.data[key] = pslides.data[key].slice(0, Math.floor(n));
	
	// now execute onload:
	if (onld !== null && onld.trim() !== "") {
		console.warn("!!! now evaluating \""+onld+";\"");
		setTimeout(function(){tryEval(onld+";", at=node)},10);
	}
	
	// Call handleDataid here!!!
	//handleDataid(node=document)
}




///////////////////////////////////////////////// New mutationObserver!
	
	pslides.pushUpdate = function(node=document.documentElement) {
		let newNode = node.cloneNode(true);
		node.replaceWith(newNode);
	}
	
	function unpackIdFill(node) {
		const id = node.getAttribute("idfill"),
			  idnode = document.getElementById(id);
		if (idnode === null) {
			console.warn("Could not fill the content of attribute \"idfill\" "+
						 "because an element of id=\""+id+"\" does not exist.");
			return;
		}
		console.log("called unpackIdFill().")
		const clone = idnode.cloneNode(true);
		// console.log("idToIdFill", clone.innerHTML)
		clone.querySelectorAll("[id]").forEach(el => el.removeAttribute("id"));
		// console.log("idToIdFill", clone.innerHTML)
		node.innerHTML = clone.innerHTML;
	}


/////////////////////////////////////////////////////////////////
//                Drag & Drop
/////////////////////////////////////////////////////////////////

function handleDragStart(e) {
	if (isDOMElement(pslides.dropIndicator)) {
		pslides.dropIndicator.style.width = "0px";
	}
	// Private function: adapt the width and height:
	function shapeDropindicator(event) {
		if (!isDOMElement(pslides.dropIndicator)) {
			pslides.dropIndicator = document.createElement("p-dropindicator")
		}
		// resize the dropindicator by editing the style:
		let elRect = event.target.getBoundingClientRect();
		let style = window.getComputedStyle(event.target);
		
		let marginX = parseFloat(style.width) + parseFloat(style.marginLeft) + parseFloat(style.marginRight)
		let marginY = parseFloat(style.height) - parseFloat(style.marginTop) - parseFloat(style.marginBottom)
		if (["col","column"].includes(event.target.parentElement.getAttribute("layout"))) {
			marginY = parseFloat(style.height) //+ parseFloat(style.marginTop) + parseFloat(style.marginBottom)
		}
		pslides.dropIndicator.style.height        = marginY+"px";
		pslides.dropIndicator.style.maxHeight     = marginY+"px";
		pslides.dropIndicator.style.width         = marginX+"px";
		pslides.dropIndicator.style.maxWidth      = marginX+"px";
		pslides.dropIndicator.style.borderRadius  = style.borderRadius;
	}
	shapeDropindicator(e);
		
	// element style:
	let elRect   = e.target.getBoundingClientRect();
	let elHeight = elRect.height //- elStyle.marginTop  - elStyle.marginBottom;
	let elWidth  = elRect.width  //- elStyle.marginLeft - elStyle.marginRight;
		
	if (["IMG","SVG","CANVAS"].includes(e.target.tagName)) {
		e.dataTransfer.setDragImage(e.target, elWidth/2, elHeight/2);
	}
	
	e.dataTransfer.setData("text/html", e.target.innerHTML);
	e.dataTransfer.setData("text/html", e.target.innerHTML);
	e.target.setAttribute("dragging",""); // left-behind ghost
	e.dataTransfer.effectAllowed = "move";
	
	setTimeout(function() {
		e.target.style.display = "none"
	}, 2)
}


function handleDragEnd(e) {
	e.target.removeAttribute("dragging");
	if (pslides.dropIndicator !== null && pslides.dropIndicator.parentNode) {
		pslides.dropIndicator.parentNode.removeChild(pslides.dropIndicator);
	}
	e.target.style.display = "";
}

function handleDragOver(e) {
	
	// private function to get the coordinates of the element's center
	function elementCenterCoor(node) {
		let rect = node.getBoundingClientRect();
		return {x: Math.round((rect.left+rect.right)/2), y: Math.round((rect.top+rect.bottom)/2)};
	}
	
	// private function to compute the Euclidian distance
	function coorDist(coor1, coor2) {
		return Math.pow(coor1.x - coor2.x, 2) + Math.pow(coor1.y - coor2.y, 2);
	}
	
	e.preventDefault();
	e.dataTransfer.dropEffect = "move";

	const container = e.currentTarget;
	const draggedItem = document.querySelector("p-dragdrop>[dragging]");
	const layout = container.getAttribute("layout");
	const isHorizontal = [null,"","row","inline","inline-block"].includes(layout);
	//const items = Array.from(container.querySelectorAll(':scope>:not([dragging])'));
	const items = container.querySelectorAll(":scope>:not([dragging])");
	//console.log("items:\n", items);
	// if nothing is in the container:
	if (items.length === 0) {
		container.appendChild(pslides.dropIndicator);
		return;
	}
	
	const mouseX = e.clientX;
	const mouseY = e.clientY;
	const hoveredElement = document.elementFromPoint(mouseX, mouseY);
		
	maxdims = {left:Infinity, right:-Infinity, top:Infinity, bottom:-Infinity}
	items.forEach(item => {
		const rectIt = item.getBoundingClientRect();
		maxdims.left    = Math.min(maxdims.left,   rectIt.left)
		maxdims.top     = Math.min(maxdims.top,    rectIt.top)
		maxdims.right   = Math.max(maxdims.right,  rectIt.right)
		maxdims.bottom  = Math.max(maxdims.bottom, rectIt.bottom)
	})
	
	// first, only determine if 
	if (draggedItem === null) return;
	if (hoveredElement === pslides.dropIndicator) return;
	let targetItem = null;
	
	// Now we are within the dragdrop box.
	// get target item:
	if (draggedItem === hoveredElement) {
		pslides.dropIndicator.remove();
	} else if (( isHorizontal && mouseX < maxdims.left) || 
		       (!isHorizontal && mouseY < maxdims.top )) {
		container.insertBefore(pslides.dropIndicator, items[0]);
		//console.log("further from the beginning")
	} else if (( isHorizontal && mouseX > maxdims.right) ||
	           (!isHorizontal && mouseY > maxdims.bottom)) {
		container.appendChild(pslides.dropIndicator);
		//console.log("further from the end")
	} else if (!isHorizontal) {
		let minDist = Infinity, elCenter = null, dist = Infinity; 
		for (var i=0; i<items.length; i++) {
			elCenter = items[i].getBoundingClientRect();
			dist = Math.abs(mouseY - (elCenter.top + elCenter.bottom) / 2);
			if (dist < minDist) {
				minDist = dist;
				targetItem = items[i];
			}
		}
		
		// If the mouse is further than the last item: 
		let lastRect = items[items.length - 1].getBoundingClientRect();
		if (mouseY > (lastRect.top + lastRect.bottom) / 2) {
			container.appendChild(pslides.dropIndicator);
		} else {
			container.insertBefore(pslides.dropIndicator, targetItem);
		}
	} else {
		let minDist = Infinity; 
		items.forEach(item => {
			const dist = coorDist(elementCenterCoor(item), 
			                      {x:mouseX, y:mouseY});
			if (dist < minDist) {
				minDist = dist;
				targetItem = item;
			}
		});
		
		// If the mouse is further than the last item: 
		let lastRect = items[items.length - 1].getBoundingClientRect();
		let edgeDist = coorDist({x: lastRect.right, y: (lastRect.top+lastRect.bottom)/2}, 
		                        {x:mouseX, y:mouseY})
		if (edgeDist < minDist) {
			container.appendChild(pslides.dropIndicator);
		} else {
			container.insertBefore(pslides.dropIndicator, targetItem);
		}
	}
}

function handleDrop(e) {
	e.preventDefault();
	const hoveredElement = document.elementFromPoint(e.clientX, e.clientY);
	const draggedItem = document.querySelector("p-dragdrop>[dragging]");
	if (!isDOMElement(pslides.dropIndicator) || 
	    pslides.dropIndicator.style.display == "none" || 
		hoveredElement === draggedItem) {
		return;
	}
	
	if (!isDOMElement(draggedItem)) {
		console.error("handleDrop(): The dragged item is not a DOM element.");
		return;
	}
	
	const container = e.currentTarget;
	//const items = Array.from(container.querySelectorAll(':not([dragging])'));
	/*if (container.querySelector(":not([dragging])") !== null && 
	    draggedItem.parentElement === container) {
		if (pslides.dropIndicator.parentNode) {
			pslides.dropIndicator.parentNode.removeChild(pslides.dropIndicator);
		}
		return;
	}*/
	
	/*
	let newItem = draggedItem;
	if (draggedItem.parentElement !== container) {
		newItem = document.createElement(draggedItem.tagName);
		//newItem = draggedItem.cloneNode(true);
		
		// copy all attributes:
		[...draggedItem.attributes].forEach(
			attr => { newItem.setAttribute(attr.nodeName, attr.nodeValue) }
		)
		//newItem.className = `drag-item ${container.classList.contains('main-container') ? 'main-container' : 'bucket-container'} inserted`;
		newItem.removeAttribute("dragging")
		newItem.style.display = "";
		newItem.setAttribute("inserted","")
		newItem.innerHTML = draggedItem.innerHTML;
		newItem.draggable = true;
		newItem.addEventListener("dragstart", handleDragStart);
		newItem.addEventListener("dragend", handleDragEnd);
		draggedItem.remove();
	}
	
	// Replace dropIndicator with newItem
	if (pslides.dropIndicator.parentNode === container) {
		container.replaceChild(newItem, pslides.dropIndicator);
	} else {
		container.appendChild(newItem);
	}
	*/
	
	
	//////////////////////////////////////////
	// NEW ADDITION (Can we replace all the code above?)
	pslides.dropIndicator.parentElement.insertBefore(draggedItem, pslides.dropIndicator); 
	pslides.dropIndicator.parentNode.removeChild(pslides.dropIndicator);
	draggedItem.addEventListener("dragstart", handleDragStart);
	draggedItem.addEventListener("dragend", handleDragEnd);
	///////////////////////////////////
	
	// Remove inserted attribute after animation
	/*setTimeout(() => {
		newItem.removeAttribute('inserted');
	}, 30);*/
}






/////////////////////////////////////////////////////////////////
//                Note listeners
/////////////////////////////////////////////////////////////////
	
	// CSS match: function(node)
	pslides.nodeListeners = {
		"p-input": unpackPInput,
		"p-upload,p-download": function (node) {
			var empty = node.innerHTML.trim() === "";	
			if (empty && node.tagName==="P-DOWNLOAD") {
				node.innerHTML = "&nbsp;<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 29 32' height='2em' width='2em'>"+
					"<g xmlns='http://www.w3.org/2000/svg' transform='matrix(-1 0 0 -1 30 32)'>"+
					"<path data-name='Path 4' d='M28,14H23.98A1.979,1.979,0,0,0,22,15.98v.04A1.979,1.979,0,0,0,23.98,18H25a1,1,0,0,1,1,1v8a1,1,0,0,1-1,1H7a1,1,0,0,1-1-1V19a1,1,0,0,1,1-1H8.02A1.979,1.979,0,0,0,10,16.02v-.04A1.979,1.979,0,0,0,8.02,14H4a2,2,0,0,0-2,2V30a2,2,0,0,0,2,2H28a2,2,0,0,0,2-2V16A2,2,0,0,0,28,14Z' fill='#000000' fill-rule='evenodd' />"+
					"<path data-name='Path 5' d='M11.413,9.387,14,6.754V23a1,1,0,0,0,1,1h2a1,1,0,0,0,1-1V7.057l.26.042L20.587,9.4a2.017,2.017,0,0,0,2.833,0,1.969,1.969,0,0,0,0-2.807L17.346.581a2.017,2.017,0,0,0-2.833,0l-5.934,6a1.97,1.97,0,0,0,0,2.806A2.016,2.016,0,0,0,11.413,9.387Z' fill='#000000' fill-rule='evenodd' />"+
					"</g></svg>&nbsp;";
			} else if (empty && node.tagName==="P-UPLOAD") {
				node.innerHTML = "&nbsp;<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' height='2em' width='2em'>"+
					"<path data-name='Path 4' d='M28,14H23.98A1.979,1.979,0,0,0,22,15.98v.04A1.979,1.979,0,0,0,23.98,18H25a1,1,0,0,1,1,1v8a1,1,0,0,1-1,1H7a1,1,0,0,1-1-1V19a1,1,0,0,1,1-1H8.02A1.979,1.979,0,0,0,10,16.02v-.04A1.979,1.979,0,0,0,8.02,14H4a2,2,0,0,0-2,2V30a2,2,0,0,0,2,2H28a2,2,0,0,0,2-2V16A2,2,0,0,0,28,14Z' fill='#000000' fill-rule='evenodd' />"+
					"<path data-name='Path 5' d='M11.413,9.387,14,6.754V23a1,1,0,0,0,1,1h2a1,1,0,0,0,1-1V7.057l.26.042L20.587,9.4a2.017,2.017,0,0,0,2.833,0,1.969,1.969,0,0,0,0-2.807L17.346.581a2.017,2.017,0,0,0-2.833,0l-5.934,6a1.97,1.97,0,0,0,0,2.806A2.016,2.016,0,0,0,11.413,9.387Z' fill='#000000' fill-rule='evenodd' />"+
					"</svg>&nbsp;";
			}
		},
		"p-next,p-back,p-exit": unpackSlideNavigation,
		"p-data[src]":unpackPData,
		"[id]": function(node) {
			// node = document.getElementById("button_template"); updateIdFill(node)
			
			const id = node.id;
			if (isEmpty(id)) return;
			// console.log("Evaluated idfills for id=\""+id+"\"");
			const idfills = document.querySelectorAll("[idfill=\""+id+"\"]"),
				  clone   = node.cloneNode(true);
			
			console.log("idfills: ", idfills);
			// remove IDs from elements to prevent duplicate IDs:
			clone.querySelectorAll("[id]").forEach(el => el.removeAttribute("id"));
			// console.log("clone.innerHTML:", clone.innerHTML)
			for (idfill of idfills) unpackIdFill(idfill); // idfill.innerHTML = clone.innerHTML;
		},
		"[idfill]": unpackIdFill,
		"[order=shuffle]": handlePSet,
		"[src]:not(p-data,audio,embed,iframe,img,input[type=image],script,source,track,video)": function(node) {
			// if file:// protocol, introduce an iframe,
			
			// fetch text data and append the content to the node.
			
			// if in http:// or https:// protocol, load into the object;
			// for p-data, use a template tag
			
			// after this, always check if the object has an id and if the idfill needs to be updated.
		},
		"p-dragdrop": function(node) {
			let ch = node.children
			node.addEventListener("dragover", handleDragOver);
			node.addEventListener("drop", handleDrop);
			node.addEventListener("dragenter", e => e.preventDefault());
			for (var i=0; i<ch.length; i++) {
				ch[i].addEventListener("dragstart", handleDragStart);
				ch[i].addEventListener("dragend", handleDragEnd);
			}
		}
	}
	
	pslides.mutationObserver = new MutationObserver((mutations, obs) => {
		for (const mutation of mutations) {
			// Only care about added nodes
			if (mutation.addedNodes.length === 0) continue;
			for (const node of mutation.addedNodes) {
				
				// skip text, comment, etc.:
				if (!(node instanceof Element)) continue; 
				
				// Now check the node and execute function:
				for (const [key, func] of Object.entries(pslides.nodeListeners)) {
					if (node.matches(key)) {
						// console.log("mutated node:\n", node)
						func(node);
					}
				}
				
				// Also check any descendants of the added node
				for (const [key, func] of Object.entries(pslides.nodeListeners)) {
					const ds = node.querySelectorAll(key)
					for (d of ds) {
						if (node.matches(key)) {
							// console.log("mutated descendant:\n", node)
							func(d);
						}
					}
				}
			}
		}
	});

///////////////////////////////////////////////// New mutationObserver above!


function parse(str) {
	var res = null;
	try {
		res = JSON.parse(str)
	} catch {
		try {
			res = eval(str+";");
		} catch {
			res = str
		}
	}
	return res;
}

function getFormatAttribute(node) {
	var format = node.getAttribute("format");
	if ([undefined,null].includes(format)) format = "json";
	format = format.trim().toLowerCase().replaceAll(" ",".").split(".");
	return format;
}

// shuffle an p-set
function shuffle(x) {
	var j, b, i;
	for (i = x.length - 1; i > 0; i--) {
		j = Math.floor(Math.random() * (i + 1));
		b = x[i]; x[i] = x[j]; x[j] = b;
	}
	return x;
}

function swapNodes(node1, node2) {
	var clonedNode1 = node1.cloneNode(true);
    var clonedNode2 = node2.cloneNode(true);
	node1.replaceWith(clonedNode2);
	node2.replaceWith(clonedNode1);    
}

function rangeIndex(start=0, end) {
	if (start > end) {var end2 = end; end = start; start = end2}
	if (start < 0) start = 0; if (end < 0) end = 0;
	var res = [];
    for (var i=start;i<=end;i++) {res.push(i)}
	return(res)
}


// Randomize array in-place using Durstenfeld shuffle algorithm
function shuffleArray(x, groups=null) {
	// var x = [1,2,13,4,15,6,7,8], groups = ["a","a","fixed","a","fixed","a","b","b"];
	var k = Object.keys(x);
	
	function allIndices(x, val) {
		var indices = [], i = -1;
		while ((i = x.indexOf(val, i+1)) != -1){
			indices.push(i);
		}
		return indices;
	}
	
	
	function copy(obj) {
		return(JSON.parse(JSON.stringify(obj)))
	}
	
	
	// an item will be removed from an array (once)
	function removeItemOnce(arr, value) {
		var index = arr.indexOf(value);
		if (index > -1) arr.splice(index, 1);
		return arr;
	}
	
	if (groups!==null && groups.length===x.length) {
		var gi = allIndices(groups, "fixed")
		for (var i=0;i<gi.length;i++) k = removeItemOnce(k, String(gi[i]));
	}
	var kr = copy(k);
	for (var i=kr.length-1;i>0;i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = kr[i]; kr[i] = kr[j]; kr[j] = temp;
    }
	var res = copy(x);
	for (var i=0;i<k.length;i++) res[k[i]] = x[kr[i]];
	return res;
}


function shuffleSeq(node) { // Fisher–Yates shuffle	
	var ch = node.querySelectorAll(":scope > :not([group='fixed'])")
	var unfixed = rangeIndex(0, ch.length-1)
	
	// Shuffle the array
	unfixed_shuffled = shuffleArray(JSON.parse(JSON.stringify(unfixed)));
	
	var past_swaps = []
	// there should be a function to prevent [0, 1] --> [1, 0] from staying unchanged
	// because otherwise, e.g., an array of 2 can never get shuffled.
	for (var i=0; i < unfixed.length; i++) {
		if (unfixed[i] !== unfixed_shuffled[i] && 
		    !past_swaps.includes(String(unfixed_shuffled[i])+" "+String(unfixed[i])) ) {
			swapNodes(ch[unfixed[i]], ch[unfixed_shuffled[i]]);
			past_swaps.push(String(unfixed[i])+" "+String(unfixed_shuffled[i]));
		}
		ch = node.querySelectorAll(":scope > :not([group='fixed'])");
	}
}

pslides.shuffle = function(x, groups=null) {
	if (isDOMElement(x)) {
		shuffleSeq(x);
		return x.children;
	} else if (Array.isArray(x)) {
		return shuffleArray(x, groups=groups)
	}
}

// get unique values
function unique(x) {
	function onlyUnique(value, index, array) {return array.indexOf(value) === index};
	return x.filter(onlyUnique);
}

// returns the group of the previous 
function previousGroups(nodeList, index, tol=1) {
	var res = [], indices = rangeIndex(index - tol, index);
	for (let i of indices) {res.push(nodeList[i].getAttribute("group"))}
	return(res)
}

function pseudoShuffleSeq(node, tolerance=1, preshuffle=true) {
	// console.log(preshuffle)
	if (preshuffle) shuffleSeq(node);
	
	// node = document.getElementById("pseudo")
	var ch = node.querySelectorAll(":scope > :not([group='fixed'])") 
	//var ch = node.querySelectorAll(":not([group='fixed'])") 
	// Rearrange items to avoid same group neighbors:
	for (rep=0; rep<2; rep++) {
		for (var i=1;i<ch.length;i++) {
			if (unique(previousGroups(ch,i,tolerance)).length === 1) {
				// Find a different group item to swap
				for (var j=i+1; j < 2*ch.length-2; j++) {
					var jmod = j % ch.length;
					if (ch[jmod].getAttribute("group") !== ch[i].getAttribute("group")) {
						swapNodes(ch[i], ch[jmod]);
						//console.log(previousGroups(ch, i, tolerance));
						break; // Swap the elements
					}
				}
			}
			if (unique(previousGroups(ch,i,tolerance)).length === 1) {
				console.error("Permutation Failed");
			} else {
				console.error("Permutation Failed");
			}
			ch = node.querySelectorAll(":scope > :not([group='fixed'])");
			//ch = node.querySelectorAll(":not([group='fixed'])");
		}
	}
	// previousGroups(document.querySelectorAll("p-set[name='nct_num']>p-set"),276,276)
	return ch;
}

// pseudo order an array: rearrange it so that the same group doesn't follow 'tolerance' times after another
function pseudoOrderArray(array, group, tolerance=1) {
	// Rearrange items to avoid same group neighbors:
	//var array = [0,1,2,3,4,5,6,7,8,9], group = ["b","b","a","a","b","b","b","fixed","a","a"], tolerance = 1; pseudoOrderArray(array, group, 2)
	tolerance++;
	console.log("Beginning, Groups: ", group);
	for (var rep=0; rep<3; rep++) {
		for (var i=tolerance;i<array.length;i++) {
			if (group[i] !== "fixed" && unique(group.slice(i-tolerance+1, i+1)).length < 2) {
				// Find a different group item to swap
				var j = i+1;
				while ((group[j % array.length] === "fixed"  || group[j % array.length] === group[i]) && 
				       j<array.length*2) j++;
				
				//console.log("Before:", group);
				j = j % array.length;
				var temp = array[i]; array[i] = array[j]; array[j] = temp;
					temp = group[i]; group[i] = group[j]; group[j] = temp;
				//console.log("After:", group);
			}
		}
	}
	console.log("Finally, Groups: ", group)
	return array;
}

pslides.orderRule = class {
	constructor(obj, within, atmost, atleast) {
		this.within = within
		this.atleast = atleast;
		this.atmost = atmost;
		this.obj = obj;
		
		if (obj===undefined) this.obj = {};
		if (typeof within  != "number") this.within = 2;
		if (typeof atleast != "number") this.atleast = 0;
		console.log("typeof atmost ", typeof atmost)
		if (typeof atmost  != "number") this.atmost = within;
	}
}

// if a value is an array, it's viewed as a set of "or" statements
pslides.matchObj = function(obj1, obj2) {
	if (typeof obj1 !== "object" && typeof obj1 !== "object") return obj1 === obj2;
	if (typeof obj1 !== "object" || typeof obj1 !== "object") return false;
	var keys1 = Object.keys(obj1);
	for (var i=0; i<keys1.length; i++) {
		if (![undefined,null].includes(obj2) && keys1[i] in obj2) {
			var comp1 = obj1[keys1[i]], comp2 = obj2[keys1[i]];
			if (Array.isArray(comp1) && Array.isArray(comp2)) {
				console.log("yayy 1", comp1, comp2)
				var match = false;
				for (var j=0; j<comp1.length; j++) {
					if (comp2.indexOf(comp1[j]) > -1) {
						match = true; break;
					}
				}
				if (!match) return false;
			} else if (Array.isArray(comp1) && comp1.indexOf(comp2) == -1) {
				console.log("yayy 2")
				return false;
			} else if (Array.isArray(comp2) && comp2.indexOf(comp1) == -1) {
				console.log("yayy 3")
				return false;
			} else if (!Array.isArray(comp1) && !Array.isArray(comp2) && comp1 !== comp2) {
				console.log("yayy 4", comp1, comp2)
				return false
			}
		}
	}
	return true;
}


// Evaluates the index in an "array" where the first violation takes place.
// Simply output where a violation occurs (at which index of the array) or null otherwise:
// provided an array and an array of rules:
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! Could contain bugs !!!!!!!!!!!!!!!!!!!!!!!!!!!!
pslides.evalOrderRule = function(array, rules=[], iterator=0) {
	var startIndex = 0, backReplacement = 0, testArray = [], violation = false, occurances = 0;
	if (!Array.isArray(rules)) rules = [rules];
	
	for (var i=iterator; i<array.length; i++) { // start from iterator and run
		for (var j=0; j<rules.length; j++) { // iterate over rules
			violation = false;
			if (rules[j] instanceof pslides.orderRule && rules[j].within >= j) {
				console.log("It is a rule")
				
				// now apply the rule: if the rule fails, 
				startIndex = Math.max(0, i-rules[j].within);
				testArray = array.slice(startIndex, i+1);
				console.log("i: ",i)
				console.log("startIndex: ",startIndex)
				console.log("testArray: ",testArray)
				
				// count number of occurances of that object.
				occurances = 0;
				for (var k=0; k<testArray.length; k++) {
					console.warn("rules[j].obj", rules[j].obj)
					console.warn("testArray[k]", testArray[k])
					console.warn("pslides.matchObj(rules[j].obj, testArray[k])", pslides.matchObj(rules[j].obj, testArray[k]))
					if (pslides.matchObj(rules[j], testArray[k])) {
						occurances++;
					}
				}
				// check other reuqirements here:
				// ...
				
				console.log("atleast: ",rules[j].atleast)
				console.log("atmost: ",rules[j].atmost)
				console.log("occurances: ",occurances)
				console.log("occurances < rules[j].atleast || occurances > rules[j].atmost: ",occurances < rules[j].atleast || occurances > rules[j].atmost)
				if (occurances < rules[j].atleast || occurances > rules[j].atmost) {
					return i;
				}
			}
		}
		// Now correct the violation by going backwards in the array and finding a fitting candidate.
	}
	return null;
}


// !!!!!!!!!!!!!!!!!!!!!!!! Bugs?? !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
pslides.pseudoShuffleArray = function(x, rules=[]) {
	// x=items; rules = [new pslides.orderRule(obj={type:'A'}, within=3, atmost=1)]
	// first shuffle.
	x = shuffle(x);
	
	var i=0, i2 = 0, j = 0, tmp = null;
	while (i!==null && i<x.length*2) {
		i2 = pslides.evalOrderRule(x, rules, i % x.length);
		
		j=i2+1;
		if (i2 !== null) {
			 // go beyond the current index and switch items:
			while (i2 === i && j<array.length*2) {
				// 1. switch two items:
				tmp = x[i2]; 
				x[i2] = x[j % array.length]; x[j % array.length] = tmp;
				i2 = pslides.evalOrderRule(x, rules, i % x.length);
				j++;
			}
			i = i2;
		}
	}
	return x;
}

/*
items = [
    { id: 1, type: 'A' },
    { id: 2, type: 'A' },
    { id: 2, type: 'A' },
    { id: 3, type: 'B' },
    { id: 4, type: 'B' },
    { id: 5, type: 'C' }
];

pslides.matchObj({type: 'A'}, {id: 3, type: 'B'})
pslides.evalOrderRule(items, [new pslides.orderRule(obj={type:'A'}, within=3, atmost=1)])
pslides.pseudoShuffleArray(items, [new pslides.orderRule(obj={type:'A'}, within=3, atmost=1)])
*/



function handlePSet(node) {
	// node = document.getElementById("experiment")
	var order = ifNullStr(node.getAttribute("order"));
	var n = Number(ifNullStr(node.getAttribute("n"))); //, preshuffle = true;
	if (order==="shuffle") {
		shuffleSeq(node)
	} else if (order.substring(0,13)==="pseudoshuffle") {
		var tol = tryEval(order.substring(order.indexOf("(")+1,order.lastIndexOf(")")), at=node);
		pseudoShuffleSeq(node, tol)
	}
	
	if (isNaN(n) || n==0) return;
	while (node.children.length > n) node.children[n].remove();
	
	// insert the n. !!!!!!!!!!!!!
}


function storeInCache(arrURI, templateID, type="img") {
	var template = document.querySelector("p-template[id='"+escapeString(templateID)+"']"),
		tmp = null;
	for (var i=0; i<arrURI.length; i++) {
		tmp = document.createElement(type)
		tmp.src = arrURI[i].trim();
		template.appendChild(tmp);
	}
}


function CSVToArray(strData, strDelimiter) {
	// Check to see if the delimiter is defined. If not,
	// then default to comma.
	strDelimiter = (strDelimiter || ",");
	strData = strData.trim();
	
	// Create a regular expression to parse the CSV values.
	var objPattern = new RegExp(
	("(\\" + strDelimiter + "|\\r?\\n|\\r|^)" + // Delimiters
     "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" + // Quoted fields
	 "([^\"\\" + strDelimiter + "\\r\\n]*))"), "gi"); // Standard fields
	 // Create an array to hold our data. Give the array a default empty first row.
	var arrData = [[]];
	// Create an array to hold our individual pattern matching groups.
	var arrMatches = null;
	// Keep looping over the regular expression matches until we can no longer find a match.
	while (arrMatches = objPattern.exec(strData)){
		// Get the delimiter that was found:
		var strMatchedDelimiter = arrMatches[1];
		// Check to see if the given delimiter has a length (is not the start of string) and if it matches
		// field delimiter. If id does not, then we know that this delimiter is a row delimiter.
		if (strMatchedDelimiter.length && strMatchedDelimiter !== strDelimiter) {
			// Since we have reached a new row of data, add an empty row to our data array.
			arrData.push([]);
        }
		var strMatchedValue;
		// Now that we have our delimiter out of the way,
		// let's check to see which kind of value we
		// captured (quoted or unquoted).
		if (arrMatches[2]){
			// We found a quoted value. When we capture this value, unescape any double quotes.
			strMatchedValue = arrMatches[2].replace(new RegExp( "\"\"", "g"), "\"");
		} else {
			// We found a non-quoted value.
			strMatchedValue = arrMatches[3];
		}
		// Now that we have our value string, let's add it to the data array.
		arrData[arrData.length - 1].push(strMatchedValue);
	}
	// Return the parsed data.
    return(arrData);
}


function handleDataid(node=document) {
	// download csv file onto the html
	
	// fill in the csv files
	var d = node.querySelectorAll("p-set[dataid],p-template");
	for (var i=0; i<d.length; i++) {
		var template = d[i].innerHTML, res = "", data = "";
		var delim = d[i].getAttribute("delim"); 
			if (delim===null) delim = "{{ }}"; delim = splitWhitespace(delim.trim())
				
		var dataid = ifNullStr(d[i].getAttribute("dataid"));
		if (dataid !== "") { // fill the template with data from p-data
			data = document.getElementById(dataid);
			content = pslides.data[dataid] // data.innerHTML // the content should be saved to a JS object!
			var format = getFormatAttribute(d[i])[0];
			
			// var format = dataid.substring(dataid.lastIndexOf("."),dataid.length).toLowerCase();
			// fetch(dataid).then((response) => response.text()).then((text) => {data = text});
			
			if (content !== undefined && ["json","csv","tsv"].includes(format)) {
				for (var j=0;j<content.length;j++) { // over j rows
					var current_template = template
					for (let k in content[j]) { // over k columns
						if (Array.isArray(content[j][k]) || typeof content[j][k] === 'object') {
							current_template = current_template.replaceAll(delim[0]+k+delim[1], stringify(content[j][k]));
						} else {
							current_template = current_template.replaceAll(delim[0]+k+delim[1], String(content[j][k]));
						}
					}
					res += current_template;
				}
			} else if (![undefined,null].includes(content)) {
				if (Array.isArray(content)) {
					for (var j=0;j<content.length;j++) { // over j rows
						var current_template = template
							current_template = current_template.replace(delim[0]+"i"+delim[1], stringify(content[j][k]))
						res += current_template;
					}
				}
			}
			d[i].innerHTML = res;
		}
		
		// then we will insert the javascript variables with eval
		// temp = d[i].innerHTML;
		// var i1 = temp.indexOf(delim[0]), i2 = temp.indexOf(delim[1]), insert = "";
		// while (i1 >= 0 && i2 >= 0 && i1 < i2) {
		//	insert = tryEval(temp.substring(i1+delim[0].length, i2), at=d[i]);
		//	temp   = temp.substring(0, i1) + insert + temp.substring(i2+delim[1].length, temp.length);
		//	i1     = temp.indexOf(delim[0]); i2 = temp.indexOf(delim[1]);
		//}
	}
}


	const getData = async (url) => {
		const res = await fetch(url)
		const resText = await res.text()
		return resText.trim();
	}
	const addTextFromUrl = async (url, element) => {
		const text = await getData(url)
		element.innerHTML = text
	}
	function checkURL(url) { // async await ???
		// var url = "nct_stimuli.csv"
		var cur = window.location.href;
		var string_res = null, 
			pre_url = url.substring(0, url.indexOf("//")+2).toLowerCase();
		if (cur.substring(cur.lastIndexOf("/"), cur.length).indexOf("\.")>-1) {
			cur = cur.substring(0, cur.lastIndexOf("/"))
		}
		var url_full = pre_url === "http://" || pre_url === "https://" || 
					   pre_url === "file://" || url.substring(0,4) === "www.";
		if (!url_full) url = cur+"/"+url;
		return(url);
	}

async function handlePData() {
	var d = document.querySelectorAll("p-data");
	for (var i=0;i<d.length;i++) {
		var src    = d[i].getAttribute("src"),
			onld   = d[i].getAttribute("onload"),
			key    = ifNullStr(d[i].getAttribute("id")),
			format = getFormatAttribute(d[i])[0],
			sep    = d[i].getAttribute("sep");
		
		if (src !== null && src.trim() !== "") {
			console.log("Fetching data for "+stringifyNodeTag(d[i])+" …")
			var str = await getData(src);
		} else {
			var str = d[i].textContent.trim(); // previously used innerHTML!
		}
		
		// determine the format of the src
		if (format==="" && src !== null && src.lastIndexOf("/") < src.lastIndexOf("\.") && 
			src.lastIndexOf("\.")+1 !== src.lengh) {
			format = src.substring(src.lastIndexOf("\.")+1, src.lengh)
		}
		
		// Now go through the formats TSV, CSV and JSON
		if (["csv","tsv"].includes(format) && pslides.data[key] === undefined) {
			if (format === "tsv") {
				pslides.data[key] = CSVToArray(str, "\t");
			} else if (format === "csv") {
				if (isEmpty(sep)) sep = ",";
				pslides.data[key] = CSVToArray(str, sep);
			}
			var header = pslides.data[key][0], pjson = [], temp = {};
			pslides.data[key].shift();
			for (var row=0;row<pslides.data[key].length;row++) {
				for (col=0;col<pslides.data[key][row].length;col++) {
					temp[header[col]] = pslides.data[key][row][col];
				}
				pjson.push(temp); temp = {};
			}
			pslides.data[key] = pjson;
		} else if (format === "json" && pslides.data[key] === undefined) {
			pslides.data[key] = JSON.parse(str);
		} else if (pslides.data[key] === undefined) {
			pslides.data[key] = str.trim().split("\n");
		}
		
		// order arguments
		var order = d[i].getAttribute("order"), groups = d[i].getAttribute("groups");
		if (order !== null && order.indexOf("shuffle")>-1 && Array.isArray(pslides.data[key])) {
			var garr = []; for (var j=0;j<pslides.data[key].length;j++) garr.push(pslides.data[key][j][groups]);
			//console.log("garr:\n",garr);
			pslides.data[key] = shuffleArray(pslides.data[key], garr)
			if (order.indexOf("pseudoshuffle")>-1) {
				var tol = 2;
				if (order.lastIndexOf(")") > -1) {
					tol = tryEval(order.substring(order.indexOf("(")+1,order.lastIndexOf(")")));
					//console.error("tol: ", tol);
				}
				garr = []; for (var j=0;j<pslides.data[key].length;j++) garr.push(pslides.data[key][j][groups]);
				pslides.data[key] = pseudoOrderArray(array=pslides.data[key], group=garr, tolerance=tol)
			}
		}
		
		// number of items
		var n = tryEval(d[i].getAttribute("n"), at=d[i],
			            ifError="when evaluating the Attribute \"n\"");
		if (typeof n !== "number") n = -1;
		if (n >= 0) pslides.data[key] = pslides.data[key].slice(0, Math.floor(n));
		
		// now execute onload:
		if (onld !== null && onld.trim() !== "") {
			console.warn("!!! now evaluating \""+onld+";\"");
			setTimeout(function(){tryEval(onld+";", at=d[i])},10);
		}
	}
	
	// Call handleDataid here!!!
	handleDataid(node=document)
}

// return the value given that query
// start=0 is the current slide; previous slides are smaller than 0.
// end is how many slides to go back to and when to stop searching.
// By default, "end" will go back to the very first slide of the document. b
// because we are dealing with slides, start and end are usually negative numbers
function query(obj={},start=0,end=-Infinity) {
	// Create the query for the querySelector
	// query(obj={tag="img",width:"100"})
	// obj={tag:"p-response",name:"key.down.k"};start=0;end=-Infinity
	// query(obj={width:"100"})
	// obj={tag:"img",width:"100"}; start=0; end=-Infinity;
	var k = Object.keys(obj), q="", i=0;
	for (i=0;i<k.length;i++) {
		if (k[i].toLowerCase()==="tag") {
			q=obj[k[i]]+q
		} else {
			q+="["+k[i]+"='"+escapeString(obj[k[i]])+"']"
		}
	}
	
	var slide = pslides.currentSlide, d = [], res=null;
	if ([undefined,null].includes(slide)) return null;
	if (start > 0) {
		for (i=start; i>=0; i--) slide = findNextSlide(slide);
	}
	
	while (![undefined,null].includes(slide) && res === null && end<0) {
		d = slide.querySelectorAll(q);
		var i = d.length-1;
		while (i >= 0) {
			if (!hasParentAttribute(d[i], attr="ignored", value="true")) {
				res = d[i]; i = -1;
			}
			i--;
		}
		end++;
		if (res === null && slide !== null) slide = findPreviousSlide(slide);
	}
	return res;
}

function getValue(node) {
	// node = {tag:"p-response",name:"response_side"}
	if ([undefined,null].includes(node)) {
		return "";
	} else if (!isDOMElement(node)) {
		node = query(node);
		if (node === null) {
			console.warn("No \"element\" found.");
			return "";
		}
	}
	
	var tag = node.tagName, type = node.getAttribute("type");
	if (tag === "INPUT" && type === "checkbox") {
		return node[i].checked;
	} else if (tag === "INPUT" && type === "radio") { // get value from radio button
		var q = node.parentElement.querySelector("input[type='radio']"+
		                                             "[name='"+escapeString(node.getAttribute("name"))+"']"+
													 ":checked");
		if (q === null) {
			return "";
		} else if (q.getAttribute("value")!==null) {
			return q.getAttribute("value");
		} else if (![null,"on"].includes(q.value)) {
			return q.value;
		} else if (![undefined,"",null].includes(q.id)) {
			return q.id;
		} else {
			return q.innerHTML;
		}
	} else if (["INPUT","TEXTAREA","SELECT"].includes(tag)) {
		return node.value;
	} else {
		return node.innerHTML;
	}
}


function setValue(node, val) {
	// If node is not a DOM element, it might be a query object. So, we first query.
	if (!isDOMElement(node) && typeof node === "object" && node !== null) {
		node = query(node, start=0);
	}
	
	if (isDOMElement(node) && val !== undefined) {
		var tag = node.tagName;
		var type = node.getAttribute("type");
		if (type !== null) type = type.toLowerCase();
		if (tag === "INPUT" && ["checkbox","radio"].includes(type)) {
			node.checked = tryEval(val, at=node);
		} else if (["INPUT","TEXTAREA","SELECT"].includes(tag)) {
			node.value = stringify(val);
		} else {
			node.innerHTML = stringify(val);
		}
	} else {
		console.error("Could not use setValue(node, val) on null oder undefined DOM element.")
	}
}

function ID(x) {
	return document.getElementById(x);
	// get the item that has previously been an id
}

function from10ToBase(n,base=36,set="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",sep="") { // var n=0,base=36,set="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",sep=""
	// n = 37
	n = Math.floor(n);
	var res = "", ndigits=Math.ceil(Math.log(n)/Math.log(base));
	for (var i=ndigits;i>=0;i--) {
		var place = base**i, cond = n / (place)
		if (Math.floor(n / place) < 1 && res !== "") {
			res += set[0] // Array(i).fill(set[0]).join(sep); break;
		} else if (Math.floor(n / place) >= 1) {
			res = res + set[Math.floor(n / place)] + sep; n = n % place
		}
	}
	return(res)
}

function generateCode(n=4,chunks=1,set=36,sep="-") { // var n=4,sep="",nsep=4,set=36
	Set = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz".substring(0,set)
	var res = "";
	for (var i=0;i<chunks;i++) {
		for (var j=0;j<n;j++) res += Set[Math.floor(Math.random()*Set.length)];
		if (i<chunks-1) res += sep;
	}
	return res;
}

function generateUTCCode() { // var n=4,sep="",nsep=4,set=36
	var time = new Date(),
	num = time.getUTCFullYear()*10**13 + (time.getUTCMonth()+1)*10**11 + time.getUTCDate()*10**9 + 
	      time.getUTCHours()*10**7 + time.getUTCMinutes()*10**5 + time.getUTCSeconds()*10**3 + 
		  time.getUTCMilliseconds();
	return(from10ToBase(n=num,base=36,set="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ"))
}

function copyInnerHTML(node) {
	var range = document.createRange();
	range.selectNode(node);
	window.getSelection().removeAllRanges(); // clear current selection
	window.getSelection().addRange(range); // to select text
	document.execCommand("copy");
	window.getSelection().removeAllRanges(); // to deselect
	// Alert the copied text: alert("Copied the text: " + node.innerHTML);
}


function setMetaElement(name, content=null) {
	let meta = document.head.querySelector("meta[name=\"pslides:"+escapeString(name)+"\"]"),
		URLParams = new URLSearchParams(window.location.search);
	// URL parameter takes precedence over provided content:
	if (!isEmpty(URLParams.get(name))) content = URLParams.get(name);
	if (meta === null) {
		meta = document.createElement("meta");
		meta.setAttribute("name", "pslides:"+escapeString(name));
		document.head.appendChild(meta);
	}
	
	// If the replacement is not null/empty, 
	if (![null,""].includes(content) &&
		([null,""].includes(meta.getAttribute("content")) || 
		 name.trim().toLowerCase()==="subj")) { // 
		meta.setAttribute("content", content);
		
		// set the record data straight:
		outObj.meta[name] = content;
	}
	
	return meta;
}


function extractMetaContent(name,alt="") {
	var d = document.head.querySelector("meta[name=\"pslides:"+escapeString(name)+"\"]");
	if (d !== null) d = d.getAttribute("content");
	if (d !== null) alt = d;
	return alt;
}

function extractParameter(names=[]) {
	if (typeof names !== "object" && names.length !== undefined) {
		names = [stringify(names)];
	}
	let res = {}, 
		params = new URLSearchParams(window.location.search),
		path = window.location.pathname
		       .replace(pslides.serverRootPath+"/", "")
			   .replaceAll("//","/")
			   .split("/").filter((x) => x!=="");
	if (["http:","https:"].includes(window.location.protocol)) {
		if (path.length<4) path.push("index.html");
		for (var i=0; i<names.length; i++) {
			if (names[i] === "srcroot") {
				res["srcroot"] = path[0];
			} else if (names[i] === "srcprj") {
				res["srcprj"] = path[1];
			} else if (names[i] === "srcfn") {
				res["srcfn"] = path[3].replaceAll("_","-");
			} else if (names[i] === "agenda" && 
			           extractMetaContent(name="agenda") !== "" &&
					   params.get("agenda") !== null) {
				// if agenda is represented in the URL and in the meta tags.
				res["agenda"] = extractMetaContent(name="agenda") +
				                " " + params.get("agenda")
			} else if (names[i] === "lang") {
				res["lang"] = pslides.printLanguage();
			} else {
				res[names[i]] = params.get(names[i]);
				if (res[names[i]] === null) {
					res[names[i]] = extractMetaContent(name=names[i]);
				}
				if (res[names[i]] === null) {
					res[names[i]] = localStorage.getItem(names[i]);
				}
			}
		}
		if (res["root"]  === "") res["root"]   = path[0];
		if (res["prj"]   === "") res["prj"]    = path[1];
		if (res["srcfn"] === "") res["srcfn"]  = path[3];
	} else { // not HTTP protocol
		for (var i=0; i<names.length; i++) {
			res[names[i]] = params.get(names[i]);
			if (isEmpty(res[names[i]])) {
				res[names[i]] = extractMetaContent(name=names[i]);
			}
			if (isEmpty(res[names[i]])) { // get local storage:
				res[names[i]] = localStorage.getItem(names[i]);
			}
		}
	}
	
	// subj: depends more on meta content: in lognitudinal studies,
	// we want to put presidence on subject input
	if (extractMetaContent(name="subj") === document.querySelector("p-input[type=subj] input[type=text]")?.value) {
		res["subj"] = extractMetaContent(name="subj");
	}
	
	// format:
	if (res["format"] === "") res["format"] = "json";
	
	// split up agenda:
	if (![undefined,null].includes(res["agenda"]) && res["agenda"].trim() !== "") {
		res["agenda"] = splitWhitespace(res["agenda"]);
		console.log("res['agenda']", res["agenda"]);
	}
	return res;
}

function handleGenCode(node) {
	// also set default values
	// var node = document.querySelector("p-subjcode")
	var n      = ifNullStr(node.getAttribute("n"),"3"), 
		chunks = ifNullStr(node.getAttribute("chunks"),"3"), 
		sep    = ifNullStr(node.getAttribute("sep"),"-"),
		code   = "?";
	
	if (node.tagName==="P-SUBJCODE") {
		code = document.querySelector("meta[name='pslides:subj']").getAttribute("content");
	} else if (node.tagName === "P-GENCODE") {
		code = generateCode(n=Number(n), chunks=Number(chunks), set=36, sep=sep)
	}
	
	res = "<span>"+code+"</span>";
	if (node.tagName==="P-GENCODE" && node.getAttribute("regen")!==null) {
		res+="<button style='padding:0;line-height:0;font-size:130%' onclick='handleGenCode(this.parentElement)'>&#8635;</button>"; // style='font-size:130%;padding-top:0;padding-bottom:0'
	} 
	// res+="<button onclick='copyInnerHTML(this.parentElement.firstChild)'><span style='font-size:.88em;margin-right:.12em;position:relative;top:-.24em;left:-.12em'>📄<span style='position:absolute;top:.24em;left:.24em'>📄</span></span></button>"
	res+="<button onclick='copyInnerHTML(this.parentElement.firstChild)'>"+
	"<svg alt='COPY' fill='#000000' height='800px' width='800px' version='1.1' viewBox='0 0 330 330' preserveAspectRatio='none' xml:space='preserve'>"+"<g>"+
		"<path d='M35,270h45v45c0,8.284,6.716,15,15,15h200c8.284,0,15-6.716,15-15V75c0-8.284-6.716-15-15-15h-45V15"+
			"c0-8.284-6.716-15-15-15H35c-8.284,0-15,6.716-15,15v240C20,263.284,26.716,270,35,270z M280,300H110V90h170V300z M50,30h170v30H95 "+
			"c-8.284,0-15,6.716-15,15v165H50V30z'/>"+
		"<path d='M155,120c-8.284,0-15,6.716-15,15s6.716,15,15,15h80c8.284,0,15-6.716,15-15s-6.716-15-15-15H155z'/>"+
		"<path d='M235,180h-80c-8.284,0-15,6.716-15,15s6.716,15,15,15h80c8.284,0,15-6.716,15-15S243.284,180,235,180z'/>"+
		"<path d='M235,240h-80c-8.284,0-15,6.716-15,15c0,8.284,6.716,15,15,15h80c8.284,0,15-6.716,15-15C250,246.716,243.284,240,235,240z'/>"+
	"</g></svg>"+"</button>"
	node.innerHTML=res;
}

function handleAllGenCodes() {
	var d = document.querySelectorAll("p-gencode,p-subjcode")
	for (var i=0;i<d.length;i++) handleGenCode(d[i]);
}

function encodeURIArg(val="",name) {
	var res = "";
	if (val !== null && val !== "") res=name+"="+encodeURIComponent(val);
	return res;
}

pslides.printMessage = function(token, lang=null) {
	
	// pslides.printMessage("RequestNotSent")
	// token="RequestNotSent"; lang="fr-FR";
	
	// Check if the message token even exists:
	if (!(token in pslides.messageTexts)) {
		throw new Error("The token does not correspond to an existing message. Check out \"pslides.messageTexts\".");
	}
	
	// define array of possible combinations:
	let langs = [];
	
	// Check if language is:
	if (isEmpty(lang)) {
		langs = [pslides.language.lang]
		if (!isEmpty(pslides.language.script)) langs.push(langs[0]+"-"+pslides.language.script);
		if (!isEmpty(pslides.language.region)) langs.push(langs[0]+"-"+pslides.language.region);
		if (!isEmpty(pslides.language.script) && !isEmpty(pslides.language.region)) {
			langs.push(langs[0]+"-"+pslides.language.script+"-"+pslides.language.region);
		}
	} else {
		langs = lang.split("-");
		if (langs.length>1) langs[1] = langs[0] + "-" + langs[1];
		if (langs.length>2) {
			langs[2] = langs[0] + "-" + langs[1];
			langs[3] = langs[0] + "-" + langs[1] + "-" + langs[2];
		}
		langs = langs.splice(0,4);
	}
	
	// console.log("langs:", langs);
	
	// Try to query messageTexts with different BCP 47 language strings:
	for (var i=langs.length-1; i>=0; i--) {
		if (langs[i] in pslides.messageTexts[token]) {
			return pslides.messageTexts[token][langs[i]];
		}
	}
	
	// Last resort: 
	if ("en" in pslides.messageTexts[token]) {
		console.warn("The lagnuage \""+langs[langs.length-1]+
			"\" is not supported in \"pslides.messageTexts."+token+"\". "+
			"Also, please remember that the language must be provided as a BCP 47 language tag.");
		return pslides.messageTexts[token]["en"];
	}
}

function messagingHTTPRequest(request, id=null, method="POST") {
	// console.log(request);
	var type   = "warn",
		method = method.toLowerCase(),
		// lang   = pslides.printLanguage(),
		mes    = "No message.",
		state  = request.readyState;
	if (state==0) {
		//mes = pslides.messageTexts.RequestNotSent[lang];
		mes = pslides.printMessage("RequestNotSent")
	} else if (state==1) {
		// mes = pslides.messageTexts.PreparingRequest[lang]; // "Preparing request …";
		mes = pslides.printMessage("PreparingRequest")
	} else if (state==2) {
		// mes = pslides.messageTexts.WaitingForServer[lang]; // "Waiting for server to respond …";
		mes = pslides.printMessage("WaitingForServer")
	} else if (state==3 && method==="get") {
		// mes = pslides.messageTexts.DownloadingData[lang]; // "Downloading data …";
		mes = pslides.printMessage("DownloadingData")
	} else if (state==3 && ["post","patch","put"].includes(method)) {
		// mes = pslides.messageTexts.UploadingData[lang]; //  "Uploading data …";
		mes = pslides.printMessage("UploadingData")
	} else if (state==3) {
		// mes = pslides.messageTexts.ServerProcessingDate[lang]; // "Server is processing the data …";
		mes = pslides.printMessage("ServerProcessingDate")
	} else if (state==4) {
		let body = request.response.trim(),
			contentType = request.getResponseHeader("Content-Type");
		console.log("Response body: ", body);
		if ((!isEmpty(contentType) && contentType.trim().match(/^text\/html/gi)!==null) || 
			body.match(/^<\!doctype html/gi)) {
			const parser = new DOMParser();
			body = parser.parseFromString(body, 'text/html').body?.innerHTML; // inner content
			body = body.replaceAll(/(<(br|BR|Br|bR|br\/|BR\/|Br\/|bR\/)>)+/g, "<br/>");
			body = body.replaceAll("\n"," ")
		} else {
			body = body.replaceAll(/\n+/g,"<br/>")
		}
		
		mes  = "<b>"+pslides.printMessage("Status")+" "+
		       request.status+": "+request.statusText+"</b><br/>";
		type = "neutral"; 
		if (request.status > 199 && request.status < 300) {
			type="neutral";
			mes = "&#x2705; "+mes;
		} else {
			type="error"
			mes = "&#x274C; "+mes+"<br/>POST URI: <u>"+request.responseURL+"</u><br/>";
		}
		mes += body;
	}
	console.log("mes for state "+state+": ", mes)
	if (mes.length > 700 && type==="neutral") mes = mes.substring(0, 700)+" …";
	//console.log("request: ",request);
	displayMessage(message=mes, id=id, type=type);
}


function sendOutData(element=null, data=null, format="csv", onload=null) {
	//console.log("data: ", data)
	//console.log("format: ", format)
	//console.log("onload: ", onload)
	if (isEmpty(format)) format = "csv";
	format = format.trim().toLowerCase();
	let isDOM = isDOMElement(element), xhr = null;
	if (data===null && isDOM && ![undefined,null,""].includes(element.getAttribute("js"))) {
		data = tryEval(element.getAttribute("js"), at=element, ifError=function(){return outObj;});
	}
	// is data is still empty, make it the outObj:
	if (isEmpty(data)) {
		data=outObj;
	}
	
	var loc = window.location.protocol,
		message_id = null;
		isFirstSlide = document.querySelector("p-slide[current]") === document.querySelector("p-slide") &&
		               document.querySelectorAll("p-slide").length>2;
	if (isDOM) {
		message_id = element.id;
		if (![null,""].includes(element.getAttribute("format"))) {
			format = element.getAttribute("format");
		}
	}
	
	if (["http:","https:"].includes(loc) && !isFirstSlide) {
		try {
			var params = extractParameter(["lang","root","prj","subj","session","cond","srcprj","srcfn","srcroot"]),
				urlArray = [];
			params.format = format;
			let contentType = "text/"+format;
			if (format === "csv") {
				datastr = outObj2CSV(data);
			} else {
				datastr = stringify(data);
				contentType = "application/json";
			}
			if (format==="txt") contentType = "text/plain";
			
			for (const [key, value] of Object.entries(params)) {
				if (value !== "") urlArray.push(encodeURIArg(value, key));
			}
			xhr = new XMLHttpRequest();
			var url = window.location.origin+"/"+pslides.serverSubjPath+"save_subj_data.php?"+
					  urlArray.filter((x) => ifNullStr(x) !== "").join("&");
			// window.location.search = "?"+;
			console.log("request URL:\n",url);
			xhr.open("POST", url); // 'save_subj_data.php' is the path to the php file described above.
			xhr.onreadystatechange = function() {messagingHTTPRequest(this, message_id, method="post")};
			xhr.onload = function() {
				messagingHTTPRequest(this, message_id, method="post");
				if (typeof onload === "function") onload();
			};
			xhr.setRequestHeader("Content-Type", contentType+"; charset=utf-8");
			xhr.setRequestHeader("Accept-Language", document.documentElement.lang);
			// xhr.setRequestHeader("X-PSlides-Meta", stringify(outObj.meta));
			
			// Send the data when enough time past from the previous data submission:
			let sendTime = Number(new Date());
			if (sendTime - pslides.lastSubmission > 2000) {
				pslides.lastSubmission = sendTime;
				xhr.send(datastr);
			}
		} catch (error) {
			displayMessage(pslides.printMessage("sendDataError")+"\n"+error,
						   id=message_id, type="error")
		}
	} else if (loc === "file:") {
		displayMessage(pslides.printMessage("sendDataLocalToExternal"), id=message_id, type="error")
	} else if (isFirstSlide) {
		displayMessage(pslides.printMessage("sendDataOnFirstSlide"), id=message_id, type="error")
	} else {
		displayMessage(pslides.printMessage("sendDataUnknownError"), id=message_id, type="error")
	}
	return xhr;
}


function downloadObj(node=null, x=null, filename=null) {
	var format = "json", str = "", id = null, js = null; // create a local storage!
	if (isDOMElement(node)) {
		if (![null,""].includes(node.getAttribute("format"))) {
			format = node.getAttribute("format");
			id = node.id;
		}
		
		js = node.getAttribute("js");
		if (js !== null) x = tryEval(js, at=node);
	}
		
	format = format.trim().toLowerCase();
	if ([undefined,null,""].includes(x)) x = outObj;
	
	if (format === "json") {
		str = JSON.stringify(x);
	} else if (format === "csv") {
		str = outObj2CSV(x);
	}
	
	if (filename === null) {
		var pars = extractParameter(["session","subj","cond","srcfn","srcprj","srcroot"]);
		if (window.location.protocol === "https:") {
			filename=[pars.session,pars.subj,pars.cond,pars.srcfn,pars.srcprj,pars.srcroot].join("_")+"."+format
		} else {
			filename=[pars.session,pars.subj,pars.cond,pars.srcfn].join("_")+"."+format;
		}
	}
	var a = document.createElement("a");
	a.setAttribute("href", "data:text/plain;charset=utf-8," + encodeURIComponent(str));
	a.setAttribute("download", filename);
	a.style.display = "none";
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
}

// fill attributes with JS (jsattr): insert JSON object with {"attr":value, ...}

function evalJSAttr(node) {
	if (node.tagName==="P-SUBJCODE") node.querySelector("span").innerHTML = extractParameter("subj").subj
	var attrs  = node.getAttribute("jsattr");
	if (attrs !== null && attrs !== "") {
		attrs = attrs.trim()
		if (attrs[0] !== "{") attrs = "{"+attrs+"}";
		attrs = "("+attrs+");"
		try {
			var attr = eval(attrs);
			for (var key in attr) {
				if (attr.hasOwnProperty(key)) node.setAttribute(key, stringify(attr[key]));
			}
			if (node.id !== "") {
				displayMessage("\"jsattr\" successfully evaluated in id=\""+
							   node.id+"\":", id=node.id)
			}
		} catch(e) {
			displayMessage("Could not evaluate \"jsattr\" to insert "+
			               "attributes in element with id=\""+
						   node.id+"\":\n"+e, id=node.id, type="error")
		}
	}
	var jsfill = node.getAttribute("jsfill");
	if (jsfill !== null && jsfill !== "") {
		try {
			node.innerHTML = stringify(eval(jsfill+";"))
			if (node.id !== "") {
				displayMessage("\"jsfill\" successfully evaluated at id=\""+
							   node.id+"\":", id=node.id)
			}
		} catch(e) {
			displayMessage("Could not evaluate \"jsfill\" in element with id=\""+
						   node.id+"\":\n"+e, id=node.id, type="error")
		}
	}
}

pslides.download = function(node, obj=null, filename=null) {
	try {
		downloadObj(node, obj, filename)
		displayMessage(message="&#9989; <b>"+pslides.printMessage("DownloadSuccessful")+"</b>:\n"+
			pslides.printMessage("FindDownload"), id=node.id, type="log")
	} catch(e) {
		displayMessage(message="&#10060; "+String(e), id=node.id, type="error")
	}
}


// MOVE TO MUTATION OBSERVER
/*
function handleOnclicks(node=document) {
	var d = node.querySelectorAll("p-download,p-upload"), empty = true, js = null,
		downloadSVG = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' height='2em' width='2em'>"+
			"<g xmlns='http://www.w3.org/2000/svg' transform='matrix(-1 0 0 -1 30 32)'>"+
			"<path data-name='Path 4' d='M28,14H23.98A1.979,1.979,0,0,0,22,15.98v.04A1.979,1.979,0,0,0,23.98,18H25a1,1,0,0,1,1,1v8a1,1,0,0,1-1,1H7a1,1,0,0,1-1-1V19a1,1,0,0,1,1-1H8.02A1.979,1.979,0,0,0,10,16.02v-.04A1.979,1.979,0,0,0,8.02,14H4a2,2,0,0,0-2,2V30a2,2,0,0,0,2,2H28a2,2,0,0,0,2-2V16A2,2,0,0,0,28,14Z' fill='#000000' fill-rule='evenodd' />"+
			"<path data-name='Path 5' d='M11.413,9.387,14,6.754V23a1,1,0,0,0,1,1h2a1,1,0,0,0,1-1V7.057l.26.042L20.587,9.4a2.017,2.017,0,0,0,2.833,0,1.969,1.969,0,0,0,0-2.807L17.346.581a2.017,2.017,0,0,0-2.833,0l-5.934,6a1.97,1.97,0,0,0,0,2.806A2.016,2.016,0,0,0,11.413,9.387Z' fill='#000000' fill-rule='evenodd' />"+
			"</g></svg>",
		uploadSVG = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32' height='2em' width='2em'>"+
			"<path data-name='Path 4' d='M28,14H23.98A1.979,1.979,0,0,0,22,15.98v.04A1.979,1.979,0,0,0,23.98,18H25a1,1,0,0,1,1,1v8a1,1,0,0,1-1,1H7a1,1,0,0,1-1-1V19a1,1,0,0,1,1-1H8.02A1.979,1.979,0,0,0,10,16.02v-.04A1.979,1.979,0,0,0,8.02,14H4a2,2,0,0,0-2,2V30a2,2,0,0,0,2,2H28a2,2,0,0,0,2-2V16A2,2,0,0,0,28,14Z' fill='#000000' fill-rule='evenodd' />"+
			"<path data-name='Path 5' d='M11.413,9.387,14,6.754V23a1,1,0,0,0,1,1h2a1,1,0,0,0,1-1V7.057l.26.042L20.587,9.4a2.017,2.017,0,0,0,2.833,0,1.969,1.969,0,0,0,0-2.807L17.346.581a2.017,2.017,0,0,0-2.833,0l-5.934,6a1.97,1.97,0,0,0,0,2.806A2.016,2.016,0,0,0,11.413,9.387Z' fill='#000000' fill-rule='evenodd' />"+
			"</svg>";
	for (var i=0;i<d.length;i++) {
		empty = d[i].innerHTML.trim() === "";
		js = d[i].getAttribute("js");
		if (js === null || js==="") js = "outObj";
		if (d[i].tagName==="P-DOWNLOAD") {
			if (empty) d[i].innerHTML = downloadSVG;
			//d[i].setAttribute("onclick", d[i].getAttribute("onclick")+";pslides.download(this,"+js+")")
		} else if (d[i].tagName==="P-UPLOAD") {
			if (empty) d[i].innerHTML = uploadSVG;
			//d[i].setAttribute("onclick", d[i].getAttribute("onclick")+";sendOutData("+js+",this)")
		}
	}
}
*/




function updateURIParameters(url, params) {
    let urlObj = new URL(url, window.location.origin); // Ensure valid URL
    let searchParams = urlObj.searchParams;
	
    // Update or add parameters
    Object.entries(params).forEach(([key, value]) => {
        if (Array.isArray(value) && value.length>0) {
			searchParams.set(key, value.join(" "));
		} else if (![null,undefined,""].includes(value)) {
			searchParams.set(key, value);
		}
    });
    return urlObj.toString();
}

pslides.isValidURL = function(string) {
	if (typeof string !== "string") return false;
	try {
		new URL(string);
	} catch {
		return false;  
	}
	return true;
}

function createRedirectURI(href=null) {
	let params = extractParameter(["root","prj","subj","agenda","session","cond"]),
		agenda = params["agenda"],
		isValid = pslides.isValidURL(href);
	if ([undefined,null,""].includes(agenda)) return;
	// URL parameter takes precedence over provided content:
	
	// now go through all p-redirect and p-exit elements.
	// URLs should be updated according to the URL parameters.
	console.log("Adopted URI parameters: ", stringify(params))
	var agenda0 = "";
	//console.error("agenda: ", agenda)
	
	//console.warn(agenda0)
	if (isValid) {
		agenda0 = updateURIParameters(href, params);
	} else if (agenda.length > 0) {
		agenda0 = agenda[0].trim();
		var agenda0_split = agenda0.split("/");
		if (!["http:","https:","file:"].includes(agenda0_split[0].toLowerCase())) {
			if (document.head.baseURI.slice(-1) !== "/" && agenda0.substring(0,1) !== "/") {
				agenda0 = "/"+agenda0;
			}
			agenda0 = document.head.baseURI+agenda0;
		}		
		params["agenda"] = agenda.slice(1).join(" ");
		agenda0 = updateURIParameters(agenda[0], params);
		console.log("agenda0: ", agenda0)
		setMetaElement("agenda", agenda.join(" "));
	} else {
		agenda0 = updateURIParameters(window.location.href, params);
	}
	
	return agenda0;
}

function createSubjCodes() {
	var pars = extractParameter(["subj","session","cond"]);
	
	// Subject Code
	var subj = pars.subj, d = setMetaElement("subj")
	if (subj === "") subj = d.getAttribute("content");
	if ([null,undefined,""].includes(subj)) {
		var n      = ifNullStr(d.getAttribute("n"),"3"), 
			chunks = ifNullStr(d.getAttribute("chunks"),"3"), 
			sep    = ifNullStr(d.getAttribute("sep"),"-"),
			subj   = generateCode(n=eval(n), chunks=eval(chunks), set=36, sep=sep);
		/*d.setAttribute("content", subj);
		outObj.meta.subj = subj;*/
	} else {
		/*d.setAttribute("content", subj)
		outObj.meta.subj = subj;*/
	}
	setMetaElement("subj", subj)
	outObj.meta.origSubjCode = subj
	
	// Session code: if not in a URL parameter, just generate it.
	if (pars.session === "") pars.session = generateUTCCode();
	setMetaElement("session", pars.session);
	//outObj.meta.session = pars.session;
}

async function requestStartSession() {
	// if session does not exist in the URL parameters.
	var res = null, opt = null, 
		cond = document.head.querySelector("meta[name='pslides:cond'][options]");
	if (cond === null) {
		console.log("no <meta name=\"pslides:cond\" options=\"…\"> in the document's head.")
		return res;
	}
	opt = splitWhitespace(cond.getAttribute("options").trim());
	if (opt.length<2) cond.setAttribute("content", opt);
	
	if (["http:","https:"].includes(window.location.protocol)) {
		var params = extractParameter(["root","prj","cond","subj","session","srcroot","scrprj","srcfn"])
		var urlArray = [];
		for (const [key, value] of Object.entries(params)) {
			if (![null,""].includes(value)) urlArray.push(encodeURIArg(value, key));
		}
		var url = window.location.origin+"/"+pslides.serverSubjPath+"start_session.php?"+urlArray.filter((x) => ifNullStr(x) !== "").join("&")
		try {
			console.log("Requesting session start:\n",url,"\nbody:\n",opt);
			var res = await fetch(url, {method: "POST", body: opt.join(" ")});
			console.log("Response:",res)
		} catch(e) {
			console.warn(e);
			cond.setAttribute("content", opt[Math.floor(Math.random() * opt.length)])
			createSubjCodes();
		}
		// Now act on it: set cond (and later also subj and session ?)
		// if ("cond" in res) cond.setAttribute("content", res["cond"]);
		for (const [key, value] of Object.entries(res)) {
			if (key.toLowerCase()==="message") {
				console.log("Session started:\n", res[key]);
			} else if (value !== null && value !== "") {
				setMetaElement(key, value);
			}
		}
	} else {
		cond.setAttribute("content", opt[Math.floor(Math.random() * opt.length)])
		createSubjCodes();
	}
	return res;
}


function treeFindPreviousNode(node) {
	if (!isDOMElement(node)) throw new Error("Argument \"node\" is not a DOM node.");
	let candidate = node.previousElementSibling;
	while (candidate === null && node !== null && node.tagName!=="BODY") {
		node = node.parentElement; candidate = node.previousElementSibling;
	}
	if (candidate === null || node.tagName==="BODY") {
		console.warn("There is no previous Element to be found because the end of the <body> has been reached.");
		candidate = null;
	}
	return candidate;
}

function treeFindNextNode(node) {
	if (!isDOMElement(node)) throw new Error("Argument \"node\" is not a DOM node.");
	let candidate = node.nextElementSibling, condStr = "", cond = false;
	while (candidate === null && node !== null && node.tagName!=="BODY") {
		node = node.parentElement;
		
		// P-WHILE: if the parent element is a p-while element:
		// check if the condition still applies and start from the beginning.
		if (node.tagName === "P-WHILE" && node.querySelector("script,p-slide") !== null) {
			condStr = node.getAttribute("cond");
			cond    = tryEval(condStr, at=node) == true;
			if (condStr === null) cond = true;
			if (cond) {
				candidate = node.firstElementChild;
			} else {
				candidate = node.nextElementSibling;
			}
		} else {
			candidate = node.nextElementSibling;
		}
	}
	
	if (candidate === null || node.tagName==="BODY") {
		console.warn("There is no next Element to be found because "+
		             "the end of the <body> has been reached.");
		candidate = null;
	}
	return candidate;
}

function selectPIf(node) { // return the first child of a 
	if (!isDOMElement(node) || node.tagName!=="P-IF") {
		throw new Error("There was no node <p-if cond=\"…\"> provided, instead:\n"+stringifyNodeTag(node));
	}
	
	var condStr = node.getAttribute("cond");
	var cond = tryEval(condStr, at=node) == true,
		candidate = node;
	
	// Handle p-if:
	if (cond && node.children.length<1) {
		node.setAttribute("ignore","true")
		return treeFindNextNode(node);
	} else if (cond) {
		return node.firstElementChild;
	} else if (!cond) {
		node.setAttribute("ignore","true")
		candidate = node.nextElementSibling;
	}
	
	if (candidate === null) {
		node.setAttribute("ignore","true")
		return treeFindNextNode(node);
	} else if (!["P-ELIF","P-ELSE"].includes(candidate.tagName)) {
		node.setAttribute("ignore","true")
		return candidate;
	}
	
	// go through (potential) p-elif elements:
	while (cond != true && candidate !== null && candidate.tagName === "P-ELIF") {
		node      = candidate;
		cond      = tryEval(node.getAttribute("cond"), at=node);
		if (cond != true) node.setAttribute("ignore","true");
		candidate = node.nextElementSibling;
	}
	
	// if the p-elif condition is true, jump into that node:
	if (cond && node.tagName === "P-ELIF" && node.children.length>0) {
		return node.firstElementChild;
	} else if (cond && node.tagName === "P-ELIF") {
		return node;
	}
	
	// In the next few steps, we will check if the next node is p-else:
	if (candidate === null) {
		node.setAttribute("ignore","true")
		return treeFindNextNode(node);
	} else {
		node = candidate;
	}
	
	// handle p-else
	if (node.tagName === "P-ELSE" && node.children.length>0) {
		return node.firstElementChild;
	}
	node.setAttribute("ignore","true")
	return treeFindNextNode(node);
}

function handleStartPWhile(node) {
	if (!isDOMElement(node) || node.tagName!=="P-WHILE") {
		throw new Error("There was no node <p-while cond=\"…\"> provided, instead:\n"+
		                stringifyNodeTag(node));
	}
	var condStr = node.getAttribute("cond");
	var cond = tryEval(condStr, at=node) == true;
	if (condStr === null) cond = true;
	
	if (cond && node.querySelector("p-slide,script") !== null) {
		// Should we enter the p-while loop?
		return node.firstElementChild;
	} else {
		// otherwise, we move on from the p-while loop:
		return treeFindNextNode(node);
	}
}


// give the current slide and get the next one.
// ??? Should we include p-set to dig in?
function findNextSlide(current) {
	if (current === null || !isDOMElement(current)) {
		throw new Error("Error when finding the next slide:\n\""+escapeString(stringify(current))+"\" is not a slide");
	}
	
	// if the argument is the body, we assume that we are looking for the first slide.
	var firstSlide = false;
	if (current.tagName === "BODY") {
		current = document.body.firstElementChild;
		if (current.tagName === "P-SLIDE") return current;
		firstSlide = true;
	}
	
	let candidate = treeFindNextNode(current);
	
	// Now final check before while loop if we kind of reached the end of all slides
	if (candidate === null) {
		throw new Error("There is no next slide because the last slide has already been reached.");
	}
	
	current = candidate;
	while (candidate !== null && candidate.tagName !== "P-SLIDE") {
		evalJSAttr(candidate);
		
		// nextElementSibling: go through all possibilities
		if (candidate === null) {
			console.error("Unexpected null value of the \"candidate\" element.");
			return null;
		} else if (candidate.tagName==="SCRIPT" && !firstSlide) { // script
			tryEval(candidate.innerText, at=candidate)
			candidate = treeFindNextNode(candidate)
		} else if (["AUDIO","VIDEO"].includes(candidate.tagName) && 
		           ![null,"false","0"].includes(candidate.getAttribute("autoplay"))) {
			candidate.play();
			candidate = treeFindNextNode(candidate);
		} else if (candidate.tagName === "P-WHILE") { // p-while
			candidate = handleStartPWhile(candidate);
		} else if (candidate.tagName === "P-IF") { // ... Now run p-if
			candidate = selectPIf(candidate);
		} else if (["P-ELIF","P-ELSE"].includes(candidate.tagName)) {
			candidate = treeFindNextNode(candidate)
		} else if (candidate.tagName==="P-SET" && candidate.children.length>0) { // !!! Changed: .children --> tag is p-set
			candidate = candidate.firstElementChild
		} else {
			candidate = treeFindNextNode(candidate)
		}
	}
	return candidate;
}

function findPreviousSlide(current) {
	if (current === null || !isDOMElement(current)) {
		throw new Error("Error when finding the next slide:\n\""+escapeString(stringify(current))+"\" is not a slide");
	}
	
	// if the argument is the body, we assume that we are looking for the first slide.
	var firstSlide = false;
	if (current.tagName === "BODY") {
		current = document.body.firstElementChild;
		firstSlide = true;
	}
	
	let candidate = treeFindPreviousNode(current);
	
	// Now final check before while loop if we kind of reached the end of all slides
	if (candidate === null) {
		console.warn("There is no previous slide because the first slide has already been reached.");
		return current;
	}
		
	while (candidate !== null && candidate.tagName !== "P-SLIDE") {
		
		// pause audio and video
		if (candidate !== null) {
			if (["AUDIO","VIDEO"].includes(candidate.tagName) && 
				![null,"false","0"].includes(candidate.getAttribute("autoplay"))) {
				candidate.pause();
			}
		}
		
		// nextElementSibling: go through all possibilities
		if (candidate === null) {
			console.error("Unexpected null value of the \"candidate\" element.");
			return null;
		} else if (candidate.getAttribute("ignore")!==null) {
			candidate = treeFindPreviousNode(candidate)
		} else if (candidate.querySelector("p-slide")!==null) {
			candidate = candidate.lastElementChild
		} else {
			candidate = treeFindPreviousNode(candidate)
		}
	}
	return candidate;
}

/*
p-records : at the beginning of every new slide: store in HTML document.
*/




function handleFullscreenChange(event) {
	if (!document.fullscreenElement && !document.webkitFullscreenElement &&
		!document.mozFullScreenElement && !document.msFullscreenElement) {
		
		console.log("Fullscreen exited!");
		pslides.fullscreen = false;
		if (typeof pslides.eventListeners.onfullscreenexit == "function") {
			pslides.eventListeners.onfullscreenexit(event)
		}
	} else {
		console.log("Fullscreen entered!");
		pslides.fullscreen = true;
		if (typeof pslides.eventListeners.onfullscreenenter == "function") {
			pslides.eventListeners.onfullscreenenter(event)
		}
	}
}

// Add event listener for fullscreen change
document.addEventListener("fullscreenchange", (event) => {handleFullscreenChange(event)});
document.addEventListener("webkitfullscreenchange", (event) => {handleFullscreenChange(event)});
document.addEventListener("mozfullscreenchange", (event) => {handleFullscreenChange(event)});
document.addEventListener("MSFullscreenChange", (event) => {handleFullscreenChange(event)});


window.onkeydown = (event) => {
	var eventTime = new Date();
	if (!event.repeat) {
		pslides.key.down.t.push(eventTime - pslides.slideStartTime)
		pslides.key.down.k.push(event.code)
		if (typeof pslides.eventListeners.onkeydown == "function") {
			pslides.eventListeners.onkeydown(event);
		}
	}
}

window.onkeyup = (event) => {
	// response time is always since slide onset!!!
	var eventTime = new Date();
	if (!event.repeat) {
		pslides.key.up.t.push(eventTime - pslides.slideStartTime)
		pslides.key.up.k.push(event.code)
		
		if (typeof pslides.eventListeners.onkeyup == "function") {
			pslides.eventListeners.onkeyup(event);
		}
		
		// if key is released, check if a key was pressed that changes to the next slide
		if (pslides.nextSlideKeys.includes(event.code) && pslides.key.down.k.includes(event.code)) {
			pslides.nextSlideKeys = [];
			changeSlide(1);
		} else if (pslides.backSlideKeys.includes(event.code) && pslides.key.down.k.includes(event.code)) {
			pslides.backSlideKeys = [];
			changeSlide(-1);
		}
	} else {
		console.error("Duplicate \"keyup\" event: Key has already been released.")
	}
}


pslides.getKeys = function(slidesback=-1) {
	if (outObj.slides.length<2 && slidesback<0) return [];
	if (slidesback == 0) return pslides.key.down.k;
	if (slidesback > 0) slidesback = -slidesback;
	if (slidesback < -outObj.slides.length+1) {
		throw new Error("Argument \"slidesback\" in pslides.getKeys() "+
		                "goes back further than the number of slides looked at.");
	}
	try {
		return outObj.slides[outObj.slides.length-1+slidesback].key.down.k;
	} catch {
		return [];
	};
}

pslides.matchKeys = function(code="", slidesback=-1) {
	if (slidesback > 0) slidesback = -slidesback;
	let keys = pslides.getKeys(slidesback); // 
	if (keys.length==0 && isEmpty(code)) return [true];
	if (keys.length==0) return [false];
	
	res = new Array(keys.length).fill(false);
	if (Array.isArray(code)) { // if code is an array, check if each last key is any of the codes
		for (var i=0; i<keys.length; i++) {
			if (code.includes(keys[i])) res[i] = true;
		}
	} else {
		for (var i=0; i<keys.length; i++) {
			if (code == keys[i]) res[i] = true;
		}
	}
	return res;
}

function stringifyTargetElement(target) {
	var el = target.tagName.toLowerCase();
	if (target.id!=="") { // id
		el = el+"[id="+target.id+"]";
	} else if (![undefined,null,""].includes(target.getAttribute("for"))) {
		el = el+"[for="+target.getAttribute("for")+"]";
	} else if (![undefined,null,""].includes(target.getAttribute("name"))) { // name
		el = el+"[name="+target.getAttribute("name")+"]";
	} else if (![undefined,null,""].includes(target.getAttribute("type"))) { // type
		el = el+"[type="+target.getAttribute("type")+"]";
	} else if (![undefined,null,""].includes(target.className)) { // class
		el = el+"[class="+target.className+"]";
	}
	return el;
}

function handleSendAttribute(node, onload=null) {
	if (!isDOMElement(node) ||
		(!["P-EXIT", "P-REDIRECT"].includes(node.tagName) &&
		 [null,"false","0"].includes(node.getAttribute("send"))) ) {
		return null;
	}
	var obj = null, js = node.getAttribute("js"),
		format = node.getAttribute("format");
	if (!isEmpty(js)) obj = tryEval(js, at=node);
	return sendOutData(element=node, data=obj, format=format, onload=onload);
}


function pointerUpHandleButtons(target) {
	// then, check if a key was pressed that changes to the next slide:
	if (["P-NEXT","P-BACK"].includes(target.tagName)) {
		var to = target.getAttribute("to"),
			disabled = ![null,"false"].includes(target.getAttribute("disabled"));
		if (disabled) {
			return;
		}
		
		handleSendAttribute(target);
		
		if (![null,""].includes(to)) {
			if (isNaN(Number(to))) {
				changeSlide(to) // this must be a slide id.
			} else {
				changeSlide(Number(to)) // this would be the number of slides forward or backward.
			}
		} else if (!disabled && target.tagName==="P-NEXT") {
			changeSlide(1)
		} else if (!disabled && target.tagName==="P-BACK") {
			changeSlide(-1)
		} else {
			console.error("Slide cannot be changed on pointer event here:\n"+stringifyNodeTag(target));
		}
	} else if (target.tagName==="P-REDIRECT") {
		// insert 
		if (!isDOMElement(target) || target.tagName !== "P-REDIRECT") return;
		
		// remove event listener for beforeunload:
		window.removeEventListener("beforeunload", pslides.beforeunload);
		
		handleSendAttribute(target, onload = () => {
			// update subject code!
			// console.log("target:", target);
			let href = target.getAttribute("href");
			let redir = createRedirectURI(href);
			var a = document.createElement("a");
			a.setAttribute("href", redir);
			document.body.appendChild(a);
			a.click();
			a.remove();
		});
	} else if (target.tagName==="P-UPLOAD") {
		sendOutData(element=target);
	} else if (target.tagName==="P-DOWNLOAD") {
		pslides.download(target)
	} else if (target.tagName==="P-EXIT") {
		
		// upload data:
		handleSendAttribute(target, onload = () => {
			var href = target.getAttribute("href");
			var params = extractParameter(["root","prj","subj"]);
			
			// remove event listener for beforeunload:
			window.removeEventListener("beforeunload", pslides.beforeunload);
			
			if ([null,undefined,""].includes(href) || href.trim() === "") {
				href = window.location.origin+pslides.serverRootPath+"/"+
				       params.root+"/"+params.prj+"/app/?subj="+params.subj;
			}
			
			// remove information from local storage:
			localStorage.removeItem("session");
			
			window.location.href = href;
		});
	}
}


function mouseMoveRecorder(event, time=null, resolution=0) {
	var time2 = new Date();
	if (time === null) time = time2;
	var lastX = pslides.mouse.x[pslides.mouse.x.length-1],
		lastY = pslides.mouse.y[pslides.mouse.y.length-1],
		lastT = pslides.mouse.t[pslides.mouse.t.length-1],
		newT  = time - pslides.slideStartTime;
	
	//if (lastX[lastX.length-1] !== event.clientX && lastY[lastY.length-1] !== event.clientY) {
	if (lastT !== undefined && 
	    (lastT[lastT.length-1] === undefined || 
	     newT - lastT[lastT.length-1] >= resolution)) {
		pslides.mouse.t[pslides.mouse.t.length-1].push(newT);
		pslides.mouse.x[pslides.mouse.x.length-1].push(event.clientX);
		pslides.mouse.y[pslides.mouse.y.length-1].push(event.clientY);
	}
}


function lastArrayValue(x) {
	while (Array.isArray(x)) {
		if (x.length === 0) {
			return undefined;
		} else {
			x = x[x.length-1]
		}
	}
	return x;
}

function stringifyHTMLAttribute(name, value="") {
	if ([undefined,null,""].includes(value) || value.trim() === "") {
		return "";
	}
	return " "+name+"=\""+escapeString(value)+"\"";
}

// ????
pslides.changeSubjCode = function(node) {
	return node.value;
}


// Event handler for pointer events
function recordPointerEvent(event) {
	var time = Number(new Date()),
		pointer = event;
	//console.log("time: ",time)
	//console.log("event.type: ",event.type)
	//console.log("pslides.activePointers: ",pslides.activePointers);
	//console.log("event ended? ",["pointerup","pointercancel","mouseup","touchend","touchcancel"].includes(event.type))
	//console.log("pslides.activePointers: ", pslides.activePointers)
	
	const identifier = pointer.pointerId,
		  pointerData = pslides.activePointers.get(identifier);
	//console.log("pointerData", pointerData)
	if (["pointerdown","mousedown","touchstart"].includes(event.type) || pointerData === undefined) {
		//console.log("Pointer started!");
		// Initialize arrays for a new pointer
		pslides.activePointers.set(identifier, {
			t:    [time], // Store timestamp as Date object
			x:    [Math.round(event.clientX)],
			y:    [Math.round(event.clientY)],
			rx:   [Math.round(event.radiusX)],
			ry:   [Math.round(event.radiusY)],
			f:    [Math.round(event.force*1000)],
			ang:  [Math.round(event.rotationAngle)],
			type: event.pointerType,
			el0:  stringifyTargetElement(event.target),
		});
		if (event.type==="mouse") pslides.isClickedDown = true;
	} else if (["pointermove","mousemove","touchmove"].includes(event.type)) {
		//console.log("Pointer moves!")
		const lastT = lastArrayValue(pointerData.t);
		if (((event.type==="mouse" && pslides.isClickedDown) || event.type!=="mouse") && 
		    lastT !== undefined && time - lastT >= pslides.settings.pointerTemporalResolution) {
			
			// Append new data to existing arrays
			pointerData.t.push(time);
			pointerData.x.push(Math.round(event.clientX));
			pointerData.y.push(Math.round(event.clientY));
			pointerData.f.push(Math.round(event.force*1000));
			pointerData.rx.push(Math.round(event.radiusX));
			pointerData.ry.push(Math.round(event.radiusY));
			pointerData.ang.push(Math.round(event.rotationAngle));
		}
	} else if (["pointerup","pointercancel","mouseup","touchend","touchcancel"].includes(event.type)) {
		//console.log("Pointer ended!");
		// Append final data
		pointerData.t.push(time);
		pointerData.x.push(pointerData.x[pointerData.x.length-1]);
		pointerData.y.push(pointerData.y[pointerData.y.length-1]);
		pointerData.f.push(Math.round(event.force*1000));
		pointerData.rx.push(Math.round(event.radiusX));
		pointerData.ry.push(Math.round(event.radiusY));
		pointerData.ang.push(Math.round(event.rotationAngle));
		pointerData.type = event.pointerType;
		
		// Store the pointer's arrays in the pointer object
		
		//console.log("pointerData.t: ", pointerData.t)
		//console.log("pslides.pointer.t: ", pslides.pointer.t)
		
		var times = [];
		for (var i=0;i<pointerData.t.length;i++) {
			times.push(pointerData.t[i] - pslides.slideStartTime);
		}
		pslides.pointer.t.push(times);
		//console.log("pointerData.x", pointerData.x)
		pslides.pointer.x.push(pointerData.x);
		pslides.pointer.y.push(pointerData.y);
		pslides.pointer.f.push(pointerData.f);
		pslides.pointer.rx.push(pointerData.rx);
		pslides.pointer.ry.push(pointerData.ry);
		pslides.pointer.ang.push(pointerData.ang);
		pslides.pointer.el0.push(pointerData.el0);
		pslides.pointer.el1.push(stringifyTargetElement(event.target));
		pslides.pointer.type.push(pointerData.type);
		// set a pointer type! mouse/touch/pen
		
		// Remove from active touches
		pslides.activePointers.delete(identifier);
		//console.log("see if still not deleted", pslides.activePointers.get(identifier))
		if (event.type==="mouse") pslides.isClickedDown = false;
	}
}


document.addEventListener("visibilitychange", (event) => {
	var time = new Date() - pslides.slideStartTime;
	if (!event.repeat) {
		pslides.visibility.state.push(document.visibilityState)
		pslides.visibility.t.push(time)
		if (typeof pslides.eventListeners.onvisibilitychange == "function") {
			pslides.eventListeners.onvisibilitychange(event);
		}
	}
	//console.log("visibilitychange event: ", event)
	//console.log("document.visibilityState: ", document.visibilityState)
})

document.addEventListener("blur", (event) => {
	var time = new Date() - pslides.slideStartTime;
	if (!event.repeat) {
		pslides.visibility.state.push("blur")
		pslides.visibility.t.push(time)
		if (typeof pslides.eventListeners.onblur == "function") {
			pslides.eventListeners.onblur(event);
		}
	}
	//console.log("blur event, ", event)
})

document.addEventListener("focus", (event) => {
	var time = new Date() - pslides.slideStartTime;
	if (!event.repeat) {
		pslides.visibility.state.push("focus")
		pslides.visibility.t.push(time)
		if (typeof pslides.eventListeners.onfocus == "function") {
			pslides.eventListeners.onfocus(event);
		}
	}
	//console.log("focus event, ", event)
})

document.addEventListener("pointerdown", (event) => {
	var time = new Date();
	if (!event.repeat) {
		recordPointerEvent(event);
		if (typeof pslides.eventListeners.onpointerdown == "function") {
			pslides.eventListeners.onpointerdown(event);
		}
	}
})

document.addEventListener("pointermove", (event) => {
	var time = new Date();
	if (!event.repeat) {
		recordPointerEvent(event);
		if (typeof pslides.eventListeners.onpointermove == "function") {
			pslides.eventListeners.onpointermove(event);
		}
	}
})

document.addEventListener("pointerup", (event) => {
	// first, record mouse movements:
	recordPointerEvent(event);
	if (typeof pslides.eventListeners.onpointerup == "function") {
		pslides.eventListeners.onpointerup(event);
	}
	// then, check if a key was pressed that changes to the next slide:
	pointerUpHandleButtons(event.target);
})

document.addEventListener("pointercancel", (event) => {
	// first, record pointer movements:
	recordPointerEvent(event);
	if (typeof pslides.eventListeners.onpointercancel == "function") {
		pslides.eventListeners.onpointercancel(event);
	}
	// then, check if a key was pressed that changes to the next slide:
})

pslides.beforeunload = function(event) {
	// Final save using Beacon (guaranteed delivery)
	event.preventDefault();
	
	handleSendAttribute(document.documentElement);
		
	// Show native browser confirmation if there are unsaved changes
	// Standard message (browsers ignore custom text for security)
	const message = pslides.printMessage("BeforeClosingWindow");
	event.returnValue = message; // for legacy browsers
	return message;          // for modern browsers
}

window.addEventListener("beforeunload", pslides.beforeunload)

window.onload = function() {
	// fill in external data
	// src="nct_stimuli_pdata.csv"; addTextFromUrl(checkURL(src), document.querySelectorAll("p-data")[0].innerHTML)
	
	// load experiment information: start_session.php
	createSubjCodes();
	pslides.setLanguage();
	
	//handlePData();
	
	//handleDataid();
	//handleOnclicks();
	// sample <p-set>
	
	//handleFillid();
	
	// initialize the array for querySelectorAll()
	var d = [];
	
	//d = document.querySelectorAll("p-input");
	//for (var i=0; i<d.length; i++) unpackPInput(d[i]);
	
	//var d = document.querySelectorAll("[jsattr][jsfill]");
	//for (var i=0; i<d.length; i++) evalJSAttr(d[i]);
	
	// shuffle all children in <p-set> tags
	// d = document.querySelectorAll("p-set");
	// for (var i=0; i<d.length; i++) handlePSet(d[i]);
	
	// select tag: create a default value!
	d = document.querySelectorAll("select");
	for (var i=0; i < d.length; i++) {
		d[i].insertAdjacentHTML("afterbegin", "<option value=''> </option>");
	}
	handleAllGenCodes();
	
	// last slide has extra button
	const lastSlide = document.createElement("p-slide");
	lastSlide.innerHTML = "<p-center><p>Exit website:</p><p-exit>Exit</p-exit></p-center>"
	document.body.appendChild(lastSlide);
		
	
	pslides.currentSlide = findNextSlide(document.body);
	pushSlide();
	pslides.currentSlide.setAttribute("p_hiddenclass", "current"); // make first slide visible
	pslides.currentSlide.setAttribute("current", "");              // mark first slide
	prepareSlide(pslides.currentSlide)
	
	// idfill
	var idfills = document.querySelectorAll("[idfill]")
	for (var i=0; i<idfills.length; i++) unpackIdFill(idfills[i]);
	
	// lastSubmission time:
	pslides.lastSubmission = Number(new Date());
	
	console.log("PSlides loaded.")
}


// Start observing mutations:
pslides.mutationObserver.observe(document.documentElement, {
	childList:     true, // watch direct additions/removals
	subtree:       true, // watch the whole tree under the target
	attributes:    true,  // set true if you also want attribute changes
	CharacterData: true
});


// Open fullscreen
function openFullScreen() {
	var d = document.documentElement;
	if (d.requestFullscreen) {
		d.requestFullscreen();
	} else if (d.webkitRequestFullscreen) { // Safari
		d.webkitRequestFullscreen();
	} else if (d.msRequestFullscreen) { // IE11
		d.msRequestFullscreen();
	}
}

// Close fullscreen
function closeFullScreen() {
	if (window.matchMedia('(display-mode: fullscreen)').matches) {
	var d = document;
	if (d.exitFullscreen) {
			d.exitFullscreen();
		} else if (d.webkitExitFullscreen) { // Safari
			d.webkitExitFullscreen();
		} else if (d.msExitFullscreen) { // IE11
			d.msExitFullscreen();
		}
	}
}

function isFullscreen() {
	return (window.fullScreen) || 
	(window.innerWidth  == window.screen.width && 
	 window.innerHeight == window.screen.height);
}

function validEmail(x) {
	var res = false, at = x.indexOf("@"), aft = x.substring(at+1);
	if (at>-1 && aft.lastIndexOf(".")>1 && 
	    aft.substring(0, aft.indexOf(".")).length > 0 && // domain name longer than 0
	    aft.substring(aft.lastIndexOf(".")+1, aft.length).length > 1) res = true; // top level domain longer than 1
	return res;
}

function validPhone(x) {
	var res = true, vec = x.split("");
	x = x.replace(/\s+/g,"").replaceAll("/","").replaceAll("-","")
	if (x[0]==="+") x[0]="";
	if (x.length<4) {
		res = false;
	} else {
		for (var i=0;i<vec.length;i++) {if ("0123456789".indexOf(vec[i])<0) {res = false; break;}}
	}
	return res;
}

function isSlideAnswered(slide) {
	// slide = document.querySelector("slide.current")
	let Continue = true,
		d = slide.querySelectorAll("select[required],input[required],textarea[required]");
	//console.log("Queried Slide:\n", slide)
	if (d.length > 0) {
		for (var i=0;i<d.length;i++) {
			//console.log("required?\n", d);
			var res = false;
			//console.log(d[i].outerHTML)
			
			// If it's a radio button
			if (d[i].tagName==="INPUT" && d[i].getAttribute("type") === "radio" && d[i].getAttribute("name") !== null) {
				var d2 = slide.querySelectorAll("input[type='radio'][name='" + d[i].getAttribute("name") + "']");
				var res2 = false;
				for (var j=0;j<d2.length;j++) {
					if (d2[j].checked) {res2 = true};
				}
				if (res2) {res = true};
			} else if (d[i].tagName==="INPUT" && 
			           ((d[i].getAttribute("type") === "checkbox" && !d[i].checked) || 
					    (d[i].getAttribute("type") === "email"    && !validEmail(d[i].value)) ||
						(d[i].getAttribute("type") === "tel"      && !validPhone(d[i].value))) ) {
				res = false;
			} else if (d[i].value==="" && (d[i].tagName==="SELECT" || d[i].tagName==="TEXTAREA" || d[i].tagName==="INPUT")) { // && d[i].getAttribute("type")==="text"
				res = false;
			} else {
				res = true;
			}
			
			// if res is false
			var dn = slide.querySelectorAll("[name='" + d[i].getAttribute("name") + "'],[for='"+d[i].id+"']");
			// take the name and color it all red.
			
			if (!res) Continue = res;
			for (var j=0; j<dn.length;j++) {
				if        (!res && ((dn[j].tagName==="INPUT" && (dn[j].getAttribute("type")==="text" || 
				           dn[j].getAttribute("type")==="email" || dn[j].getAttribute("type")==="tel")) || dn[j].tagName==="TEXTAREA")) {
					dn[j].style.backgroundColor="#FFCCCC";dn[j].style.borderColor="#DD0000";
				} else if (!res) {
					dn[j].style.color="#DD0000"; //dn[j].style.fontWeight="bold";
				} else if (res && ((dn[j].tagName==="INPUT" && (dn[j].getAttribute("type")==="text" || 
				           dn[j].getAttribute("type")==="email" || dn[j].getAttribute("type")==="tel")) || dn[j].tagName==="TEXTAREA")) {
					dn[j].style.backgroundColor=null;dn[j].style.borderColor=null;
				} else if (res) {
					dn[j].style.color=null; //dn[j].style.fontWeight=null;
				}
			}
			// with email, phone or anything like this: add an error span with an "!" that people can hover over to see a message.
		}
	}
	//console.log(Continue)
	return Continue;
}

function listAllOnEvents() {
	var res = [];
	try {
		res = Object.getOwnPropertyNames(document).concat(Object.getOwnPropertyNames(Object.getPrototypeOf(Object.getPrototypeOf(document)))).filter(function(i){return !i.indexOf('on')&&(document[i]==null||typeof document[i]=='function');});
	} catch(e) {
		console.error("listAllOnEvents() failed: It could not list all possible events.");
	}
	return res;
}

function nestedness(node, verbose=false) {
	var res = "", resb = "",
		ignored = ["p_hiddenclass","current","jsfill","idfill","cond","jsattr"].concat(listAllOnEvents()),
		wanted = ["name","id","type","class"];
	while (node !== null && node !== undefined && node.tagName !== "HTML") {
		var resArr = [], attr = node.attributes
		for (var i=0;i<attr.length;i++) {
			if (!verbose && wanted.includes(attr[i].name)) {
				resArr.push(attr[i].name + "=" + escapeString(attr[i].value))
			} else if (verbose && !ignored.includes(attr[i].name) && 
			           ![undefined, null].includes(attr[i].value)) {
				resArr.push(attr[i].name + "=" + escapeString(attr[i].value))
			}
		}
		resb = ">" + node.tagName.toLowerCase()
		if (resArr.length>0) {resb = resb+"["+resArr.join(",")+"]";}
		res = resb + res;
		node = node.parentElement;
	}
	return(res.substring(1))
}

function handlePIf(pif) {
	var cond = tryEval(pif.getAttribute("cond"), at=pif),
		res = null;
	if (cond !== true) { // is the condition true or false?
		pif.setAttribute("ignore", "true")
	} else {
		res = pif; pif.removeAttribute("ignore")
	}
	pif = pif.nextElementSibling;
	console.log("P-IF", pif)
	while (pif !== null && pif.tagName === "P-ELIF") {
		if (res !== null) {
			pif.setAttribute("ignore", "true")
		} else {
			cond = tryEval(pif.getAttribute("cond"), at=pif);
			if (cond !== true) {
				pif.setAttribute("ignore", "true")
			} else {
				res = pif; pif.removeAttribute("ignore")
			}
		}
		pif = pif.nextElementSibling;
		console.log("P-IF", pif)
	}
	if (pif !== null && res !== null && pif.tagName === "P-ELSE") {
		pif.setAttribute("ignore", "true")
	} else if (pif !== null && pif.tagName === "P-ELSE") {
		res = pif; pif.removeAttribute("ignore")
	}
	return res;
}

function getDistantCousin(node) {
	var d = node;
	while (d.nextElementSibling === null && d.tagName !== "P-SLIDE") {
		d = d.parentElement;
	}
	if (d.tagName !== "P-SLIDE" && d.nextElementSibling !== null) {
		d = d.nextElementSibling;
	}
	return d;
}

// DYSFUNCTIONAL FOR P-IF ?
function renderSlide(slide) {
	var d = slide.firstElementChild, cond=false;
	pslides.autoplayed = [];
	while (d !== null && d !== slide) {
		// First, move to the next node and try to render
		
		// Now process the next element:
		evalJSAttr(d);
		//console.log("evalJSAttr()", stringifyNodeTag(d))
		
		
		 /*else if (d.tagName === "P-WHILE") { // p-while inside p-slide, what to do??
			var cond = tryEval(d.getAttribute("cond"),at=d)
			if (cond === true) {
				d.removeAttribute("ignore");
			} else {
				d.setAttribute("ignore","true");
			}
		}*/
		
		/* if (!["SVG","P-GENCODE","P-SUBJCODE","BR"].includes(d.tagName)) {
			
		} else */
		if (d.tagName === "SCRIPT") {
			//console.log("renderSlide SCRIPT: ", d)
			tryEval(d.innerHTML, at=d)
		} else if (["AUDIO","VIDEO"].includes(d.tagName) && 
		           ![null,"false","0"].includes(d.getAttribute("autoplay"))) {
			pslides.autoplayed.push(d);
		}
		
		if (d.tagName === "P-IF") {
			d = handlePIf(d);
			if (d !== null && d.tagName === "P-IF" && d.firstElementChild !== null) {
				d = d.firstElementChild;
			} else if (d !== null && d.tagName === "P-IF" && d.nextElementSibling !== null) {
				d = d.nextElementSibling;
			} else if (d !== null && d.tagName === "P-IF") {
				d = getDistantCousin(d);
			}
			console.log("current d: ", d)
		} else if (["P-ELIF","P-ELSE"].includes(d.tagName) && d.nextElementSibling !== null) {
			d = d.nextElementSibling
		} else if (["P-ELIF","P-ELSE"].includes(d.tagName)) {
			d = getDistantCousin(d)
		} else if (d.firstElementChild !== null) {
			d = d.firstElementChild;
		} else if (d.nextElementSibling !== null) {
			d = d.nextElementSibling;
		} else {
			// d = d.parentElement;
			d = getDistantCousin(d)
		}
	}
}

function hasParentAttribute(node, attr="p_hiddenclass", value="never") {
	var res = false;
	while (node.tagName !== "HTML" && res === false) {
		if (node.getAttribute(attr) === value) res = true;
		node = node.parentElement
	}
	return res;
}

function prepareSlide(slide) {
	// fullscreen?
	//evalJSAttr(slide)
	renderSlide(slide);
	var attr = slide.attributes, counter=outObj.slides.length-1,
		fullscreen_var = null, maxms_var = Infinity;
	for (var i=0;i<attr.length;i++) {
		var attrn = attr[i].name, attrg = slide.getAttribute(attr[i].name), attrv = attr[i].value;
		if (attrn === "maxms") {
			var eV = "";
			try {
				eV = stringify(attrg);
			} catch {
				eV = stringify(attrv);
			}
			slide.setAttribute(attrn, eV);
			outObj.slides[counter].attributes.maxms = eV;
		} else if (attrn === "fullscreen" && attrg !== null && attrg !== "false") {
			outObj.slides[counter].attributes.fullscreen = true
		} else if (attrn.substring(0,2) !== "p_" && attrn !== "current") {
			outObj.slides[counter].attributes[attrn] = attrv;
		}
	}
	//console.log("maxms inside after prepareSlide(): ", slide.getAttribute("maxms"))
	
	// set if the it is currently viewed in fullscreen mode:
	//console.warn("pslides.fullscreen", pslides.fullscreen)
	outObj.slides[counter].fullscreen = pslides.fullscreen // window.matchMedia('(display-mode: fullscreen)').matches;
	
	var fullscreen_var = tryEval(slide.getAttribute("fullscreen"), at=slide),
		maxms_var      = tryEval(slide.getAttribute("maxms"),      at=slide);
	if (!["false","0",false,0].includes(fullscreen_var) && pslides.fullscreen === true) {
		fullscreen_var = true;
	}
	if ([undefined,null].includes(maxms_var)) {
		maxms_var = Infinity;
	}
	
	// if fullscreen_var is true, turn on full screen, else: close fullscreen
	// the first slide can't be fullscreen
	var isFirstSlide = slide===document.querySelector("p-slide")
	if (fullscreen_var===true && !isFirstSlide) {  // !pslides.fullscreen && 
		try {
			openFullScreen()
			console.log("Open full screen.")
		} catch(e) {
			console.warn("On openFullScreen(): ", e);
		}
	} else if (fullscreen_var===false) { // pslides.fullscreen && 
		try {
			closeFullScreen()
			console.log("Close full screen.");
		} catch(e) {
			console.warn("On closeFullScreen(): ", e);
		}
	}
	
	pslides.backSlideKeys = [];
	pslides.nextSlideKeys = [];
	var keysback = slide.getAttribute("keysback"),
		keysnext = slide.getAttribute("keysnext");
	if (keysback !== null) pslides.backSlideKeys = splitWhitespace(keysback);
	if (keysnext !== null) pslides.nextSlideKeys = splitWhitespace(keysnext);
	
	// Create a record node:
	var record = document.createElement("p-records");
	slide.appendChild(record);
	pslides.records = record;
	
	// set time if it is set on the slide
	if (typeof maxms_var !== "number" || isNaN(maxms_var) || maxms_var <= 0) {
		console.error("Attribute \"maxms\" must evaluate to be a number > 0, not "+stringify(maxms_var));
		maxms_var = Infinity;
	}
	return maxms_var;
}

function createRecord(node=pslides.currentSlide, name=null, value) {
	var allRecords = node.querySelectorAll("p-records"), record = null;
	if (allRecords.length > 0) {
		record = allRecords[allRecords.length-1]
	} else {
		record = document.createElement("p-records");
		node.appendChild(record);
	}
	var el = document.createElement("p-response");
	if (name !== null) el.setAttribute("name", name);
	if (Array.isArray(value)) value = stringifyArray(value);
	el.innerHTML = escapeHTML(stringify(value))
	record.appendChild(el);
}

function browseSlides(slide, next=0) {
	if (next===0) {
		return slide;
	} else if (typeof next === "string") {
		var idSlide = document.getElementById(next);
		if (idSlide === null || idSlide.tagName !== "P-SLIDE") return slide;
		return idSlide;
	} else if (next > 0) {
		for (var i=0; i<next; i++) slide = findNextSlide(slide);
	} else if (next < 0) {
		for (var i=0; i<Math.abs(next); i++) slide = findPreviousSlide(slide);
	}
	return slide;
}

function getRecords(slide=pslides.currentSlide, n=0) {
	var records = slide.querySelectorAll("p-records");
	while (slide !== null && records.length===0) {
		slide = findPreviousSlide(slide);
		records = slide.querySelectorAll("p-records");
	}
	return records;
}

function stringifyArray(x, sep=[" ",";"]) {
	if (!Array.isArray(x)) return stringify(x);
	// x = [[5,6],[1,2,3]]; sep=[" ",";"]
	
	var res = JSON.parse(JSON.stringify(x));
	
	for (var i=0; i<res.length; i++) {
		if (Array.isArray(res[i])) {
			for (var j=0; j<res[i].length; j++) {
				res[i][j] = stringify(res[i][j])
			}
			res[i] = res[i].join(sep[0]);
		} else {
			res[i] = stringify(res[i])
		}
	}
	res = res.join(sep[1]);
	return res;
}

function isEmpty(x, extra=[]) {
	return [null, undefined, ""].concat(extra).includes(x);
}

// create the key of the recorded element:
function recordKey() {
	
}

function recordPInput(node) {
	if (node.tagName!=="P-INPUT") return null;
	var id    = node.id,
		name  = node.getAttribute("name"),
		type  = node.getAttribute("type"),
		value = node.querySelector("input").value,
		key   = "pinput",
		res   = {};
	
	if (!isEmpty(id)) {
		key = id;
	} else if (!isEmpty(name)) {
		key = name;
	} else if (!isEmpty(type)) {
		key = type;
	} else {
		key = stringifyNodeTag(node);
	}
	
	if (type === "checkbox") {
		var inputs = node.querySelectorAll("input,[value],[id]")
		for (var i=0; i<inputs.length; i++) {
			//res[] = ;
		}
	} else if (isEmpty(type)) {
		//res[key] = 
	}
	
}

// capture values from elements into an object "obj"
function recordElement(node, obj) {
	if (!("content"   in obj)) obj.content   = {};
	if (!("variables" in obj)) obj.variables = {};
	if (!("records"   in obj)) obj.records   = {};
	
	var type = ifNullStr(node.getAttribute("type"),"NA").toLowerCase(),
		tag  = ifNullStr(node.tagName,"NA").toLowerCase(),
		id   = node.getAttribute("id"),
		name = node.getAttribute("name"),
		cl   = node.getAttribute("name");
	
	if (name === null && node.getAttribute("jsfill") !== null) {
		name = node.getAttribute("jsfill").trim().replace(/[^a-zA-Z0-9]/g, '_')
	}
	var key  = tag, parsed_var = "";
	if (!isEmpty(id)) {
		key = id;
	} else if (!isEmpty(name)) {
		key = "name=" + name;
	} else if (!isEmpty(type)) {
		if (!isEmpty(cl)) {
			key = tag+"."+cl+",type="+type;
		} else {
			key = tag+",type="+type;
		}
	} else if (!isEmpty(cl)) {
		key = tag+"."+cl
	} else {
		key = "tag="+tag;
	}
	
	// is subject input sensitive?
	if (node.getAttribute("sensitive") !== null || ["email","tel","password"].includes(type)) {
		console.warn("No data that reveal personal information should be submitted.");
	} else if (tag === "input" && ["checkbox","radio"].includes(type)) {
		obj.content[key] = String(node.checked);
	} else if (tag === "input" && type === "text") {
		obj.content[key] = node.value;
	} else if (["input","textarea","select"].includes(tag)) {
		obj.content[key] = node.value;
	} else if (tag === "span" && node.parentElement.tagName==="P-GENCODE") {
		obj.content[key.replace("span","p-gencode")] = node.innerText;
	} else if (tag === "p-var" && [undefined,null,""].includes(name)) {
		parsed_var = parse(node.innerHTML);
		if (parsed_var !== null && typeof parsed_var === "object" && !Array.isArray(parsed_var)) {
			obj.variables = {...obj.variables, ...parsed_var};
		} else {
			obj.variables = parsed_var;
		}
	} else if (tag === "p-var") {
		if (!(name in obj.variables)) obj.variables[name] = {};
		obj.variables[name] = parse(node.innerHTML);
	} else if (tag === "p-response") {
		obj.records[key] = parse(node.innerHTML);
	} else {
		//console.log("Response (node.innerHTML): ", node)
		obj.content[key] = node.innerHTML;
	}
		
	return obj;
}



// which "next page" is clicked
function changeSlide(next=1) {
	pslides.slideEndTime = new Date();
	pslides.slideNumber++;
	if (pslides.slideTimerTimeout !== null) {
		clearTimeout(pslides.slideTimerTimeout);
		pslides.slideTimerTimeout = null;
	}
	
	// stop any played audio or video files
	if (!Array.isArray(pslides.autoplayed)) pslides.autoplayed = [];
	for (var i=0; i<pslides.autoplayed.length; i++) {
		var playing = !pslides.autoplayed[i].paused;
		pslides.autoplayed[i].pause();
		if (playing) {
			var playReset = pslides.autoplayed[i].getAttribute("autoreset");
			if (playReset !== null && !isNaN(Number(playReset))) {
				pslides.autoplayed[i].currentTime = Number(playReset);
			} else if (playReset !== null && playReset.trim().toLowerCase() !== "false") {
				pslides.autoplayed[i].currentTime = 0
			}
		}
	}
	
	// go through all inputs in the p-slide (except for keyboard responses):
	var oldSlide = pslides.currentSlide; // document.querySelector("p-slide[current]");
	var d = oldSlide.querySelectorAll("input,textarea:not(p-input textarea),select:not(p-input select),p-gencode>span,p-var"), // [name]:not(p-records>[name],p-input), input:not(p-input input)
		tmpRes = {content:{}, variables:{}, order:{}, records:{}, 
		          key: pslides.key, pointer: pslides.pointer, visibility: pslides.visibility};
	//console.error("tmpRes.mouse: ", tmpRes.mouse)
	for (var i=0; i<d.length; i++) {
		tmpRes = recordElement(d[i], tmpRes);
	}
	
	// collect any (potential) additional records (e.g., from swipes or mouse clicks):
	d = pslides.records.querySelectorAll("*"); // p-response
	for (var i=0; i<d.length; i++) {
		tmpRes = recordElement(d[i], tmpRes);
	}
	
	// console.warn("tmpRes: ", tmpRes);
	
	tmpRes.durationTimeMS = pslides.slideEndTime - pslides.slideStartTime;
	tmpRes.absoluteTimeMS = Number(pslides.slideStartTime);
	tmpRes.HTMLbranch     = nestedness(oldSlide);
	
	// add to the current outObj slide:
	outObj.slides[outObj.slides.length-1] = {...outObj.slides[outObj.slides.length-1] , ...tmpRes};
	//console.log("outObj.slides[outObj.slides.length-1]", outObj.slides[outObj.slides.length-1])
	
	// handle if slide is fully answered
	var fullyAnswered = isSlideAnswered(oldSlide);
	// console.log("fullyAnswered?\n",fullyAnswered);
	if (typeof next === "number" && next>0 && !fullyAnswered) {
		alert(pslides.printMessage("UnansweredQuestions"));
		return;
	}
	
	// create p-response tags to store button responses on the HTML document
	createRecord(node=oldSlide, name="durationTimeMS", value=tmpRes.durationTimeMS)
	createRecord(node=oldSlide, name="absoluteTimeMS", value=Number(pslides.slideStartTime))
	createRecord(node=oldSlide, name="key.down.k", value=tmpRes.key.down.k)
	createRecord(node=oldSlide, name="key.down.t", value=tmpRes.key.down.t)
	createRecord(node=oldSlide, name="key.up.k",   value=tmpRes.key.up.k)
	createRecord(node=oldSlide, name="key.up.t",   value=tmpRes.key.up.t)
	createRecord(node=oldSlide, name="pointer.x", value=stringifyArray(tmpRes.pointer.x))
	createRecord(node=oldSlide, name="pointer.y", value=stringifyArray(tmpRes.pointer.y))
	createRecord(node=oldSlide, name="pointer.t", value=stringifyArray(tmpRes.pointer.t))
	createRecord(node=oldSlide, name="pointer.el0", value=stringifyArray(tmpRes.pointer.el0))
	createRecord(node=oldSlide, name="pointer.el1", value=stringifyArray(tmpRes.pointer.el1))
	
	// for the new slide: reset the button response:
	// delete all event listeners:
	
	// get the current instance of pslides into the outObj !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	
	pslides.pointer    = {t:[],x:[],y:[],f:[],rx:[],ry:[],ang:[],el0:[],el1:[],type:[]};
	pslides.key        = {up:{t:[],k:[]}, down:{t:[],k:[]}};
	pslides.visibility = {t:[], state:[]};
	
	// add responses to the "outObj" object:
	var newSlide = browseSlides(oldSlide, next);
	
	oldSlide.removeAttribute("current");
	newSlide.setAttribute("current",""); // set the new current slide
	oldSlide.removeAttribute("p_hiddenclass"); // make this slide disappear
	newSlide.setAttribute("p_hiddenclass", "hidden"); // new slide is hidden
	
	//console.log("oldSlide:",oldSlide)
	//console.log("newSlide:",newSlide)
	
	window.scrollTo(0, 0) // scroll back to the top
	
	////// NOW RENDER NEW SLIDE
	
	// First, we initiate a new slide for the outObj.
	pushSlide();
	// extract maxms from the new slide.
	pslides.currentSlide = newSlide;
	var maxms = prepareSlide(newSlide);
	newSlide.setAttribute("p_hiddenclass", "current");
	/*
	document.getElementById("myaudio").play()
	setTimeout(function(){var audio = document.getElementById("myaudio"); audio.pause(); audio.currentTime = 0}, 1000)
	*/
	pslides.slideStartTime = new Date();
	for (var i=0; i<pslides.autoplayed.length; i++) {
		pslides.autoplayed[i].play();
	}
	
	if (maxms < Infinity) {
		const const_slideNumber = pslides.slideNumber;
		setTimeout(
			function() {
				if (const_slideNumber === pslides.slideNumber) {
					changeSlide(1)
				} else {
					console.log("Slide already passed.")
				}
			},
			maxms
		);
	}
}



function unnestObj(map, stringifyArrays=false) {
	// obj = outObj;map=JSON.parse(JSON.stringify(obj))
	var csv = [], 
		isIncomplete = true, keys=[], keys2=[], levels=11;
	while (isIncomplete && levels>0) {
		levels--;
		isIncomplete = false;
		keys = Object.keys(map);
		for (var i=0; i<keys.length; i++) {
			//keys[i] = keys[i].replaceAll(".","\\.")
			if (map[keys[i]] === null) {
				map[keys[i]] = "null"
			} else if (typeof map[keys[i]] == "object" && map[keys[i]].length === undefined) {
				// if it is a JSON object
				keys2 = Object.keys(map[keys[i]])
				for (var j=0; j<keys2.length; j++) {
					map[keys[i]+"."+keys2[j]] = map[keys[i]][keys2[j]];
				}
				delete map[keys[i]];
				isIncomplete = true;
			} else if (Array.isArray(map[keys[i]])) {
				// if it is an array
				
				// stringifyArrays = false
				if (stringifyArrays) {
					//for (var j=0; j<map[keys[i]].length; j++) {
					//	map[keys[i]+"["+j+"]"] = map[keys[i]][j]
					//}
					//delete map[keys[i]];
					//console.warn("stringifyArray(map[keys[i]]):\n", stringifyArray(map[keys[i]]))
					map[keys[i]] = stringifyArray(map[keys[i]]);
				}// else {
					//map[keys[i]] = JSON.stringify(map[keys[i]])
						//.replace(/"(\w+)"\s*:/g, "$1:")     // get rid of quotation marks around key strings
						//.replace(/,(?=\s*"\w+"\s*:)/g, " ") // replace the commas between key-value pairs with space
						//.replaceAll("},{","}{")             // get rid of commas between objects
				//}
				isIncomplete = true;
			} else if (typeof map[keys[i]] !== "string") {
				map[keys[i]] = stringify(map[keys[i]])
			}
		}
	}
	// now we have an object, turn that to an array
	return map;
}

pslides.standardizeArray = function(array, defaultObj={}) {
	// array = JSON.parse(JSON.stringify(outObj.slides)); defaultObj = JSON.parse(JSON.stringify(outObj)); delete defaultObj.Slides; defaultPrefix="SESSION"
	// pslides.standardizeArray([{"a":2,"b":3},{"a":4,"b":5,"c":9}],{"default":"value"})
	var csv = [], defaultKeys = [], newDefault={}, keys=[]; 
	
	// There is a default Object that will be added to each row 
	/*
	if (defaultObj !== null) {
		newDefault = unnestObj(defaultObj);
	}
	*/
	
	// First, unnest each row, then collect the keys.
	for (var i=0; i<array.length; i++) {
		array[i] = unnestObj(array[i], true);
		keys = unique(keys.concat(Object.keys(array[i])));
	}
	
	// Now fill up all empty cells with the "keys":
	for (var i=0; i<array.length; i++) {
		// Go through keys and add empty cells:
		for (var j=0; j<keys.length; j++) {
			if ([undefined,null].includes(array[i][keys[j]])) array[i][keys[j]] = "";
		}
		// Now we fuse the default:
		csv.push({...defaultObj, ...array[i]});
	}
		
	return csv;
}

pslides.stringifyCSV = function(csvArray) {
	// csvArray = outObj.slides
	
	// 1. Check if the keys for each row are the same.
	// If a key is not included in all rows, add it to the column names and leave the value empty?
	// 
	
	// var csvArray = outObj.slides
	
	var csvArray = pslides.standardizeArray(csvArray), keys = Object.keys(csvArray[0]), header = [], body=[], row=[];
		
	// First, make the header:
	for (var i=0; i<keys.length; i++) {
		header.push("\""+escapeString(keys[i])+"\"")
	}
	header = header.join(",")
	
	for (var i=0; i<csvArray.length; i++) {
		row = [];
		for (var j=0; j<keys.length; j++) {
			row.push("\""+escapeString(stringify(csvArray[i][keys[j]]))+"\"")
		}
		body.push(row.join(","))
	}
	
	return header+"\n"+body.join("\n");
}

function outObj2CSV(obj=outObj) {
	var obj = JSON.parse(JSON.stringify(outObj))
	var slides = [];
	if ("slides" in obj) slides = JSON.parse(JSON.stringify(obj.slides));
	delete obj.slides;
	var CSVObj = pslides.standardizeArray(slides, defaultObj=obj, defaultPrefix="SESSION");
	return pslides.stringifyCSV(CSVObj);
}


function customRecord(name=null, data=null) {
	var str = stringify(data);
	outObj.slides[outObj.slides.length-1].custom[stringify(name)] = str;
}


/*
	button for swipe: add event listener and record mouse movements from the moment of pressing down until button press is released
	In the beginning of experiment, do so for each special button. Store coordinates in response button.
	Store in format x y, x y, ... every 50ms
*/
