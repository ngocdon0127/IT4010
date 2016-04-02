ob('btnGenerateRSAKey').addEventListener('click', generateRSAKey);
ob('btnSaveRSAKey').addEventListener('click', saveRSAKey);

function generateRSAKey () {

	// Email is used to seed random in cryptico library by this statement:
	// Math.seedrandom(sha256.hex(email));
	var email = ob('email').value.trim();

	// generate a unique number
	var date = (new Date()).getTime();

	// convert email to string
	email += ' ' + date;
	
	// encrypt email using MD5
	email = CryptoJS.MD5(email).toString(CryptoJS.enc.Base16);

	// bit length in RSA Key
	var bitlen = ob('bitlen').value;

	var RSAKey = cryptico.generateRSAKey(email, bitlen);
	ob('pub').value = preEncrypt(cryptico.publicKeyString(RSAKey) + '|' + ob('email').value);
	var prepriv = preEncrypt(cryptico.privateKeyString(RSAKey) + '|' + ob('email').value);
	ob('priv').value = CryptoJS.AES.encrypt(prepriv, ob('passphrase').value).toString();
	
	jQuery('#keys').fadeIn();
}

function saveRSAKey () {
	$('#btnSaveRSAKey').text('Saving...');
	var email = ob('email').value.trim();
	chrome.storage.sync.get(email, function (items) {
		if (!jQuery.isEmptyObject(items)){
			var c = confirm('This email has already had a key pair. Overwrite?');
			$('#btnSaveRSAKey').text('Save RSA Key');
			if (c == false){
				return;
			}
		}
		var data = {};
		data[email] = {
			public: ob('pub').value,
			// private: CryptoJS.AES.encrypt(ob('priv').value, ob('passphrase').value).toString(),
			private: ob('priv').value,
			isPairKey: 1
		}
		chrome.storage.sync.set(data, function () {
			if (typeof(chrome.runtime.lastError) !== 'undefined'){
				console.log('error');
				$('#btnSaveRSAKey').text('Save RSA Key');
			}
			else{
				console.log('ok');
				addIndexes(email);
				$('#btnSaveRSAKey').text('Save RSA Key');
				alert('Key Pair is saved.');
			}
		});
	});
}

chrome.storage.onChanged.addListener(function(changes, namespace) {
	for (key in changes) {
		var storageChange = changes[key];
		console.log('Storage key "%s" in namespace "%s" changed. ' +
					'Old value was "%s", new value is "%s".',
					key,
					namespace,
					storageChange.oldValue,
					storageChange.newValue);
	}
});