/*!
 * tablesort v5.0.2 (2017-11-12)
 * http://tristen.ca/tablesort/demo/
 * Copyright (c) 2017 ; Licensed MIT
*/!function(){function a(b,c){if(!(this instanceof a))return new a(b,c);if(!b||"TABLE"!==b.tagName)throw new Error("Element must be a table");this.init(b,c||{})}var b=[],c=function(a){var b;return window.CustomEvent&&"function"==typeof window.CustomEvent?b=new CustomEvent(a):(b=document.createEvent("CustomEvent"),b.initCustomEvent(a,!1,!1,void 0)),b},d=function(a){return a.getAttribute("data-sort")||a.textContent||a.innerText||""},e=function(a,b){return a=a.trim().toLowerCase(),b=b.trim().toLowerCase(),a===b?0:a<b?1:-1},f=function(a,b){return function(c,d){var e=a(c.td,d.td);return 0===e?b?d.index-c.index:c.index-d.index:e}};a.extend=function(a,c,d){if("function"!=typeof c||"function"!=typeof d)throw new Error("Pattern and sort must be a function");b.push({name:a,pattern:c,sort:d})},a.prototype={init:function(a,b){var c,d,e,f,g=this;if(g.table=a,g.thead=!1,g.options=b,a.rows&&a.rows.length>0)if(a.tHead&&a.tHead.rows.length>0){for(e=0;e<a.tHead.rows.length;e++)if("thead"===a.tHead.rows[e].getAttribute("data-sort-method")){c=a.tHead.rows[e];break}c||(c=a.tHead.rows[a.tHead.rows.length-1]),g.thead=!0}else c=a.rows[0];if(c){var h=function(){g.current&&g.current!==this&&g.current.removeAttribute("aria-sort"),g.current=this,g.sortTable(this)};for(e=0;e<c.cells.length;e++)f=c.cells[e],f.setAttribute("role","columnheader"),"none"!==f.getAttribute("data-sort-method")&&(f.tabindex=0,f.addEventListener("click",h,!1),null!==f.getAttribute("data-sort-default")&&(d=f));d&&(g.current=d,g.sortTable(d))}},sortTable:function(a,g){var h=this,i=a.cellIndex,j=e,k="",l=[],m=h.thead?0:1,n=a.getAttribute("data-sort-method"),o=a.getAttribute("aria-sort");if(h.table.dispatchEvent(c("beforeSort")),g||(o="ascending"===o?"descending":"descending"===o?"ascending":h.options.descending?"descending":"ascending",a.setAttribute("aria-sort",o)),!(h.table.rows.length<2)){if(!n){for(;l.length<3&&m<h.table.tBodies[0].rows.length;)k=d(h.table.tBodies[0].rows[m].cells[i]),k=k.trim(),k.length>0&&l.push(k),m++;if(!l)return}for(m=0;m<b.length;m++)if(k=b[m],n){if(k.name===n){j=k.sort;break}}else if(l.every(k.pattern)){j=k.sort;break}for(h.col=i,m=0;m<h.table.tBodies.length;m++){var p,q=[],r={},s=0,t=0;if(!(h.table.tBodies[m].rows.length<2)){for(p=0;p<h.table.tBodies[m].rows.length;p++)k=h.table.tBodies[m].rows[p],"none"===k.getAttribute("data-sort-method")?r[s]=k:q.push({tr:k,td:d(k.cells[h.col]),index:s}),s++;for("descending"===o?q.sort(f(j,!0)):(q.sort(f(j,!1)),q.reverse()),p=0;p<s;p++)r[p]?(k=r[p],t++):k=q[p-t].tr,h.table.tBodies[m].appendChild(k)}}h.table.dispatchEvent(c("afterSort"))}},refresh:function(){void 0!==this.current&&this.sortTable(this.current,!0)}},"undefined"!=typeof module&&module.exports?module.exports=a:window.Tablesort=a}();

(function(){
    var cleanNumber = function(i) {
            return i.replace(/[^\-?0-9.]/g, '');
        },

        compareNumber = function(a, b) {
            a = parseFloat(a);
            b = parseFloat(b);

            a = isNaN(a) ? 0 : a;
            b = isNaN(b) ? 0 : b;

            return a - b;
        };

    Tablesort.extend('number', function(item) {
        return item.match(/^[-+]?[£\x24Û¢´€]?\d+\s*([,\.]\d{0,2})/) || // Prefixed currency
            item.match(/^[-+]?\d+\s*([,\.]\d{0,2})?[£\x24Û¢´€]/) || // Suffixed currency
            item.match(/^[-+]?(\d)*-?([,\.]){0,1}-?(\d)+([E,e][\-+][\d]+)?%?$/); // Number
    }, function(a, b) {
        a = cleanNumber(a);
        b = cleanNumber(b);

        return compareNumber(b, a);
    });
}());
/*
 * Runelogs script.js
 *
 * Content:
 *  - Get userId and current year from the appropriate headers
 *  - Grid square click event -> XhR request naar API -> update profile
 *  - Nightmode toggle (works with localStorage)
 *  - Grid drag -> select squares
 *  - Print a table with rows for exp or an unordened lost for events
 *
 */

const profile = document.querySelector('.profile');
let userId = null;
let year = null;

function getUserId() {
    const userHeader = document.querySelector('.current h1');
    if (userHeader !== null) {
        userId = userHeader.dataset.id;
    }
}

function getYear() {
    const yearHeader = document.querySelector('.yearHeader');
    if (yearHeader !== null) {
        year = yearHeader.dataset.year;
    }
}

function updateProfile(data)
{
    console.log(data);
    removeSpinnerIfPresent();

    if (data.logs  === null && data.events.length  === 0) {
        const notification = createNotification();
        profile.appendChild(notification);
        return;
    }

    if (data.logs  !== null) {
        printLogs(data.logs);
    }

    if (data.events.length  !== 0) {
        printEvents(data.events);
    }
}

