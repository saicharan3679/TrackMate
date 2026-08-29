// TrackMate frontend enhancer.
// Pure client-side progressive enhancement — reads the DOM the server
// already sent and re-presents it. Never calls any endpoint or changes
// any form/link, so it cannot break existing backend behavior.
(function () {
  "use strict";

  function initDrawer() {
    var menuBtn = document.getElementById("menuBtn");
    var drawer = document.getElementById("drawer");
    var backdrop = document.getElementById("drawerBackdrop");
    var closeBtn = document.getElementById("drawerClose");
    if (!menuBtn || !drawer || !backdrop) return;

    function open() { drawer.classList.add("open"); backdrop.classList.add("open"); }
    function close() { drawer.classList.remove("open"); backdrop.classList.remove("open"); }

    menuBtn.addEventListener("click", open);
    backdrop.addEventListener("click", close);
    if (closeBtn) closeBtn.addEventListener("click", close);
    drawer.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", close);
    });
  }

  // Detects the booking-confirmation table (starts with a "PNR No" row)
  // and rebuilds it as a proper digital-ticket card.
  function enhancePnrTable(table) {
    var rows = table.querySelectorAll("tr");
    if (!rows.length) return null;
    var firstCells = rows[0].querySelectorAll("td");
    if (!firstCells.length || !/pnr/i.test(firstCells[0].textContent)) return null;

    var pairs = [];
    var pnrValue = "";
    rows.forEach(function (row, idx) {
      var cells = row.querySelectorAll("td");
      for (var i = 0; i < cells.length; i += 2) {
        if (!cells[i + 1]) continue;
        var label = cells[i].textContent.replace(/:$/, "").trim();
        var value = cells[i + 1].innerHTML.trim();
        if (idx === 0) { pnrValue = value; continue; }
        pairs.push({ label: label, value: value });
      }
    });

    var card = document.createElement("div");
    card.className = "ticket-card";
    var head = document.createElement("div");
    head.className = "ticket-head";
    head.innerHTML = '<div class="brand">TrackMate</div><div class="status">Booking Confirmed ✓</div>';
    var body = document.createElement("div");
    body.className = "ticket-body";
    var pnrBlock = document.createElement("div");
    pnrBlock.className = "ticket-pnr";
    pnrBlock.innerHTML = '<div class="pnr-label">PNR</div><div class="pnr-value">' + pnrValue + "</div>";
    var grid = document.createElement("div");
    grid.className = "ticket-grid";
    pairs.forEach(function (p) {
      var field = document.createElement("div");
      field.innerHTML = '<div class="t-label">' + p.label + '</div><div class="t-value">' + p.value + "</div>";
      grid.appendChild(field);
    });
    body.appendChild(pnrBlock);
    body.appendChild(grid);
    card.appendChild(head);
    card.appendChild(body);
    return card;
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

      var fromIdx = headers.findIndex(function (h) { return /from/i.test(h); });
      var toIdx = headers.findIndex(function (h) { return /^to\b|to.?stn|to.?station/i.test(h); });
      if (fromIdx >= 0 && toIdx >= 0 && cells[fromIdx] && cells[toIdx]) {
        var route = document.createElement("div");
        route.className = "rc-route";
        route.innerHTML = '<span class="stn">' + cells[fromIdx].textContent.trim() +
          '</span><span class="line"></span><span class="stn">' + cells[toIdx].textContent.trim() + "</span>";
        card.appendChild(route);
      }

      var grid = document.createElement("div");
      grid.className = "rc-grid";
      cells.forEach(function (cell, i) {
        if (i === titleIdx || i === fromIdx || i === toIdx) return;
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
      var firstRow = table.querySelector("tr");
      var firstCells = firstRow ? firstRow.querySelectorAll("td") : [];
      if (firstCells.length && /pnr/i.test(firstCells[0].textContent)) {
        built = enhancePnrTable(table);
      } else if (firstCells.length === 2 && firstCells[0].classList.contains("blue")) {
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
    initDrawer();
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
