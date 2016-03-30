function ob (x) {
	return document.getElementById(x);
}

ob('btnGenerateRSAKey').addEventListener('click', generateRSAKey);

// self-invoking function
		/*(function(c){
			var parametersBigint = ["n", "d", "p", "q", "dmp1", "dmq1", "coeff"];
			// var parametersBigint = ["n", "d"];

			c.privateKeyString = function(rsakey) {
				var keyObj = {};
				parametersBigint.forEach(function(parameter){
					keyObj[parameter] = c.b16to64(rsakey[parameter].toString(16));
				});
				// for (var i = 0; i < parametersBigint.length; i++) {
				// 	keyObj[parametersBigint[i]] = c.b16to64(rsakey[parametersBigint[i]].toString(16));
				// }
				// e is 3 implicitly
				return JSON.stringify(keyObj);
			}
			c.RSAKeyFromString = function(string) {
				var keyObj = JSON.parse(string);
				var rsa = new RSAKey();
				parametersBigint.forEach(function(parameter){
					rsa[parameter] = parseBigInt(c.b64to16(keyObj[parameter].split("|")[0]), 16);
				});
				rsa.e = parseInt("03", 16);
				return rsa
			}
		})(cryptico);*/

		// normal function
		var parametersBigint = ["n", "d", "p", "q", "dmp1", "dmq1", "coeff"];
		// var parametersBigint = ["n", "d"];

		// cryptico.privateKeyString = function(rsakey) {
		// 	var keyObj = {};
		// 	for (var i = 0; i < parametersBigint.length; i++) {
		// 		parameter = parametersBigint[i];
		// 		keyObj[parameter] = cryptico.b16to64(rsakey[parameter].toString(16));
		// 	}
		// 	// e is 3 implicitly
		// 	return JSON.stringify(keyObj);
		// }
		// cryptico.RSAKeyFromString = function(string) {
		// 	var keyObj = JSON.parse(string);
		// 	var rsa = new RSAKey();
		// 	for (var i = 0; i < parametersBigint.length; i++) {
		// 		parameter = parametersBigint[i];
		// 		// rsa[parameter] = parseBigInt(cryptico.b64to16(keyObj[parameter].split("|")[0]), 16);
		// 		rsa[parameter] = parseBigInt(cryptico.b64to16(keyObj[parameter]), 16);
		// 	};
		// 	rsa.e = parseInt("03", 16);
		// 	return rsa;
		// }

		// new way to display private key
		cryptico.privateKeyString = function (rsakey) {
			var privKey = '';
			for (var i = 0; i < parametersBigint.length; i++) {
				parameter = parametersBigint[i];
				privKey += cryptico.b16to64(rsakey[parameter].toString(16)) + '|';
			}
			return privKey;
		}

		cryptico.RSAKeyFromString = function(string) {
			var keyParams = string.split('|');
			var rsa = new RSAKey();
			var noOfParams = keyParams.length;
			for (var i = 0; i < parametersBigint.length; i++) {
				if (i >= noOfParams){
					break;
				}
				parameter = parametersBigint[i];
				// rsa[parameter] = parseBigInt(cryptico.b64to16(keyObj[parameter].split("|")[0]), 16);
				rsa[parameter] = parseBigInt(cryptico.b64to16(keyParams[i]), 16);
			};
			rsa.e = parseInt("03", 16);
			return rsa;
		}

		
		function ob (x) {
			return document.getElementById(x);
		}

		function generateRSAKey () {

			// Passphrase is used to seed random in cryptico library by this statement:
			// Math.seedrandom(sha256.hex(passphrase));

			// generate a unique number
			var passphrase = (new Date()).getTime();

			// convert passphrase to string
			passphrase += '';
			
			// encrypt passphrase using MD5
			passphrase = CryptoJS.MD5(passphrase).toString(CryptoJS.enc.Base16);
			console.log(passphrase);

			// bit length in RSA Key
			var bitlen = ob('bitlen').value;

			var RSAKey = cryptico.generateRSAKey(passphrase, bitlen);
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