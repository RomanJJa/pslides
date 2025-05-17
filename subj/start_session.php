<?php

// require "../pkg/dbcon.php";

/*
	Search through files in raw.
	Parameters:
		- root:     root where the raw files are to be accessed
		- prj:      project inside the root where the raw files are to be accessed
		- patterns: some kind of patterns inside of cond; 
		            a space-separated array of patterns
					to return a list for
		- subj:     subject number
		- session:  session number
		- srcfn:    function of the original experiment; automatically filled in by JavaScript
		- srcprj:   project where the experiment originated; automatically filled in by JavaScript
		- format:   format of the recorded file to be searched
		
	What if there are multiple within-subject factors?
	
	// For any new participant:
	curl --verbose -d "sc-ki si-kc" "http://127.0.0.1/access/subj/start_session.php?root=rj&prj=syntax-addition"
	
	// For a given participant and a session (both already exist):
	curl --verbose -d "sc-ki si-kc" "http://127.0.0.1/access/subj/start_session.php?root=rj&prj=syntax-addition&subj=p123&session=ght5"
	
	// For a given participant who already exists:
	curl --verbose -d "sc-ki si-kc" "http://127.0.0.1/access/subj/start_session.php?root=rj&prj=syntax-addition&subj=p123"
	
	The syntax of files is:
	<session>.<subject>.<cond>.<source-survey-file>.<source-project>.<source-root>.<format>
*/

header_remove("X-Powered-By");
header("Server: No server");

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
	error_log("Method is not \"POST\".");
	header($_SERVER["SERVER_PROTOCOL"]." 409 Error");
	echo "Method is not \"POST\".";
	exit();
}

if (!key_exists("root", $_GET) || !key_exists("prj", $_GET)) {
	error_log("URL parameters \"root\" and \"prj\" are not provided.");
	header($_SERVER["SERVER_PROTOCOL"]." 409 Error");
	echo "The URL parameters \"root\" and \"prj\" must both be provided to access the data.";
	exit();
}
$root = strtolower($_GET["root"]);
$prj  = strtolower($_GET["prj"]);

// Should output be in a JavaScript variable? If yes, indicate JavaScript constant (or section in a map)
$js = null;
if (key_exists("js", $_GET)) $js = $_GET["js"];
$is_js = false;
$content_header = "Content-Type: application/json";
if ($js !== null && $js !== "") { // is_string($js) &&
	$is_js = true;
	$content_header = "Content-Type: application/javascript";
}

// The body contains the JSON object for factors
$cond_cells_str = file_get_contents('php://input');
$cond_cells = [""];
if ($cond_cells_str === null) {
	$cond_cells = preg_split("/[\s]+/", $cond_cells);
}


function is_valid_root_prj($uroot, $uprj) {
	return strlen($uroot) > 1 && strlen($uprj) > 1 &&
	       !preg_match("/[^a-z0-9\.-]/", $uroot) && !preg_match("/[^a-z0-9\.-]/", $uprj)  &&
		   is_dir($_SERVER['DOCUMENT_ROOT']."/u/".$uroot."/".$uprj);
}

if (!is_valid_root_prj($root, $prj)) {
	error_log("Invalid URL parameters provided for root=\"".$root."\" and prj=\"".$prj."\".");
	header($_SERVER["SERVER_PROTOCOL"]." 409 Error");
	echo "The provided URL parameters \"root\" and \"prj\" do not point to an existing project where the subject's data could be stored.";
	exit();
}

// Changing the base of a number to a new base (from base-10 to base-36?)
function change_base($num, $str="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ") {
    $result = "";
	$set = str_split($str);
	$base = count($set);
    while ($num > 0) {
        $result = $set[$num % $base].$result;
        $num = (int)($num / $base);
    }
    return $result;
}

function sample_subj_code() {
	return change_base(random_int(0,46655))."-".
	       change_base(random_int(0,46655))."-".
		   change_base(random_int(0,46655));
}

