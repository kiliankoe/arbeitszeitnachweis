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

			if (j == 3) {
				var bemerkung = document.createElement("input");
				bemerkung.id = "bemerkung";
				td.appendChild(bemerkung)
			}

			tag.appendChild(td);
		}


		kalender.insertBefore(tag, gesamtzahl);
	}
}

generateStuff = function () {
	var stundenzahl = document.getElementById("arbeitszeit").value;
	var gesamtzahl = document.querySelectorAll("#gesamtzahl td");

	var zellen = document.querySelectorAll("td + td");

	for (var i = 1; i < zellen.length - 1; i+=3) {
		zellen[i].innerHTML = Math.ceil(stundenzahl/31);
	};

	gesamtzahl[0].innerHTML = stundenzahl;
}
