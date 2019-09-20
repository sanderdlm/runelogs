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
    console.table(data);
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRhYmxlc29ydC5taW4uanMiLCJzY3JpcHQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiFcbiAqIHRhYmxlc29ydCB2NS4wLjIgKDIwMTctMTEtMTIpXG4gKiBodHRwOi8vdHJpc3Rlbi5jYS90YWJsZXNvcnQvZGVtby9cbiAqIENvcHlyaWdodCAoYykgMjAxNyA7IExpY2Vuc2VkIE1JVFxuKi8hZnVuY3Rpb24oKXtmdW5jdGlvbiBhKGIsYyl7aWYoISh0aGlzIGluc3RhbmNlb2YgYSkpcmV0dXJuIG5ldyBhKGIsYyk7aWYoIWJ8fFwiVEFCTEVcIiE9PWIudGFnTmFtZSl0aHJvdyBuZXcgRXJyb3IoXCJFbGVtZW50IG11c3QgYmUgYSB0YWJsZVwiKTt0aGlzLmluaXQoYixjfHx7fSl9dmFyIGI9W10sYz1mdW5jdGlvbihhKXt2YXIgYjtyZXR1cm4gd2luZG93LkN1c3RvbUV2ZW50JiZcImZ1bmN0aW9uXCI9PXR5cGVvZiB3aW5kb3cuQ3VzdG9tRXZlbnQ/Yj1uZXcgQ3VzdG9tRXZlbnQoYSk6KGI9ZG9jdW1lbnQuY3JlYXRlRXZlbnQoXCJDdXN0b21FdmVudFwiKSxiLmluaXRDdXN0b21FdmVudChhLCExLCExLHZvaWQgMCkpLGJ9LGQ9ZnVuY3Rpb24oYSl7cmV0dXJuIGEuZ2V0QXR0cmlidXRlKFwiZGF0YS1zb3J0XCIpfHxhLnRleHRDb250ZW50fHxhLmlubmVyVGV4dHx8XCJcIn0sZT1mdW5jdGlvbihhLGIpe3JldHVybiBhPWEudHJpbSgpLnRvTG93ZXJDYXNlKCksYj1iLnRyaW0oKS50b0xvd2VyQ2FzZSgpLGE9PT1iPzA6YTxiPzE6LTF9LGY9ZnVuY3Rpb24oYSxiKXtyZXR1cm4gZnVuY3Rpb24oYyxkKXt2YXIgZT1hKGMudGQsZC50ZCk7cmV0dXJuIDA9PT1lP2I/ZC5pbmRleC1jLmluZGV4OmMuaW5kZXgtZC5pbmRleDplfX07YS5leHRlbmQ9ZnVuY3Rpb24oYSxjLGQpe2lmKFwiZnVuY3Rpb25cIiE9dHlwZW9mIGN8fFwiZnVuY3Rpb25cIiE9dHlwZW9mIGQpdGhyb3cgbmV3IEVycm9yKFwiUGF0dGVybiBhbmQgc29ydCBtdXN0IGJlIGEgZnVuY3Rpb25cIik7Yi5wdXNoKHtuYW1lOmEscGF0dGVybjpjLHNvcnQ6ZH0pfSxhLnByb3RvdHlwZT17aW5pdDpmdW5jdGlvbihhLGIpe3ZhciBjLGQsZSxmLGc9dGhpcztpZihnLnRhYmxlPWEsZy50aGVhZD0hMSxnLm9wdGlvbnM9YixhLnJvd3MmJmEucm93cy5sZW5ndGg+MClpZihhLnRIZWFkJiZhLnRIZWFkLnJvd3MubGVuZ3RoPjApe2ZvcihlPTA7ZTxhLnRIZWFkLnJvd3MubGVuZ3RoO2UrKylpZihcInRoZWFkXCI9PT1hLnRIZWFkLnJvd3NbZV0uZ2V0QXR0cmlidXRlKFwiZGF0YS1zb3J0LW1ldGhvZFwiKSl7Yz1hLnRIZWFkLnJvd3NbZV07YnJlYWt9Y3x8KGM9YS50SGVhZC5yb3dzW2EudEhlYWQucm93cy5sZW5ndGgtMV0pLGcudGhlYWQ9ITB9ZWxzZSBjPWEucm93c1swXTtpZihjKXt2YXIgaD1mdW5jdGlvbigpe2cuY3VycmVudCYmZy5jdXJyZW50IT09dGhpcyYmZy5jdXJyZW50LnJlbW92ZUF0dHJpYnV0ZShcImFyaWEtc29ydFwiKSxnLmN1cnJlbnQ9dGhpcyxnLnNvcnRUYWJsZSh0aGlzKX07Zm9yKGU9MDtlPGMuY2VsbHMubGVuZ3RoO2UrKylmPWMuY2VsbHNbZV0sZi5zZXRBdHRyaWJ1dGUoXCJyb2xlXCIsXCJjb2x1bW5oZWFkZXJcIiksXCJub25lXCIhPT1mLmdldEF0dHJpYnV0ZShcImRhdGEtc29ydC1tZXRob2RcIikmJihmLnRhYmluZGV4PTAsZi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIixoLCExKSxudWxsIT09Zi5nZXRBdHRyaWJ1dGUoXCJkYXRhLXNvcnQtZGVmYXVsdFwiKSYmKGQ9ZikpO2QmJihnLmN1cnJlbnQ9ZCxnLnNvcnRUYWJsZShkKSl9fSxzb3J0VGFibGU6ZnVuY3Rpb24oYSxnKXt2YXIgaD10aGlzLGk9YS5jZWxsSW5kZXgsaj1lLGs9XCJcIixsPVtdLG09aC50aGVhZD8wOjEsbj1hLmdldEF0dHJpYnV0ZShcImRhdGEtc29ydC1tZXRob2RcIiksbz1hLmdldEF0dHJpYnV0ZShcImFyaWEtc29ydFwiKTtpZihoLnRhYmxlLmRpc3BhdGNoRXZlbnQoYyhcImJlZm9yZVNvcnRcIikpLGd8fChvPVwiYXNjZW5kaW5nXCI9PT1vP1wiZGVzY2VuZGluZ1wiOlwiZGVzY2VuZGluZ1wiPT09bz9cImFzY2VuZGluZ1wiOmgub3B0aW9ucy5kZXNjZW5kaW5nP1wiZGVzY2VuZGluZ1wiOlwiYXNjZW5kaW5nXCIsYS5zZXRBdHRyaWJ1dGUoXCJhcmlhLXNvcnRcIixvKSksIShoLnRhYmxlLnJvd3MubGVuZ3RoPDIpKXtpZighbil7Zm9yKDtsLmxlbmd0aDwzJiZtPGgudGFibGUudEJvZGllc1swXS5yb3dzLmxlbmd0aDspaz1kKGgudGFibGUudEJvZGllc1swXS5yb3dzW21dLmNlbGxzW2ldKSxrPWsudHJpbSgpLGsubGVuZ3RoPjAmJmwucHVzaChrKSxtKys7aWYoIWwpcmV0dXJufWZvcihtPTA7bTxiLmxlbmd0aDttKyspaWYoaz1iW21dLG4pe2lmKGsubmFtZT09PW4pe2o9ay5zb3J0O2JyZWFrfX1lbHNlIGlmKGwuZXZlcnkoay5wYXR0ZXJuKSl7aj1rLnNvcnQ7YnJlYWt9Zm9yKGguY29sPWksbT0wO208aC50YWJsZS50Qm9kaWVzLmxlbmd0aDttKyspe3ZhciBwLHE9W10scj17fSxzPTAsdD0wO2lmKCEoaC50YWJsZS50Qm9kaWVzW21dLnJvd3MubGVuZ3RoPDIpKXtmb3IocD0wO3A8aC50YWJsZS50Qm9kaWVzW21dLnJvd3MubGVuZ3RoO3ArKylrPWgudGFibGUudEJvZGllc1ttXS5yb3dzW3BdLFwibm9uZVwiPT09ay5nZXRBdHRyaWJ1dGUoXCJkYXRhLXNvcnQtbWV0aG9kXCIpP3Jbc109azpxLnB1c2goe3RyOmssdGQ6ZChrLmNlbGxzW2guY29sXSksaW5kZXg6c30pLHMrKztmb3IoXCJkZXNjZW5kaW5nXCI9PT1vP3Euc29ydChmKGosITApKToocS5zb3J0KGYoaiwhMSkpLHEucmV2ZXJzZSgpKSxwPTA7cDxzO3ArKylyW3BdPyhrPXJbcF0sdCsrKTprPXFbcC10XS50cixoLnRhYmxlLnRCb2RpZXNbbV0uYXBwZW5kQ2hpbGQoayl9fWgudGFibGUuZGlzcGF0Y2hFdmVudChjKFwiYWZ0ZXJTb3J0XCIpKX19LHJlZnJlc2g6ZnVuY3Rpb24oKXt2b2lkIDAhPT10aGlzLmN1cnJlbnQmJnRoaXMuc29ydFRhYmxlKHRoaXMuY3VycmVudCwhMCl9fSxcInVuZGVmaW5lZFwiIT10eXBlb2YgbW9kdWxlJiZtb2R1bGUuZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz1hOndpbmRvdy5UYWJsZXNvcnQ9YX0oKTtcblxuKGZ1bmN0aW9uKCl7XG4gICAgdmFyIGNsZWFuTnVtYmVyID0gZnVuY3Rpb24oaSkge1xuICAgICAgICAgICAgcmV0dXJuIGkucmVwbGFjZSgvW15cXC0/MC05Ll0vZywgJycpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGNvbXBhcmVOdW1iZXIgPSBmdW5jdGlvbihhLCBiKSB7XG4gICAgICAgICAgICBhID0gcGFyc2VGbG9hdChhKTtcbiAgICAgICAgICAgIGIgPSBwYXJzZUZsb2F0KGIpO1xuXG4gICAgICAgICAgICBhID0gaXNOYU4oYSkgPyAwIDogYTtcbiAgICAgICAgICAgIGIgPSBpc05hTihiKSA/IDAgOiBiO1xuXG4gICAgICAgICAgICByZXR1cm4gYSAtIGI7XG4gICAgICAgIH07XG5cbiAgICBUYWJsZXNvcnQuZXh0ZW5kKCdudW1iZXInLCBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgIHJldHVybiBpdGVtLm1hdGNoKC9eWy0rXT9bwqNcXHgyNMObwqLCtOKCrF0/XFxkK1xccyooWyxcXC5dXFxkezAsMn0pLykgfHwgLy8gUHJlZml4ZWQgY3VycmVuY3lcbiAgICAgICAgICAgIGl0ZW0ubWF0Y2goL15bLStdP1xcZCtcXHMqKFssXFwuXVxcZHswLDJ9KT9bwqNcXHgyNMObwqLCtOKCrF0vKSB8fCAvLyBTdWZmaXhlZCBjdXJyZW5jeVxuICAgICAgICAgICAgaXRlbS5tYXRjaCgvXlstK10/KFxcZCkqLT8oWyxcXC5dKXswLDF9LT8oXFxkKSsoW0UsZV1bXFwtK11bXFxkXSspPyU/JC8pOyAvLyBOdW1iZXJcbiAgICB9LCBmdW5jdGlvbihhLCBiKSB7XG4gICAgICAgIGEgPSBjbGVhbk51bWJlcihhKTtcbiAgICAgICAgYiA9IGNsZWFuTnVtYmVyKGIpO1xuXG4gICAgICAgIHJldHVybiBjb21wYXJlTnVtYmVyKGIsIGEpO1xuICAgIH0pO1xufSgpKTsiLCIvKlxuICogUnVuZWxvZ3Mgc2NyaXB0LmpzXG4gKlxuICogQ29udGVudDpcbiAqICAtIEdldCB1c2VySWQgYW5kIGN1cnJlbnQgeWVhciBmcm9tIHRoZSBhcHByb3ByaWF0ZSBoZWFkZXJzXG4gKiAgLSBHcmlkIHNxdWFyZSBjbGljayBldmVudCAtPiBYaFIgcmVxdWVzdCBuYWFyIEFQSSAtPiB1cGRhdGUgcHJvZmlsZVxuICogIC0gTmlnaHRtb2RlIHRvZ2dsZSAod29ya3Mgd2l0aCBsb2NhbFN0b3JhZ2UpXG4gKiAgLSBHcmlkIGRyYWcgLT4gc2VsZWN0IHNxdWFyZXNcbiAqICAtIFByaW50IGEgdGFibGUgd2l0aCByb3dzIGZvciBleHAgb3IgYW4gdW5vcmRlbmVkIGxvc3QgZm9yIGV2ZW50c1xuICpcbiAqL1xuXG5jb25zdCBwcm9maWxlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnByb2ZpbGUnKTtcbmxldCB1c2VySWQgPSBudWxsO1xubGV0IHllYXIgPSBudWxsO1xuXG5mdW5jdGlvbiBnZXRVc2VySWQoKSB7XG4gICAgY29uc3QgdXNlckhlYWRlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jdXJyZW50IGgxJyk7XG4gICAgaWYgKHVzZXJIZWFkZXIgIT09IG51bGwpIHtcbiAgICAgICAgdXNlcklkID0gdXNlckhlYWRlci5kYXRhc2V0LmlkO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZ2V0WWVhcigpIHtcbiAgICBjb25zdCB5ZWFySGVhZGVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnllYXJIZWFkZXInKTtcbiAgICBpZiAoeWVhckhlYWRlciAhPT0gbnVsbCkge1xuICAgICAgICB5ZWFyID0geWVhckhlYWRlci5kYXRhc2V0LnllYXI7XG4gICAgfVxufVxuXG5mdW5jdGlvbiB1cGRhdGVQcm9maWxlKGRhdGEpXG57XG4gICAgY29uc29sZS50YWJsZShkYXRhKTtcbiAgICByZW1vdmVTcGlubmVySWZQcmVzZW50KCk7XG5cbiAgICBpZiAoZGF0YS5sb2dzICA9PT0gbnVsbCAmJiBkYXRhLmV2ZW50cy5sZW5ndGggID09PSAwKSB7XG4gICAgICAgIGNvbnN0IG5vdGlmaWNhdGlvbiA9IGNyZWF0ZU5vdGlmaWNhdGlvbigpO1xuICAgICAgICBwcm9maWxlLmFwcGVuZENoaWxkKG5vdGlmaWNhdGlvbik7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoZGF0YS5sb2dzICAhPT0gbnVsbCkge1xuICAgICAgICBwcmludExvZ3MoZGF0YS5sb2dzKTtcbiAgICB9XG5cbiAgICBpZiAoZGF0YS5ldmVudHMubGVuZ3RoICAhPT0gMCkge1xuICAgICAgICBwcmludEV2ZW50cyhkYXRhLmV2ZW50cyk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBwcmludExvZ3MobG9ncylcbntcbiAgICAvLyBQcmludCB0aGUgZXhwZXJpZW5jZSB0YWJsZSBhbmQgaGVhZGVyXG4gICAgY29uc3QgbG9nU2VjdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NlY3Rpb24nKTtcbiAgICBsb2dTZWN0aW9uLmNsYXNzTGlzdC5hZGQoJ3RhYmxlJyk7XG5cbiAgICBjb25zdCBsb2dUYWJsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RhYmxlJyk7XG4gICAgY29uc3QgbG9nSGVhZGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGhlYWQnKTtcblxuICAgIGNvbnN0IGxvZ0hlYWRlclJvdyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RyJyk7XG5cbiAgICBjb25zdCBsb2dIZWFkZXJJY29uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGgnKTtcbiAgICBsb2dIZWFkZXJJY29uLmNsYXNzTGlzdC5hZGQoJ2ljb24nKTtcblxuICAgIGNvbnN0IGxvZ0hlYWRlckxldmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGgnKTtcbiAgICBsb2dIZWFkZXJMZXZlbC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnTGV2ZWwnKSk7XG4gICAgbG9nSGVhZGVyTGV2ZWwuY2xhc3NMaXN0LmFkZCgnbGV2ZWwnKTtcblxuICAgIGNvbnN0IGxvZ0hlYWRlckV4cGVyaWVuY2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0aCcpO1xuICAgIGxvZ0hlYWRlckV4cGVyaWVuY2UuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoJ0V4cGVyaWVuY2UnKSk7XG5cbiAgICBjb25zdCBsb2dIZWFkZXJEaWZmZXJlbmNlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGgnKTtcbiAgICBsb2dIZWFkZXJEaWZmZXJlbmNlLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCdEaWZmZXJlbmNlJykpO1xuXG4gICAgY29uc3QgbG9nVGFibGVCb2R5ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGJvZHknKTtcblxuICAgIHByb2ZpbGUuYXBwZW5kQ2hpbGQobG9nU2VjdGlvbik7XG4gICAgbG9nU2VjdGlvbi5hcHBlbmRDaGlsZChsb2dUYWJsZSk7XG4gICAgbG9nVGFibGUuYXBwZW5kQ2hpbGQobG9nSGVhZGVyKTtcblxuICAgIGxvZ0hlYWRlclJvdy5hcHBlbmRDaGlsZChsb2dIZWFkZXJJY29uKTtcbiAgICBsb2dIZWFkZXJSb3cuYXBwZW5kQ2hpbGQobG9nSGVhZGVyTGV2ZWwpO1xuICAgIGxvZ0hlYWRlclJvdy5hcHBlbmRDaGlsZChsb2dIZWFkZXJFeHBlcmllbmNlKTtcbiAgICBsb2dIZWFkZXJSb3cuYXBwZW5kQ2hpbGQobG9nSGVhZGVyRGlmZmVyZW5jZSk7XG5cbiAgICBsb2dIZWFkZXIuYXBwZW5kQ2hpbGQobG9nSGVhZGVyUm93KTtcblxuICAgIGxvZ1RhYmxlLmFwcGVuZENoaWxkKGxvZ1RhYmxlQm9keSk7XG5cbiAgICAvKiBEaXNwbGF5IHRoZSBleHBlcmllbmNlIHRhYmxlIHJvd3MgKi9cbiAgICBsb2dzLmZvckVhY2goZnVuY3Rpb24gKGxvZywgaW5kZXgpIHtcbiAgICAgICAgY29uc3QgbG9nUm93ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndHInKTtcblxuICAgICAgICBjb25zdCBsb2dJY29uQ2VsbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RkJyk7XG4gICAgICAgIGNvbnN0IGxvZ0ljb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgICAgIGxvZ0ljb24uY2xhc3NMaXN0LmFkZCgnbG9nLWljb24nLCAncycgKyBpbmRleCk7XG4gICAgICAgIGxvZ0ljb25DZWxsLmFwcGVuZENoaWxkKGxvZ0ljb24pO1xuXG4gICAgICAgIGNvbnN0IGxvZ0xldmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGQnKTtcbiAgICAgICAgbG9nTGV2ZWwuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUobG9nLmxldmVsKSk7XG5cbiAgICAgICAgY29uc3QgbG9nVmFsdWUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZCcpO1xuICAgICAgICBsb2dWYWx1ZS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShNYXRoLnJvdW5kKGxvZy52YWx1ZSkudG9Mb2NhbGVTdHJpbmcoKSkpO1xuXG4gICAgICAgIGNvbnN0IGxvZ0RpZmZlcmVuY2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZCcpO1xuICAgICAgICBpZiAobG9nLmRpZmZlcmVuY2UgPiAwKSB7XG4gICAgICAgICAgICBsb2dEaWZmZXJlbmNlLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCcrJyArIE1hdGgucm91bmQobG9nLmRpZmZlcmVuY2UpLnRvTG9jYWxlU3RyaW5nKCkpKTtcbiAgICAgICAgICAgIGxvZ0RpZmZlcmVuY2UuY2xhc3NMaXN0LmFkZCgnbG9nLXZhbHVlJywgJ3Bvc2l0aXZlJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsb2dEaWZmZXJlbmNlLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCcwJykpO1xuICAgICAgICB9XG5cbiAgICAgICAgbG9nUm93LmFwcGVuZENoaWxkKGxvZ0ljb25DZWxsKTtcbiAgICAgICAgbG9nUm93LmFwcGVuZENoaWxkKGxvZ0xldmVsKTtcbiAgICAgICAgbG9nUm93LmFwcGVuZENoaWxkKGxvZ1ZhbHVlKTtcbiAgICAgICAgbG9nUm93LmFwcGVuZENoaWxkKGxvZ0RpZmZlcmVuY2UpO1xuICAgICAgICBsb2dUYWJsZUJvZHkuYXBwZW5kQ2hpbGQobG9nUm93KTtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gcHJpbnRFdmVudHMoZXZlbnRzKVxue1xuICAgIGNvbnN0IGV2ZW50U2VjdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NlY3Rpb24nKTtcbiAgICBldmVudFNlY3Rpb24uY2xhc3NMaXN0LmFkZCgnZXZlbnRzJyk7XG5cbiAgICBjb25zdCBldmVudExpc3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd1bCcpO1xuICAgIGV2ZW50TGlzdC5jbGFzc0xpc3QuYWRkKCdldmVudHMnKTtcblxuICAgIHByb2ZpbGUuYXBwZW5kQ2hpbGQoZXZlbnRTZWN0aW9uKTtcbiAgICBldmVudFNlY3Rpb24uYXBwZW5kQ2hpbGQoZXZlbnRMaXN0KTtcblxuICAgIGV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uIChldmVudCwgaW5kZXgpIHtcblxuICAgICAgICBjb25zdCBldmVudEl0ZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaScpO1xuICAgICAgICBldmVudEl0ZW0uY2xhc3NMaXN0LmFkZCgnZXZlbnQtaXRlbScpO1xuXG4gICAgICAgIGNvbnN0IGV2ZW50SGVhZGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGV2ZW50SGVhZGVyLmNsYXNzTGlzdC5hZGQoJ2V2ZW50LWhlYWRlcicpO1xuXG4gICAgICAgIGNvbnN0IGV2ZW50VGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdoMicpO1xuICAgICAgICBldmVudFRpdGxlLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGV2ZW50LnRpdGxlKSk7XG4gICAgICAgIGV2ZW50VGl0bGUuY2xhc3NMaXN0LmFkZCgnZXZlbnQtdGl0bGUnKTtcblxuICAgICAgICBjb25zdCBldmVudFRpbWVzdGFtcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICAgICAgZXZlbnRUaW1lc3RhbXAuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoZGF5anMudW5peChldmVudC50aW1lc3RhbXApLmZvcm1hdChcIk1NTU0gRCwgWVlZWSBISDptbVwiKSkpO1xuICAgICAgICBldmVudFRpbWVzdGFtcC5jbGFzc0xpc3QuYWRkKCdldmVudC10aW1lc3RhbXAnKTtcblxuICAgICAgICBjb25zdCBldmVudERldGFpbHMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJyk7XG4gICAgICAgIGV2ZW50RGV0YWlscy5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShldmVudC5kZXRhaWxzKSk7XG4gICAgICAgIGV2ZW50RGV0YWlscy5jbGFzc0xpc3QuYWRkKCdldmVudC1kZXRhaWxzJyk7XG5cbiAgICAgICAgZXZlbnRJdGVtLmFwcGVuZENoaWxkKGV2ZW50SGVhZGVyKTtcbiAgICAgICAgZXZlbnRIZWFkZXIuYXBwZW5kQ2hpbGQoZXZlbnRUaXRsZSk7XG4gICAgICAgIGV2ZW50SGVhZGVyLmFwcGVuZENoaWxkKGV2ZW50VGltZXN0YW1wKTtcbiAgICAgICAgZXZlbnRJdGVtLmFwcGVuZENoaWxkKGV2ZW50RGV0YWlscyk7XG5cbiAgICAgICAgZXZlbnRMaXN0LmFwcGVuZENoaWxkKGV2ZW50SXRlbSk7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZU5vdGlmaWNhdGlvbigpXG57XG4gICAgY29uc3Qgbm90aWZpY2F0aW9uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgbm90aWZpY2F0aW9uLmNsYXNzTGlzdC5hZGQoJ3RleHQnLCAnbm90aWZpY2F0aW9uJywgJ2luZicpO1xuXG4gICAgY29uc3Qgbm90aWZpY2F0aW9uVGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdoMicpO1xuICAgIG5vdGlmaWNhdGlvblRpdGxlLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFwiTm90aGluZyBpbnRlcmVzdGluZyBoYXBwZW5lZC5cIikpO1xuXG4gICAgY29uc3Qgbm90aWZpY2F0aW9uVGV4dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3AnKTtcbiAgICBub3RpZmljYXRpb25UZXh0LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKFwiTG9va3MgbGlrZSB3ZSBkb24ndCBoYXZlIGFueSBkYXRhIGZvciB5b3Ugb24gdGhpcyBkYXkuXCIpKTtcblxuICAgIG5vdGlmaWNhdGlvbi5hcHBlbmRDaGlsZChub3RpZmljYXRpb25UaXRsZSk7XG4gICAgbm90aWZpY2F0aW9uLmFwcGVuZENoaWxkKG5vdGlmaWNhdGlvblRleHQpO1xuICAgIHJldHVybiBub3RpZmljYXRpb247XG59XG5cbi8qIE5pZ2h0bW9kZSB0b2dnbGUgKGdsb2JhbCkgKi9cblxuY29uc3QgYm9keSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKTtcbmxldCBpc05pZ2h0bW9kZSA9IGJvZHkuY2xhc3NMaXN0LmNvbnRhaW5zKCdpcy1uaWdodG1vZGUnKTtcbmNvbnN0IG5pZ2h0bW9kZVRvZ2dsZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5uaWdodC1tb2RlLXRvZ2dsZScpO1xuXG5mdW5jdGlvbiB0b2dnbGVOaWdodG1vZGVPbkNsaWNrKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAvLyBHZXQgdGhlIGJvZHkgY2xhc3MgYW5kIHJldmVyc2UgaXRcbiAgICBpc05pZ2h0bW9kZSA9IGJvZHkuY2xhc3NMaXN0LmNvbnRhaW5zKCdpcy1uaWdodG1vZGUnKTtcbiAgICBpc05pZ2h0bW9kZSA9ICFpc05pZ2h0bW9kZTtcblxuICAgIC8vIFNldCB0aGUgYm9keSBjbGFzcyBzbyB0aGF0IHRoZSBzdHlsaW5nIGNoYW5nZXNcbiAgICBib2R5LmNsYXNzTGlzdC50b2dnbGUoJ2lzLW5pZ2h0bW9kZScpO1xuXG4gICAgLy8gU3RvcmUgdGhlIGJvb2wgaW4gbG9jYWxTdG9yYWdlXG4gICAgbG9jYWxTdG9yYWdlLnNldEl0ZW0oXCJuaWdodG1vZGVcIiwgSlNPTi5zdHJpbmdpZnkoaXNOaWdodG1vZGUpKTtcbn1cblxuLypcbiAqIElmIGEgcGFnZSBpcyBsb2FkZWQgYW5kIHRoZSBsb2NhbFN0b3JhZ2UgcGFyYW1ldGVyIGlzIHNldCB0b1xuICogdHJ1ZSwgdGhlbiBzd2l0Y2ggdGhlIHBhZ2Ugc3R5bGluZ1xuICovXG5mdW5jdGlvbiB0dXJuT25OaWdodG1vZGVPblBhZ2VMb2FkKCkge1xuICAgIGlmIChsb2NhbFN0b3JhZ2UuZ2V0SXRlbShcIm5pZ2h0bW9kZVwiKSA9PT0gXCJ0cnVlXCIpIHtcbiAgICAgICAgYm9keS5jbGFzc0xpc3QudG9nZ2xlKCdpcy1uaWdodG1vZGUnKTtcbiAgICB9XG59XG5cbmlmIChuaWdodG1vZGVUb2dnbGUgIT09IG51bGwpIHtcbiAgICBuaWdodG1vZGVUb2dnbGUuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCB0b2dnbGVOaWdodG1vZGVPbkNsaWNrKTtcbn1cblxuLyogRGF0ZSBjbGlja2VyICovXG5sZXQgc3RhcnREYXksIGVuZERheTtcbmxldCBkcmFnZ2VkID0gZmFsc2U7XG5cbi8qIFNWRyBHcmlkIGV2ZW50cyAqL1xuY29uc3QgZ3JpZFNxdWFyZXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuZGF5Jyk7XG5cbi8vIHF1ZXJ5U2VsZWN0b3JBbGwgcmV0dXJucyBhIE5vZGVsaXN0IHNvIGhhdmUgdG8gY2hlY2sgZm9yIGxlbmd0aFxuaWYgKGdyaWRTcXVhcmVzLmxlbmd0aCA+IDApIHtcblxuICAgIGdyaWRTcXVhcmVzLmZvckVhY2goZnVuY3Rpb24gKHNxdWFyZSwgaW5kZXgpIHtcblxuICAgICAgICBbJ21vdXNlZG93bicsICd0b3VjaHN0YXJ0J10uZm9yRWFjaChmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgc3F1YXJlLmFkZEV2ZW50TGlzdGVuZXIoZSwgZ3JpZFN0YXJ0SGFuZGxlcik7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIFsnbW91c2V1cCcsICd0b3VjaGVuZCddLmZvckVhY2goZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIHNxdWFyZS5hZGRFdmVudExpc3RlbmVyKGUsIGdyaWRFbmRIYW5kbGVyKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgWydtb3VzZWVudGVyJywgJ3RvdWNoZW50ZXInXS5mb3JFYWNoKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBzcXVhcmUuYWRkRXZlbnRMaXN0ZW5lcihlLCBncmlkSG92ZXJIYW5kbGVyKTtcbiAgICAgICAgfSk7XG5cbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gZ3JpZFN0YXJ0SGFuZGxlcihlKSB7XG4gICAgc3RhcnREYXkgPSBlLnRhcmdldC5kYXRhc2V0LmluZGV4O1xuXG4gICAgY29uc3QgYWN0aXZlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLnRvZGF5Jyk7XG4gICAgYWN0aXZlLmZvckVhY2goZnVuY3Rpb24gKHNxdWFyZSwgaW5kZXgpIHtcbiAgICAgICAgc3F1YXJlLmNsYXNzTGlzdC50b2dnbGUoJ3RvZGF5Jyk7XG4gICAgfSlcbiAgICBjb25zdCBzZWxlY3RlZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5zZWxlY3QnKTtcbiAgICBzZWxlY3RlZC5mb3JFYWNoKGZ1bmN0aW9uIChzcXVhcmUsIGluZGV4KSB7XG4gICAgICAgIHNxdWFyZS5jbGFzc0xpc3QudG9nZ2xlKCdzZWxlY3QnKTtcbiAgICB9KVxuICAgIGUudGFyZ2V0LmNsYXNzTGlzdC50b2dnbGUoJ3RvZGF5Jyk7XG4gICAgZHJhZ2dlZCA9IHRydWU7XG59XG5cbmZ1bmN0aW9uIGdyaWRFbmRIYW5kbGVyKGUpIHtcbiAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgZW5kRGF5ID0gZS50YXJnZXQuZGF0YXNldC5pbmRleDtcbiAgICBkcmFnZ2VkID0gZmFsc2U7XG4gICAgaWYgKHN0YXJ0RGF5ID4gZW5kRGF5KSB7XG4gICAgICAgIGxvYWQoZW5kRGF5LCBzdGFydERheSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgbG9hZChzdGFydERheSwgZW5kRGF5KTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGdyaWRIb3ZlckhhbmRsZXIoZSkge1xuICAgIGlmIChkcmFnZ2VkKSB7XG4gICAgICAgIGdyaWRTcXVhcmVzLmZvckVhY2goZnVuY3Rpb24gKHNxdWFyZSwgaW5kZXgpIHtcbiAgICAgICAgICAgIC8vcmVzZXRcbiAgICAgICAgICAgIHNxdWFyZS5jbGFzc0xpc3QucmVtb3ZlKCdzZWxlY3QnKTtcbiAgICAgICAgICAgIC8vcmlnaHQgZHJhZ1xuICAgICAgICAgICAgaWYgKHBhcnNlSW50KHN0YXJ0RGF5KSA+IHBhcnNlSW50KGUudGFyZ2V0LmRhdGFzZXQuaW5kZXgpKSB7XG4gICAgICAgICAgICAgICAgaWYgKHBhcnNlSW50KHNxdWFyZS5kYXRhc2V0LmluZGV4KSA8PSBwYXJzZUludChzdGFydERheSkgJiYgcGFyc2VJbnQoc3F1YXJlLmRhdGFzZXQuaW5kZXgpID49IHBhcnNlSW50KGUudGFyZ2V0LmRhdGFzZXQuaW5kZXgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHNxdWFyZS5jbGFzc0xpc3QuYWRkKCdzZWxlY3QnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vbGVmdCBkcmFnXG4gICAgICAgICAgICAgICAgaWYgKHBhcnNlSW50KHNxdWFyZS5kYXRhc2V0LmluZGV4KSA+PSBwYXJzZUludChzdGFydERheSkgJiYgcGFyc2VJbnQoc3F1YXJlLmRhdGFzZXQuaW5kZXgpIDw9IHBhcnNlSW50KGUudGFyZ2V0LmRhdGFzZXQuaW5kZXgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHNxdWFyZS5jbGFzc0xpc3QuYWRkKCdzZWxlY3QnKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgfVxufVxuXG5mdW5jdGlvbiByZW1vdmVTcGlubmVySWZQcmVzZW50KCkge1xuICAgIGNvbnN0IHNwaW5uZXIgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcuc3Bpbm5lcicpO1xuICAgIGlmIChzcGlubmVyICE9PSBudWxsKSB7XG4gICAgICAgIHNwaW5uZXIucmVtb3ZlKCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiByZW1vdmVOb3RpZmljYXRpb25JZlByZXNlbnQoKSB7XG4gICAgY29uc3Qgbm90aWZpY2F0aW9uID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm5vdGlmaWNhdGlvbicpO1xuICAgIGlmIChub3RpZmljYXRpb24gIT09IG51bGwpIHtcbiAgICAgICAgbm90aWZpY2F0aW9uLnJlbW92ZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gbG9hZChzdGFydERheSwgZW5kRGF5KSB7XG5cbiAgICAvLyAgUHJlcCB0aGUgZGF0YSB0aGF0IHRoZSBBUEkgbmVlZHNcbiAgICBjb25zdCBkYXRhID0ge1xuICAgICAgICB1c2VySWQ6IHVzZXJJZCxcbiAgICAgICAgeWVhcjogeWVhcixcbiAgICAgICAgc3RhcnREYXk6IHN0YXJ0RGF5LFxuICAgICAgICBlbmREYXk6IGVuZERheVxuICAgIH07XG5cbiAgICAvLyAgQ2xlYW4gdXAgdGhlIHByb2ZpbGUgc28gd2UgY2FuIHJlLWluc2VydCB0aGUgbmV3IGRhdGFcbiAgICBwcm9maWxlLmlubmVySFRNTCA9ICcnO1xuICAgIHJlbW92ZU5vdGlmaWNhdGlvbklmUHJlc2VudCgpO1xuICAgIHJlbW92ZVNwaW5uZXJJZlByZXNlbnQoKTtcblxuICAgIC8vICBBZGQgdGhlIGxvYWRpbmcgc3Bpbm5lclxuICAgIGNvbnN0IG5ld1NwaW5uZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgbmV3U3Bpbm5lci5jbGFzc0xpc3QuYWRkKCdzcGlubmVyJyk7XG4gICAgcHJvZmlsZS5hcHBlbmRDaGlsZChuZXdTcGlubmVyKTtcblxuICAgIC8vICBTdGFydCB0aGUgcmVxdWVzdFxuICAgIGNvbnN0IHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgIHhoci5vcGVuKCdQT1NUJywgJy9hcGkvZ2V0RGF0YScsIHRydWUpO1xuICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbjsgY2hhcnNldD1VVEYtOCcpO1xuICAgIHhoci5zZW5kKEpTT04uc3RyaW5naWZ5KGRhdGEpKTtcbiAgICB4aHIub25yZWFkeXN0YXRlY2hhbmdlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoeGhyLnJlYWR5U3RhdGUgPT09IDQgJiYgeGhyLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgICAgICB1cGRhdGVQcm9maWxlKEpTT04ucGFyc2UoeGhyLnJlc3BvbnNlVGV4dCkpO1xuICAgICAgICAgICAgc29ydFByb2ZpbGVUYWJsZSgpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5mdW5jdGlvbiBzb3J0UHJvZmlsZVRhYmxlKClcbntcbiAgICBjb25zdCBwcm9maWxlVGFibGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcudGFibGUgdGFibGUnKTtcbiAgICBpZiAocHJvZmlsZVRhYmxlICE9PSBudWxsKSB7XG4gICAgICAgIG5ldyBUYWJsZXNvcnQocHJvZmlsZVRhYmxlLCB7XG4gICAgICAgICAgICBkZXNjZW5kaW5nOiB0cnVlXG4gICAgICAgIH0pO1xuICAgIH1cbn1cblxuLypcbmxldCBncmlkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLmdyaWQtY29udGFpbmVyJyk7XG5pZihncmlkKXtcbiAgbGV0IG1heCA9IGdyaWQuc2Nyb2xsV2lkdGggLSBncmlkLmNsaWVudFdpZHRoO1xuICBncmlkLnNjcm9sbExlZnQgPSBtYXg7XG59XG4qL1xuXG5nZXRVc2VySWQoKTtcbmdldFllYXIoKTtcbnR1cm5Pbk5pZ2h0bW9kZU9uUGFnZUxvYWQoKTtcbnNvcnRQcm9maWxlVGFibGUoKTsiXX0=