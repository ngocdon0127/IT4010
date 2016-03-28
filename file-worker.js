importScripts('crypto-js/build/rollups/aes.js');
importScripts('crypto-js/build/components/enc-base64-min.js');

onmessage = function (msg) {
	if (msg.data.type == 'encrypt'){
		var file = msg.data.file;
		var browser = 'Chrome';

		// FireFox does not support FileReader in Web Worker. => use FileReaderSync.
		if (typeof(FileReader) !== 'undefined'){
			console.log(browser);
			var reader = new FileReader();
			reader.onload = function (evt) {
				var encrypted = CryptoJS.AES.encrypt(evt.target.result, msg.data.key).toString();
				postMessage({
					cipher: 'encrypted',
					b: browser,
					hehe: 'dmm'
				})
			}
			reader.readAsDataURL(file);
		}
		else{
			browser = 'FireFox';
			console.log(browser);
			var reader = new FileReaderSync();
			var dataURL = reader.readAsDataURL(file);
			var encrypted = CryptoJS.AES.encrypt(dataURL, msg.data.key).toString();
			postMessage({
				cipher: 'encrypted',
				b: browser,
				hehe: 'dmm'
			});
		}
		
		
	}
	else if (msg.data.type = 'decrypt'){
		var cipher = msg.data.cipher;
		var key = msg.data.key;
		var decrypted = CryptoJS.AES.decrypt(cipher, key).toString(CryptoJS.enc.Latin1);
		postMessage({
			dataURL: decrypted
		});
	}
}