<?php error_reporting(0); ?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <title>MJC : Admin</title>
	<script type="text/javascript" src="swfobject.js"></script>    

	<style type="text/css">
		/* hide from ie on mac \*/
		html {
			height:100%;
			overflow:hidden;
		}
		body {
			height: 100%;
			margin: 0;
			padding: 0;
			background-color: #ffffff;
		}
		#flashcontent {
			height:100%;
		}
	</style>

</head>


<body>

<div id="flashcontent" align="center">
</div>        

<script type="text/javascript">
	// <![CDATA[
		var so = new SWFObject('Admin_JSON.swf', 'touratour', '100%', '100%', '9.0.115', '#D6D6D6');
		so.addParam('menu', 'true');
		so.addParam('scale', 'noscale');
		so.addParam('salign', 'lt');
		so.addParam('allowFullScreen', 'true');
		so.addVariable("apiKey", "<?php echo $_ENV["API_KEY"] ?>");
		// so.addVariable("googleMapsKey", "<?php echo $_ENV["GOOGLE_MAP_KEY"] ?>");
		so.addVariable("wsURL", "<?php echo $_ENV["SERVICE_URL"] ?>");
		so.addVariable("awsS3", "true");
		so.addVariable("queryPrefix", "<?php echo $_ENV["QUERIES_PREFIX"] ?>");
		so.write('flashcontent');
	// ]]>
</script>

</body>