function printLogs(logs)
{
    // Print the experience table and header
    const logSection = document.createElement('section');
    logSection.classList.add('table');

    const logTable = document.createElement('table');
    const logHeader = document.createElement('thead');

    const logHeaderRow = document.createElement('tr');

    const logHeaderIcon = document.createElement('th');
    logHeaderIcon.classList.add('icon');

    const logHeaderLevel = document.createElement('th');
    logHeaderLevel.appendChild(document.createTextNode('Level'));
    logHeaderLevel.classList.add('level');

    const logHeaderExperience = document.createElement('th');
    logHeaderExperience.appendChild(document.createTextNode('Experience'));

    const logHeaderDifference = document.createElement('th');
    logHeaderDifference.appendChild(document.createTextNode('Difference'));

    const logTableBody = document.createElement('tbody');

    profile.appendChild(logSection);
    logSection.appendChild(logTable);
    logTable.appendChild(logHeader);

    logHeaderRow.appendChild(logHeaderIcon);
    logHeaderRow.appendChild(logHeaderLevel);
    logHeaderRow.appendChild(logHeaderExperience);
    logHeaderRow.appendChild(logHeaderDifference);

    logHeader.appendChild(logHeaderRow);

    logTable.appendChild(logTableBody);

    /* Display the experience table rows */
    logs.forEach(function (log, index) {
        const logRow = document.createElement('tr');

        const logIconCell = document.createElement('td');
        const logIcon = document.createElement('span');
        logIcon.classList.add('log-icon', 's' + index);
        logIconCell.appendChild(logIcon);

        const logLevel = document.createElement('td');
        logLevel.appendChild(document.createTextNode(log.level));

        const logValue = document.createElement('td');
        logValue.appendChild(document.createTextNode(Math.round(log.value).toLocaleString()));

        const logDifference = document.createElement('td');
        if (log.difference > 0) {
            logDifference.appendChild(document.createTextNode('+' + Math.round(log.difference).toLocaleString()));
            logDifference.classList.add('log-value', 'positive');
        } else {
            logDifference.appendChild(document.createTextNode('0'));
        }

        logRow.appendChild(logIconCell);
        logRow.appendChild(logLevel);
        logRow.appendChild(logValue);
        logRow.appendChild(logDifference);
        logTableBody.appendChild(logRow);
    });
}

function printEvents(events)
{
    const eventSection = document.createElement('section');
    eventSection.classList.add('events');

    const eventList = document.createElement('ul');
    eventList.classList.add('events');

    profile.appendChild(eventSection);
    eventSection.appendChild(eventList);

    events.forEach(function (event, index) {

        const eventItem = document.createElement('li');
        eventItem.classList.add('event-item');

        const eventHeader = document.createElement('div');
        eventHeader.classList.add('event-header');

        const eventTitle = document.createElement('h2');
        eventTitle.appendChild(document.createTextNode(event.title));
        eventTitle.classList.add('event-title');

        const eventTimestamp = document.createElement('span');
        eventTimestamp.appendChild(document.createTextNode(dayjs.unix(event.timestamp).format("MMMM D, YYYY HH:mm")));
        eventTimestamp.classList.add('event-timestamp');

        const eventDetails = document.createElement('p');
        eventDetails.appendChild(document.createTextNode(event.details));
        eventDetails.classList.add('event-details');

        eventItem.appendChild(eventHeader);
        eventHeader.appendChild(eventTitle);
        eventHeader.appendChild(eventTimestamp);
        eventItem.appendChild(eventDetails);

        eventList.appendChild(eventItem);
    });
}

function createNotification()
{
    const notification = document.createElement('div');
    notification.classList.add('text', 'notification', 'inf');

    const notificationTitle = document.createElement('h2');
    notificationTitle.appendChild(document.createTextNode("Nothing interesting happened."));

    const notificationText = document.createElement('p');
    notificationText.appendChild(document.createTextNode("Looks like we don't have any data for you on this day."));

    notification.appendChild(notificationTitle);
    notification.appendChild(notificationText);
    return notification;
}

/* Nightmode toggle (global) */

const body = document.querySelector('body');
let isNightmode = body.classList.contains('is-nightmode');
const nightmodeToggle = document.querySelector('.night-mode-toggle');

function toggleNightmodeOnClick(e) {
    e.preventDefault();

    // Get the body class and reverse it
    isNightmode = body.classList.contains('is-nightmode');
    isNightmode = !isNightmode;

    // Set the body class so that the styling changes
    body.classList.toggle('is-nightmode');

    // Store the bool in localStorage
    localStorage.setItem("nightmode", JSON.stringify(isNightmode));
}

/*
 * If a page is loaded and the localStorage parameter is set to
 * true, then switch the page styling
 */
function turnOnNightmodeOnPageLoad() {
    if (localStorage.getItem("nightmode") === "true") {
        body.classList.toggle('is-nightmode');
    }
}

if (nightmodeToggle !== null) {
    nightmodeToggle.addEventListener('click', toggleNightmodeOnClick);
}

/* Date clicker */
let startDay, endDay;
let dragged = false;

/* SVG Grid events */
const gridSquares = document.querySelectorAll('.day');

// querySelectorAll returns a Nodelist so have to check for length
if (gridSquares.length > 0) {

    gridSquares.forEach(function (square, index) {

        ['mousedown', 'touchstart'].forEach(function (e) {
            square.addEventListener(e, gridStartHandler);
        });

        ['mouseup', 'touchend'].forEach(function (e) {
            square.addEventListener(e, gridEndHandler);
        });

        ['mouseenter', 'touchenter'].forEach(function (e) {
            square.addEventListener(e, gridHoverHandler);
        });

    });
}

function gridStartHandler(e) {
    startDay = e.target.dataset.index;

    const active = document.querySelectorAll('.today');
    active.forEach(function (square, index) {
        square.classList.toggle('today');
    })
    const selected = document.querySelectorAll('.select');
    selected.forEach(function (square, index) {
        square.classList.toggle('select');
    })
    e.target.classList.toggle('today');
    dragged = true;
}

function gridEndHandler(e) {
    e.preventDefault();
    endDay = e.target.dataset.index;
    dragged = false;
    if (startDay > endDay) {
        load(endDay, startDay);
    } else {
        load(startDay, endDay);
    }
}

function gridHoverHandler(e) {
    if (dragged) {
        gridSquares.forEach(function (square, index) {
            //reset
            square.classList.remove('select');
            //right drag
            if (parseInt(startDay) > parseInt(e.target.dataset.index)) {
                if (parseInt(square.dataset.index) <= parseInt(startDay) && parseInt(square.dataset.index) >= parseInt(e.target.dataset.index)) {
                    square.classList.add('select');
                }
            } else {
                //left drag
                if (parseInt(square.dataset.index) >= parseInt(startDay) && parseInt(square.dataset.index) <= parseInt(e.target.dataset.index)) {
                    square.classList.add('select');
                }
            }
        })
    }
}

function removeSpinnerIfPresent() {
    const spinner = document.querySelector('.spinner');
    if (spinner !== null) {
        spinner.remove();
    }
}

function removeNotificationIfPresent() {
    const notification = document.querySelector('.notification');
    if (notification !== null) {
        notification.remove();
    }
}