// Generate the utc code from a time. If time is null, it is right now.
function generate_utc_number($time=null) {
    if (is_null($time)) $time = new DateTime("now", new DateTimeZone("UTC"));
    $number = $time->format("Y") * pow(10, 13) + $time->format("m") * pow(10, 11) + $time->format("d") * pow(10, 9) +
              $time->format("H") * pow(10, 7)  + $time->format("i") * pow(10, 5)  + $time->format("s") * pow(10, 3) + 
              $time->format("v"); // 'v' formats milliseconds (added in PHP 7.0.0)
    return $number;
}

$res = Array("message"=>"","subj"=>"","session"=>"","cond"=>"");

// if subj is not provided, create one:
if (key_exists("subj", $_GET) && $_GET["subj"] !== null && $_GET["subj"] !== "") {
	$res["subj"] = $_GET["subj"];
	$res["message"] .= "Subject code received. ";
	
	// Take care of session code:
	if (key_exists("session", $_GET) && $_GET["session"] !== null && $_GET["session"] !== "") {
		$res["session"] = $_GET["session"];
		$res["message"] .= "Session code received. ";
	}
} else {
	$res["subj"] = sample_subj_code(); // sample new subject code and check if it already exists
	$res["message"] .= "Subject code randomly sampled. ";
}

// If no session code provided yet, create one:
if ($res["session"] === "") {
		$res["session"] = change_base(generate_utc_number()); // sample new subject code and check if it already exists
		$res["message"] .= "Session code generated. ";
}

/*
function json2js($json_str, $const) {
	if (str_contains($json_str,".")) return $const." = ".$json_str.";";
	return "var ".$const." = ".$json_str.";";
}
*/

// works
if ((include "../json2js.php") !== TRUE) {
	error_log("Unable to load \"../json2js.php\" to retrieve json2js() function.");
}

if ($is_js && !function_exists("json2js")) {
	$res["message"] .= "Unable to load body as JavaScript variable. ";
	$is_js = false;
}



// Check if project's data collection is already closed.
// If it is closed, return random factor cell.
$raw_path = $_SERVER["DOCUMENT_ROOT"]."/u/".$root."/".$prj."/raw";
if (!is_dir($raw_path)) {
	$res["message"] .= "Condition sampled randomly because \"".$root."/".$prj."/raw\" was not found. ";
	$res["cond"]     = $cond_cells[array_rand($cond_cells, 1)];
	$res_str = json_encode($res, JSON_UNESCAPED_SLASHES);
	if (json_last_error() !== JSON_ERROR_NONE) {
		header($_SERVER["SERVER_PROTOCOL"]." 500 Error");
		echo "Unable to return JSON result.";
		exit();
	}
	
	if ($is_js) $res_str = json2js($res_str, $js);
	// here set-cookies: subj-code, session-code
	header($content_header);
	header($_SERVER["SERVER_PROTOCOL"]." 200 Success");
	echo $res_str;
	exit();	
}

if (is_file($raw_path."/.frozen")) {
	$res["message"] .= "Condition sampled randomly because data acquisition has ended. ";
	$res["cond"]     = $cond_cells[array_rand($cond_cells, 1)];
	$res_str = json_encode($res, JSON_UNESCAPED_SLASHES);
	if (json_last_error() !== JSON_ERROR_NONE) {
		header($_SERVER["SERVER_PROTOCOL"]." 500 Error");
		echo "Unable to return JSON result.";
		exit();
	}
	if ($is_js) $res_str = json2js($res_str, $js);
	// set cookie?! subj and session ???????????????????
	
	header($_SERVER["SERVER_PROTOCOL"]." 200 Success");
	header($content_header);
	echo $res_str;
	exit();
}

// extract url parameters:
// param: parameter name; default: default value if value is not set or missing; replace_dot: should "." be replaced? With what?
function url_par_regex($param="subj", $default="") {
	if (key_exists($param, $_GET) && $_GET[$param] !== null && $_GET[$param] !== "") {
		$default = preg_quote($_GET[$param],"/");
	}
	return $default;
}

