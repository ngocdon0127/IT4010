importScripts('http://crypto-js.googlecode.com/svn/tags/3.1.2/build/rollups/aes.js');
importScripts('http://crypto-js.googlecode.com/svn/tags/3.1.2/build/components/enc-base64-min.js');

onmessage = function (msg) {
	if (msg.data.type == 'encrypt'){
		var file = msg.data.file;

		/** // FireFox does not support FileReader in Web Worker. => use FileReaderSync.
		 * var reader = new FileReader();
		 * reader.onload = function (evt) {
		 *	var encrypted = CryptoJS.AES.encrypt(evt.target.result, msg.data.key).toString();
		 *	postMessage({
		 *		cipher: encrypted
		 *	})
		 * }
		 * reader.readAsDataURL(file);
		 */
		var reader = new FileReaderSync();
		var dataURL = reader.readAsDataURL(file);
		var encrypted = CryptoJS.AES.encrypt(dataURL, msg.data.key).toString();
		postMessage({
			cipher: encrypted
		})
	}
	else if (msg.data.type = 'decrypt'){
		var cipher = msg.data.cipher;
		var key = msg.data.key;
		var decrypted = CryptoJS.AES.decrypt(cipher, key).toString(CryptoJS.enc.Latin1);
		postMessage({
			dataURL: decrypted
		})
	}
}