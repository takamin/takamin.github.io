<?php
$name = $argv[1];
$filename = "$name.mzt";

// load file as binary string
$fp = fopen($filename, "rb");
if (FALSE === $fp) {
    exit("Failed to open stream to URL");
}

$bin = '';
while (!feof($fp)) {
    $bin .= fread($fp, 8192);
}
fclose($fp);

// to byte array
$bytes = array();
$bytes_hash = unpack("C*", $bin);
foreach($bytes_hash as $i => $value) {
    $bytes[] = $value;
}
file_put_contents("$name.json", json_encode($bytes));
