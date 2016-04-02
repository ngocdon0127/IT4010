'use strict';

function handleFileSelect (event) {
	var files = event.target.files;
	for (var i = 0; i < files.length; i++) {
		var file = files[i];
		console.log(file);
	};

}
ob('attach').addEventListener('change', handleFileSelect, false);


// use this key to encrypt attachments.
var aesKeyFile = '';

// storage single email for 1 recipient
// structure:

// singleEmails = {
// 	'e1@ex.com': 'CtnIuSOas...QkK240ieyL8/VHE',
// 	'e2@ex.net': 'tnIsdfexi...jde25s0ie/tiAcs'
// }

// will be filled right after the time popup windows is created.
var singleEmails = {};

// Async Functions => Good

var dw = undefined;
var files;

function decryptFile () {
	if (ob('attach').files[0].name.indexOf('.encrypted') < 0){
		alert('Chọn file .encrypted để giải mã.');
		return;
	}
	// console.log(aesKeyFile);
	ob('btnDecrypt').disabled = true;
	ob('btnDecrypt').innerHTML = 'Decrypting...';
	if (typeof(Worker) !== 'undefined'){
		if (typeof(dw) == 'undefined'){
			dw = new Worker('file-worker.js');
			dw.postMessage({
				type: 'decrypt',
				file: ob('attach').files[0],
				key: aesKeyFile
			});
		}
		dw.onmessage = function (event) {
			var blob = undefined;
			// console.log(event.data);
			var dataURL = event.data.dataURL;
			var filenames = event.data.filenames.split(STR_SEPERATOR);
			// console.log(filenames);
			for (var i = 0; i < dataURL.length; i++) {
				var data = dataURL[i];
				var filename = filenames[i];
				try{
					blob = dataURLToBlob(data);
					// console.log(evt.target);
					ob('btnDecrypt').disabled = false;
					ob('btnDecrypt').innerHTML = 'Decrypt File';
					saveAs(blob, filename);
				}
				catch (e){
					alert('Key không đúng');
					ob('btnDecrypt').disabled = false;
					ob('btnDecrypt').innerHTML = 'Decrypt File';
				}
			};
			dw.terminate();
			dw = undefined;
		}
	}
}

// connect to background page
var port = chrome.extension.connect({name: "Retrieve decrypted email"});
port.onMessage.addListener(function(msg) {
	// if user use context menu
	if (msg.contextMenu == true){
		var c = msg.contextMenu;
		var d = msg.data;
		$('#text').text(d);
		$('#text').val(d);
		// decryptEmail(c, d);

		// insert data to select#slRecipients
		var contents = ob('text').value.split(STR_SEPERATOR);
		// console.log(contents);
		contents.forEach(function (content) {

			var c = preDecrypt(content);

			// each element of contents is a email for 1 recipient.
			// in format:
			// cipher|recipient.
			// Example: CtnIuSOas...QkK240ieyL8/VHE|ngocdon127@gmail.com
			var data = c.split('|');
			var emailContent = data[0];
			var recipient = data[1];
			var e = document.createElement('option');
			e.value = recipient;
			e.innerHTML = recipient;
			ob('slRecipients').appendChild(e);

			// fill data to singleEmails object
			singleEmails[recipient] = content;
		})
	}
});

function decryptEmail(contextMenu, data) {
	// console.log('decrypt');

	// console.log(data);
	data = preDecrypt(data);
	// console.log(data);
	data = data.split('|');
	// console.log(data);
	if (data.length < 2){
		alert('Data is corrupted.');
		console.log('Data is corrupted.');
		return;
	}
	STORAGE_AREA.get(data[1], function (items) {
		if (jQuery.isEmptyObject(items)){
			alert('Could not find private key of ' + data[1]);
			return;
		}
		if (items[data[1]].isPairKey == 1){
			try {
				var privateKey = items[data[1]].private;
				var passphrase = prompt('Nhập passphrase của ' + data[1] + ':', '');
				privateKey = CryptoJS.AES.decrypt(privateKey, passphrase).toString(CryptoJS.enc.Utf8);
				privateKey = preDecrypt(privateKey);
				var plainText = cryptico.decrypt(data[0], cryptico.RSAKeyFromString(privateKey));
				plainText = decodeURIComponent(escape(plainText.plaintext)).split('|');
				$('#decrypted').val(plainText[0]);
				aesKeyFile = plainText[1];
				// console.log(aesKeyFile);
				if (ob('attach').files.length > 0){
					decryptFile();
				}
			}
			catch (e){
				alert('Email is corrupted or invalid passphrase.');
			}
		}
		else{
			alert('Private key of ' + data[1] + ' is not exist.');
		}
	})
}

ob('btnDecrypt').addEventListener('click', function () {
	decryptEmail(true, singleEmails[ob('slRecipients').value]);
});