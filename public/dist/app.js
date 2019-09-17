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
        logLevel.appendChild(document.createTextNode(log.lg_level));

        const logValue = document.createElement('td');
        logValue.appendChild(document.createTextNode(Math.round(log.lg_value).toLocaleString()));

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
        eventTitle.appendChild(document.createTextNode(event.ev_title));
        eventTitle.classList.add('event-title');

        const eventTimestamp = document.createElement('span');
        eventTimestamp.appendChild(document.createTextNode(dayjs.unix(event.ev_ts).format("MMMM D, YYYY HH:mm")));
        eventTimestamp.classList.add('event-timestamp');

        const eventDetails = document.createElement('p');
        eventDetails.appendChild(document.createTextNode(event.ev_details));
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
        }
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNjcmlwdC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJhcHAuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuICogUnVuZWxvZ3Mgc2NyaXB0LmpzXG4gKlxuICogQ29udGVudDpcbiAqICAtIEdldCB1c2VySWQgYW5kIGN1cnJlbnQgeWVhciBmcm9tIHRoZSBhcHByb3ByaWF0ZSBoZWFkZXJzXG4gKiAgLSBHcmlkIHNxdWFyZSBjbGljayBldmVudCAtPiBYaFIgcmVxdWVzdCBuYWFyIEFQSSAtPiB1cGRhdGUgcHJvZmlsZVxuICogIC0gTmlnaHRtb2RlIHRvZ2dsZSAod29ya3Mgd2l0aCBsb2NhbFN0b3JhZ2UpXG4gKiAgLSBHcmlkIGRyYWcgLT4gc2VsZWN0IHNxdWFyZXNcbiAqICAtIFByaW50IGEgdGFibGUgd2l0aCByb3dzIGZvciBleHAgb3IgYW4gdW5vcmRlbmVkIGxvc3QgZm9yIGV2ZW50c1xuICpcbiAqL1xuXG5jb25zdCBwcm9maWxlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnByb2ZpbGUnKTtcbmxldCB1c2VySWQgPSBudWxsO1xubGV0IHllYXIgPSBudWxsO1xuXG5mdW5jdGlvbiBnZXRVc2VySWQoKSB7XG4gICAgY29uc3QgdXNlckhlYWRlciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5jdXJyZW50IGgxJyk7XG4gICAgaWYgKHVzZXJIZWFkZXIgIT09IG51bGwpIHtcbiAgICAgICAgdXNlcklkID0gdXNlckhlYWRlci5kYXRhc2V0LmlkO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZ2V0WWVhcigpIHtcbiAgICBjb25zdCB5ZWFySGVhZGVyID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLnllYXJIZWFkZXInKTtcbiAgICBpZiAoeWVhckhlYWRlciAhPT0gbnVsbCkge1xuICAgICAgICB5ZWFyID0geWVhckhlYWRlci5kYXRhc2V0LnllYXI7XG4gICAgfVxufVxuXG5mdW5jdGlvbiB1cGRhdGVQcm9maWxlKGRhdGEpXG57XG4gICAgcmVtb3ZlU3Bpbm5lcklmUHJlc2VudCgpO1xuXG4gICAgaWYgKGRhdGEubG9ncyAgPT09IG51bGwgJiYgZGF0YS5ldmVudHMubGVuZ3RoICA9PT0gMCkge1xuICAgICAgICBjb25zdCBub3RpZmljYXRpb24gPSBjcmVhdGVOb3RpZmljYXRpb24oKTtcbiAgICAgICAgcHJvZmlsZS5hcHBlbmRDaGlsZChub3RpZmljYXRpb24pO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKGRhdGEubG9ncyAgIT09IG51bGwpIHtcbiAgICAgICAgcHJpbnRMb2dzKGRhdGEubG9ncyk7XG4gICAgfVxuXG4gICAgaWYgKGRhdGEuZXZlbnRzLmxlbmd0aCAgIT09IDApIHtcbiAgICAgICAgcHJpbnRFdmVudHMoZGF0YS5ldmVudHMpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gcHJpbnRMb2dzKGxvZ3MpXG57XG4gICAgLy8gUHJpbnQgdGhlIGV4cGVyaWVuY2UgdGFibGUgYW5kIGhlYWRlclxuICAgIGNvbnN0IGxvZ1NlY3Rpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzZWN0aW9uJyk7XG4gICAgbG9nU2VjdGlvbi5jbGFzc0xpc3QuYWRkKCd0YWJsZScpO1xuXG4gICAgY29uc3QgbG9nVGFibGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0YWJsZScpO1xuICAgIGNvbnN0IGxvZ0hlYWRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RoZWFkJyk7XG5cbiAgICBjb25zdCBsb2dIZWFkZXJSb3cgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0cicpO1xuXG4gICAgY29uc3QgbG9nSGVhZGVySWNvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RoJyk7XG4gICAgbG9nSGVhZGVySWNvbi5jbGFzc0xpc3QuYWRkKCdpY29uJyk7XG5cbiAgICBjb25zdCBsb2dIZWFkZXJMZXZlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RoJyk7XG4gICAgbG9nSGVhZGVyTGV2ZWwuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoJ0xldmVsJykpO1xuICAgIGxvZ0hlYWRlckxldmVsLmNsYXNzTGlzdC5hZGQoJ2xldmVsJyk7XG5cbiAgICBjb25zdCBsb2dIZWFkZXJFeHBlcmllbmNlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGgnKTtcbiAgICBsb2dIZWFkZXJFeHBlcmllbmNlLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCdFeHBlcmllbmNlJykpO1xuXG4gICAgY29uc3QgbG9nSGVhZGVyRGlmZmVyZW5jZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RoJyk7XG4gICAgbG9nSGVhZGVyRGlmZmVyZW5jZS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZSgnRGlmZmVyZW5jZScpKTtcblxuICAgIGNvbnN0IGxvZ1RhYmxlQm9keSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3Rib2R5Jyk7XG5cbiAgICBwcm9maWxlLmFwcGVuZENoaWxkKGxvZ1NlY3Rpb24pO1xuICAgIGxvZ1NlY3Rpb24uYXBwZW5kQ2hpbGQobG9nVGFibGUpO1xuICAgIGxvZ1RhYmxlLmFwcGVuZENoaWxkKGxvZ0hlYWRlcik7XG5cbiAgICBsb2dIZWFkZXJSb3cuYXBwZW5kQ2hpbGQobG9nSGVhZGVySWNvbik7XG4gICAgbG9nSGVhZGVyUm93LmFwcGVuZENoaWxkKGxvZ0hlYWRlckxldmVsKTtcbiAgICBsb2dIZWFkZXJSb3cuYXBwZW5kQ2hpbGQobG9nSGVhZGVyRXhwZXJpZW5jZSk7XG4gICAgbG9nSGVhZGVyUm93LmFwcGVuZENoaWxkKGxvZ0hlYWRlckRpZmZlcmVuY2UpO1xuXG4gICAgbG9nSGVhZGVyLmFwcGVuZENoaWxkKGxvZ0hlYWRlclJvdyk7XG5cbiAgICBsb2dUYWJsZS5hcHBlbmRDaGlsZChsb2dUYWJsZUJvZHkpO1xuXG4gICAgLyogRGlzcGxheSB0aGUgZXhwZXJpZW5jZSB0YWJsZSByb3dzICovXG4gICAgbG9ncy5mb3JFYWNoKGZ1bmN0aW9uIChsb2csIGluZGV4KSB7XG5cbiAgICAgICAgY29uc3QgbG9nUm93ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndHInKTtcblxuICAgICAgICBjb25zdCBsb2dJY29uQ2VsbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3RkJyk7XG4gICAgICAgIGNvbnN0IGxvZ0ljb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzcGFuJyk7XG4gICAgICAgIGxvZ0ljb24uY2xhc3NMaXN0LmFkZCgnbG9nLWljb24nLCAncycgKyBpbmRleCk7XG4gICAgICAgIGxvZ0ljb25DZWxsLmFwcGVuZENoaWxkKGxvZ0ljb24pO1xuXG4gICAgICAgIGNvbnN0IGxvZ0xldmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndGQnKTtcbiAgICAgICAgbG9nTGV2ZWwuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUobG9nLmxnX2xldmVsKSk7XG5cbiAgICAgICAgY29uc3QgbG9nVmFsdWUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZCcpO1xuICAgICAgICBsb2dWYWx1ZS5hcHBlbmRDaGlsZChkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShNYXRoLnJvdW5kKGxvZy5sZ192YWx1ZSkudG9Mb2NhbGVTdHJpbmcoKSkpO1xuXG4gICAgICAgIGNvbnN0IGxvZ0RpZmZlcmVuY2UgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd0ZCcpO1xuICAgICAgICBpZiAobG9nLmRpZmZlcmVuY2UgPiAwKSB7XG4gICAgICAgICAgICBsb2dEaWZmZXJlbmNlLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCcrJyArIE1hdGgucm91bmQobG9nLmRpZmZlcmVuY2UpLnRvTG9jYWxlU3RyaW5nKCkpKTtcbiAgICAgICAgICAgIGxvZ0RpZmZlcmVuY2UuY2xhc3NMaXN0LmFkZCgnbG9nLXZhbHVlJywgJ3Bvc2l0aXZlJyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsb2dEaWZmZXJlbmNlLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCcwJykpO1xuICAgICAgICB9XG5cbiAgICAgICAgbG9nUm93LmFwcGVuZENoaWxkKGxvZ0ljb25DZWxsKTtcbiAgICAgICAgbG9nUm93LmFwcGVuZENoaWxkKGxvZ0xldmVsKTtcbiAgICAgICAgbG9nUm93LmFwcGVuZENoaWxkKGxvZ1ZhbHVlKTtcbiAgICAgICAgbG9nUm93LmFwcGVuZENoaWxkKGxvZ0RpZmZlcmVuY2UpO1xuICAgICAgICBsb2dUYWJsZUJvZHkuYXBwZW5kQ2hpbGQobG9nUm93KTtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gcHJpbnRFdmVudHMoZXZlbnRzKVxue1xuICAgIGNvbnN0IGV2ZW50U2VjdGlvbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NlY3Rpb24nKTtcbiAgICBldmVudFNlY3Rpb24uY2xhc3NMaXN0LmFkZCgnZXZlbnRzJyk7XG5cbiAgICBjb25zdCBldmVudExpc3QgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd1bCcpO1xuICAgIGV2ZW50TGlzdC5jbGFzc0xpc3QuYWRkKCdldmVudHMnKTtcblxuICAgIHByb2ZpbGUuYXBwZW5kQ2hpbGQoZXZlbnRTZWN0aW9uKTtcbiAgICBldmVudFNlY3Rpb24uYXBwZW5kQ2hpbGQoZXZlbnRMaXN0KTtcblxuICAgIGV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uIChldmVudCwgaW5kZXgpIHtcblxuICAgICAgICBjb25zdCBldmVudEl0ZW0gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdsaScpO1xuICAgICAgICBldmVudEl0ZW0uY2xhc3NMaXN0LmFkZCgnZXZlbnQtaXRlbScpO1xuXG4gICAgICAgIGNvbnN0IGV2ZW50SGVhZGVyID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgIGV2ZW50SGVhZGVyLmNsYXNzTGlzdC5hZGQoJ2V2ZW50LWhlYWRlcicpO1xuXG4gICAgICAgIGNvbnN0IGV2ZW50VGl0bGUgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdoMicpO1xuICAgICAgICBldmVudFRpdGxlLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGV2ZW50LmV2X3RpdGxlKSk7XG4gICAgICAgIGV2ZW50VGl0bGUuY2xhc3NMaXN0LmFkZCgnZXZlbnQtdGl0bGUnKTtcblxuICAgICAgICBjb25zdCBldmVudFRpbWVzdGFtcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICAgICAgZXZlbnRUaW1lc3RhbXAuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoZGF5anMudW5peChldmVudC5ldl90cykuZm9ybWF0KFwiTU1NTSBELCBZWVlZIEhIOm1tXCIpKSk7XG4gICAgICAgIGV2ZW50VGltZXN0YW1wLmNsYXNzTGlzdC5hZGQoJ2V2ZW50LXRpbWVzdGFtcCcpO1xuXG4gICAgICAgIGNvbnN0IGV2ZW50RGV0YWlscyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3AnKTtcbiAgICAgICAgZXZlbnREZXRhaWxzLmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGV2ZW50LmV2X2RldGFpbHMpKTtcbiAgICAgICAgZXZlbnREZXRhaWxzLmNsYXNzTGlzdC5hZGQoJ2V2ZW50LWRldGFpbHMnKTtcblxuICAgICAgICBldmVudEl0ZW0uYXBwZW5kQ2hpbGQoZXZlbnRIZWFkZXIpO1xuICAgICAgICBldmVudEhlYWRlci5hcHBlbmRDaGlsZChldmVudFRpdGxlKTtcbiAgICAgICAgZXZlbnRIZWFkZXIuYXBwZW5kQ2hpbGQoZXZlbnRUaW1lc3RhbXApO1xuICAgICAgICBldmVudEl0ZW0uYXBwZW5kQ2hpbGQoZXZlbnREZXRhaWxzKTtcblxuICAgICAgICBldmVudExpc3QuYXBwZW5kQ2hpbGQoZXZlbnRJdGVtKTtcbiAgICB9KTtcbn1cblxuZnVuY3Rpb24gY3JlYXRlTm90aWZpY2F0aW9uKClcbntcbiAgICBjb25zdCBub3RpZmljYXRpb24gPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgICBub3RpZmljYXRpb24uY2xhc3NMaXN0LmFkZCgndGV4dCcsICdub3RpZmljYXRpb24nLCAnaW5mJyk7XG5cbiAgICBjb25zdCBub3RpZmljYXRpb25UaXRsZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2gyJyk7XG4gICAgbm90aWZpY2F0aW9uVGl0bGUuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCJOb3RoaW5nIGludGVyZXN0aW5nIGhhcHBlbmVkLlwiKSk7XG5cbiAgICBjb25zdCBub3RpZmljYXRpb25UZXh0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgncCcpO1xuICAgIG5vdGlmaWNhdGlvblRleHQuYXBwZW5kQ2hpbGQoZG9jdW1lbnQuY3JlYXRlVGV4dE5vZGUoXCJMb29rcyBsaWtlIHdlIGRvbid0IGhhdmUgYW55IGRhdGEgZm9yIHlvdSBvbiB0aGlzIGRheS5cIikpO1xuXG4gICAgbm90aWZpY2F0aW9uLmFwcGVuZENoaWxkKG5vdGlmaWNhdGlvblRpdGxlKTtcbiAgICBub3RpZmljYXRpb24uYXBwZW5kQ2hpbGQobm90aWZpY2F0aW9uVGV4dCk7XG4gICAgcmV0dXJuIG5vdGlmaWNhdGlvbjtcbn1cblxuLyogTmlnaHRtb2RlIHRvZ2dsZSAoZ2xvYmFsKSAqL1xuXG5jb25zdCBib2R5ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignYm9keScpO1xubGV0IGlzTmlnaHRtb2RlID0gYm9keS5jbGFzc0xpc3QuY29udGFpbnMoJ2lzLW5pZ2h0bW9kZScpO1xuY29uc3QgbmlnaHRtb2RlVG9nZ2xlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignLm5pZ2h0LW1vZGUtdG9nZ2xlJyk7XG5cbmZ1bmN0aW9uIHRvZ2dsZU5pZ2h0bW9kZU9uQ2xpY2soZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgIC8vIEdldCB0aGUgYm9keSBjbGFzcyBhbmQgcmV2ZXJzZSBpdFxuICAgIGlzTmlnaHRtb2RlID0gYm9keS5jbGFzc0xpc3QuY29udGFpbnMoJ2lzLW5pZ2h0bW9kZScpO1xuICAgIGlzTmlnaHRtb2RlID0gIWlzTmlnaHRtb2RlO1xuXG4gICAgLy8gU2V0IHRoZSBib2R5IGNsYXNzIHNvIHRoYXQgdGhlIHN0eWxpbmcgY2hhbmdlc1xuICAgIGJvZHkuY2xhc3NMaXN0LnRvZ2dsZSgnaXMtbmlnaHRtb2RlJyk7XG5cbiAgICAvLyBTdG9yZSB0aGUgYm9vbCBpbiBsb2NhbFN0b3JhZ2VcbiAgICBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShcIm5pZ2h0bW9kZVwiLCBKU09OLnN0cmluZ2lmeShpc05pZ2h0bW9kZSkpO1xufVxuXG4vKlxuICogSWYgYSBwYWdlIGlzIGxvYWRlZCBhbmQgdGhlIGxvY2FsU3RvcmFnZSBwYXJhbWV0ZXIgaXMgc2V0IHRvXG4gKiB0cnVlLCB0aGVuIHN3aXRjaCB0aGUgcGFnZSBzdHlsaW5nXG4gKi9cbmZ1bmN0aW9uIHR1cm5Pbk5pZ2h0bW9kZU9uUGFnZUxvYWQoKSB7XG4gICAgaWYgKGxvY2FsU3RvcmFnZS5nZXRJdGVtKFwibmlnaHRtb2RlXCIpID09PSBcInRydWVcIikge1xuICAgICAgICBib2R5LmNsYXNzTGlzdC50b2dnbGUoJ2lzLW5pZ2h0bW9kZScpO1xuICAgIH1cbn1cblxuaWYgKG5pZ2h0bW9kZVRvZ2dsZSAhPT0gbnVsbCkge1xuICAgIG5pZ2h0bW9kZVRvZ2dsZS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHRvZ2dsZU5pZ2h0bW9kZU9uQ2xpY2spO1xufVxuXG4vKiBEYXRlIGNsaWNrZXIgKi9cbmxldCBzdGFydERheSwgZW5kRGF5O1xubGV0IGRyYWdnZWQgPSBmYWxzZTtcblxuLyogU1ZHIEdyaWQgZXZlbnRzICovXG5jb25zdCBncmlkU3F1YXJlcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5kYXknKTtcblxuLy8gcXVlcnlTZWxlY3RvckFsbCByZXR1cm5zIGEgTm9kZWxpc3Qgc28gaGF2ZSB0byBjaGVjayBmb3IgbGVuZ3RoXG5pZiAoZ3JpZFNxdWFyZXMubGVuZ3RoID4gMCkge1xuXG4gICAgZ3JpZFNxdWFyZXMuZm9yRWFjaChmdW5jdGlvbiAoc3F1YXJlLCBpbmRleCkge1xuXG4gICAgICAgIFsnbW91c2Vkb3duJywgJ3RvdWNoc3RhcnQnXS5mb3JFYWNoKGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBzcXVhcmUuYWRkRXZlbnRMaXN0ZW5lcihlLCBncmlkU3RhcnRIYW5kbGVyKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgWydtb3VzZXVwJywgJ3RvdWNoZW5kJ10uZm9yRWFjaChmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgc3F1YXJlLmFkZEV2ZW50TGlzdGVuZXIoZSwgZ3JpZEVuZEhhbmRsZXIpO1xuICAgICAgICB9KTtcblxuICAgICAgICBbJ21vdXNlZW50ZXInLCAndG91Y2hlbnRlciddLmZvckVhY2goZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIHNxdWFyZS5hZGRFdmVudExpc3RlbmVyKGUsIGdyaWRIb3ZlckhhbmRsZXIpO1xuICAgICAgICB9KTtcblxuICAgIH0pO1xufVxuXG5mdW5jdGlvbiBncmlkU3RhcnRIYW5kbGVyKGUpIHtcbiAgICBzdGFydERheSA9IGUudGFyZ2V0LmRhdGFzZXQuaW5kZXg7XG5cbiAgICBjb25zdCBhY3RpdmUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcudG9kYXknKTtcbiAgICBhY3RpdmUuZm9yRWFjaChmdW5jdGlvbiAoc3F1YXJlLCBpbmRleCkge1xuICAgICAgICBzcXVhcmUuY2xhc3NMaXN0LnRvZ2dsZSgndG9kYXknKTtcbiAgICB9KVxuICAgIGNvbnN0IHNlbGVjdGVkID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLnNlbGVjdCcpO1xuICAgIHNlbGVjdGVkLmZvckVhY2goZnVuY3Rpb24gKHNxdWFyZSwgaW5kZXgpIHtcbiAgICAgICAgc3F1YXJlLmNsYXNzTGlzdC50b2dnbGUoJ3NlbGVjdCcpO1xuICAgIH0pXG4gICAgZS50YXJnZXQuY2xhc3NMaXN0LnRvZ2dsZSgndG9kYXknKTtcbiAgICBkcmFnZ2VkID0gdHJ1ZTtcbn1cblxuZnVuY3Rpb24gZ3JpZEVuZEhhbmRsZXIoZSkge1xuICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICBlbmREYXkgPSBlLnRhcmdldC5kYXRhc2V0LmluZGV4O1xuICAgIGRyYWdnZWQgPSBmYWxzZTtcbiAgICBpZiAoc3RhcnREYXkgPiBlbmREYXkpIHtcbiAgICAgICAgbG9hZChlbmREYXksIHN0YXJ0RGF5KTtcbiAgICB9IGVsc2Uge1xuICAgICAgICBsb2FkKHN0YXJ0RGF5LCBlbmREYXkpO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gZ3JpZEhvdmVySGFuZGxlcihlKSB7XG4gICAgaWYgKGRyYWdnZWQpIHtcbiAgICAgICAgZ3JpZFNxdWFyZXMuZm9yRWFjaChmdW5jdGlvbiAoc3F1YXJlLCBpbmRleCkge1xuICAgICAgICAgICAgLy9yZXNldFxuICAgICAgICAgICAgc3F1YXJlLmNsYXNzTGlzdC5yZW1vdmUoJ3NlbGVjdCcpO1xuICAgICAgICAgICAgLy9yaWdodCBkcmFnXG4gICAgICAgICAgICBpZiAocGFyc2VJbnQoc3RhcnREYXkpID4gcGFyc2VJbnQoZS50YXJnZXQuZGF0YXNldC5pbmRleCkpIHtcbiAgICAgICAgICAgICAgICBpZiAocGFyc2VJbnQoc3F1YXJlLmRhdGFzZXQuaW5kZXgpIDw9IHBhcnNlSW50KHN0YXJ0RGF5KSAmJiBwYXJzZUludChzcXVhcmUuZGF0YXNldC5pbmRleCkgPj0gcGFyc2VJbnQoZS50YXJnZXQuZGF0YXNldC5pbmRleCkpIHtcbiAgICAgICAgICAgICAgICAgICAgc3F1YXJlLmNsYXNzTGlzdC5hZGQoJ3NlbGVjdCcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy9sZWZ0IGRyYWdcbiAgICAgICAgICAgICAgICBpZiAocGFyc2VJbnQoc3F1YXJlLmRhdGFzZXQuaW5kZXgpID49IHBhcnNlSW50KHN0YXJ0RGF5KSAmJiBwYXJzZUludChzcXVhcmUuZGF0YXNldC5pbmRleCkgPD0gcGFyc2VJbnQoZS50YXJnZXQuZGF0YXNldC5pbmRleCkpIHtcbiAgICAgICAgICAgICAgICAgICAgc3F1YXJlLmNsYXNzTGlzdC5hZGQoJ3NlbGVjdCcpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHJlbW92ZVNwaW5uZXJJZlByZXNlbnQoKSB7XG4gICAgY29uc3Qgc3Bpbm5lciA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5zcGlubmVyJyk7XG4gICAgaWYgKHNwaW5uZXIgIT09IG51bGwpIHtcbiAgICAgICAgc3Bpbm5lci5yZW1vdmUoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHJlbW92ZU5vdGlmaWNhdGlvbklmUHJlc2VudCgpIHtcbiAgICBjb25zdCBub3RpZmljYXRpb24gPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcubm90aWZpY2F0aW9uJyk7XG4gICAgaWYgKG5vdGlmaWNhdGlvbiAhPT0gbnVsbCkge1xuICAgICAgICBub3RpZmljYXRpb24ucmVtb3ZlKCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBsb2FkKHN0YXJ0RGF5LCBlbmREYXkpIHtcblxuICAgIC8vICBQcmVwIHRoZSBkYXRhIHRoYXQgdGhlIEFQSSBuZWVkc1xuICAgIGNvbnN0IGRhdGEgPSB7XG4gICAgICAgIHVzZXJJZDogdXNlcklkLFxuICAgICAgICB5ZWFyOiB5ZWFyLFxuICAgICAgICBzdGFydERheTogc3RhcnREYXksXG4gICAgICAgIGVuZERheTogZW5kRGF5XG4gICAgfTtcblxuICAgIC8vICBDbGVhbiB1cCB0aGUgcHJvZmlsZSBzbyB3ZSBjYW4gcmUtaW5zZXJ0IHRoZSBuZXcgZGF0YVxuICAgIHByb2ZpbGUuaW5uZXJIVE1MID0gJyc7XG4gICAgcmVtb3ZlTm90aWZpY2F0aW9uSWZQcmVzZW50KCk7XG4gICAgcmVtb3ZlU3Bpbm5lcklmUHJlc2VudCgpO1xuXG4gICAgLy8gIEFkZCB0aGUgbG9hZGluZyBzcGlubmVyXG4gICAgY29uc3QgbmV3U3Bpbm5lciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICBuZXdTcGlubmVyLmNsYXNzTGlzdC5hZGQoJ3NwaW5uZXInKTtcbiAgICBwcm9maWxlLmFwcGVuZENoaWxkKG5ld1NwaW5uZXIpO1xuXG4gICAgLy8gIFN0YXJ0IHRoZSByZXF1ZXN0XG4gICAgY29uc3QgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgeGhyLm9wZW4oJ1BPU1QnLCAnL2FwaS9nZXREYXRhJywgdHJ1ZSk7XG4gICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uOyBjaGFyc2V0PVVURi04Jyk7XG4gICAgeGhyLnNlbmQoSlNPTi5zdHJpbmdpZnkoZGF0YSkpO1xuICAgIHhoci5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh4aHIucmVhZHlTdGF0ZSA9PT0gNCAmJiB4aHIuc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgICAgIHVwZGF0ZVByb2ZpbGUoSlNPTi5wYXJzZSh4aHIucmVzcG9uc2VUZXh0KSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qXG5sZXQgZ3JpZCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJy5ncmlkLWNvbnRhaW5lcicpO1xuaWYoZ3JpZCl7XG4gIGxldCBtYXggPSBncmlkLnNjcm9sbFdpZHRoIC0gZ3JpZC5jbGllbnRXaWR0aDtcbiAgZ3JpZC5zY3JvbGxMZWZ0ID0gbWF4O1xufVxuKi9cblxuZ2V0VXNlcklkKCk7XG5nZXRZZWFyKCk7XG50dXJuT25OaWdodG1vZGVPblBhZ2VMb2FkKCk7Il19