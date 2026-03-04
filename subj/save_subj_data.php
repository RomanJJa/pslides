<?php

// require "../pkg/dbcon.php";
require "select_message.php";
//require "bids_select.php";


//$post_data = json_decode(file_get_contents('php://input'), true); 


// extract url parameters:
// param: parameter name; default: default value if value is not set or missing; 
// replace_: should "_" be replaced? With what?
function extract_url_par($param="subj", $default="", $replace_="") {
	if (key_exists($param, $_GET) && $_GET[$param] !== "") {
		$default = $_GET[$param];
		if ($replace_ !== null) $default = str_replace(".", $replace_, $default);
		$default = str_replace("/", "", $default);
	}
	return $default;
}

$lang = extract_url_par($param="lang", $default="en-US", $replace_="-");

// Now object containing messages with translations
$messages = array(
	"Error"=>array(
		"en"=>"Error",
		"de"=>"Fehler",
		"fr"=>"Erreur",
		"zh"=>"&#x9519;&#x8BEF; (Error)"),
	"Successful"=>array(
		"en"=>"Uploaded",
		"de"=>"Hochgeladen",
		"fr"=>"Compl&eacute;t&eacute;",
		"zh"=>"&#x4E0A;&#x4F20;&#x6210;&#x529F;"),
	"MethodNotPost"=>array(
		"en"=>"HTTP method is not \"POST\".",
		"de"=>"HTTP-Methode ist nicht \"POST\".",
		"fr"=>"La méthode HTTP n'est pas « POST ».",
		"zh"=>"HTTP 方法不是 “POST”。"),
	"NeedRootAndPrj"=>array(
		"en"=>"The URL parameters \"root\" and \"prj\" must both be provided in order to appropriately store the data.",
		"de"=>"Die URL-Parameter \"root\" und \"prj\" müssen beide angegeben werden, damit die Daten ordnungsgemäß gespeichert werden können.",
		"fr"=>"Les paramètres d'URL « root » et « prj » doivent tous deux être fournis pour que les données soient correctement stockées.",
		"zh"=>"要正确存储数据，必须同时提供 URL 参数“root”和“prj”。"),
	"InvalidRootPrjFile"=>array(
		"en"=>"The provided URL parameters \"root\" and \"prj\" do not point to an existing project where the data could be stored.",
		"de"=>"Die angegebenen URL-Parameter \"root\" und \"prj\" verweisen nicht auf ein bestehendes Projekt, in dem die Daten gespeichert werden könnten.",
		"fr"=>"Les paramètres d'URL fournis, « root » et « prj », ne pointent pas vers un projet existant où les données pourraient être stockées.",
		"zh"=>"提供的 URL 参数“root”和“prj”没有指向可以存储数据的现有项目。"),
	"InvalidDataFormat"=>array(
		"en"=>"The data format \"%s\" is not supported on this platform.",
		"de"=>"Das Datenformat \"%s\" wird auf dieser Plattform nicht unterstützt.",
		"fr"=>"Le format de données « %s » n'est pas pris en charge sur cette plateforme.",
		"zh"=>"此平台不支持数据格式“%s”。"),
	"InvalidSourcedFile"=>array(
		"en"=>"The root author \"%s\" refers to a file in another project. Either that file, that project, or even that associated root author does not exist: \"%s\".",
		"de"=>"Der Stammautor \"%s\" verweist auf eine Datei in einem anderen Projekt. Entweder existiert diese Datei, dieses Projekt oder gar der dazugehörige Stammautor nicht: \"%s\".",
		"fr"=>"L'auteur racine « %s » fait référence à un fichier d'un autre projet. Ce fichier, ce projet ou l'auteur racine associé n'existe pas: \"%s\".",
		"zh"=>"根作者“%s”指的是另一个项目中的文件。该文件、该项目或关联的根作者均不存在: “%s”。"),
	"DataCollectionBlocked"=>array(
		"en"=>"Data were not stored because data collection for project \"%s\" has already been halted or completed.",
		"de"=>"Es wurden keine Daten gespeichert, da die Datenerfassung für das Projekt \"%s\" bereits eingestellt oder abgeschlossen wurde.",
		"fr"=>"Les données n'ont pas été enregistrées car la collecte de données pour le projet « %s » a déjà été interrompue ou terminée.",
		"zh"=>"由于项目“%s”的数据收集已经停止或完成，因此数据未被存储。"),
	"NotStoredServerError"=>array(
		"en"=>"The data were stored incompletely or not at all due to a server error. Please try again.",
		"de"=>"Die Daten wurden aufgrund eines Server-Fehlers unvollständig oder gar nicht gespeichert. Bitte versuchen Sie es erneut.",
		"fr"=>"Les données n'ont pas pu être enregistrées ou leur enregistrement a été incomplet en raison d'une erreur de serveur. Veuillez réessayer.",
		"zh"=>"由于服务器错误，数据存储不完整或根本没有存储。请重试。"),
	"UploadSuccess"=>array(
		"en"=>"Data were uploaded successfully.",
		"de"=>"Die Daten wurden erfolgreich hochgeladen.",
		"fr"=>"Les données ont été téléchargées avec succès.",
		"zh"=>"数据已成功上传。"),
	"UnknownError"=>array(
		"en"=>"An unknown error occured.",
		"de"=>"Ein unbekannter Fehler ist aufgetreten.",
		"fr"=>"Une erreur inconnue s'est produite.",
		"zh"=>"发生未知错误。")
);

