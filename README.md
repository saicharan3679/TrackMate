# TrackMate — Train Ticket Booking System

TrackMate is a Java Servlet web application for browsing train schedules, checking seat availability, comparing fares, and booking tickets online. It has separate flows for regular users (search, book, view history) and admins (add/update/remove trains).

## Features

**User**
- Register / log in
- View all trains, search by train number
- Search trains between two stations
- Check seat availability and fare
- Book tickets, view booking history
- Edit profile / change password

**Admin**
- Log in
- Add, update, and cancel trains
- View and search the full train list

## Tech Stack (100% free, no license or subscription anywhere)

- Java Servlets (no framework — raw `javax.servlet`), package `com.sai.*`
- HTML / CSS front end (custom, no JS framework)
- **MySQL Community Server** for the database (free, open source)
- Maven (`pom.xml`) for dependency management
- Built and run from **Eclipse** with a **Tomcat 9** server

Everything runs entirely on your own computer — no cloud service, no paid API, nothing that asks for a credit card.

## Project Structure

```
TrackMate/
├── src/com/sai/             # servlets, services, beans (backend logic)
├── WebContent/              # HTML pages + assets/css/style.css (front end)
├── WebContent/WEB-INF/      # web.xml
├── pom.xml
└── Dummy-Database.md        # sample SQL to set up tables
```

## Running It Locally

1. Install, all free: Temurin JDK 8+, Eclipse IDE for Enterprise Java and Web Developers, Apache Tomcat 9, MySQL Community Server.
2. Import this folder into Eclipse as an **Existing Maven Project**.
3. Follow `Dummy-Database.md` to create the MySQL database and tables.
4. Open `src/application.properties` and set your MySQL username/password/port.
5. Add the project to a local Tomcat 9 server in Eclipse (right-click project → Run As → Run on Server).
6. Open `http://localhost:8080/TrackMate/` in your browser.

## Design Notes

- Front end uses a top-navbar layout (`assets/css/style.css`) rather than a sidebar, and the page templates deliberately leave their container `<div>` open. Several servlets build a result by including a page and then writing extra HTML straight after it in the same response — with an open container, that extra markup lands inside the visible content area in normal document flow instead of being pushed to the end of the page by the browser.
- Fixed a backend bug present in the original exercise this was built from: a few insert/update operations called `executeQuery()` on `INSERT`/`UPDATE` statements (only valid for `SELECT`), which silently failed. These now correctly use `executeUpdate()`.
