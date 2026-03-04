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


// 2. DB ni auth ga bog'lash (JUDA MUHIM)
server.db = router.db;

const rules = auth.rewriter({
    users: 600,
    posts: 640
});

server.use(middlewares);
server.use(rules);
server.use(auth);
server.use(router);

const PORT = 5000;
server.listen(PORT, () => {
    console.log(`\n✅ JSON Server running on http://localhost:${PORT}`);
    console.log(`🔐 Auth enabled\n`);
});