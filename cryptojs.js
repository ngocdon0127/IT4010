// connect to background page
var port = chrome.extension.connect({name: "get-email-content"});
port.onMessage.addListener(function (msg) {
	if (msg.emailContent != null){
		$('#text').val(msg.emailContent);
	}
});
port.postMessage({
	encryptedData: $('#encrypted').val()
});

ob('btnTransfer').addEventListener('click', function () {
	console.log('transfer');
	console.log($('#encrypted').val());
	var port = chrome.extension.connect({name: 'transfer-encrypted-data'});
	port.postMessage({
		encryptedData: $('#encrypted').val()
	});
	window.close();
});