// Load URL parameters into variables:
$subj    = url_par_regex($param="subj",    $default="[a-zA-Z0-9\.-]*");
$session = url_par_regex($param="session", $default="[a-zA-Z0-9\.-]*");
$cond    = url_par_regex($param="cond",    $default="[a-zA-Z0-9\.-]*");
$format  = url_par_regex($param="format",  $default="[a-zA-Z\.]+");
$srcroot = url_par_regex($param="srcroot", $default=$root);
$srcprj  = url_par_regex($param="srcprj",  $default=$prj);

// extract source filename from the project: default is "index.html".
$srcfn_raw = "index.html";
if (key_exists("srcfn", $_GET)) $srcfn_raw = $_GET["srcfn"];
$srcfn = str_replace("_","-",$srcfn_raw);

// Check if the sourced project actually exists.
if (!is_valid_root_prj($srcroot, $srcprj) || 
	!is_file($_SERVER["DOCUMENT_ROOT"]."/u/".$srcroot."/".$srcprj."/app/".$srcfn_raw)) {
	
	error_log("The sourced root author, project, or file \"".$srcroot."/".$srcprj."/app/".$srcfn_raw."\" does not exist or is an unvalid project.");
	header($_SERVER["SERVER_PROTOCOL"]." 409 Error");
	echo "The sourced root author, project, or file \"".$srcroot."/".$srcprj."/app/".$srcfn_raw."\" is invalid or does not exist.";
	exit();
}

// pattern to look for
$pattern = "/^".$session."_".$subj."_"."[a-zA-Z0-9-]*"."_".$srcfn."_".$srcprj."_".$srcroot."\.".$format."$/";

// now get all filename candidates:
$files = array_diff(scandir($_SERVER["DOCUMENT_ROOT"]."/u/".$root."/".$prj."/raw"), array("..", ".", ".htaccess", ".frozen","data.zip"));

// Filter files using the regex
$matching_files = preg_grep($pattern, $files);

// echo json_encode($matching_files);

// create a named array to count all levels:
$file_levels = [];
foreach ($cond_cells as $key => $value) {
	$file_levels[$cond_cells[$key]] = 0;
}

// create a names array with level-cell: number of instances.
foreach ($matching_files as $key => $value) {
	$expl_fn = explode("_", $matching_files[$key]);
	if (count($expl_fn) > 3 && key_exists($expl_fn[2], $file_levels)) {
		$file_levels[$expl_fn[2]] = $file_levels[$expl_fn[2]] + 1;
	}
}

// find smallest count (value in file_levels): The array key with the lowest value
$min_file_count = $file_levels[array_search(min($file_levels), $file_levels)];

$arr_keys   = array_keys($file_levels);
$arr_values = array_values($file_levels);
$min_cells  = [];

for ($i = 0; $i < count($arr_values); $i++) {
	if ($arr_values[$i] === $min_file_count) {
		$min_cells[] = $arr_keys[$i];
	}
}

// maybe append more: session, subj?
$res["cond"]     = $min_cells[array_rand($min_cells, 1)];
$res["message"] .= "Random condition sampled based on already acquired data. ";



// If this is a new subject: Check if the subject code already exists
if (!key_exists("subj", $_GET) || $_GET["subj"] === null || $_GET["subj"] === "") {
	$pattern = "/^[a-zA-Z0-9\.-]*_".$res["subj"]."_.*$/";
	while (count(preg_grep($pattern, $files)) > 0) {
		$res["subj"] = sample_subj_code();
		$pattern = "/^[a-zA-Z0-9\.-]*_".$res["subj"]."_.*$/";
	}
}


// leave a file in the project???? Like this: <session>_<subj>_<cond>_session-start.json

$res_str = json_encode($res, JSON_UNESCAPED_SLASHES);
if(json_last_error() !== JSON_ERROR_NONE) {
	error_log("Error when encoding the JSON response.");
	header($_SERVER["SERVER_PROTOCOL"]." 500 Error");
	echo "Error when encoding the JSON response.";
	exit();
}

if ($is_js) $res_str = json2js($res_str, $js);
header($_SERVER["SERVER_PROTOCOL"]." 200 Success");
header($content_header);
echo $res_str;
exit();
