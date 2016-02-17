var kona = new Konami();
kona.code = function() {
	document.getElementsByTagName("body")[0].style.fontFamily = "UnifrakturCook";
	var inputs = document.getElementsByTagName("input");
	for (var i = inputs.length - 1; i >= 0; i--) {
		inputs[i].style.fontFamily = "UnifrakturCook";
	}
}
kona.load();

var urlParams;

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

			switch (j) {
				case 0:
					var comeinput = document.createElement("input");
					comeinput.id = "kommenzeit";
					comeinput.type = "text";
					td.appendChild(comeinput);
					break;
				case 1:
					var leaveinput = document.createElement("input");
					leaveinput.id = "gehenzeit";
					leaveinput.type = "text";
					td.appendChild(leaveinput);
					break;
				case 2:
					var stundeninput = document.createElement("input");
					stundeninput.id = "tagesstunden";
					stundeninput.type = "text";
					td.appendChild(stundeninput);
					break;
				case 3:
					var bemerkung = document.createElement("input");
					bemerkung.className = "bemerkung";
					bemerkung.id = "bemerkung"+i;
					bemerkung.type = "text";
					td.appendChild(bemerkung)
					break;
				default:
					break;
			}

			tag.appendChild(td);
		}


		kalender.insertBefore(tag, gesamtzahl);
	}

	// http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
	var match,
		pl     = /\+/g,  // Regex for replacing addition symbol with a space
		search = /([^&=]+)=?([^&]*)/g,
		decode = function (s) { return decodeURIComponent(s.replace(pl, " ")); },
		query  = window.location.search.substring(1);

	urlParams = {};
	while (match = search.exec(query))
		urlParams[decode(match[1])] = decode(match[2]);

	for (var field in urlParams) {
		document.getElementById(field).value = urlParams[field];
	}
}

generateStuff = function () {
	var jahr = document.getElementById("jahr").value;
	var months = {"01":31, "02":(jahr%400==0||(jahr%4==0&&jahr%100!=0))?29:28, "03":31, "04":30, "05":31, "06":30, "07":31, "08":31, "09":30, "10":31, "11":30, "12":31};

	var gesamtzahl = document.querySelectorAll("#gesamtzahlinput");
	var stundenzahl = document.getElementById("arbeitszeit").value;
	var monat = document.getElementById("monat").value;

	var bemerkungsfelder = document.querySelectorAll("input.bemerkungstext");
	var bemerkungen = [];
	var i;
	for (i = 0; i < bemerkungsfelder.length; ++i) {
		if (bemerkungsfelder[i].value)
			bemerkungen.push(bemerkungsfelder[i].value);
	}

	var zellen = document.querySelectorAll("input#tagesstunden");
	var total = 0;

	var verteilung = getRandomDist(months[monat]);

	for (var i = 0; i < zellen.length; i+=1) {
		if (stundenzahl != "" && i < verteilung.length) {
			if (verteilung[i] == 0) {
				zellen[i].value = "";
				document.querySelector("input#bemerkung"+(i+1)).value = "";
			} else {
				zellen[i].value = verteilung[i];
				if (bemerkungen.length > 0)
					document.querySelector("input#bemerkung"+(i+1)).value = bemerkungen[Math.floor(Math.random()*bemerkungen.length)];
				total += verteilung[i];
			}
		} else {
			zellen[i].value = "";
		}
	}

	gesamtzahl[0].value = total;
}

getRandomDist = function (days) {
	var dist = [];
	var stundenzahl = document.getElementById("arbeitszeit").value * 4.33;
	var stundenPaket = 1;

	for (var i = days - 1; i >= 0; i--) {
		dist[i] = 0;
	}
	var tage = tagesform.wochentag;
	var jahr = document.getElementById("jahr").value;
	var monat = document.getElementById("monat").value-1;

	while (stundenzahl > 0) {
		//stundenPaket = Math.floor(Math.random() * (stundenzahl+1));

		var tag = Math.floor(Math.random() * days);

		// check if day is valid
		// checkboxes for single calendar days, e.g. holidays, could be added
		var datum = new Date(jahr, monat, tag+1);
		if(tage[datum.getDay()].checked) {
			dist[tag] += stundenPaket;
			stundenzahl -= stundenPaket;
		}
	}

	return dist;
}
