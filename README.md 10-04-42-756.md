# ArtisticBits Consultancy

A static HTML, CSS, and JavaScript website for ArtisticBits Consultancy. A small Java 21 server hosts the existing pages and assets over HTTP.

## Requirements

- Java 21 or later
- Apache Maven 3.9 or later

## Run locally

From this project folder, build the server:

~~~powershell
mvn package
~~~

Start the site:

~~~powershell
java --add-modules jdk.httpserver -Dsite.root=. -jar target/allgoodstudio-site-1.0.0.jar
~~~

Open <http://localhost:8080>. Press Ctrl+C in the terminal to stop the server.

To use another port, add -Dserver.port=8081 before -jar and open that port in the browser. To serve the site from another folder, set -Dsite.root to that folder.

## Pages

- / or /index.html - studio home page
- /portfolio.html - solutions and technology specialties
- /hybiz.html - company profile

The frontend files and images remain in their original folders. The Java server reads them from the project folder and returns the correct content type for common web assets.
