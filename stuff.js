window.onload = function () {
	var gesamtzahl = document.getElementById("gesamtzahl");
	var kalender = gesamtzahl.parentNode;

	for(var i=1; i<=31; i++) {
		var tag = document.createElement("tr");
		var th = document.createElement("th");
		th.innerHTML = i+".";
		tag.appendChild(th);
		for(var j=0; j<4; j++) {
			var td = document.createElement("td");
			tag.appendChild(td);
		}
		kalender.insertBefore(tag, gesamtzahl);
	}
}
