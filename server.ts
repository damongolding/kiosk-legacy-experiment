const server = Bun.serve({
  port: 4000,
  async fetch(req) {
    const url = new URL(req.url);
    const filePath = `./dist${url.pathname === "/" ? "/index.html" : url.pathname}`;

    const file = Bun.file(filePath);

    // Check if file exists
    if (await file.exists()) {
      return new Response(file);
    }

    // 404 if not found
    return new Response("Not Found", { status: 404 });
  },
});

console.log(`Server running at http://localhost:${server.port}`);
