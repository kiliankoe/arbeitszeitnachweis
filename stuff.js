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
	if (numberOfCheckedWeekdays() == 0) {
		document.querySelector("fieldset[name='wochentage']").style.color = "red";
		return;
	} else {
		document.querySelector("fieldset[name='wochentage']").style.color = "#000";
	}

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
				if (cometimes.length > 0){
					var clock = cometimes[Math.floor(Math.random()*cometimes.length)];
					var h = parseInt(clock.match(/^[\d]+/));
					var m = parseInt(clock.match(/[\d]+$/));
					document.querySelector("input#kommenzeit"+(i+1)).value = h + ":" + (m < 10 ? "0" + m : m);
					if (14 > h && 11 < h + verteilung[i]){ // lunch time!
						var lunchtime = getRandomInt(0, Math.min(3, verteilung[i])) * 30 + m;
						m = lunchtime % 60;
						h += Math.floor(lunchtime / 60);
					}
					document.querySelector("input#gehenzeit"+(i+1)).value = (h + verteilung[i]) + ":" + (m < 10 ? "0" + m : m);
				}
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
	var checked_days = [...tagesform.wochentag].map(function(val){ return val.checked });

	var first_checked = Math.min(...checked_days.map(function(val, ind){ return val ? ind : Infinity }));
	var last_checked = Math.max(...checked_days.map(function(val, ind){ return val ? ind : -Infinity }));

	var mondays = getMondays(month, year);
	if (mondays[0] > 0)					// add partial week
		mondays.unshift(mondays[0] - 7);

	mondays.forEach(function(monday){
		// valid first and last day of week
		var first = Math.max(monday + first_checked, 1);	
		var last = Math.min(monday + last_checked, days);

		// current monday's checked days
		var checked_this_week = 0;
		for (var i = first; i <= last; i++)
			if (checked_days[i - monday])
				checked_this_week++;

		// if partial week use relative amount of hours
		var remaining_hours = Math.round(stundenzahl * checked_this_week / numberOfCheckedWeekdays());
		while (remaining_hours > 0) {
			var rand = getRandomInt(first, last);
			var validate = new Date(year, month, rand);
			if (checked_days[validate.getDay()]) {
				var h = getRandomInt(1, remaining_hours); // should result in less distributed results
				dist[rand-1] += h;
				remaining_hours -= h;
			}
		}
	});

	return dist;
}

// Return zero-indexed dates of mondays in a month, possibly omitting the last one
// if the month ends in the middle of that week.
function getMondays(month, year) {
	var date = new Date(year, month, 1);
  	month = date.getMonth();
	var mondays = [];

	// Get the first monday of month
	while (date.getDay() !== 1) {
		date.setDate(date.getDate() + 1);
	}

	// save this and all other mondays
	while (date.getMonth() === month) {
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

function numberOfCheckedWeekdays() {
	var num = 0;
	for (var i = 0; i < 7; ++i) {
		num += tagesform.wochentag[i].checked;
	}
	return num;
}

function addBookmark() {
	var urlParams = [
		"name",
		"geburtsdatum",
		"personalnummer",
		"vorgesetzter",
		"laufzeit",
		"kostenstelle",
		"struktureinheit",
		"arbeitszeit"
	].map(function(param){
		return param + "=" + document.getElementById(param).value;
	});

	var url = "index.html?"+urlParams.join("&");
	if (window.sidebar && window.sidebar.addPanel) {
		// Mozilla Firefox Bookmark
		window.sidebar.addPanel(document.title, url,'');
	} else if(window.external && ('AddFavorite' in window.external)) {
		// IE Favorite
		window.external.AddFavorite(url ,document.title);
	} else if(window.opera && window.print) {
		// Opera Hotlist
		this.title=document.title;
		return true;
	} else {
		// webkit - safari/chrome
		if (window.history)
			window.history.pushState({}, document.title, url);
		else
			window.location.href = url;

		alert('Press ' + (navigator.userAgent.toLowerCase().indexOf('mac') != - 1 ? 'Command/Cmd' : 'CTRL') + ' + D to bookmark this page.');
	}
}
