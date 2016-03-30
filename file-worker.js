importScripts('crypto-js/build/rollups/aes.js');
importScripts('crypto-js/build/components/enc-base64-min.js');

var strseperator = 'ngocdon';

onmessage = function (msg) {
	if (msg.data.type == 'encrypt'){
		var files = msg.data.files;
		var encrypted = '';
		var noOfEncryptedFiles = 0;
		var filenames = '';

		// FireFox does not support FileReader in Web Worker.
		// Btw, Encrypting multiple files using Async is too complicated. => use FileReaderSync.

		// if (typeof(FileReader) !== 'undefined'){
		// 	// var encrypted = '';
		// 	var reader = [];
		// 	for (var i = 0; i < files.length; i++) {
		// 		file = files[i];
		// 		reader.push(new FileReader());
		// 		reader[i].onload = function (evt) {
		// 			if (i < files.length - 1){
		// 				// encrypted += CryptoJS.AES.encrypt(evt.target.result, msg.data.key).toString() + strseperator;
						
		// 			}
		// 			else{
		// 				// encrypted += CryptoJS.AES.encrypt(evt.target.result, msg.data.key).toString();
		// 				encrypted += i;
		// 				noOfEncryptedFiles++;
		// 				if (noOfEncryptedFiles == files.length){
		// 					postMessage({
		// 						cipher: encrypted,
		// 						browser: 'Async'
		// 					});
		// 				}
		// 			}
		// 		}
		// 		reader[i].readAsDataURL(file);
		// 	}
		// }
		// else{
			// var encrypted = '';
			for (var i = 0; i < files.length; i++) {
				file = files[i];
				var reader = new FileReaderSync();
				var dataURL = reader.readAsDataURL(file);
				if (i < files.length - 1){
					// encrypted += i + strseperator;
					encrypted += CryptoJS.AES.encrypt(dataURL, msg.data.key).toString() + strseperator;
					filenames += file.name + strseperator;
				}
				else{
					encrypted += CryptoJS.AES.encrypt(dataURL, msg.data.key).toString();
					filenames += file.name;
				}
				// noOfEncryptedFiles++;
			}
			var data = filenames + '?' + encrypted;
			postMessage({
				cipher: encrypted,
				filenames: filenames,
				data: data,
				browser: 'Sync'
			});
		// }
	}
	else if (msg.data.type = 'decrypt'){
		// var ciphers = msg.data.ciphers;
		// var filenames = msg.data.filenames;
		var key = msg.data.key;
		var file = msg.data.file;
		var reader = new FileReaderSync();
		var data = reader.readAsText(file);
		var ciphers = data.split('?')[1];
		var filenames = data.split('?')[0];
		var arrCipher = ciphers.split(strseperator);
		var dataURL = [];
		for (var i = 0; i < arrCipher.length; i++) {
			cipher = arrCipher[i];
			var decrypted = CryptoJS.AES.decrypt(cipher, key).toString(CryptoJS.enc.Latin1);
			dataURL.push(decrypted);
			
		}
		postMessage({
			dataURL: dataURL,
			filenames: filenames
		});
	}
}