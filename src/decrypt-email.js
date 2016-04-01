'use strict';

function handleFileSelect (event) {
	var files = event.target.files;
	for (var i = 0; i < files.length; i++) {
		var file = files[i];
		console.log(file);
	};

}
ob('attach').addEventListener('change', handleFileSelect, false);


var tmpcipher = '';
var tmpFileName = '';

// use this key to encrypt attachments.
var aesKeyFile = '';

// Sync Functions

function encryptFileSync () {
	var files = ob('attach').files;
	file = files[0];
	console.log('read File: ');
	console.log(file);
	tmpFileName = file.name;
	var reader = new FileReader();
	reader.onload = function (evt){
		// if (evt.target.readyState == FileReader.DONE){
		var encrypted = CryptoJS.AES.encrypt(evt.target.result, ob('key').value);
		a.attr('href', 'data:application/octet-stream,' + encrypted);
		a.attr('download', file.name + '.encrypted');
		// saveAs(new Blob([encrypted], {Type: 'application/octet-stream'}), file.name + '.encrypted');
		// ob('file-info').value = encrypted;
		tmpcipher = encrypted;
		console.log('encrypted');

	}
	// var blob = file.slice(0, file.size);
	reader.readAsDataURL(file);
}

function decryptFileSync () {
	var cipher = tmpcipher;
	var fileName = tmpFileName;
	var decrypted = CryptoJS.AES.decrypt(cipher, ob('key').value).toString(CryptoJS.enc.Latin1);
	console.log('start saving');
	saveAs(dataURLToBlob(decrypted), fileName);
	console.log('finish saving');
}

// Async Functions => Good

var ew = undefined;
var dw = undefined;
var oldSize = 0;
var files;
var filenames;

function encryptFile (evt) {
	var date1 = new Date();
	files = ob('attach').files;
	evt.target.disabled = true;
	evt.target.innerHTML = 'Encrypting...';
	if (typeof(Worker) !== 'undefined'){
		if (typeof(ew) == 'undefined'){
			ew = new Worker('file-worker.js');
			ew.postMessage({
				type: 'encrypt',
				files: files,
				key: aesKeyFile
			});
		}
		ew.onmessage = function (event) {
			// var date2 = new Date();
			evt.target.disabled = false;
			evt.target.innerHTML = 'Encrypt File';
			ob('file-info').value = 'File has been encrypted.';
			ob('btnDecryptFile').disabled = false;
			tmpcipher = event.data.cipher;
			filenames = event.data.filenames;
			var data = event.data.data.split('?');
			filenames = data[0];
			tmpcipher = data[1];
			var arrCipher = tmpcipher.split(STR_SEPERATOR);
			console.log(arrCipher.length);
			ob('file-info').value = '';
			var fCipher = '';
			for (var i = 0; i < arrCipher.length; i++) {
				f = arrCipher[i];
				fCipher += f + STR_SEPERATOR;
				oldSize = files[i].size;
				var tmpbrowser = event.data.browser;
				// console.log(f);
				ob('file-info').value += "\n\nName: " + files[i].name + ".";
				ob('file-info').value += "\nOriginal Size: " + (oldSize / 1024 / 1024).toFixed(2) + " MiB.";
				ob('file-info').value += "\nSize after Encrypting: " + (f.length / 1024 / 1024).toFixed(2) + " MiB.";
				// ob('file-info').value += "\nTime Encrypt: " + (date2.getTime() - date1.getTime()) + " ms.";
				ob('file-info').value += "\nBrowser: " + tmpbrowser + ".";
			}
			fCipher = fCipher.substring(0, fCipher.length - STR_SEPERATOR.length);
			console.log(fCipher.substring(fCipher.length - 10));
			// saveAs(new Blob([fCipher], {Type: 'text/plain'}), 'attachments.encrypted');
			saveAs(new Blob([event.data.data], {Type: 'text/plain'}), 'attachments.encrypted');
			ew.terminate();
			ew = undefined;
		}
	}
	else{
		alert('Does not support web worker');
	}
}

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
	}
});

function decryptEmail(contextMenu, data) {
	// console.log('decrypt');

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
	decryptEmail(true, ob('text').value);
})