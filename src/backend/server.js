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

// 🔥 DB ni auth ga ulash
server.db = router.db;

// 🔥 Middleware tartibi MUHIM
server.use(middlewares);
server.use(auth);

// ================= CUSTOM ROUTE =================
// ⚠️ Routerdan OLDIN bo‘lishi shart
server.get("/users", (req, res) => {
    const { search } = req.query;

    let users = server.db.get("users").value();

    if (search) {
        const lowerSearch = search.toLowerCase();

        users = users.filter(user =>
            (user.name && user.name.toLowerCase().includes(lowerSearch)) ||
            (user.email && user.email.toLowerCase().includes(lowerSearch))
        );
    }

    res.json({ users });
});
// =================================================

// 🔥 Router ENG OXIRIDA bo‘lishi shart
server.use(router);

const PORT = 5000;
server.listen(PORT, () => {
    console.log(`\n✅ JSON Server running on http://localhost:${PORT}`);
    console.log(`🔐 Auth enabled\n`);
});