function load(startDay, endDay) {

    //  Prep the data that the API needs
    const data = {
        userId: userId,
        year: year,
        startDay: startDay,
        endDay: endDay
    };

    //  Clean up the profile so we can re-insert the new data
    profile.innerHTML = '';
    removeNotificationIfPresent();
    removeSpinnerIfPresent();

    //  Add the loading spinner
    const newSpinner = document.createElement('span');
    newSpinner.classList.add('spinner');
    profile.appendChild(newSpinner);

    //  Start the request
    const xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/getData', true);
    xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    xhr.send(JSON.stringify(data));
    xhr.onreadystatechange = function () {
        if (xhr.readyState === 4 && xhr.status === 200) {
            console.log(xhr.responseText);
            console.log(JSON.parse(xhr.responseText));
            updateProfile(JSON.parse(xhr.responseText));
            sortProfileTable();
        }
    }
}

function sortProfileTable()
{
    const profileTable = document.querySelector('.table table');
    if (profileTable !== null) {
        new Tablesort(profileTable, {
            descending: true
        });
    }
}

/*
let grid = document.querySelector('.grid-container');
if(grid){
  let max = grid.scrollWidth - grid.clientWidth;
  grid.scrollLeft = max;
}
*/

getUserId();
getYear();
turnOnNightmodeOnPageLoad();
sortProfileTable();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRhYmxlc29ydC5taW4uanMiLCJzY3JpcHQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiYXBwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyohXG4gKiB0YWJsZXNvcnQgdjUuMC4yICgyMDE3LTExLTEyKVxuICogaHR0cDovL3RyaXN0ZW4uY2EvdGFibGVzb3J0L2RlbW8vXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTcgOyBMaWNlbnNlZCBNSVRcbiovIWZ1bmN0aW9uKCl7ZnVuY3Rpb24gYShiLGMpe2lmKCEodGhpcyBpbnN0YW5jZW9mIGEpKXJldHVybiBuZXcgYShiLGMpO2lmKCFifHxcIlRBQkxFXCIhPT1iLnRhZ05hbWUpdGhyb3cgbmV3IEVycm9yKFwiRWxlbWVudCBtdXN0IGJlIGEgdGFibGVcIik7dGhpcy5pbml0KGIsY3x8e30pfXZhciBiPVtdLGM9ZnVuY3Rpb24oYSl7dmFyIGI7cmV0dXJuIHdpbmRvdy5DdXN0b21FdmVudCYmXCJmdW5jdGlvblwiPT10eXBlb2Ygd2luZG93LkN1c3RvbUV2ZW50P2I9bmV3IEN1c3RvbUV2ZW50KGEpOihiPWRvY3VtZW50LmNyZWF0ZUV2ZW50KFwiQ3VzdG9tRXZlbnRcIiksYi5pbml0Q3VzdG9tRXZlbnQoYSwhMSwhMSx2b2lkIDApKSxifSxkPWZ1bmN0aW9uKGEpe3JldHVybiBhLmdldEF0dHJpYnV0ZShcImRhdGEtc29ydFwiKXx8YS50ZXh0Q29udGVudHx8YS5pbm5lclRleHR8fFwiXCJ9LGU9ZnVuY3Rpb24oYSxiKXtyZXR1cm4gYT1hLnRyaW0oKS50b0xvd2VyQ2FzZSgpLGI9Yi50cmltKCkudG9Mb3dlckNhc2UoKSxhPT09Yj8wOmE8Yj8xOi0xfSxmPWZ1bmN0aW9uKGEsYil7cmV0dXJuIGZ1bmN0aW9uKGMsZCl7dmFyIGU9YShjLnRkLGQudGQpO3JldHVybiAwPT09ZT9iP2QuaW5kZXgtYy5pbmRleDpjLmluZGV4LWQuaW5kZXg6ZX19O2EuZXh0ZW5kPWZ1bmN0aW9uKGEsYyxkKXtpZihcImZ1bmN0aW9uXCIhPXR5cGVvZiBjfHxcImZ1bmN0aW9uXCIhPXR5cGVvZiBkKXRocm93IG5ldyBFcnJvcihcIlBhdHRlcm4gYW5kIHNvcnQgbXVzdCBiZSBhIGZ1bmN0aW9uXCIpO2IucHVzaCh7bmFtZTphLHBhdHRlcm46Yyxzb3J0OmR9KX0sYS5wcm90b3R5cGU9e2luaXQ6ZnVuY3Rpb24oYSxiKXt2YXIgYyxkLGUsZixnPXRoaXM7aWYoZy50YWJsZT1hLGcudGhlYWQ9ITEsZy5vcHRpb25zPWIsYS5yb3dzJiZhLnJvd3MubGVuZ3RoPjApaWYoYS50SGVhZCYmYS50SGVhZC5yb3dzLmxlbmd0aD4wKXtmb3IoZT0wO2U8YS50SGVhZC5yb3dzLmxlbmd0aDtlKyspaWYoXCJ0aGVhZFwiPT09YS50SGVhZC5yb3dzW2VdLmdldEF0dHJpYnV0ZShcImRhdGEtc29ydC1tZXRob2RcIikpe2M9YS50SGVhZC5yb3dzW2VdO2JyZWFrfWN8fChjPWEudEhlYWQucm93c1thLnRIZWFkLnJvd3MubGVuZ3RoLTFdKSxnLnRoZWFkPSEwfWVsc2UgYz1hLnJvd3NbMF07aWYoYyl7dmFyIGg9ZnVuY3Rpb24oKXtnLmN1cnJlbnQmJmcuY3VycmVudCE9PXRoaXMmJmcuY3VycmVudC5yZW1vdmVBdHRyaWJ1dGUoXCJhcmlhLXNvcnRcIiksZy5jdXJyZW50PXRoaXMsZy5zb3J0VGFibGUodGhpcyl9O2ZvcihlPTA7ZTxjLmNlbGxzLmxlbmd0aDtlKyspZj1jLmNlbGxzW2VdLGYuc2V0QXR0cmlidXRlKFwicm9sZVwiLFwiY29sdW1uaGVhZGVyXCIpLFwibm9uZVwiIT09Zi5nZXRBdHRyaWJ1dGUoXCJkYXRhLXNvcnQtbWV0aG9kXCIpJiYoZi50YWJpbmRleD0wLGYuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsaCwhMSksbnVsbCE9PWYuZ2V0QXR0cmlidXRlKFwiZGF0YS1zb3J0LWRlZmF1bHRcIikmJihkPWYpKTtkJiYoZy5jdXJyZW50PWQsZy5zb3J0VGFibGUoZCkpfX0sc29ydFRhYmxlOmZ1bmN0aW9uKGEsZyl7dmFyIGg9dGhpcyxpPWEuY2VsbEluZGV4LGo9ZSxrPVwiXCIsbD1bXSxtPWgudGhlYWQ/MDoxLG49YS5nZXRBdHRyaWJ1dGUoXCJkYXRhLXNvcnQtbWV0aG9kXCIpLG89YS5nZXRBdHRyaWJ1dGUoXCJhcmlhLXNvcnRcIik7aWYoaC50YWJsZS5kaXNwYXRjaEV2ZW50KGMoXCJiZWZvcmVTb3J0XCIpKSxnfHwobz1cImFzY2VuZGluZ1wiPT09bz9cImRlc2NlbmRpbmdcIjpcImRlc2NlbmRpbmdcIj09PW8/XCJhc2NlbmRpbmdcIjpoLm9wdGlvbnMuZGVzY2VuZGluZz9cImRlc2NlbmRpbmdcIjpcImFzY2VuZGluZ1wiLGEuc2V0QXR0cmlidXRlKFwiYXJpYS1zb3J0XCIsbykpLCEoaC50YWJsZS5yb3dzLmxlbmd0aDwyKSl7aWYoIW4pe2Zvcig7bC5sZW5ndGg8MyYmbTxoLnRhYmxlLnRCb2RpZXNbMF0ucm93cy5sZW5ndGg7KWs9ZChoLnRhYmxlLnRCb2RpZXNbMF0ucm93c1ttXS5jZWxsc1tpXSksaz1rLnRyaW0oKSxrLmxlbmd0aD4wJiZsLnB1c2goayksbSsrO2lmKCFsKXJldHVybn1mb3IobT0wO208Yi5sZW5ndGg7bSsrKWlmKGs9YlttXSxuKXtpZihrLm5hbWU9PT1uKXtqPWsuc29ydDticmVha319ZWxzZSBpZihsLmV2ZXJ5KGsucGF0dGVybikpe2o9ay5zb3J0O2JyZWFrfWZvcihoLmNvbD1pLG09MDttPGgudGFibGUudEJvZGllcy5sZW5ndGg7bSsrKXt2YXIgcCxxPVtdLHI9e30scz0wLHQ9MDtpZighKGgudGFibGUudEJvZGllc1ttXS5yb3dzLmxlbmd0aDwyKSl7Zm9yKHA9MDtwPGgudGFibGUudEJvZGllc1ttXS5yb3dzLmxlbmd0aDtwKyspaz1oLnRhYmxlLnRCb2RpZXNbbV0ucm93c1twXSxcIm5vbmVcIj09PWsuZ2V0QXR0cmlidXRlKFwiZGF0YS1zb3J0LW1ldGhvZFwiKT9yW3NdPWs6cS5wdXNoKHt0cjprLHRkOmQoay5jZWxsc1toLmNvbF0pLGluZGV4OnN9KSxzKys7Zm9yKFwiZGVzY2VuZGluZ1wiPT09bz9xLnNvcnQoZihqLCEwKSk6KHEuc29ydChmKGosITEpKSxxLnJldmVyc2UoKSkscD0wO3A8cztwKyspcltwXT8oaz1yW3BdLHQrKyk6az1xW3AtdF0udHIsaC50YWJsZS50Qm9kaWVzW21dLmFwcGVuZENoaWxkKGspfX1oLnRhYmxlLmRpc3BhdGNoRXZlbnQoYyhcImFmdGVyU29ydFwiKSl9fSxyZWZyZXNoOmZ1bmN0aW9uKCl7dm9pZCAwIT09dGhpcy5jdXJyZW50JiZ0aGlzLnNvcnRUYWJsZSh0aGlzLmN1cnJlbnQsITApfX0sXCJ1bmRlZmluZWRcIiE9dHlwZW9mIG1vZHVsZSYmbW9kdWxlLmV4cG9ydHM/bW9kdWxlLmV4cG9ydHM9YTp3aW5kb3cuVGFibGVzb3J0PWF9KCk7XG5cbihmdW5jdGlvbigpe1xuICAgIHZhciBjbGVhbk51bWJlciA9IGZ1bmN0aW9uKGkpIHtcbiAgICAgICAgICAgIHJldHVybiBpLnJlcGxhY2UoL1teXFwtPzAtOS5dL2csICcnKTtcbiAgICAgICAgfSxcblxuICAgICAgICBjb21wYXJlTnVtYmVyID0gZnVuY3Rpb24oYSwgYikge1xuICAgICAgICAgICAgYSA9IHBhcnNlRmxvYXQoYSk7XG4gICAgICAgICAgICBiID0gcGFyc2VGbG9hdChiKTtcblxuICAgICAgICAgICAgYSA9IGlzTmFOKGEpID8gMCA6IGE7XG4gICAgICAgICAgICBiID0gaXNOYU4oYikgPyAwIDogYjtcblxuICAgICAgICAgICAgcmV0dXJuIGEgLSBiO1xuICAgICAgICB9O1xuXG4gICAgVGFibGVzb3J0LmV4dGVuZCgnbnVtYmVyJywgZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICByZXR1cm4gaXRlbS5tYXRjaCgvXlstK10/W8KjXFx4MjTDm8KiwrTigqxdP1xcZCtcXHMqKFssXFwuXVxcZHswLDJ9KS8pIHx8IC8vIFByZWZpeGVkIGN1cnJlbmN5XG4gICAgICAgICAgICBpdGVtLm1hdGNoKC9eWy0rXT9cXGQrXFxzKihbLFxcLl1cXGR7MCwyfSk/W8KjXFx4MjTDm8KiwrTigqxdLykgfHwgLy8gU3VmZml4ZWQgY3VycmVuY3lcbiAgICAgICAgICAgIGl0ZW0ubWF0Y2goL15bLStdPyhcXGQpKi0/KFssXFwuXSl7MCwxfS0/KFxcZCkrKFtFLGVdW1xcLStdW1xcZF0rKT8lPyQvKTsgLy8gTnVtYmVyXG4gICAgfSwgZnVuY3Rpb24oYSwgYikge1xuICAgICAgICBhID0gY2xlYW5OdW1iZXIoYSk7XG4gICAgICAgIGIgPSBjbGVhbk51bWJlcihiKTtcblxuICAgICAgICByZXR1cm4gY29tcGFyZU51bWJlcihiLCBhKTtcbiAgICB9KTtcbn0oKSk7IiwiLypcbiAqIFJ1bmVsb2dzIHNjcmlwdC5qc1xuICpcbiAqIENvbnRlbnQ6XG4gKiAgLSBHZXQgdXNlcklkIGFuZCBjdXJyZW50IHllYXIgZnJvbSB0aGUgYXBwcm9wcmlhdGUgaGVhZGVyc1xuICogIC0gR3JpZCBzcXVhcmUgY2xpY2sgZXZlbnQgLT4gWGhSIHJlcXVlc3QgbmFhciBBUEkgLT4gdXBkYXRlIHByb2ZpbGVcbiAqICAtIE5pZ2h0bW9kZSB0b2dnbGUgKHdvcmtzIHdpdGggbG9jYWxTdG9yYWdlKVxuICogIC0gR3JpZCBkcmFnIC0+IHNlbGVjdCBzcXVhcmVzXG4gKiAgLSBQcmludCBhIHRhYmxlIHdpdGggcm93cyBmb3IgZXhwIG9yIGFuIHVub3JkZW5lZCBsb3N0IGZvciBldmVudHNcbiAqXG4gKi9cblxuY29uc3QgcHJvZmlsZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5wcm9maWxlJyk7XG5sZXQgdXNlcklkID0gbnVsbDtcbmxldCB5ZWFyID0gbnVsbDtcblxuZnVuY3Rpb24gZ2V0VXNlcklkKCkge1xuICAgIGNvbnN0IHVzZXJIZWFkZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuY3VycmVudCBoMScpO1xuICAgIGlmICh1c2VySGVhZGVyICE9PSBudWxsKSB7XG4gICAgICAgIHVzZXJJZCA9IHVzZXJIZWFkZXIuZGF0YXNldC5pZDtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGdldFllYXIoKSB7XG4gICAgY29uc3QgeWVhckhlYWRlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy55ZWFySGVhZGVyJyk7XG4gICAgaWYgKHllYXJIZWFkZXIgIT09IG51bGwpIHtcbiAgICAgICAgeWVhciA9IHllYXJIZWFkZXIuZGF0YXNldC55ZWFyO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gdXBkYXRlUHJvZmlsZShkYXRhKVxue1xuICAgIGNvbnNvbGUubG9nKGRhdGEpO1xuICAgIHJlbW92ZVNwaW5uZXJJZlByZXNlbnQoKTtcblxuICAgIGlmIChkYXRhLmxvZ3MgID09PSBudWxsICYmIGRhdGEuZXZlbnRzLmxlbmd0aCAgPT09IDApIHtcbiAgICAgICAgY29uc3Qgbm90aWZpY2F0aW9uID0gY3JlYXRlTm90aWZpY2F0aW9uKCk7XG4gICAgICAgIHByb2ZpbGUuYXBwZW5kQ2hpbGQobm90aWZpY2F0aW9uKTtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChkYXRhLmxvZ3MgICE9PSBudWxsKSB7XG4gICAgICAgIHByaW50TG9ncyhkYXRhLmxvZ3MpO1xuICAgIH1cblxuICAgIGlmIChkYXRhLmV2ZW50cy5sZW5ndGggICE9PSAwKSB7XG4gICAgICAgIHByaW50RXZlbnRzKGRhdGEuZXZlbnRzKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHByaW50TG9ncyhsb2dzKVxue1xuICAgIC8vIFByaW50IHRoZSBleHBlcmllbmNlIHRhYmxlIGFuZCBoZWFkZXJcbiAgICBjb25zdCBsb2dTZWN0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2VjdGlvbicpO1xuICAgIGxvZ1NlY3Rpb24uY2xhc3NMaXN0LmFkZCgndGFibGUnKTtcblxuICAgIGNvbnN0IGxvZ1RhYmxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGFibGUnKTtcbiAgICBjb25zdCBsb2dIZWFkZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0aGVhZCcpO1xuXG4gICAgY29uc3QgbG9nSGVhZGVyUm93ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndHInKTtcblxuICAgIGNvbnN0IGxvZ0hlYWRlckljb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0aCcpO1xuICAgIGxvZ0hlYWRlckljb24uY2xhc3NMaXN0LmFkZCgnaWNvbicpO1xuXG4gICAgY29uc3QgbG9nSGVhZGVyTGV2ZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0aCcpO1xuICAgIGxvZ0hlYWRlckxldmVsLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCdMZXZlbCcpKTtcbiAgICBsb2dIZWFkZXJMZXZlbC5jbGFzc0xpc3QuYWRkKCdsZXZlbCcpO1xuXG4gICAgY29uc3QgbG9nSGVhZGVyRXhwZXJpZW5jZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RoJyk7XG4gICAgbG9nSGVhZGVyRXhwZXJpZW5jZS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnRXhwZXJpZW5jZScpKTtcblxuICAgIGNvbnN0IGxvZ0hlYWRlckRpZmZlcmVuY2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0aCcpO1xuICAgIGxvZ0hlYWRlckRpZmZlcmVuY2UuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoJ0RpZmZlcmVuY2UnKSk7XG5cbiAgICBjb25zdCBsb2dUYWJsZUJvZHkgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0Ym9keScpO1xuXG4gICAgcHJvZmlsZS5hcHBlbmRDaGlsZChsb2dTZWN0aW9uKTtcbiAgICBsb2dTZWN0aW9uLmFwcGVuZENoaWxkKGxvZ1RhYmxlKTtcbiAgICBsb2dUYWJsZS5hcHBlbmRDaGlsZChsb2dIZWFkZXIpO1xuXG4gICAgbG9nSGVhZGVyUm93LmFwcGVuZENoaWxkKGxvZ0hlYWRlckljb24pO1xuICAgIGxvZ0hlYWRlclJvdy5hcHBlbmRDaGlsZChsb2dIZWFkZXJMZXZlbCk7XG4gICAgbG9nSGVhZGVyUm93LmFwcGVuZENoaWxkKGxvZ0hlYWRlckV4cGVyaWVuY2UpO1xuICAgIGxvZ0hlYWRlclJvdy5hcHBlbmRDaGlsZChsb2dIZWFkZXJEaWZmZXJlbmNlKTtcblxuICAgIGxvZ0hlYWRlci5hcHBlbmRDaGlsZChsb2dIZWFkZXJSb3cpO1xuXG4gICAgbG9nVGFibGUuYXBwZW5kQ2hpbGQobG9nVGFibGVCb2R5KTtcblxuICAgIC8qIERpc3BsYXkgdGhlIGV4cGVyaWVuY2UgdGFibGUgcm93cyAqL1xuICAgIGxvZ3MuZm9yRWFjaChmdW5jdGlvbiAobG9nLCBpbmRleCkge1xuICAgICAgICBjb25zdCBsb2dSb3cgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0cicpO1xuXG4gICAgICAgIGNvbnN0IGxvZ0ljb25DZWxsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGQnKTtcbiAgICAgICAgY29uc3QgbG9nSWNvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICAgICAgbG9nSWNvbi5jbGFzc0xpc3QuYWRkKCdsb2ctaWNvbicsICdzJyArIGluZGV4KTtcbiAgICAgICAgbG9nSWNvbkNlbGwuYXBwZW5kQ2hpbGQobG9nSWNvbik7XG5cbiAgICAgICAgY29uc3QgbG9nTGV2ZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZCcpO1xuICAgICAgICBsb2dMZXZlbC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShsb2cubGV2ZWwpKTtcblxuICAgICAgICBjb25zdCBsb2dWYWx1ZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RkJyk7XG4gICAgICAgIGxvZ1ZhbHVlLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKE1hdGgucm91bmQobG9nLnZhbHVlKS50b0xvY2FsZVN0cmluZygpKSk7XG5cbiAgICAgICAgY29uc3QgbG9nRGlmZmVyZW5jZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RkJyk7XG4gICAgICAgIGlmIChsb2cuZGlmZmVyZW5jZSA+IDApIHtcbiAgICAgICAgICAgIGxvZ0RpZmZlcmVuY2UuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoJysnICsgTWF0aC5yb3VuZChsb2cuZGlmZmVyZW5jZSkudG9Mb2NhbGVTdHJpbmcoKSkpO1xuICAgICAgICAgICAgbG9nRGlmZmVyZW5jZS5jbGFzc0xpc3QuYWRkKCdsb2ctdmFsdWUnLCAncG9zaXRpdmUnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxvZ0RpZmZlcmVuY2UuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoJzAnKSk7XG4gICAgICAgIH1cblxuICAgICAgICBsb2dSb3cuYXBwZW5kQ2hpbGQobG9nSWNvbkNlbGwpO1xuICAgICAgICBsb2dSb3cuYXBwZW5kQ2hpbGQobG9nTGV2ZWwpO1xuICAgICAgICBsb2dSb3cuYXBwZW5kQ2hpbGQobG9nVmFsdWUpO1xuICAgICAgICBsb2dSb3cuYXBwZW5kQ2hpbGQobG9nRGlmZmVyZW5jZSk7XG4gICAgICAgIGxvZ1RhYmxlQm9keS5hcHBlbmRDaGlsZChsb2dSb3cpO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBwcmludEV2ZW50cyhldmVudHMpXG57XG4gICAgY29uc3QgZXZlbnRTZWN0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc2VjdGlvbicpO1xuICAgIGV2ZW50U2VjdGlvbi5jbGFzc0xpc3QuYWRkKCdldmVudHMnKTtcblxuICAgIGNvbnN0IGV2ZW50TGlzdCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3VsJyk7XG4gICAgZXZlbnRMaXN0LmNsYXNzTGlzdC5hZGQoJ2V2ZW50cycpO1xuXG4gICAgcHJvZmlsZS5hcHBlbmRDaGlsZChldmVudFNlY3Rpb24pO1xuICAgIGV2ZW50U2VjdGlvbi5hcHBlbmRDaGlsZChldmVudExpc3QpO1xuXG4gICAgZXZlbnRzLmZvckVhY2goZnVuY3Rpb24gKGV2ZW50LCBpbmRleCkge1xuXG4gICAgICAgIGNvbnN0IGV2ZW50SXRlbSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2xpJyk7XG4gICAgICAgIGV2ZW50SXRlbS5jbGFzc0xpc3QuYWRkKCdldmVudC1pdGVtJyk7XG5cbiAgICAgICAgY29uc3QgZXZlbnRIZWFkZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICAgICAgZXZlbnRIZWFkZXIuY2xhc3NMaXN0LmFkZCgnZXZlbnQtaGVhZGVyJyk7XG5cbiAgICAgICAgY29uc3QgZXZlbnRUaXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2gyJyk7XG4gICAgICAgIGV2ZW50VGl0bGUuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoZXZlbnQudGl0bGUpKTtcbiAgICAgICAgZXZlbnRUaXRsZS5jbGFzc0xpc3QuYWRkKCdldmVudC10aXRsZScpO1xuXG4gICAgICAgIGNvbnN0IGV2ZW50VGltZXN0YW1wID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgICAgICBldmVudFRpbWVzdGFtcC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShkYXlqcy51bml4KGV2ZW50LnRpbWVzdGFtcCkuZm9ybWF0KFwiTU1NTSBELCBZWVlZIEhIOm1tXCIpKSk7XG4gICAgICAgIGV2ZW50VGltZXN0YW1wLmNsYXNzTGlzdC5hZGQoJ2V2ZW50LXRpbWVzdGFtcCcpO1xuXG4gICAgICAgIGNvbnN0IGV2ZW50RGV0YWlscyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3AnKTtcbiAgICAgICAgZXZlbnREZXRhaWxzLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGV2ZW50LmRldGFpbHMpKTtcbiAgICAgICAgZXZlbnREZXRhaWxzLmNsYXNzTGlzdC5hZGQoJ2V2ZW50LWRldGFpbHMnKTtcblxuICAgICAgICBldmVudEl0ZW0uYXBwZW5kQ2hpbGQoZXZlbnRIZWFkZXIpO1xuICAgICAgICBldmVudEhlYWRlci5hcHBlbmRDaGlsZChldmVudFRpdGxlKTtcbiAgICAgICAgZXZlbnRIZWFkZXIuYXBwZW5kQ2hpbGQoZXZlbnRUaW1lc3RhbXApO1xuICAgICAgICBldmVudEl0ZW0uYXBwZW5kQ2hpbGQoZXZlbnREZXRhaWxzKTtcblxuICAgICAgICBldmVudExpc3QuYXBwZW5kQ2hpbGQoZXZlbnRJdGVtKTtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlTm90aWZpY2F0aW9uKClcbntcbiAgICBjb25zdCBub3RpZmljYXRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBub3RpZmljYXRpb24uY2xhc3NMaXN0LmFkZCgndGV4dCcsICdub3RpZmljYXRpb24nLCAnaW5mJyk7XG5cbiAgICBjb25zdCBub3RpZmljYXRpb25UaXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2gyJyk7XG4gICAgbm90aWZpY2F0aW9uVGl0bGUuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCJOb3RoaW5nIGludGVyZXN0aW5nIGhhcHBlbmVkLlwiKSk7XG5cbiAgICBjb25zdCBub3RpZmljYXRpb25UZXh0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncCcpO1xuICAgIG5vdGlmaWNhdGlvblRleHQuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCJMb29rcyBsaWtlIHdlIGRvbid0IGhhdmUgYW55IGRhdGEgZm9yIHlvdSBvbiB0aGlzIGRheS5cIikpO1xuXG4gICAgbm90aWZpY2F0aW9uLmFwcGVuZENoaWxkKG5vdGlmaWNhdGlvblRpdGxlKTtcbiAgICBub3RpZmljYXRpb24uYXBwZW5kQ2hpbGQobm90aWZpY2F0aW9uVGV4dCk7XG4gICAgcmV0dXJuIG5vdGlmaWNhdGlvbjtcbn1cblxuLyogTmlnaHRtb2RlIHRvZ2dsZSAoZ2xvYmFsKSAqL1xuXG5jb25zdCBib2R5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpO1xubGV0IGlzTmlnaHRtb2RlID0gYm9keS5jbGFzc0xpc3QuY29udGFpbnMoJ2lzLW5pZ2h0bW9kZScpO1xuY29uc3QgbmlnaHRtb2RlVG9nZ2xlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm5pZ2h0LW1vZGUtdG9nZ2xlJyk7XG5cbmZ1bmN0aW9uIHRvZ2dsZU5pZ2h0bW9kZU9uQ2xpY2soZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgIC8vIEdldCB0aGUgYm9keSBjbGFzcyBhbmQgcmV2ZXJzZSBpdFxuICAgIGlzTmlnaHRtb2RlID0gYm9keS5jbGFzc0xpc3QuY29udGFpbnMoJ2lzLW5pZ2h0bW9kZScpO1xuICAgIGlzTmlnaHRtb2RlID0gIWlzTmlnaHRtb2RlO1xuXG4gICAgLy8gU2V0IHRoZSBib2R5IGNsYXNzIHNvIHRoYXQgdGhlIHN0eWxpbmcgY2hhbmdlc1xuICAgIGJvZHkuY2xhc3NMaXN0LnRvZ2dsZSgnaXMtbmlnaHRtb2RlJyk7XG5cbiAgICAvLyBTdG9yZSB0aGUgYm9vbCBpbiBsb2NhbFN0b3JhZ2VcbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcIm5pZ2h0bW9kZVwiLCBKU09OLnN0cmluZ2lmeShpc05pZ2h0bW9kZSkpO1xufVxuXG4vKlxuICogSWYgYSBwYWdlIGlzIGxvYWRlZCBhbmQgdGhlIGxvY2FsU3RvcmFnZSBwYXJhbWV0ZXIgaXMgc2V0IHRvXG4gKiB0cnVlLCB0aGVuIHN3aXRjaCB0aGUgcGFnZSBzdHlsaW5nXG4gKi9cbmZ1bmN0aW9uIHR1cm5Pbk5pZ2h0bW9kZU9uUGFnZUxvYWQoKSB7XG4gICAgaWYgKGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwibmlnaHRtb2RlXCIpID09PSBcInRydWVcIikge1xuICAgICAgICBib2R5LmNsYXNzTGlzdC50b2dnbGUoJ2lzLW5pZ2h0bW9kZScpO1xuICAgIH1cbn1cblxuaWYgKG5pZ2h0bW9kZVRvZ2dsZSAhPT0gbnVsbCkge1xuICAgIG5pZ2h0bW9kZVRvZ2dsZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRvZ2dsZU5pZ2h0bW9kZU9uQ2xpY2spO1xufVxuXG4vKiBEYXRlIGNsaWNrZXIgKi9cbmxldCBzdGFydERheSwgZW5kRGF5O1xubGV0IGRyYWdnZWQgPSBmYWxzZTtcblxuLyogU1ZHIEdyaWQgZXZlbnRzICovXG5jb25zdCBncmlkU3F1YXJlcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5kYXknKTtcblxuLy8gcXVlcnlTZWxlY3RvckFsbCByZXR1cm5zIGEgTm9kZWxpc3Qgc28gaGF2ZSB0byBjaGVjayBmb3IgbGVuZ3RoXG5pZiAoZ3JpZFNxdWFyZXMubGVuZ3RoID4gMCkge1xuXG4gICAgZ3JpZFNxdWFyZXMuZm9yRWFjaChmdW5jdGlvbiAoc3F1YXJlLCBpbmRleCkge1xuXG4gICAgICAgIFsnbW91c2Vkb3duJywgJ3RvdWNoc3RhcnQnXS5mb3JFYWNoKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBzcXVhcmUuYWRkRXZlbnRMaXN0ZW5lcihlLCBncmlkU3RhcnRIYW5kbGVyKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgWydtb3VzZXVwJywgJ3RvdWNoZW5kJ10uZm9yRWFjaChmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgc3F1YXJlLmFkZEV2ZW50TGlzdGVuZXIoZSwgZ3JpZEVuZEhhbmRsZXIpO1xuICAgICAgICB9KTtcblxuICAgICAgICBbJ21vdXNlZW50ZXInLCAndG91Y2hlbnRlciddLmZvckVhY2goZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIHNxdWFyZS5hZGRFdmVudExpc3RlbmVyKGUsIGdyaWRIb3ZlckhhbmRsZXIpO1xuICAgICAgICB9KTtcblxuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBncmlkU3RhcnRIYW5kbGVyKGUpIHtcbiAgICBzdGFydERheSA9IGUudGFyZ2V0LmRhdGFzZXQuaW5kZXg7XG5cbiAgICBjb25zdCBhY3RpdmUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcudG9kYXknKTtcbiAgICBhY3RpdmUuZm9yRWFjaChmdW5jdGlvbiAoc3F1YXJlLCBpbmRleCkge1xuICAgICAgICBzcXVhcmUuY2xhc3NMaXN0LnRvZ2dsZSgndG9kYXknKTtcbiAgICB9KVxuICAgIGNvbnN0IHNlbGVjdGVkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLnNlbGVjdCcpO1xuICAgIHNlbGVjdGVkLmZvckVhY2goZnVuY3Rpb24gKHNxdWFyZSwgaW5kZXgpIHtcbiAgICAgICAgc3F1YXJlLmNsYXNzTGlzdC50b2dnbGUoJ3NlbGVjdCcpO1xuICAgIH0pXG4gICAgZS50YXJnZXQuY2xhc3NMaXN0LnRvZ2dsZSgndG9kYXknKTtcbiAgICBkcmFnZ2VkID0gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gZ3JpZEVuZEhhbmRsZXIoZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBlbmREYXkgPSBlLnRhcmdldC5kYXRhc2V0LmluZGV4O1xuICAgIGRyYWdnZWQgPSBmYWxzZTtcbiAgICBpZiAoc3RhcnREYXkgPiBlbmREYXkpIHtcbiAgICAgICAgbG9hZChlbmREYXksIHN0YXJ0RGF5KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBsb2FkKHN0YXJ0RGF5LCBlbmREYXkpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZ3JpZEhvdmVySGFuZGxlcihlKSB7XG4gICAgaWYgKGRyYWdnZWQpIHtcbiAgICAgICAgZ3JpZFNxdWFyZXMuZm9yRWFjaChmdW5jdGlvbiAoc3F1YXJlLCBpbmRleCkge1xuICAgICAgICAgICAgLy9yZXNldFxuICAgICAgICAgICAgc3F1YXJlLmNsYXNzTGlzdC5yZW1vdmUoJ3NlbGVjdCcpO1xuICAgICAgICAgICAgLy9yaWdodCBkcmFnXG4gICAgICAgICAgICBpZiAocGFyc2VJbnQoc3RhcnREYXkpID4gcGFyc2VJbnQoZS50YXJnZXQuZGF0YXNldC5pbmRleCkpIHtcbiAgICAgICAgICAgICAgICBpZiAocGFyc2VJbnQoc3F1YXJlLmRhdGFzZXQuaW5kZXgpIDw9IHBhcnNlSW50KHN0YXJ0RGF5KSAmJiBwYXJzZUludChzcXVhcmUuZGF0YXNldC5pbmRleCkgPj0gcGFyc2VJbnQoZS50YXJnZXQuZGF0YXNldC5pbmRleCkpIHtcbiAgICAgICAgICAgICAgICAgICAgc3F1YXJlLmNsYXNzTGlzdC5hZGQoJ3NlbGVjdCcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy9sZWZ0IGRyYWdcbiAgICAgICAgICAgICAgICBpZiAocGFyc2VJbnQoc3F1YXJlLmRhdGFzZXQuaW5kZXgpID49IHBhcnNlSW50KHN0YXJ0RGF5KSAmJiBwYXJzZUludChzcXVhcmUuZGF0YXNldC5pbmRleCkgPD0gcGFyc2VJbnQoZS50YXJnZXQuZGF0YXNldC5pbmRleCkpIHtcbiAgICAgICAgICAgICAgICAgICAgc3F1YXJlLmNsYXNzTGlzdC5hZGQoJ3NlbGVjdCcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHJlbW92ZVNwaW5uZXJJZlByZXNlbnQoKSB7XG4gICAgY29uc3Qgc3Bpbm5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zcGlubmVyJyk7XG4gICAgaWYgKHNwaW5uZXIgIT09IG51bGwpIHtcbiAgICAgICAgc3Bpbm5lci5yZW1vdmUoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHJlbW92ZU5vdGlmaWNhdGlvbklmUHJlc2VudCgpIHtcbiAgICBjb25zdCBub3RpZmljYXRpb24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubm90aWZpY2F0aW9uJyk7XG4gICAgaWYgKG5vdGlmaWNhdGlvbiAhPT0gbnVsbCkge1xuICAgICAgICBub3RpZmljYXRpb24ucmVtb3ZlKCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBsb2FkKHN0YXJ0RGF5LCBlbmREYXkpIHtcblxuICAgIC8vICBQcmVwIHRoZSBkYXRhIHRoYXQgdGhlIEFQSSBuZWVkc1xuICAgIGNvbnN0IGRhdGEgPSB7XG4gICAgICAgIHVzZXJJZDogdXNlcklkLFxuICAgICAgICB5ZWFyOiB5ZWFyLFxuICAgICAgICBzdGFydERheTogc3RhcnREYXksXG4gICAgICAgIGVuZERheTogZW5kRGF5XG4gICAgfTtcblxuICAgIC8vICBDbGVhbiB1cCB0aGUgcHJvZmlsZSBzbyB3ZSBjYW4gcmUtaW5zZXJ0IHRoZSBuZXcgZGF0YVxuICAgIHByb2ZpbGUuaW5uZXJIVE1MID0gJyc7XG4gICAgcmVtb3ZlTm90aWZpY2F0aW9uSWZQcmVzZW50KCk7XG4gICAgcmVtb3ZlU3Bpbm5lcklmUHJlc2VudCgpO1xuXG4gICAgLy8gIEFkZCB0aGUgbG9hZGluZyBzcGlubmVyXG4gICAgY29uc3QgbmV3U3Bpbm5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICBuZXdTcGlubmVyLmNsYXNzTGlzdC5hZGQoJ3NwaW5uZXInKTtcbiAgICBwcm9maWxlLmFwcGVuZENoaWxkKG5ld1NwaW5uZXIpO1xuXG4gICAgLy8gIFN0YXJ0IHRoZSByZXF1ZXN0XG4gICAgY29uc3QgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgeGhyLm9wZW4oJ1BPU1QnLCAnL2FwaS9nZXREYXRhJywgdHJ1ZSk7XG4gICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uOyBjaGFyc2V0PVVURi04Jyk7XG4gICAgeGhyLnNlbmQoSlNPTi5zdHJpbmdpZnkoZGF0YSkpO1xuICAgIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh4aHIucmVhZHlTdGF0ZSA9PT0gNCAmJiB4aHIuc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKHhoci5yZXNwb25zZVRleHQpO1xuICAgICAgICAgICAgY29uc29sZS5sb2coSlNPTi5wYXJzZSh4aHIucmVzcG9uc2VUZXh0KSk7XG4gICAgICAgICAgICB1cGRhdGVQcm9maWxlKEpTT04ucGFyc2UoeGhyLnJlc3BvbnNlVGV4dCkpO1xuICAgICAgICAgICAgc29ydFByb2ZpbGVUYWJsZSgpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5mdW5jdGlvbiBzb3J0UHJvZmlsZVRhYmxlKClcbntcbiAgICBjb25zdCBwcm9maWxlVGFibGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcudGFibGUgdGFibGUnKTtcbiAgICBpZiAocHJvZmlsZVRhYmxlICE9PSBudWxsKSB7XG4gICAgICAgIG5ldyBUYWJsZXNvcnQocHJvZmlsZVRhYmxlLCB7XG4gICAgICAgICAgICBkZXNjZW5kaW5nOiB0cnVlXG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuLypcbmxldCBncmlkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmdyaWQtY29udGFpbmVyJyk7XG5pZihncmlkKXtcbiAgbGV0IG1heCA9IGdyaWQuc2Nyb2xsV2lkdGggLSBncmlkLmNsaWVudFdpZHRoO1xuICBncmlkLnNjcm9sbExlZnQgPSBtYXg7XG59XG4qL1xuXG5nZXRVc2VySWQoKTtcbmdldFllYXIoKTtcbnR1cm5Pbk5pZ2h0bW9kZU9uUGFnZUxvYWQoKTtcbnNvcnRQcm9maWxlVGFibGUoKTsiXX0=