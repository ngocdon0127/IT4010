importScripts('crypto-js/build/rollups/aes.js');
importScripts('crypto-js/build/components/enc-base64-min.js');

onmessage = function (msg) {
	if (msg.data.type == 'encrypt'){
		var files = msg.data.files;
		var encrypted = '';
		var noOfEncryptedFiles = 0;

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
		// 				// encrypted += CryptoJS.AES.encrypt(evt.target.result, msg.data.key).toString() + 'ngocdon';
						
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
					// encrypted += i + 'ngocdon';
					encrypted += CryptoJS.AES.encrypt(dataURL, msg.data.key).toString() + 'ngocdon';
				}
				else{
					encrypted += CryptoJS.AES.encrypt(dataURL, msg.data.key).toString();
				}
				// noOfEncryptedFiles++;
			}
			postMessage({
				cipher: encrypted,
				browser: 'Sync'
			});
		// }
	}
	else if (msg.data.type = 'decrypt'){
		var ciphers = msg.data.ciphers;
		var key = msg.data.key;
		var arrCipher = ciphers.split('ngocdon');
		var dataURL = [];
		for (var i = 0; i < arrCipher.length; i++) {
			cipher = arrCipher[i];
			var decrypted = CryptoJS.AES.decrypt(cipher, key).toString(CryptoJS.enc.Latin1);
			dataURL.push(decrypted);
			
		}
		postMessage({
			dataURL: dataURL
		});
	}
}