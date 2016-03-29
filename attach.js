function ob(x){
	return document.getElementById(x);
}
function encrypt () {
	var text = ob('text').value;
	var key = ob('key').value;
	var encrypted = CryptoJS.AES.encrypt(text, key);
	ob('encrypted').value = encrypted.toString();
}
function decrypt() {
	var encrypted = ob('encrypted').value;
	var decrypted = CryptoJS.AES.decrypt(encrypted, ob('key').value);
	ob('decrypted').value = decrypted.toString(CryptoJS.enc.Utf8);
}
function handleFileSelect (event) {
	var files = event.target.files;
	for (var i = 0; i < files.length; i++) {
		file = files[i];
		console.log(file);
	};

}
ob('attach').addEventListener('change', handleFileSelect, false);
ob('btnDecryptFile').disabled = true;

var tmpcipher = '';
var tmpFileName = '';

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
				key: ob('key').value
			});
		}
		ew.onmessage = function (event) {
			// var date2 = new Date();
			evt.target.disabled = false;
			evt.target.innerHTML = 'Encrypt File';
			ob('file-info').value = 'File has been encrypted.';
			ob('btnDecryptFile').disabled = false;
			tmpcipher = event.data.cipher;
			var arrCipher = tmpcipher.split('ngocdon');
			console.log(arrCipher.length);
			ob('file-info').value = '';
			for (var i = 0; i < arrCipher.length; i++) {
				f = arrCipher[i];
				oldSize = files[i].size;
				var tmpbrowser = event.data.browser;
				// console.log(f);
				ob('file-info').value += "\n\nName: " + files[i].name + ".";
				ob('file-info').value += "\nOriginal Size: " + (oldSize / 1024 / 1024).toFixed(2) + " MiB.";
				ob('file-info').value += "\nSize after Encrypting: " + (f.length / 1024 / 1024).toFixed(2) + " MiB.";
				// ob('file-info').value += "\nTime Encrypt: " + (date2.getTime() - date1.getTime()) + " ms.";
				ob('file-info').value += "\nBrowser: " + tmpbrowser + ".";
			};
			ew.terminate();
			ew = undefined;
		}
	}
	else{
		alert('Does not support web worker');
	}
}

ob('btnEncryptFile').addEventListener('click', encryptFile);

function decryptFile (evt) {
	var cipher = tmpcipher;
	var fileName = tmpFileName;
	evt.target.disabled = true;
	evt.target.innerHTML = 'Decrypting...';
	if (typeof(Worker) !== 'undefined'){
		if (typeof(dw) == 'undefined'){
			dw = new Worker('file-worker.js');
			dw.postMessage({
				type: 'decrypt',
				ciphers: cipher,
				key: ob('key').value
			});
		}
		dw.onmessage = function (event) {
			var blob = undefined;
			var dataURL = event.data.dataURL;
			for (var i = 0; i < dataURL.length; i++) {
				data = dataURL[i];
				try{
					blob = dataURLToBlob(data);
					// console.log(evt.target);
					evt.target.disabled = false;
					evt.target.innerHTML = 'Decrypt File';
					saveAs(blob, files[i].name);
				}
				catch (e){
					alert('Key không đúng');
					evt.target.disabled = false;
					evt.target.innerHTML = 'Decrypt File';
				}
			};
			dw.terminate();
			dw = undefined;
		}
	}
}

// dataURLToBlob => get from https://github.com/ebidel/filer.js/blob/master/src/filer.js#L137
var dataURLToBlob = function(dataURL) {
	var BASE64_MARKER = ';base64,';
	if (dataURL.indexOf(BASE64_MARKER) == -1) {
		var parts = dataURL.split(',');
		var contentType = parts[0].split(':')[1];
		var raw = decodeURIComponent(parts[1]);

		return new Blob([raw], {type: contentType});
	}

	var parts = dataURL.split(BASE64_MARKER);
	var contentType = parts[0].split(':')[1];
	var raw = window.atob(parts[1]);
	var rawLength = raw.length;

	var uInt8Array = new Uint8Array(rawLength);

	for (var i = 0; i < rawLength; ++i) {
	  uInt8Array[i] = raw.charCodeAt(i);
	}

	return new Blob([uInt8Array], {type: contentType});
}

ob('btnDecryptFile').addEventListener('click', decryptFile);