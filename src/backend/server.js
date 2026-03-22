import { createRequire } from "module";
const require = createRequire(import.meta.url);

const jsonServer = require("json-server");
const auth = require("json-server-auth");
const path = require("path");
const jwt = require("jsonwebtoken");
const { JWT_SECRET_KEY } = require("json-server-auth/dist/constants");
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = jsonServer.create();
const router = jsonServer.router(path.join(__dirname, "db.json"));
const middlewares = jsonServer.defaults();

server.db = router.db;

server.use(middlewares);
server.use(auth);

// ================= CUSTOM ROUTE =================
server.get("/users/me", (req, res) => {
    const { authorization } = req.headers;

    if (!authorization) {
        return res.status(401).json({ message: "Missing authorization header" });
    }

    const [scheme, token] = authorization.split(" ");

    if (scheme !== "Bearer" || !token) {
        return res.status(401).json({ message: "Invalid authorization format" });
    }

    try {
        const claims = jwt.verify(token, JWT_SECRET_KEY);
        const user = server.db.get("users").find({ id: Number(claims.sub) }).value();

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const { password, ...userWithoutPassword } = user;
        return res.json({ user: userWithoutPassword });
    } catch (error) {
        return res.status(401).json({ message: "Invalid or expired token" });
    }
});

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

server.use(router);

const PORT = 5000;
server.listen(PORT, () => {
    console.log(`\nJSON Server running on http://localhost:${PORT}`);
    console.log(`Auth enabled\n`);
});
