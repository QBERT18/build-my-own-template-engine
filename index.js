const fs = require("fs");
const path = require("path");
const prettier = require("prettier");

const filename = "index.html";
const filePath = path.join(__dirname, filename);

const output = "./output-index.html";

var TemplateEngine = function (template, data) {
  var regex = /<%([^%>]+)?%>/g;
  var reExp = /(^( )?(if|for|else|switch|case|break|{|}))(.*)?/g;
  var code = "var r=[];\n";
  var cursor = 0;

  var add = function (line, isCode) {
    isCode
      ? (code += line.match(reExp) ? `${line}\n` : `r.push(${line});\n`) // If the line matches the `reExp` regex, add it directly to `code` with a newline; otherwise, push the line into `r`
      : (code += `r.push("${line.replace(/"/g, '\\"')}");\n`); // If `isCode` is false, escape quotes in the line and push it as a string into `r`
  };

  while ((match = regex.exec(template))) {
    add(template.slice(cursor, match.index), false); // Add the portion of the template before the current match to the result array
    add(match[1], true); // Add the matched template content (the code inside <% %>) to the result array
    cursor = match.index + match[0].length; // Update the cursor position to skip over the matched part, so the next match can be found
  }
  add(template.substr(cursor, template.length - cursor), false); // Add the remaining part of the template (after the last match) to the result array
  code += 'return r.join("");'; // Join all the parts and return the final rendered string

  return new Function(code.replace(/(\r\n|\n|\r)/g, "")).apply(data); // Create a new function from the generated code, removing newlines and applying the provided data
};

fs.readFile(filePath, "utf8", (err, template) => {
  if (err) {
    console.error("Error reading the file:", err);
    return;
  }

  const html = TemplateEngine(template, {
    showSkills: true,
    skills: ["JavaScript", "HTML", "CSS", "Node.js"],
    level: "Intermediate",
    isProfessional: true,
    contactEmail: "example@example.com",
    phoneNumber: "123-456-7890",
  });

  prettier.format(html, { parser: "html" }).then((data) => {
    writeFile(data);
  });
});

async function writeFile(content) {
  fs.writeFile(output, content, "utf8", (err) => {
    if (err) {
      console.error("Error writing to file:", err);
    } else {
      console.log("File has been written successfully!");
    }
  });
}
