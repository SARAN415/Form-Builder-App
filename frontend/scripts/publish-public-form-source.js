const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");
const sourceDirectory = path.join(projectRoot, "public", "source");

fs.mkdirSync(sourceDirectory, { recursive: true });

fs.copyFileSync(
    path.join(projectRoot, "src", "Component", "PublicForm.js"),
    path.join(sourceDirectory, "PublicForm.js")
);

fs.copyFileSync(
    path.join(projectRoot, "src", "Style", "PublicForm.css"),
    path.join(sourceDirectory, "PublicForm.css")
);