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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRhYmxlc29ydC5taW4uanMiLCJzY3JpcHQuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQy9CQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKiFcbiAqIHRhYmxlc29ydCB2NS4wLjIgKDIwMTctMTEtMTIpXG4gKiBodHRwOi8vdHJpc3Rlbi5jYS90YWJsZXNvcnQvZGVtby9cbiAqIENvcHlyaWdodCAoYykgMjAxNyA7IExpY2Vuc2VkIE1JVFxuKi8hZnVuY3Rpb24oKXtmdW5jdGlvbiBhKGIsYyl7aWYoISh0aGlzIGluc3RhbmNlb2YgYSkpcmV0dXJuIG5ldyBhKGIsYyk7aWYoIWJ8fFwiVEFCTEVcIiE9PWIudGFnTmFtZSl0aHJvdyBuZXcgRXJyb3IoXCJFbGVtZW50IG11c3QgYmUgYSB0YWJsZVwiKTt0aGlzLmluaXQoYixjfHx7fSl9dmFyIGI9W10sYz1mdW5jdGlvbihhKXt2YXIgYjtyZXR1cm4gd2luZG93LkN1c3RvbUV2ZW50JiZcImZ1bmN0aW9uXCI9PXR5cGVvZiB3aW5kb3cuQ3VzdG9tRXZlbnQ/Yj1uZXcgQ3VzdG9tRXZlbnQoYSk6KGI9ZG9jdW1lbnQuY3JlYXRlRXZlbnQoXCJDdXN0b21FdmVudFwiKSxiLmluaXRDdXN0b21FdmVudChhLCExLCExLHZvaWQgMCkpLGJ9LGQ9ZnVuY3Rpb24oYSl7cmV0dXJuIGEuZ2V0QXR0cmlidXRlKFwiZGF0YS1zb3J0XCIpfHxhLnRleHRDb250ZW50fHxhLmlubmVyVGV4dHx8XCJcIn0sZT1mdW5jdGlvbihhLGIpe3JldHVybiBhPWEudHJpbSgpLnRvTG93ZXJDYXNlKCksYj1iLnRyaW0oKS50b0xvd2VyQ2FzZSgpLGE9PT1iPzA6YTxiPzE6LTF9LGY9ZnVuY3Rpb24oYSxiKXtyZXR1cm4gZnVuY3Rpb24oYyxkKXt2YXIgZT1hKGMudGQsZC50ZCk7cmV0dXJuIDA9PT1lP2I/ZC5pbmRleC1jLmluZGV4OmMuaW5kZXgtZC5pbmRleDplfX07YS5leHRlbmQ9ZnVuY3Rpb24oYSxjLGQpe2lmKFwiZnVuY3Rpb25cIiE9dHlwZW9mIGN8fFwiZnVuY3Rpb25cIiE9dHlwZW9mIGQpdGhyb3cgbmV3IEVycm9yKFwiUGF0dGVybiBhbmQgc29ydCBtdXN0IGJlIGEgZnVuY3Rpb25cIik7Yi5wdXNoKHtuYW1lOmEscGF0dGVybjpjLHNvcnQ6ZH0pfSxhLnByb3RvdHlwZT17aW5pdDpmdW5jdGlvbihhLGIpe3ZhciBjLGQsZSxmLGc9dGhpcztpZihnLnRhYmxlPWEsZy50aGVhZD0hMSxnLm9wdGlvbnM9YixhLnJvd3MmJmEucm93cy5sZW5ndGg+MClpZihhLnRIZWFkJiZhLnRIZWFkLnJvd3MubGVuZ3RoPjApe2ZvcihlPTA7ZTxhLnRIZWFkLnJvd3MubGVuZ3RoO2UrKylpZihcInRoZWFkXCI9PT1hLnRIZWFkLnJvd3NbZV0uZ2V0QXR0cmlidXRlKFwiZGF0YS1zb3J0LW1ldGhvZFwiKSl7Yz1hLnRIZWFkLnJvd3NbZV07YnJlYWt9Y3x8KGM9YS50SGVhZC5yb3dzW2EudEhlYWQucm93cy5sZW5ndGgtMV0pLGcudGhlYWQ9ITB9ZWxzZSBjPWEucm93c1swXTtpZihjKXt2YXIgaD1mdW5jdGlvbigpe2cuY3VycmVudCYmZy5jdXJyZW50IT09dGhpcyYmZy5jdXJyZW50LnJlbW92ZUF0dHJpYnV0ZShcImFyaWEtc29ydFwiKSxnLmN1cnJlbnQ9dGhpcyxnLnNvcnRUYWJsZSh0aGlzKX07Zm9yKGU9MDtlPGMuY2VsbHMubGVuZ3RoO2UrKylmPWMuY2VsbHNbZV0sZi5zZXRBdHRyaWJ1dGUoXCJyb2xlXCIsXCJjb2x1bW5oZWFkZXJcIiksXCJub25lXCIhPT1mLmdldEF0dHJpYnV0ZShcImRhdGEtc29ydC1tZXRob2RcIikmJihmLnRhYmluZGV4PTAsZi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIixoLCExKSxudWxsIT09Zi5nZXRBdHRyaWJ1dGUoXCJkYXRhLXNvcnQtZGVmYXVsdFwiKSYmKGQ9ZikpO2QmJihnLmN1cnJlbnQ9ZCxnLnNvcnRUYWJsZShkKSl9fSxzb3J0VGFibGU6ZnVuY3Rpb24oYSxnKXt2YXIgaD10aGlzLGk9YS5jZWxsSW5kZXgsaj1lLGs9XCJcIixsPVtdLG09aC50aGVhZD8wOjEsbj1hLmdldEF0dHJpYnV0ZShcImRhdGEtc29ydC1tZXRob2RcIiksbz1hLmdldEF0dHJpYnV0ZShcImFyaWEtc29ydFwiKTtpZihoLnRhYmxlLmRpc3BhdGNoRXZlbnQoYyhcImJlZm9yZVNvcnRcIikpLGd8fChvPVwiYXNjZW5kaW5nXCI9PT1vP1wiZGVzY2VuZGluZ1wiOlwiZGVzY2VuZGluZ1wiPT09bz9cImFzY2VuZGluZ1wiOmgub3B0aW9ucy5kZXNjZW5kaW5nP1wiZGVzY2VuZGluZ1wiOlwiYXNjZW5kaW5nXCIsYS5zZXRBdHRyaWJ1dGUoXCJhcmlhLXNvcnRcIixvKSksIShoLnRhYmxlLnJvd3MubGVuZ3RoPDIpKXtpZighbil7Zm9yKDtsLmxlbmd0aDwzJiZtPGgudGFibGUudEJvZGllc1swXS5yb3dzLmxlbmd0aDspaz1kKGgudGFibGUudEJvZGllc1swXS5yb3dzW21dLmNlbGxzW2ldKSxrPWsudHJpbSgpLGsubGVuZ3RoPjAmJmwucHVzaChrKSxtKys7aWYoIWwpcmV0dXJufWZvcihtPTA7bTxiLmxlbmd0aDttKyspaWYoaz1iW21dLG4pe2lmKGsubmFtZT09PW4pe2o9ay5zb3J0O2JyZWFrfX1lbHNlIGlmKGwuZXZlcnkoay5wYXR0ZXJuKSl7aj1rLnNvcnQ7YnJlYWt9Zm9yKGguY29sPWksbT0wO208aC50YWJsZS50Qm9kaWVzLmxlbmd0aDttKyspe3ZhciBwLHE9W10scj17fSxzPTAsdD0wO2lmKCEoaC50YWJsZS50Qm9kaWVzW21dLnJvd3MubGVuZ3RoPDIpKXtmb3IocD0wO3A8aC50YWJsZS50Qm9kaWVzW21dLnJvd3MubGVuZ3RoO3ArKylrPWgudGFibGUudEJvZGllc1ttXS5yb3dzW3BdLFwibm9uZVwiPT09ay5nZXRBdHRyaWJ1dGUoXCJkYXRhLXNvcnQtbWV0aG9kXCIpP3Jbc109azpxLnB1c2goe3RyOmssdGQ6ZChrLmNlbGxzW2guY29sXSksaW5kZXg6c30pLHMrKztmb3IoXCJkZXNjZW5kaW5nXCI9PT1vP3Euc29ydChmKGosITApKToocS5zb3J0KGYoaiwhMSkpLHEucmV2ZXJzZSgpKSxwPTA7cDxzO3ArKylyW3BdPyhrPXJbcF0sdCsrKTprPXFbcC10XS50cixoLnRhYmxlLnRCb2RpZXNbbV0uYXBwZW5kQ2hpbGQoayl9fWgudGFibGUuZGlzcGF0Y2hFdmVudChjKFwiYWZ0ZXJTb3J0XCIpKX19LHJlZnJlc2g6ZnVuY3Rpb24oKXt2b2lkIDAhPT10aGlzLmN1cnJlbnQmJnRoaXMuc29ydFRhYmxlKHRoaXMuY3VycmVudCwhMCl9fSxcInVuZGVmaW5lZFwiIT10eXBlb2YgbW9kdWxlJiZtb2R1bGUuZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz1hOndpbmRvdy5UYWJsZXNvcnQ9YX0oKTtcblxuKGZ1bmN0aW9uKCl7XG4gICAgdmFyIGNsZWFuTnVtYmVyID0gZnVuY3Rpb24oaSkge1xuICAgICAgICAgICAgcmV0dXJuIGkucmVwbGFjZSgvW15cXC0/MC05Ll0vZywgJycpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGNvbXBhcmVOdW1iZXIgPSBmdW5jdGlvbihhLCBiKSB7XG4gICAgICAgICAgICBhID0gcGFyc2VGbG9hdChhKTtcbiAgICAgICAgICAgIGIgPSBwYXJzZUZsb2F0KGIpO1xuXG4gICAgICAgICAgICBhID0gaXNOYU4oYSkgPyAwIDogYTtcbiAgICAgICAgICAgIGIgPSBpc05hTihiKSA/IDAgOiBiO1xuXG4gICAgICAgICAgICByZXR1cm4gYSAtIGI7XG4gICAgICAgIH07XG5cbiAgICBUYWJsZXNvcnQuZXh0ZW5kKCdudW1iZXInLCBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgIHJldHVybiBpdGVtLm1hdGNoKC9eWy0rXT9bwqNcXHgyNMObwqLCtOKCrF0/XFxkK1xccyooWyxcXC5dXFxkezAsMn0pLykgfHwgLy8gUHJlZml4ZWQgY3VycmVuY3lcbiAgICAgICAgICAgIGl0ZW0ubWF0Y2goL15bLStdP1xcZCtcXHMqKFssXFwuXVxcZHswLDJ9KT9bwqNcXHgyNMObwqLCtOKCrF0vKSB8fCAvLyBTdWZmaXhlZCBjdXJyZW5jeVxuICAgICAgICAgICAgaXRlbS5tYXRjaCgvXlstK10/KFxcZCkqLT8oWyxcXC5dKXswLDF9LT8oXFxkKSsoW0UsZV1bXFwtK11bXFxkXSspPyU/JC8pOyAvLyBOdW1iZXJcbiAgICB9LCBmdW5jdGlvbihhLCBiKSB7XG4gICAgICAgIGEgPSBjbGVhbk51bWJlcihhKTtcbiAgICAgICAgYiA9IGNsZWFuTnVtYmVyKGIpO1xuXG4gICAgICAgIHJldHVybiBjb21wYXJlTnVtYmVyKGIsIGEpO1xuICAgIH0pO1xufSgpKTsiLCIvKlxuICogUnVuZWxvZ3Mgc2NyaXB0LmpzXG4gKlxuICogQ29udGVudDpcbiAqICAtIEdldCB1c2VySWQgYW5kIGN1cnJlbnQgeWVhciBmcm9tIHRoZSBhcHByb3ByaWF0ZSBoZWFkZXJzXG4gKiAgLSBHcmlkIHNxdWFyZSBjbGljayBldmVudCAtPiBYaFIgcmVxdWVzdCBuYWFyIEFQSSAtPiB1cGRhdGUgcHJvZmlsZVxuICogIC0gTmlnaHRtb2RlIHRvZ2dsZSAod29ya3Mgd2l0aCBsb2NhbFN0b3JhZ2UpXG4gKiAgLSBHcmlkIGRyYWcgLT4gc2VsZWN0IHNxdWFyZXNcbiAqICAtIFByaW50IGEgdGFibGUgd2l0aCByb3dzIGZvciBleHAgb3IgYW4gdW5vcmRlbmVkIGxvc3QgZm9yIGV2ZW50c1xuICpcbiAqL1xuXG5jb25zdCBwcm9maWxlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnByb2ZpbGUnKTtcbmxldCB1c2VySWQgPSBudWxsO1xubGV0IHllYXIgPSBudWxsO1xuXG5mdW5jdGlvbiBnZXRVc2VySWQoKSB7XG4gICAgY29uc3QgdXNlckhlYWRlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jdXJyZW50IGgxJyk7XG4gICAgaWYgKHVzZXJIZWFkZXIgIT09IG51bGwpIHtcbiAgICAgICAgdXNlcklkID0gdXNlckhlYWRlci5kYXRhc2V0LmlkO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZ2V0WWVhcigpIHtcbiAgICBjb25zdCB5ZWFySGVhZGVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnllYXJIZWFkZXInKTtcbiAgICBpZiAoeWVhckhlYWRlciAhPT0gbnVsbCkge1xuICAgICAgICB5ZWFyID0geWVhckhlYWRlci5kYXRhc2V0LnllYXI7XG4gICAgfVxufVxuXG5mdW5jdGlvbiB1cGRhdGVQcm9maWxlKGRhdGEpXG57XG4gICAgY29uc29sZS5sb2coZGF0YSk7XG4gICAgcmVtb3ZlU3Bpbm5lcklmUHJlc2VudCgpO1xuXG4gICAgaWYgKGRhdGEubG9ncyAgPT09IG51bGwgJiYgZGF0YS5ldmVudHMubGVuZ3RoICA9PT0gMCkge1xuICAgICAgICBjb25zdCBub3RpZmljYXRpb24gPSBjcmVhdGVOb3RpZmljYXRpb24oKTtcbiAgICAgICAgcHJvZmlsZS5hcHBlbmRDaGlsZChub3RpZmljYXRpb24pO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKGRhdGEubG9ncyAgIT09IG51bGwpIHtcbiAgICAgICAgcHJpbnRMb2dzKGRhdGEubG9ncyk7XG4gICAgfVxuXG4gICAgaWYgKGRhdGEuZXZlbnRzLmxlbmd0aCAgIT09IDApIHtcbiAgICAgICAgcHJpbnRFdmVudHMoZGF0YS5ldmVudHMpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gcHJpbnRMb2dzKGxvZ3MpXG57XG4gICAgLy8gUHJpbnQgdGhlIGV4cGVyaWVuY2UgdGFibGUgYW5kIGhlYWRlclxuICAgIGNvbnN0IGxvZ1NlY3Rpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzZWN0aW9uJyk7XG4gICAgbG9nU2VjdGlvbi5jbGFzc0xpc3QuYWRkKCd0YWJsZScpO1xuXG4gICAgY29uc3QgbG9nVGFibGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0YWJsZScpO1xuICAgIGNvbnN0IGxvZ0hlYWRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RoZWFkJyk7XG5cbiAgICBjb25zdCBsb2dIZWFkZXJSb3cgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0cicpO1xuXG4gICAgY29uc3QgbG9nSGVhZGVySWNvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RoJyk7XG4gICAgbG9nSGVhZGVySWNvbi5jbGFzc0xpc3QuYWRkKCdpY29uJyk7XG5cbiAgICBjb25zdCBsb2dIZWFkZXJMZXZlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RoJyk7XG4gICAgbG9nSGVhZGVyTGV2ZWwuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoJ0xldmVsJykpO1xuICAgIGxvZ0hlYWRlckxldmVsLmNsYXNzTGlzdC5hZGQoJ2xldmVsJyk7XG5cbiAgICBjb25zdCBsb2dIZWFkZXJFeHBlcmllbmNlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGgnKTtcbiAgICBsb2dIZWFkZXJFeHBlcmllbmNlLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCdFeHBlcmllbmNlJykpO1xuXG4gICAgY29uc3QgbG9nSGVhZGVyRGlmZmVyZW5jZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RoJyk7XG4gICAgbG9nSGVhZGVyRGlmZmVyZW5jZS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnRGlmZmVyZW5jZScpKTtcblxuICAgIGNvbnN0IGxvZ1RhYmxlQm9keSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3Rib2R5Jyk7XG5cbiAgICBwcm9maWxlLmFwcGVuZENoaWxkKGxvZ1NlY3Rpb24pO1xuICAgIGxvZ1NlY3Rpb24uYXBwZW5kQ2hpbGQobG9nVGFibGUpO1xuICAgIGxvZ1RhYmxlLmFwcGVuZENoaWxkKGxvZ0hlYWRlcik7XG5cbiAgICBsb2dIZWFkZXJSb3cuYXBwZW5kQ2hpbGQobG9nSGVhZGVySWNvbik7XG4gICAgbG9nSGVhZGVyUm93LmFwcGVuZENoaWxkKGxvZ0hlYWRlckxldmVsKTtcbiAgICBsb2dIZWFkZXJSb3cuYXBwZW5kQ2hpbGQobG9nSGVhZGVyRXhwZXJpZW5jZSk7XG4gICAgbG9nSGVhZGVyUm93LmFwcGVuZENoaWxkKGxvZ0hlYWRlckRpZmZlcmVuY2UpO1xuXG4gICAgbG9nSGVhZGVyLmFwcGVuZENoaWxkKGxvZ0hlYWRlclJvdyk7XG5cbiAgICBsb2dUYWJsZS5hcHBlbmRDaGlsZChsb2dUYWJsZUJvZHkpO1xuXG4gICAgLyogRGlzcGxheSB0aGUgZXhwZXJpZW5jZSB0YWJsZSByb3dzICovXG4gICAgbG9ncy5mb3JFYWNoKGZ1bmN0aW9uIChsb2csIGluZGV4KSB7XG4gICAgICAgIGNvbnN0IGxvZ1JvdyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RyJyk7XG5cbiAgICAgICAgY29uc3QgbG9nSWNvbkNlbGwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZCcpO1xuICAgICAgICBjb25zdCBsb2dJY29uID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgICAgICBsb2dJY29uLmNsYXNzTGlzdC5hZGQoJ2xvZy1pY29uJywgJ3MnICsgaW5kZXgpO1xuICAgICAgICBsb2dJY29uQ2VsbC5hcHBlbmRDaGlsZChsb2dJY29uKTtcblxuICAgICAgICBjb25zdCBsb2dMZXZlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RkJyk7XG4gICAgICAgIGxvZ0xldmVsLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGxvZy5sZXZlbCkpO1xuXG4gICAgICAgIGNvbnN0IGxvZ1ZhbHVlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGQnKTtcbiAgICAgICAgbG9nVmFsdWUuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoTWF0aC5yb3VuZChsb2cudmFsdWUpLnRvTG9jYWxlU3RyaW5nKCkpKTtcblxuICAgICAgICBjb25zdCBsb2dEaWZmZXJlbmNlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGQnKTtcbiAgICAgICAgaWYgKGxvZy5kaWZmZXJlbmNlID4gMCkge1xuICAgICAgICAgICAgbG9nRGlmZmVyZW5jZS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnKycgKyBNYXRoLnJvdW5kKGxvZy5kaWZmZXJlbmNlKS50b0xvY2FsZVN0cmluZygpKSk7XG4gICAgICAgICAgICBsb2dEaWZmZXJlbmNlLmNsYXNzTGlzdC5hZGQoJ2xvZy12YWx1ZScsICdwb3NpdGl2ZScpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbG9nRGlmZmVyZW5jZS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnMCcpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxvZ1Jvdy5hcHBlbmRDaGlsZChsb2dJY29uQ2VsbCk7XG4gICAgICAgIGxvZ1Jvdy5hcHBlbmRDaGlsZChsb2dMZXZlbCk7XG4gICAgICAgIGxvZ1Jvdy5hcHBlbmRDaGlsZChsb2dWYWx1ZSk7XG4gICAgICAgIGxvZ1Jvdy5hcHBlbmRDaGlsZChsb2dEaWZmZXJlbmNlKTtcbiAgICAgICAgbG9nVGFibGVCb2R5LmFwcGVuZENoaWxkKGxvZ1Jvdyk7XG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIHByaW50RXZlbnRzKGV2ZW50cylcbntcbiAgICBjb25zdCBldmVudFNlY3Rpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzZWN0aW9uJyk7XG4gICAgZXZlbnRTZWN0aW9uLmNsYXNzTGlzdC5hZGQoJ2V2ZW50cycpO1xuXG4gICAgY29uc3QgZXZlbnRMaXN0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndWwnKTtcbiAgICBldmVudExpc3QuY2xhc3NMaXN0LmFkZCgnZXZlbnRzJyk7XG5cbiAgICBwcm9maWxlLmFwcGVuZENoaWxkKGV2ZW50U2VjdGlvbik7XG4gICAgZXZlbnRTZWN0aW9uLmFwcGVuZENoaWxkKGV2ZW50TGlzdCk7XG5cbiAgICBldmVudHMuZm9yRWFjaChmdW5jdGlvbiAoZXZlbnQsIGluZGV4KSB7XG5cbiAgICAgICAgY29uc3QgZXZlbnRJdGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcbiAgICAgICAgZXZlbnRJdGVtLmNsYXNzTGlzdC5hZGQoJ2V2ZW50LWl0ZW0nKTtcblxuICAgICAgICBjb25zdCBldmVudEhlYWRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgICAgICBldmVudEhlYWRlci5jbGFzc0xpc3QuYWRkKCdldmVudC1oZWFkZXInKTtcblxuICAgICAgICBjb25zdCBldmVudFRpdGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaDInKTtcbiAgICAgICAgZXZlbnRUaXRsZS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShldmVudC50aXRsZSkpO1xuICAgICAgICBldmVudFRpdGxlLmNsYXNzTGlzdC5hZGQoJ2V2ZW50LXRpdGxlJyk7XG5cbiAgICAgICAgY29uc3QgZXZlbnRUaW1lc3RhbXAgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgICAgIGV2ZW50VGltZXN0YW1wLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGRheWpzLnVuaXgoZXZlbnQudGltZXN0YW1wKS5mb3JtYXQoXCJNTU1NIEQsIFlZWVkgSEg6bW1cIikpKTtcbiAgICAgICAgZXZlbnRUaW1lc3RhbXAuY2xhc3NMaXN0LmFkZCgnZXZlbnQtdGltZXN0YW1wJyk7XG5cbiAgICAgICAgY29uc3QgZXZlbnREZXRhaWxzID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncCcpO1xuICAgICAgICBldmVudERldGFpbHMuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoZXZlbnQuZGV0YWlscykpO1xuICAgICAgICBldmVudERldGFpbHMuY2xhc3NMaXN0LmFkZCgnZXZlbnQtZGV0YWlscycpO1xuXG4gICAgICAgIGV2ZW50SXRlbS5hcHBlbmRDaGlsZChldmVudEhlYWRlcik7XG4gICAgICAgIGV2ZW50SGVhZGVyLmFwcGVuZENoaWxkKGV2ZW50VGl0bGUpO1xuICAgICAgICBldmVudEhlYWRlci5hcHBlbmRDaGlsZChldmVudFRpbWVzdGFtcCk7XG4gICAgICAgIGV2ZW50SXRlbS5hcHBlbmRDaGlsZChldmVudERldGFpbHMpO1xuXG4gICAgICAgIGV2ZW50TGlzdC5hcHBlbmRDaGlsZChldmVudEl0ZW0pO1xuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVOb3RpZmljYXRpb24oKVxue1xuICAgIGNvbnN0IG5vdGlmaWNhdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIG5vdGlmaWNhdGlvbi5jbGFzc0xpc3QuYWRkKCd0ZXh0JywgJ25vdGlmaWNhdGlvbicsICdpbmYnKTtcblxuICAgIGNvbnN0IG5vdGlmaWNhdGlvblRpdGxlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaDInKTtcbiAgICBub3RpZmljYXRpb25UaXRsZS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcIk5vdGhpbmcgaW50ZXJlc3RpbmcgaGFwcGVuZWQuXCIpKTtcblxuICAgIGNvbnN0IG5vdGlmaWNhdGlvblRleHQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdwJyk7XG4gICAgbm90aWZpY2F0aW9uVGV4dC5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcIkxvb2tzIGxpa2Ugd2UgZG9uJ3QgaGF2ZSBhbnkgZGF0YSBmb3IgeW91IG9uIHRoaXMgZGF5LlwiKSk7XG5cbiAgICBub3RpZmljYXRpb24uYXBwZW5kQ2hpbGQobm90aWZpY2F0aW9uVGl0bGUpO1xuICAgIG5vdGlmaWNhdGlvbi5hcHBlbmRDaGlsZChub3RpZmljYXRpb25UZXh0KTtcbiAgICByZXR1cm4gbm90aWZpY2F0aW9uO1xufVxuXG4vKiBOaWdodG1vZGUgdG9nZ2xlIChnbG9iYWwpICovXG5cbmNvbnN0IGJvZHkgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdib2R5Jyk7XG5sZXQgaXNOaWdodG1vZGUgPSBib2R5LmNsYXNzTGlzdC5jb250YWlucygnaXMtbmlnaHRtb2RlJyk7XG5jb25zdCBuaWdodG1vZGVUb2dnbGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubmlnaHQtbW9kZS10b2dnbGUnKTtcblxuZnVuY3Rpb24gdG9nZ2xlTmlnaHRtb2RlT25DbGljayhlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgLy8gR2V0IHRoZSBib2R5IGNsYXNzIGFuZCByZXZlcnNlIGl0XG4gICAgaXNOaWdodG1vZGUgPSBib2R5LmNsYXNzTGlzdC5jb250YWlucygnaXMtbmlnaHRtb2RlJyk7XG4gICAgaXNOaWdodG1vZGUgPSAhaXNOaWdodG1vZGU7XG5cbiAgICAvLyBTZXQgdGhlIGJvZHkgY2xhc3Mgc28gdGhhdCB0aGUgc3R5bGluZyBjaGFuZ2VzXG4gICAgYm9keS5jbGFzc0xpc3QudG9nZ2xlKCdpcy1uaWdodG1vZGUnKTtcblxuICAgIC8vIFN0b3JlIHRoZSBib29sIGluIGxvY2FsU3RvcmFnZVxuICAgIGxvY2FsU3RvcmFnZS5zZXRJdGVtKFwibmlnaHRtb2RlXCIsIEpTT04uc3RyaW5naWZ5KGlzTmlnaHRtb2RlKSk7XG59XG5cbi8qXG4gKiBJZiBhIHBhZ2UgaXMgbG9hZGVkIGFuZCB0aGUgbG9jYWxTdG9yYWdlIHBhcmFtZXRlciBpcyBzZXQgdG9cbiAqIHRydWUsIHRoZW4gc3dpdGNoIHRoZSBwYWdlIHN0eWxpbmdcbiAqL1xuZnVuY3Rpb24gdHVybk9uTmlnaHRtb2RlT25QYWdlTG9hZCgpIHtcbiAgICBpZiAobG9jYWxTdG9yYWdlLmdldEl0ZW0oXCJuaWdodG1vZGVcIikgPT09IFwidHJ1ZVwiKSB7XG4gICAgICAgIGJvZHkuY2xhc3NMaXN0LnRvZ2dsZSgnaXMtbmlnaHRtb2RlJyk7XG4gICAgfVxufVxuXG5pZiAobmlnaHRtb2RlVG9nZ2xlICE9PSBudWxsKSB7XG4gICAgbmlnaHRtb2RlVG9nZ2xlLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgdG9nZ2xlTmlnaHRtb2RlT25DbGljayk7XG59XG5cbi8qIERhdGUgY2xpY2tlciAqL1xubGV0IHN0YXJ0RGF5LCBlbmREYXk7XG5sZXQgZHJhZ2dlZCA9IGZhbHNlO1xuXG4vKiBTVkcgR3JpZCBldmVudHMgKi9cbmNvbnN0IGdyaWRTcXVhcmVzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmRheScpO1xuXG4vLyBxdWVyeVNlbGVjdG9yQWxsIHJldHVybnMgYSBOb2RlbGlzdCBzbyBoYXZlIHRvIGNoZWNrIGZvciBsZW5ndGhcbmlmIChncmlkU3F1YXJlcy5sZW5ndGggPiAwKSB7XG5cbiAgICBncmlkU3F1YXJlcy5mb3JFYWNoKGZ1bmN0aW9uIChzcXVhcmUsIGluZGV4KSB7XG5cbiAgICAgICAgWydtb3VzZWRvd24nLCAndG91Y2hzdGFydCddLmZvckVhY2goZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIHNxdWFyZS5hZGRFdmVudExpc3RlbmVyKGUsIGdyaWRTdGFydEhhbmRsZXIpO1xuICAgICAgICB9KTtcblxuICAgICAgICBbJ21vdXNldXAnLCAndG91Y2hlbmQnXS5mb3JFYWNoKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBzcXVhcmUuYWRkRXZlbnRMaXN0ZW5lcihlLCBncmlkRW5kSGFuZGxlcik7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIFsnbW91c2VlbnRlcicsICd0b3VjaGVudGVyJ10uZm9yRWFjaChmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgc3F1YXJlLmFkZEV2ZW50TGlzdGVuZXIoZSwgZ3JpZEhvdmVySGFuZGxlcik7XG4gICAgICAgIH0pO1xuXG4gICAgfSk7XG59XG5cbmZ1bmN0aW9uIGdyaWRTdGFydEhhbmRsZXIoZSkge1xuICAgIHN0YXJ0RGF5ID0gZS50YXJnZXQuZGF0YXNldC5pbmRleDtcblxuICAgIGNvbnN0IGFjdGl2ZSA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy50b2RheScpO1xuICAgIGFjdGl2ZS5mb3JFYWNoKGZ1bmN0aW9uIChzcXVhcmUsIGluZGV4KSB7XG4gICAgICAgIHNxdWFyZS5jbGFzc0xpc3QudG9nZ2xlKCd0b2RheScpO1xuICAgIH0pXG4gICAgY29uc3Qgc2VsZWN0ZWQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuc2VsZWN0Jyk7XG4gICAgc2VsZWN0ZWQuZm9yRWFjaChmdW5jdGlvbiAoc3F1YXJlLCBpbmRleCkge1xuICAgICAgICBzcXVhcmUuY2xhc3NMaXN0LnRvZ2dsZSgnc2VsZWN0Jyk7XG4gICAgfSlcbiAgICBlLnRhcmdldC5jbGFzc0xpc3QudG9nZ2xlKCd0b2RheScpO1xuICAgIGRyYWdnZWQgPSB0cnVlO1xufVxuXG5mdW5jdGlvbiBncmlkRW5kSGFuZGxlcihlKSB7XG4gICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIGVuZERheSA9IGUudGFyZ2V0LmRhdGFzZXQuaW5kZXg7XG4gICAgZHJhZ2dlZCA9IGZhbHNlO1xuICAgIGlmIChzdGFydERheSA+IGVuZERheSkge1xuICAgICAgICBsb2FkKGVuZERheSwgc3RhcnREYXkpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGxvYWQoc3RhcnREYXksIGVuZERheSk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBncmlkSG92ZXJIYW5kbGVyKGUpIHtcbiAgICBpZiAoZHJhZ2dlZCkge1xuICAgICAgICBncmlkU3F1YXJlcy5mb3JFYWNoKGZ1bmN0aW9uIChzcXVhcmUsIGluZGV4KSB7XG4gICAgICAgICAgICAvL3Jlc2V0XG4gICAgICAgICAgICBzcXVhcmUuY2xhc3NMaXN0LnJlbW92ZSgnc2VsZWN0Jyk7XG4gICAgICAgICAgICAvL3JpZ2h0IGRyYWdcbiAgICAgICAgICAgIGlmIChwYXJzZUludChzdGFydERheSkgPiBwYXJzZUludChlLnRhcmdldC5kYXRhc2V0LmluZGV4KSkge1xuICAgICAgICAgICAgICAgIGlmIChwYXJzZUludChzcXVhcmUuZGF0YXNldC5pbmRleCkgPD0gcGFyc2VJbnQoc3RhcnREYXkpICYmIHBhcnNlSW50KHNxdWFyZS5kYXRhc2V0LmluZGV4KSA+PSBwYXJzZUludChlLnRhcmdldC5kYXRhc2V0LmluZGV4KSkge1xuICAgICAgICAgICAgICAgICAgICBzcXVhcmUuY2xhc3NMaXN0LmFkZCgnc2VsZWN0Jyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAvL2xlZnQgZHJhZ1xuICAgICAgICAgICAgICAgIGlmIChwYXJzZUludChzcXVhcmUuZGF0YXNldC5pbmRleCkgPj0gcGFyc2VJbnQoc3RhcnREYXkpICYmIHBhcnNlSW50KHNxdWFyZS5kYXRhc2V0LmluZGV4KSA8PSBwYXJzZUludChlLnRhcmdldC5kYXRhc2V0LmluZGV4KSkge1xuICAgICAgICAgICAgICAgICAgICBzcXVhcmUuY2xhc3NMaXN0LmFkZCgnc2VsZWN0Jyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgIH1cbn1cblxuZnVuY3Rpb24gcmVtb3ZlU3Bpbm5lcklmUHJlc2VudCgpIHtcbiAgICBjb25zdCBzcGlubmVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnNwaW5uZXInKTtcbiAgICBpZiAoc3Bpbm5lciAhPT0gbnVsbCkge1xuICAgICAgICBzcGlubmVyLnJlbW92ZSgpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gcmVtb3ZlTm90aWZpY2F0aW9uSWZQcmVzZW50KCkge1xuICAgIGNvbnN0IG5vdGlmaWNhdGlvbiA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5ub3RpZmljYXRpb24nKTtcbiAgICBpZiAobm90aWZpY2F0aW9uICE9PSBudWxsKSB7XG4gICAgICAgIG5vdGlmaWNhdGlvbi5yZW1vdmUoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGxvYWQoc3RhcnREYXksIGVuZERheSkge1xuXG4gICAgLy8gIFByZXAgdGhlIGRhdGEgdGhhdCB0aGUgQVBJIG5lZWRzXG4gICAgY29uc3QgZGF0YSA9IHtcbiAgICAgICAgdXNlcklkOiB1c2VySWQsXG4gICAgICAgIHllYXI6IHllYXIsXG4gICAgICAgIHN0YXJ0RGF5OiBzdGFydERheSxcbiAgICAgICAgZW5kRGF5OiBlbmREYXlcbiAgICB9O1xuXG4gICAgLy8gIENsZWFuIHVwIHRoZSBwcm9maWxlIHNvIHdlIGNhbiByZS1pbnNlcnQgdGhlIG5ldyBkYXRhXG4gICAgcHJvZmlsZS5pbm5lckhUTUwgPSAnJztcbiAgICByZW1vdmVOb3RpZmljYXRpb25JZlByZXNlbnQoKTtcbiAgICByZW1vdmVTcGlubmVySWZQcmVzZW50KCk7XG5cbiAgICAvLyAgQWRkIHRoZSBsb2FkaW5nIHNwaW5uZXJcbiAgICBjb25zdCBuZXdTcGlubmVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnc3BhbicpO1xuICAgIG5ld1NwaW5uZXIuY2xhc3NMaXN0LmFkZCgnc3Bpbm5lcicpO1xuICAgIHByb2ZpbGUuYXBwZW5kQ2hpbGQobmV3U3Bpbm5lcik7XG5cbiAgICAvLyAgU3RhcnQgdGhlIHJlcXVlc3RcbiAgICBjb25zdCB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcbiAgICB4aHIub3BlbignUE9TVCcsICcvYXBpL2dldERhdGEnLCB0cnVlKTtcbiAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb247IGNoYXJzZXQ9VVRGLTgnKTtcbiAgICB4aHIuc2VuZChKU09OLnN0cmluZ2lmeShkYXRhKSk7XG4gICAgeGhyLm9ucmVhZHlzdGF0ZWNoYW5nZSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgaWYgKHhoci5yZWFkeVN0YXRlID09PSA0ICYmIHhoci5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICAgICAgdXBkYXRlUHJvZmlsZShKU09OLnBhcnNlKHhoci5yZXNwb25zZVRleHQpKTtcbiAgICAgICAgICAgIHNvcnRQcm9maWxlVGFibGUoKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZnVuY3Rpb24gc29ydFByb2ZpbGVUYWJsZSgpXG57XG4gICAgY29uc3QgcHJvZmlsZVRhYmxlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnRhYmxlIHRhYmxlJyk7XG4gICAgaWYgKHByb2ZpbGVUYWJsZSAhPT0gbnVsbCkge1xuICAgICAgICBuZXcgVGFibGVzb3J0KHByb2ZpbGVUYWJsZSwge1xuICAgICAgICAgICAgZGVzY2VuZGluZzogdHJ1ZVxuICAgICAgICB9KTtcbiAgICB9XG59XG5cbi8qXG5sZXQgZ3JpZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5ncmlkLWNvbnRhaW5lcicpO1xuaWYoZ3JpZCl7XG4gIGxldCBtYXggPSBncmlkLnNjcm9sbFdpZHRoIC0gZ3JpZC5jbGllbnRXaWR0aDtcbiAgZ3JpZC5zY3JvbGxMZWZ0ID0gbWF4O1xufVxuKi9cblxuZ2V0VXNlcklkKCk7XG5nZXRZZWFyKCk7XG50dXJuT25OaWdodG1vZGVPblBhZ2VMb2FkKCk7XG5zb3J0UHJvZmlsZVRhYmxlKCk7Il19