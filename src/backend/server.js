import { createRequire } from "module";
const require = createRequire(import.meta.url);

const jsonServer = require("json-server");
const auth = require("json-server-auth");
const path = require("path");
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, "db.json"));
const middlewares = jsonServer.defaults();
const rules = auth.rewriter({
    users: 600,
});

server.use(middlewares);
server.use(rules);
server.db = router.db;
server.use(auth);
server.use(router);

const PORT = 5000;
server.listen(PORT, () => {
    console.log(`===JSON Server running on http://localhost:${PORT}===`);
});