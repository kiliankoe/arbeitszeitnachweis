var kona = new Konami();
kona.code = function() {
	document.getElementsByTagName("body")[0].style.fontFamily = "UnifrakturCook";
	var inputs = document.getElementsByTagName("input");
	for (var i = inputs.length - 1; i >= 0; i--) {
		inputs[i].style.fontFamily = "UnifrakturCook";
	}
};
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
					comeinput.id = "kommenzeit"+i;
					comeinput.type = "text";
					td.appendChild(comeinput);
					break;
				case 1:
					var leaveinput = document.createElement("input");
					leaveinput.id = "gehenzeit"+i;
					leaveinput.type = "text";
					td.appendChild(leaveinput);
					break;
				case 2:
					var stundeninput = document.createElement("input");
					stundeninput.id = "tagesstunden";
					stundeninput.type = "text";
					stundeninput.addEventListener('change', function() {
						calculateTotal();
					});
					td.appendChild(stundeninput);
					break;
				case 3:
					var bemerkung = document.createElement("input");
					bemerkung.className = "bemerkung";
					bemerkung.id = "bemerkung"+i;
					bemerkung.type = "text";
					td.appendChild(bemerkung);
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
		document.getElementById(field).checked = true; // needed for the timeoptions
	}

	var arbeitszeit = document.getElementById("arbeitszeit").value;
	if (arbeitszeit)
		generateStuff();
};

function generateStuff() {
	var jahr = document.getElementById("jahr").value;
	var months = {"01":31, "02":(jahr%400===0||(jahr%4===0&&jahr%100!==0))?29:28, "03":31, "04":30, "05":31, "06":30, "07":31, "08":31, "09":30, "10":31, "11":30, "12":31};

	var gesamtzahl = document.querySelectorAll("#gesamtzahlinput");
	var stundenzahl = document.getElementById("arbeitszeit").value;
	var monat = document.getElementById("monat").value;

	// don't even try to do stuff when entered month is undefined
	// this fucks with getWeeklyDist if not present
	if (!(monat in months)) {
		return;
	}

	var bemerkungsfelder = document.querySelectorAll("input.bemerkungstext");
	var cometimesfelder = document.querySelectorAll("input.cometimestext");
	var leavetimesfelder = document.querySelectorAll("input.leavetimestext");

	var bemerkungen = [];
	var cometimes = [];
	var leavetimes = [];

	for (var i = 0; i < bemerkungsfelder.length; ++i) {
		if (bemerkungsfelder[i].value)
			bemerkungen.push(bemerkungsfelder[i].value);
	}
	for (i = 0; i < cometimesfelder.length; ++i) {
		if (cometimesfelder[i].value)
			cometimes.push(cometimesfelder[i].value);
	}
	for (i = 0; i < leavetimesfelder.length; ++i) {
		if (leavetimesfelder[i].value)
			leavetimes.push(leavetimesfelder[i].value);
	}

	var zellen = document.querySelectorAll("input#tagesstunden");

	var verteilung = getDist(months[monat]);

	for (i = 0; i < zellen.length; i+=1) {
		// console.log(verteilung.length);
		if (stundenzahl !== "" && i < verteilung.length) {
			if (verteilung[i] === 0) {
				zellen[i].value = "";
				document.querySelector("input#bemerkung"+(i+1)).value = "";
				document.querySelector("input#kommenzeit"+(i+1)).value = "";
				document.querySelector("input#gehenzeit"+(i+1)).value = "";
			} else {
				zellen[i].value = verteilung[i];
				if (bemerkungen.length > 0)
					document.querySelector("input#bemerkung"+(i+1)).value = bemerkungen[Math.floor(Math.random()*bemerkungen.length)];
				if (cometimes.length > 0)
					document.querySelector("input#kommenzeit"+(i+1)).value = cometimes[Math.floor(Math.random()*cometimes.length)];
				if (leavetimes.length > 0)
					document.querySelector("input#gehenzeit"+(i+1)).value = leavetimes[Math.floor(Math.random()*leavetimes.length)];
			}
		} else {
			zellen[i].value = "";
		}
	}

	calculateTotal();
}

function calculateTotal() {
	var gesamtzahl = document.querySelectorAll("#gesamtzahlinput");
	var zellen = document.querySelectorAll("input#tagesstunden");
	var total = 0.0;

	for (var i = 0; i <= zellen.length - 1; i++) {
		var hours = zellen[i].value;
		hours = parseFloat(hours);
		if (isNaN(hours)) {
			continue;
		}
		total += hours;
	}
	gesamtzahl[0].value = total;
}

function getDist(days) {
	var timeoption = document.querySelector("input[name='timeoptions']:checked").value;
	switch (timeoption) {
		case "timeoption1":
			return getRandomDist(days, 4.33);
		case "timeoption2":
			return getRandomDist(days, 4.0);
		case "timeoption3":
			return getWeeklyDist(days);
		default:
			console.log("Ya got something freaky going on there with the time options, mate...");
			break;
	}
}

function getRandomDist(days, stundenzahl_value) {
	var dist = [];
	var stundenzahl = document.getElementById("arbeitszeit").value * stundenzahl_value;
	var stundenPaket = 1;

	for (var i = days - 1; i >= 0; i--) {
		dist[i] = 0;
	}
	var tage = tagesform.wochentag;
	if(tage.length<1) {
		tage = [1,2,3,4,5];
	}
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

function getWeeklyDist(days) {
	var dist = [];
	for (var i = days - 1; i >= 0; i--) {
		dist[i] = 0;
	}

	var stundenzahl = document.getElementById("arbeitszeit").value;

	var year = document.getElementById("jahr").value;
	var month = document.getElementById("monat").value-1;
	var checked_days = tagesform.wochentag;

	var mondays = getMondays(month, year);
	mondays.forEach(function(monday){
		var stundenpaket = stundenzahl;
		while (stundenpaket > 0) {
			var rand = getRandomInt(monday, monday+6);
			var validate /* such pun */ = new Date(year, month, rand);
			// console.log("y:"+year+" m:"+month+" d:"+rand+" -> "+validate);
			if (checked_days[validate.getDay()].checked) {
				// console.log("bling!");
				dist[rand-1] += 1;
				stundenpaket -= 1;
				// console.log("validate:" + getDayStr(validate.getDay()) + " shouldbe:" + rand % 7);
				// console.log("day: " + getDayStr(validate.getDay()) + " - index: " + rand + "=" + dist[rand] + " - stundenpaket: " + stundenpaket);
			}
		}
		// console.log("--------------");
	});
	console.log(dist.length);
	return dist;
}

// Return zero-indexed dates of mondays in a month, possibly omitting the last one
// if the month ends in the middle of that week.
function getMondays(month, year) {
	var date = new Date(year, month, 0);
  month = date.getMonth();
	var mondays = [];

	date.setDate(1);

	// Get the first monday of month
	while (date.getDay() !== 1) {
		date.setDate(date.getDate() + 1);
	}

	// save this and all other mondays
	while (date.getMonth() === month && date.getDate() < 27) { // skipping mondays after the 28th, as partial weeks are stupid
		mondays.push(date.getDate() - 1); // -1 because final date list is zero-indexed
		date.setDate(date.getDate() + 7);
	}

	return mondays;
}

function getRandomInt(min, max) {
	min = parseInt(min);
	max = parseInt(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// for debugging only, can be deleted later
function getDayStr(day) {
	switch (day) {
		case 0: return "sunday";
		case 1: return "monday";
		case 2: return "tuesday";
		case 3: return "wednesday";
		case 4: return "thursday";
		case 5: return "friday";
		case 6: return "saturday";
	}
}
