function ob (x) {
	return document.getElementById(x);
}

ob('btnGenerateRSAKey').addEventListener('click', generateRSAKey);

		
		function ob (x) {
			return document.getElementById(x);
		}

		function generateRSAKey () {

			// Email is used to seed random in cryptico library by this statement:
			// Math.seedrandom(sha256.hex(email));
			var email = ob('email').value;

			// generate a unique number
			var date = (new Date()).getTime();

			// convert email to string
			email += ' ' + date;
			
			// encrypt email using MD5
			email = CryptoJS.MD5(email).toString(CryptoJS.enc.Base16);
			console.log(email);

			// bit length in RSA Key
			var bitlen = ob('bitlen').value;

			var RSAKey = cryptico.generateRSAKey(email, bitlen);
			ob('pub').value = cryptico.publicKeyString(RSAKey);
			ob('priv').value = cryptico.privateKeyString(RSAKey);

			// Log Key
			console.log(RSAKey);
			for (var i = 0; i < parametersBigint.length; i++) {
				parameter = parametersBigint[i];
				console.log(parameter);
				// keyObj[parameter] = RSAKey.b16to64(rsakey[parameter].toString(16));
				console.log(RSAKey[parameter]);
				console.log(RSAKey[parameter].toString());
				console.log(RSAKey[parameter].toString(16));
				console.log(cryptico.b16to64(RSAKey[parameter].toString(16)));
				console.log('|');
			}
		}
		function log (x) {
			console.log(x);
		}
		function encrypt () {
			var publicKey = ob('modal-encrypt-pub').value;
			var cipher = cryptico.encrypt(unescape(encodeURIComponent(ob('modal-encrypt-data').value)), publicKey);
			ob('modal-encrypt-cipher').value = cipher.cipher;
		}
		function decrypt () {
			var RSAKey = cryptico.RSAKeyFromString(ob('modal-decrypt-priv').value);
			var plaintext = cryptico.decrypt(ob('modal-decrypt-data').value, RSAKey);
			// var text = "Message: " + plaintext.plaintext + "\n";
			// text += "Signed: " + plaintext.signature;
			// ob('modal-decrypt-plaintext').value = text;
			ob('modal-decrypt-plaintext').value = decodeURIComponent(escape(plaintext.plaintext));
			console.log(plaintext);
		}
		function resetModal () {
			ob('modal-encrypt-cipher').value = '';
			ob('modal-encrypt-pub').value = '';
			ob('modal-decrypt-priv').value = '';
			ob('modal-decrypt-plaintext').value = '';
			ob('modal-decrypt-data').value = ob('data').value;
			ob('modal-encrypt-data').value = ob('data').value;
		}