// require("./lib/social");
// require("./lib/ads");
// var track = require("./lib/tracking");

require("component-responsive-frame/child");

var $ = require("./lib/qsa");
var flip = require("./lib/flip");
var transform = require("./lib/prefixed").transform;

var table = document.querySelector(".power-table");

var rankings = window.rankings;
var byWeek = {};
rankings.forEach(function(row) {
  if (!byWeek[row.week]) byWeek[row.week] = [];
  byWeek[row.week].push(row);
});

//assign previous
for (var w in byWeek) {
  var current = byWeek[w];
  var previous = byWeek[w - 1];
  if (!previous) continue;
  previous = previous.slice();
  current.forEach(function(c) {
    previous = previous.filter(function(p) {
      if (p.team == c.team) {
        c.previous = p.ranking;
        return false;
      }
      return true;
    })
  });
}

var teamElements = {};
$("[data-team]").forEach(function(el) {
  teamElements[el.getAttribute("data-team")] = el;
});

var weeks = Object.keys(byWeek).map(Number).sort((a, b) => a - b);
var weekNav = document.querySelector(".weeks")
weeks.forEach(function(w) {
  weekNav.innerHTML += `<li> <a class="week" data-week="${w}">${w}</a>`
});

weekNav.addEventListener("click", function(e) {
  var week = e.target.getAttribute("data-week");
  if (!week) return;
  var prev = document.querySelector("[data-week].selected");
  if (prev) prev.classList.remove("selected");
  e.target.classList.add("selected");
  var data = byWeek[week];
  var firsts = {};
  for (var t in teamElements) {
    firsts[t] = teamElements[t].getBoundingClientRect();
  }
  //update
  data.sort((a, b) => a.ranking - b.ranking).forEach(function(row) {
    var element = teamElements[row.team];
    if (!element) return console.log(`No team element found for ${row.team} - did you misspell it?`);
    element.querySelector(".rank").innerHTML = row.ranking;
    element.querySelector(".blurb").innerHTML = row.blurb || "";
    element.querySelector(".previous").innerHTML = row.previous || "-";
    element.parentElement.appendChild(element);
  });
  //reposition
  var lasts = {};
  for (var t in teamElements) {
    var element = teamElements[t];
    lasts[t] = element.getBoundingClientRect();
    element.style[transform] = `translateY(${firsts[t].top - lasts[t].top}px)`;
  }
  //animate
  table.classList.add("transition");
  var reflow = table.offsetWidth;
  for (var t in teamElements) {
    teamElements[t].style[transform] = "";
  }
  setTimeout(() => table.classList.remove("transition"), 500);
});

document.querySelector(".weeks li:last-child a").click();
