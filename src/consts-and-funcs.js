// Constants

// Master key.
// Extension use this key to encrypt original public & private key with AES algorithm.
// generate using MD5('local_key_extension_attt')
var LOCAL_KEY = '8499a08c77ba81cd35d8e93642da34b6';

// Extension saves data to this StorageArea
var STORAGE_AREA = chrome.storage.sync;

// seperate file dataURL with this string. Need to be long and semantic enough.
// Or, this can be some character which is not included in Base64 index table. 
// Such as '?', '!', ....
var STR_SEPERATOR = 'ngocdon';

// properties in RSA Key object.
var parametersBigint = ["n", "d", "p", "q", "dmp1", "dmq1", "coeff"];

// monospace
var ALIGN_OPEN_TAG = "<pre>";

var ALIGN_CLOSE_TAG = "</pre>";

/**
 * Short hand
 */
function ob (x) {
	return document.getElementById(x);
}

/**
 * Short hand
 */
function log (x) {
	console.log(x);
}

/*
Encrypt key with LOCAL_KEY using AES before saving key to Chrome Local Storage.
Just to make the key looks more beautiful. lol
*/

/**
 * Encrypt with LOCAL_KEY
 *
 * @param {string} x String to be encrypted
 * @return {string} encrypted string with LOCAL_KEY
 */
function preEncrypt(x) {
	return CryptoJS.AES.encrypt(x, LOCAL_KEY).toString();
}

/**
 * Decrypt with LOCAL_KEY
 *
 * @param {string} x String to be decrypted
 * @return {string} the original text
 */
function preDecrypt (x) {
	return CryptoJS.AES.decrypt(x, LOCAL_KEY).toString(CryptoJS.enc.Utf8);
}


/**
 * Add new email to indexes list.
 *
 * @param {string} email Email to be added to indexes[] in Chrome LocalStorage
 * @param {function} fn Function will be executed after adding email
 */
function addIndexes (email, fn) {
	STORAGE_AREA.get('indexes', function (items) {
		var indexes = [];
		if (jQuery.isEmptyObject(items)){
			indexes = [email];
		}
		else{
			items.indexes.push(email);
			indexes = items.indexes;
		}
		chrome.storage.sync.set({
			indexes: indexes
		}, fn);
	});
}

// Add new 2 methods to work with private key

/**
 * Extract Private Key from RSA Key object 
 *
 * @param {object} rsakey RSA Key object
 * @return {string} RSA Private Key
 */
cryptico.privateKeyString = function (rsakey) {
	var privKey = '';
	for (var i = 0; i < parametersBigint.length; i++) {
		parameter = parametersBigint[i];
		privKey += cryptico.b16to64(rsakey[parameter].toString(16)) + '|';
	}

	// remove the last '|' character before returning private key.
	return privKey.substring(0, privKey.length - 1);
}

/**
 * Reproduce RSA Key from string
 *
 * @param {string} string RSA Private Key
 * @return {object} RSA Key Object
 */
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
	}

	// e is 3 implicitly
	rsa.e = parseInt("03", 16);
	return rsa;
}

/**
 * dataURLToBlob => get from https://github.com/ebidel/filer.js/blob/master/src/filer.js#L137
 *
 * @param {string} dataURL Raw data display in string
 * @return {object} Blob
 */
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

/** 
 * Loading effect for button
 *
 * @param {object} e Click event
 */
var BUTTON_LOADING = function(e) {
	e.preventDefault();
	e.stopPropagation();
	e.target.classList.add('loading');
	e.target.setAttribute('disabled','disabled');
};

/**
 * Beaurify Email
 *
 * @param {string} email Email suppose to be sent
 * @return {string} aligned email
 */
function alignEmail (email) {
	/**
	 * Character ZERO WIDTH SPACE (unicode u200B - 8203) 
	 * sometimes appears in selectionText when user double click.
	 * remove it and trim() string before doing anything else
	 */
	email = email.replace(/\u200B/g, '').trim();
	var charsInLine = 60;
	var e = '';
	while (email.length > 0){
		e += email.substring(0, charsInLine);
		e += "\n";
		email = (email.length >= charsInLine) ? email.substring(charsInLine) : '';
	}
	return ALIGN_OPEN_TAG +  e.substring(0, e.length - 1) + ALIGN_CLOSE_TAG;
}

/**
 * Convert aligned email to original email
 *
 * @param {string} email Aligned email
 * @return {string} original email
 */
function deAlignEmail (email) {
	/**
	 * Character ZERO WIDTH SPACE (unicode u200B - 8203) 
	 * sometimes appears in selectionText when user double click.
	 * remove it and trim() string before doing anything else
	 */
	email = email.replace(/\u200B/g, '').trim();
	email = email.replace(/ /g, '').trim();
	// remove ALIGN TAGS
	// email = email.substring(ALIGN_OPEN_TAG.length, email.length - ALIGN_CLOSE_TAG);
	return email.split("\n").join('');
}