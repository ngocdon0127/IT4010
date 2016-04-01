var ul = ob('ulKeys');

(function () {
	chrome.storage.sync.get('indexes', function (items) {
		if (!jQuery.isEmptyObject(items)){
			var indexes = items.indexes;
			indexes.forEach(function (i) {
				chrome.storage.sync.get(i, function (obs) {
					var key = obs[i];
					var li = document.createElement('li');
					li.innerHTML = i;
					li.addEventListener('click', function () {
						alert(key.public);
						console.log(key.public);
					})
					if (key.isPairKey == 1){
						li.innerHTML += ' Full';
					}
					ul.appendChild(li);
				})
			})
		}
	})
})();

ob('btnImportPublicKey').addEventListener('click', function () {
	var p = ob('pub').value;
	if (p.length < 1){
		alert('Nhập public key.');
		return;
	}
	publicKey = preDecrypt(p);

	// Public Key should have 2 parts which are seperated by '|' : publicKey|email:
	// Ex: NBC1kO...CqHd3i=|huyfly14@yahoo.com.vn
	// The first part is the real public key thay Cryptio can understand.
	// The second part is the corresponding email.
	var data = publicKey.split('|');
	if (data.length < 2){
		alert('Public key không đúng.');
		return;
	}
	console.log(publicKey);
	var email = data[1];
	STORAGE_AREA.get(email, function (items) {
		if (!jQuery.isEmptyObject(items)){
			var c = confirm('Email ' + email + ' has already saved before. Overwrite?');
			if (c == true){
				var ob = {};
				ob[email] = {
					isPairKey: 0,
					public: p,
					private: ''
				}
				STORAGE_AREA.set(ob, function () {
				});
			}
		}
		else{
			var ob = {};
			ob[email] = {
				isPairKey: 0,
				public: p,
				private: ''
			}
			STORAGE_AREA.set(ob, function () {
				addIndexes(email);
			});
		}
	})
});