$errorword   = select_message($messages, "Error", $lang);
$successword = select_message($messages, "Successful", $lang);
$error409   = " 409 ".$errorword;
$error500   = " 500 ".$errorword;
$success200 = " 200 ".$successword;

// select_message($messages, $code, $lang);


if ($_SERVER["REQUEST_METHOD"] !== "POST") {
	error_log("Method is not \"POST\".");
	header($_SERVER["SERVER_PROTOCOL"].$error409);
	// "Method is not \"POST\".";
	echo select_message($messages, "MethodNotPost", $lang);
	exit();
}

if (!key_exists("root", $_GET) || !key_exists("prj", $_GET)) {
	error_log("URL parameter \"root\" or \"prj\" was not provided.");
	header($_SERVER["SERVER_PROTOCOL"].$error409);
	// "The URL parameters \"root\" and \"prj\" must both be provided in order to know where to store the subject's data."
	echo select_message($messages, "NeedRootAndPrj", $lang);
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
	header($_SERVER["SERVER_PROTOCOL"].$error409);
	// "The provided URL parameters \"root\" and \"prj\" do not point to an existing project where the subject's data could be stored.";
	echo select_message($messages, "InvalidRootPrjFile", $lang);
	exit();
}

// Load URL parameters into variables:
$subj    = extract_url_par($param="subj",    $default="na-subj", $replace_="");
$session = extract_url_par($param="session", $default="",        $replace_="");
$cond    = extract_url_par($param="cond",    $default="",        $replace_="");
$srcroot = extract_url_par($param="srcroot", $default=$root,     $replace_="");
$srcprj  = extract_url_par($param="srcprj",  $default=$prj,      $replace_="");
$format  = extract_url_par($param="format",  $default="json",    $replace_=null);

// Check if the format is somehow forbidden:
$format = strtolower($format);
$forbidden_formats = ["php","phtml","frozen","lock","locked","closed","htaccess","conf","exe","msi"];
if (preg_match("/[^a-zA-z0-9\.]/", $format) || in_array($format, $forbidden_formats)) {
	error_log("The file format \"".$format."\" for subject data requested from root=".$root."&prj=".$prj." is forbidden.");
	header($_SERVER["SERVER_PROTOCOL"].$error409);
	// echo "The data format is invalid.";
	echo sprintf(select_message($messages, "InvalidDataFormat", $lang), $format);
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
	header($_SERVER["SERVER_PROTOCOL"].$error409);
	// "The sourced root author, project, or file \"%s\" is invalid or does not exist.";
	$srcfile = $srcroot."/".$srcprj."/app/".$srcfn_raw;
	echo sprintf(select_message($messages, "InvalidSourcedFile", $lang), $root, $srcfile);
	exit();
}

// Check if the "raw" folder doesn't exist. Otherwise, create it:
$raw_path = $_SERVER["DOCUMENT_ROOT"]."/u/".$root."/".$prj."/raw";
if (!is_dir($raw_path)) {
	mkdir($raw_path, 0700);
} else if (is_file($raw_path."/.frozen")) { // is the project closed?
	error_log("Data will not be stored because the data collection for project \"".$root."/".$prj."\" has been frozen.");
	header($_SERVER["SERVER_PROTOCOL"].$error409);
	echo sprintf(select_message($messages, "DataCollectionBlocked", $lang), $root."/".$prj);
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
// store run? if new file is smaller than previous file.




$post_data     = file_get_contents("php://input");
$post_data_len = strlen($post_data);

// THIS WAS ADDED!
// For some reason, some few files were not fully saved to the server
// but chopped off in the middle.
$file_path = $raw_path."/".$filename;
$max_tries = 5; // maximum tries in while loop
$tries = 0;     // how many iterations already in while-loop
while ($tries <= $max_tries) {
	file_put_contents($file_path, $post_data);
	$reloaded_data = file_get_contents($file_path);
	// check if the lengths are equal:
	if ($reloaded_data !== false && strlen($reloaded_data) === $post_data_len) {
		$tries = $max_tries;
	}
	usleep(10000);
	$tries ++;
}

// the final check:
if ($reloaded_data !== false && strlen($reloaded_data) !== $post_data_len) {
	error_log("The data were not saved properly for subject \"".$subj."\" in session \"".$session."\" of project \"".$root."/".$prj."\". Last error: ".json_encode(error_get_last()));
	header($_SERVER["SERVER_PROTOCOL"].$error500);
	echo select_message($messages, "NotStoredServerError", $lang);
	exit();
} else {
	header($_SERVER["SERVER_PROTOCOL"].$success200);
	echo select_message($messages, "UploadSuccess", $lang);
	exit();
}

// If nothing has been resolved:
header($_SERVER["SERVER_PROTOCOL"].$error500);
echo select_message($messages, "UnknownError", $lang);
exit();



// send the SubjectCode and ExpCode to the database?
// insert in project logs.

?>
