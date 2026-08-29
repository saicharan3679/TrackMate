// TrackMate frontend enhancer.
// Pure client-side progressive enhancement — reads the DOM the server
// already sent and re-presents it. Never calls any endpoint or changes
// any form/link, so it cannot break existing backend behavior.
(function () {
  "use strict";

  function initNavToggle() {
    var toggle = document.querySelector(".nav-toggle");
    var links = document.querySelector(".topnav .links");
    if (!toggle || !links) return;
    toggle.addEventListener("click", function () {
      links.classList.toggle("open");
    });
  }

  // Turns a "label: value" style table (td.blue label + value) into a
  // single detail card, e.g. Fare Enquiry / Availability results.
  function enhanceKeyValueTable(table) {
    var rows = table.querySelectorAll("tr");
    if (!rows.length) return null;
    var card = document.createElement("div");
    card.className = "result-card";
    var grid = document.createElement("div");
    grid.className = "rc-grid";
    var hasLabelCol = false;

    rows.forEach(function (row) {
      var cells = row.querySelectorAll("td");
      if (cells.length === 2 && cells[0].classList.contains("blue")) {
        hasLabelCol = true;
        var field = document.createElement("div");
        field.className = "rc-field";
        var label = document.createElement("div");
        label.className = "rc-label";
        label.textContent = cells[0].textContent.replace(/:$/, "").trim();
        var value = document.createElement("div");
        value.className = "rc-value";
        value.innerHTML = cells[1].innerHTML;
        field.appendChild(label);
        field.appendChild(value);
        grid.appendChild(field);
      } else {
        // Row we don't recognize (e.g. an inline edit form row) — keep as-is.
        var wrap = document.createElement("div");
        wrap.appendChild(row.cloneNode(true));
        card.appendChild(wrap);
      }
    });

    if (!hasLabelCol) return null; // not this shape of table, leave alone
    card.insertBefore(grid, card.firstChild);
    return card;
  }

  // Turns a header-row table (e.g. train listings, booking history) into
  // a list of result cards, one per data row.
  function enhanceListTable(table) {
    var headerCells = table.querySelectorAll("tr:first-child th, tr:first-child td");
    if (!headerCells.length) return null;
    var headers = Array.prototype.map.call(headerCells, function (c) {
      return c.textContent.trim();
    });

    var bodyRows = Array.prototype.slice.call(table.querySelectorAll("tr")).slice(1);
    if (!bodyRows.length) return null;

    var list = document.createElement("div");
    list.className = "result-card-list";

    bodyRows.forEach(function (row) {
      var cells = row.querySelectorAll("td");
      if (!cells.length) return;
      var card = document.createElement("div");
      card.className = "result-card";

      var top = document.createElement("div");
      top.className = "rc-top";
      var titleIdx = headers.findIndex(function (h) {
        return /name|train/i.test(h);
      });
      var title = document.createElement("div");
      title.className = "rc-title";
      title.textContent = titleIdx >= 0 && cells[titleIdx] ? cells[titleIdx].textContent.trim() : (cells[0] ? cells[0].textContent.trim() : "");
      top.appendChild(title);

      var seatsIdx = headers.findIndex(function (h) { return /seat/i.test(h); });
      if (seatsIdx >= 0 && cells[seatsIdx]) {
        var seatsVal = parseInt(cells[seatsIdx].textContent.replace(/\D/g, ""), 10);
        var badge = document.createElement("span");
        if (!isNaN(seatsVal)) {
          if (seatsVal <= 0) { badge.className = "badge badge-danger"; badge.textContent = "Waitlisted"; }
          else if (seatsVal < 10) { badge.className = "badge badge-warning"; badge.textContent = "Limited"; }
          else { badge.className = "badge badge-success"; badge.textContent = "Available"; }
          top.appendChild(badge);
        }
      }
      card.appendChild(top);

      var grid = document.createElement("div");
      grid.className = "rc-grid";
      cells.forEach(function (cell, i) {
        if (i === titleIdx) return;
        var cellHasForm = cell.querySelector("form, input[type=submit], a");
        if (cellHasForm) return; // handled in actions row below
        var field = document.createElement("div");
        field.className = "rc-field";
        var label = document.createElement("div");
        label.className = "rc-label";
        label.textContent = headers[i] || "";
        var value = document.createElement("div");
        value.className = "rc-value";
        value.textContent = cell.textContent.trim();
        field.appendChild(label);
        field.appendChild(value);
        grid.appendChild(field);
      });
      card.appendChild(grid);

      var actionCells = Array.prototype.filter.call(cells, function (cell) {
        return cell.querySelector("form, input[type=submit], a");
      });
      if (actionCells.length) {
        var actions = document.createElement("div");
        actions.className = "rc-actions";
        actionCells.forEach(function (cell) {
          actions.appendChild(cell.cloneNode(true));
        });
        card.appendChild(actions);
      }

      list.appendChild(card);
    });

    return list;
  }

  function enhanceLegacyTables() {
    var containers = document.querySelectorAll(".page div.tab");
    containers.forEach(function (container) {
      var table = container.querySelector("table");
      if (!table) return;
      var rowCount = table.querySelectorAll("tr").length;
      if (rowCount === 0) return;

      var built = null;
      // Heuristic: a 2-column table where the first cell of every row has
      // class "blue" is a label/value detail view (fare, availability...).
      var firstRow = table.querySelector("tr");
      var firstCells = firstRow ? firstRow.querySelectorAll("td") : [];
      if (firstCells.length === 2 && firstCells[0].classList.contains("blue")) {
        built = enhanceKeyValueTable(table);
      } else if (rowCount > 1) {
        built = enhanceListTable(table);
      }

      if (built) {
        container.appendChild(built);
        container.classList.add("js-enhanced");
      }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initNavToggle();
    enhanceLegacyTables();
  });

  // Legacy servlets append their result markup to the response *after*
  // this script tag runs during initial parse, and again after any
  // include() finishes streaming — re-run once more on window load to
  // catch anything not yet in the DOM at DOMContentLoaded time.
  window.addEventListener("load", function () {
    enhanceLegacyTables();
  });
})();
