var kona = new Konami();
kona.code = function() {
	document.getElementsByTagName("body")[0].style.fontFamily = "UnifrakturCook";
}
kona.load();

window.onload = function () {
	var gesamtzahl = document.getElementById("gesamtzahl");
	var monat = document.getElementById("monat");
	var jahr = document.getElementById("jahr");
	var kalender = gesamtzahl.parentNode;

	var datum = new Date();
	jahr.value = datum.getFullYear();
	monat.value = (datum.getMonth() < 9 ? "0":"") + (datum.getMonth()+1);

	for(var i=1; i<=31; i++) {
		var tag = document.createElement("tr");
		var th = document.createElement("th");
		th.innerHTML = i+".";
		tag.appendChild(th);
		for(var j=0; j<4; j++) {
			var td = document.createElement("td");

			if (j == 3) {
				var bemerkung = document.createElement("input");
				bemerkung.className = "bemerkung";
				bemerkung.id = "bemerkung"+i;
				td.appendChild(bemerkung)
			} else if (j == 2) {
				td.id = "tagesstunden";
			}

			tag.appendChild(td);
		}


		kalender.insertBefore(tag, gesamtzahl);
	}
}

generateStuff = function () {
	var jahr = document.getElementById("jahr").value;
	var months = {"01":31, "02":(jahr%400==0||(jahr%4==0&&jahr%100!=0))?29:28, "03":31, "04":30, "05":31, "06":30, "07":31, "08":31, "09":30, "10":31, "11":30, "12":31};

	var gesamtzahl = document.querySelectorAll("#gesamtzahl td");
	var stundenzahl = document.getElementById("arbeitszeit").value;
	var monat = document.getElementById("monat").value;

	var zellen = document.querySelectorAll("td#tagesstunden");
	var total = 0;

	var verteilung = getRandomDist(months[monat]);

	for (var i = 0; i < zellen.length; i+=1) {
		if (stundenzahl != "" && i < verteilung.length) {
			if (verteilung[i] == 0) {
				zellen[i].innerHTML = "";
			} else {
				zellen[i].innerHTML = verteilung[i];
				total += verteilung[i];
			}
		} else {
			zellen[i].innerHTML = "";
		}
	}

	gesamtzahl[0].innerHTML = total;
}

getRandomDist = function (days) {
	var dist = [];
	var stundenzahl = document.getElementById("arbeitszeit").value * 4.33;
	var stundenPaket = 1;

	for (var i = days - 1; i >= 0; i--) {
		dist[i] = 0;
	}

	while (stundenzahl > 0) {
		//stundenPaket = Math.floor(Math.random() * (stundenzahl+1));

		var tag = Math.floor(Math.random() * days);
		dist[tag] += stundenPaket;

		stundenzahl -= stundenPaket;
	}

	return dist;
}
