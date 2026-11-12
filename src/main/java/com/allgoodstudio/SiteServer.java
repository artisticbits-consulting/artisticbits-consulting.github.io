package com.allgoodstudio;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.net.InetSocketAddress;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Locale;
import java.util.Map;

/** Serves the ArtisticBits Consultancy website over HTTP. */
public final class SiteServer {
    private static final Map<String, String> CONTENT_TYPES = Map.ofEntries(
            Map.entry(".css", "text/css; charset=utf-8"),
            Map.entry(".eot", "application/vnd.ms-fontobject"),
            Map.entry(".gif", "image/gif"),
            Map.entry(".html", "text/html; charset=utf-8"),
            Map.entry(".ico", "image/x-icon"),
            Map.entry(".jpeg", "image/jpeg"),
            Map.entry(".jpg", "image/jpeg"),
            Map.entry(".js", "text/javascript; charset=utf-8"),
            Map.entry(".json", "application/json; charset=utf-8"),
            Map.entry(".map", "application/json; charset=utf-8"),
            Map.entry(".png", "image/png"),
            Map.entry(".svg", "image/svg+xml"),
            Map.entry(".ttf", "font/ttf"),
            Map.entry(".woff", "font/woff"),
            Map.entry(".woff2", "font/woff2")
    );

    private SiteServer() {
    }

    public static void main(String[] args) throws IOException {
        int port = Integer.parseInt(System.getProperty("server.port", "8080"));
        Path siteRoot = Path.of(System.getProperty("site.root", ".")).toRealPath();

        HttpServer server = HttpServer.create(new InetSocketAddress("127.0.0.1", port), 0);
        server.createContext("/", exchange -> serveFile(exchange, siteRoot));
        server.start();

        System.out.println("Serving " + siteRoot + " at http://localhost:" + port);
        System.out.println("Press Ctrl+C to stop the server.");
    }

    private static void serveFile(HttpExchange exchange, Path siteRoot) throws IOException {
        String method = exchange.getRequestMethod();
        if (!method.equals("GET") && !method.equals("HEAD")) {
            exchange.getResponseHeaders().set("Allow", "GET, HEAD");
            exchange.sendResponseHeaders(405, -1);
            exchange.close();
            return;
        }

        String requestedPath = exchange.getRequestURI().getPath();
        if (requestedPath.equals("/")) {
            requestedPath = "/index.html";
        }

        Path requestedFile = siteRoot.resolve(requestedPath.substring(1)).normalize();
        if (!requestedFile.startsWith(siteRoot)) {
            sendNotFound(exchange);
            return;
        }

        if (!Files.exists(requestedFile)) {
            sendNotFound(exchange);
            return;
        }

        Path realFile = requestedFile.toRealPath();
        if (!realFile.startsWith(siteRoot) || !Files.isRegularFile(realFile)) {
            sendNotFound(exchange);
            return;
        }

        exchange.getResponseHeaders().set("Content-Type", contentType(realFile));
        exchange.getResponseHeaders().set("X-Content-Type-Options", "nosniff");
        long fileSize = Files.size(realFile);
        if (method.equals("HEAD")) {
            exchange.getResponseHeaders().set("Content-Length", Long.toString(fileSize));
        }
        exchange.sendResponseHeaders(200, method.equals("HEAD") ? -1 : fileSize);

        if (method.equals("GET")) {
            try (var responseBody = exchange.getResponseBody()) {
                Files.copy(realFile, responseBody);
            }
        } else {
            exchange.close();
        }
    }

    private static String contentType(Path file) {
        String fileName = file.getFileName().toString().toLowerCase(Locale.ROOT);
        int extensionIndex = fileName.lastIndexOf('.');
        if (extensionIndex >= 0) {
            String contentType = CONTENT_TYPES.get(fileName.substring(extensionIndex));
            if (contentType != null) {
                return contentType;
            }
        }
        return "application/octet-stream";
    }

    private static void sendNotFound(HttpExchange exchange) throws IOException {
        byte[] response = "Not found".getBytes(java.nio.charset.StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", "text/plain; charset=utf-8");
        exchange.sendResponseHeaders(404, response.length);
        try (var responseBody = exchange.getResponseBody()) {
            responseBody.write(response);
        }
    }
}
