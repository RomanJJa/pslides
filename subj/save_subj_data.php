<?php

// require "../pkg/dbcon.php";

//$post_data = json_decode(file_get_contents('php://input'), true); 

if ($_SERVER["REQUEST_METHOD"] !== "POST") {
	error_log("Method is not \"POST\".");
	header($_SERVER["SERVER_PROTOCOL"]." 409 Error");
	echo "Method is not \"POST\".";
	exit();
}

if (!key_exists("root", $_GET) || !key_exists("prj", $_GET)) {
	error_log("URL parameters \"root\" and \"prj\" are not provided.");
	header($_SERVER["SERVER_PROTOCOL"]." 409 Error");
	echo "The URL parameters \"root\" and \"prj\" must both be provided in order to know where to store the subject's data.";
	exit();
}
$root = strtolower($_GET["root"]);
$prj  = strtolower($_GET["prj"]);

function is_valid_root_prj($uroot, $uprj) {
	return strlen($uroot) >1 && strlen($uprj) >1 &&
	       !preg_match("/[^a-z0-9\.-]/", $uroot) && !preg_match("/[^a-z0-9\.-]/", $uprj)  &&
		   is_dir($_SERVER['DOCUMENT_ROOT']."/u/".$uroot."/".$uprj);
}

if (!is_valid_root_prj($root, $prj)) {
	error_log("Invalid URL parameters provided for root=\"".$root."\" and prj=\"".$prj."\".");
	header($_SERVER["SERVER_PROTOCOL"]." 409 Error");
	echo "The provided URL parameters \"root\" and \"prj\" do not point to an existing project where the subject's data could be stored.";
	exit();
}

// extract url parameters:
// param: parameter name; default: default value if value is not set or missing; replace_: should "_" be replaced? With what?
function extract_url_par($param="subj", $default="", $replace_="") {
	if (key_exists($param, $_GET) && $_GET[$param] !== "") {
		$default = $_GET[$param];
		if ($replace_ !== null) $default = str_replace(".", $replace_, $default);
		$default = str_replace("/", "", $default);
	}
	return $default;
}

// Load URL parameters into variables:
$subj    = extract_url_par($param="subj",    $default="na-subj", $replace_="");
$session = extract_url_par($param="session", $default="",        $replace_="");
$cond    = extract_url_par($param="cond",    $default="",        $replace_="");
$srcroot = extract_url_par($param="srcroot", $default=$root);
$srcprj  = extract_url_par($param="srcprj",  $default=$prj);
$format  = extract_url_par($param="format",  $default="json",    $replace_=null);

// Check if the format is somehow forbidden:
$format = strtolower($format);
$forbidden_formats = ["php","phtml","frozen","closed","htaccess","conf","exe","msi"];
if (preg_match("/[^a-zA-z0-9\.]/", $format) ||
    in_array($format, $forbidden_formats)) {
	
	error_log("The file format \"".$format."\" for subject data requested from root=".$root."&prj=".$prj." is invalid.");
	header($_SERVER["SERVER_PROTOCOL"]." 409 Error");
	echo "The data format is invalid.";
	exit();
}


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

// Check if raw folder doesn't exist. Otherwise, create it:
$raw_path = $_SERVER["DOCUMENT_ROOT"]."/u/".$root."/".$prj."/raw";
if (!is_dir($raw_path)) {
	mkdir($raw_path, 0700);
} else if (is_file($raw_path."/.frozen")) { // is the project closed?
	error_log("Data will not be stored because the data collection for project \"".$root."/".$prj."\" has already been completed.");
	header($_SERVER["SERVER_PROTOCOL"]." 409 Error");
	echo "Data will not be stored because data collection for project \"".$root."/".$prj."\" has already been completed.";
	exit();
}

// Check session or create one if it has not been created already.

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

// Generate the utc code from a time. If time is null, it is right now.
function generate_utc_number($time=null) {
    if (is_null($time)) $time = new DateTime("now", new DateTimeZone("UTC"));
    $number = $time->format("Y") * pow(10, 13) + $time->format("m") * pow(10, 11) + $time->format("d") * pow(10, 9) +
              $time->format("H") * pow(10, 7)  + $time->format("i") * pow(10, 5)  + $time->format("s") * pow(10, 3) + 
              $time->format("v"); // 'v' formats milliseconds (added in PHP 7.0.0)
    return $number;
}

if ($session === "") $session = change_base($num=generate_utc_number());



// Check if ".htaccess" is set. If not, recreate it.
// Keeping data unaccessable to outsiders is important.
if (!is_file($raw_path."/.htaccess")) {
	//file_put_contents($raw_path."/.htaccess", "Deny from all");
	
	// generate a random string to save random data:
	$seed = str_split("0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ");
	shuffle($seed);
	$rand = "";
	for ($i = 0; $i < 10; $i++) $rand .= $seed[array_rand($seed, 1)];
	file_put_contents($raw_path."/.htaccess.".$rand.".tmp", "Deny from all");
	rename($raw_path."/.htaccess.".$rand.".tmp", $raw_path."/.htaccess");
}

$filename = $session."_".$subj."_".$cond."_".$srcfn."_".$srcprj."_".$srcroot.".".$format;

$post_data     = file_get_contents("php://input");
$post_data_len = strlen($post_data);

// THIS WAS ADDED!
// For some reason, some few files were not fully saved to the server
// but chopped off in the middle. path
$file_path = $raw_path."/".$filename;
$max_tries = 5; // maximum tries in while loop
$tries = 0;     // how many iterations already in while-loop
while ($tries < $max_tries) {
	file_put_contents($file_path, $post_data);
	$reloaded_data = file_get_contents($file_path);
	// check if the lengths are equal:
	if ($reloaded_data !== false && strlen($reloaded_data) === $post_data_len) {
		$tries = $max_tries;
	}
	$tries ++;
}

// the final check:
if ($reloaded_data !== false && strlen($reloaded_data) !== $post_data_len) {
	error_log("The data were not saved properly for subject \"".$subj."\" in session \"".$session."\" of project \"".$root."/".$prj."\". Last error: ".json_encode(error_get_last()));
	header($_SERVER["SERVER_PROTOCOL"]." 409 Error");
	echo "The data were stored incompletely due to a server error. Please try again.";
	exit();
} else {
	header($_SERVER["SERVER_PROTOCOL"]." 200 Success");
	echo "Data were uploaded successfully.";
	exit();
}

// send the SubjectCode and ExpCode to the database?
// insert in project logs.

?>
