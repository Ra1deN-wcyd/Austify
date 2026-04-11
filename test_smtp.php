<?php
$email = 'imtiaz.csee.20230104045@aust.edu';
getmxrr('aust.edu', $mxhosts);
$fp = fsockopen($mxhosts[0], 25);
fread($fp, 2048);
fputs($fp, "HELO austify.edu\r\n");
fread($fp, 2048);
fputs($fp, "MAIL FROM: <test@austify.com>\r\n");
fread($fp, 2048);
fputs($fp, "RCPT TO: <$email>\r\n");
$res = fread($fp, 2048);
echo "RESPONSE FROM GOOGLE: " . $res;
fputs($fp, "QUIT\r\n");
fclose($fp);
