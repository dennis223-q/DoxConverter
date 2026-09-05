const cards = document.querySelectorAll(".card:not(.disabled)");
const form = document.getElementById("form");
const file = document.getElementById("file");
const drop = document.getElementById("drop");
const filename = document.getElementById("filename");
const title = document.getElementById("title");
const description = document.getElementById("description");
const convert = document.getElementById("convert");
const status = document.getElementById("status");

let tool = "pdf-to-word";

const config = {
  "pdf-to-word": {
    title: "PDF to Word",
    description: "Upload a PDF and turn it into an editable Word document.",
    accept: ".pdf",
    button: "Convert to Word"
  },
  "pdf-to-excel": {
    title: "PDF to Excel",
    description: "Extract detected tables from a PDF into an Excel spreadsheet.",
    accept: ".pdf",
    button: "Convert to Excel"
  },
  "word-to-pdf": {
    title: "Word to PDF",
    description: "Upload a DOC or DOCX file and convert it to PDF.",
    accept: ".doc,.docx",
    button: "Convert to PDF"
  }
};

function setTool(next) {
  tool = next;
  const c = config[next];
  title.textContent = c.title;
  description.textContent = c.description;
  file.accept = c.accept;
  convert.textContent = c.button;
  file.value = "";
  filename.textContent = "No file selected";
  status.textContent = "";
  status.className = "";
  cards.forEach(x => x.classList.toggle("selected", x.dataset.tool === next));
}

cards.forEach(card => card.addEventListener("click", () => setTool(card.dataset.tool)));

file.addEventListener("change", () => {
  filename.textContent = file.files[0] ? file.files[0].name : "No file selected";
});

["dragenter","dragover"].forEach(e => drop.addEventListener(e, ev => {
  ev.preventDefault(); drop.classList.add("over");
}));
["dragleave","drop"].forEach(e => drop.addEventListener(e, ev => {
  ev.preventDefault(); drop.classList.remove("over");
}));
drop.addEventListener("drop", ev => {
  if (ev.dataTransfer.files.length) {
    file.files = ev.dataTransfer.files;
    filename.textContent = file.files[0].name;
  }
});

form.addEventListener("submit", async e => {
  e.preventDefault();
  status.className = "";
  status.textContent = "";

  if (!file.files.length) {
    status.className = "error";
    status.textContent = "Please select a file first.";
    return;
  }
  if (file.files[0].size > 50 * 1024 * 1024) {
    status.className = "error";
    status.textContent = "File is larger than the 50 MB limit.";
    return;
  }

  convert.disabled = true;
  convert.textContent = "Converting…";
  status.textContent = "Uploading and converting your file…";

  try {
    const data = new FormData();
    data.append("file", file.files[0]);

    const response = await fetch(`/api/${tool}`, { method: "POST", body: data });
    if (!response.ok) {
      const json = await response.json().catch(() => ({}));
      throw new Error(json.error || "Conversion failed.");
    }

    const blob = await response.blob();
    const disposition = response.headers.get("Content-Disposition") || "";
    const match = disposition.match(/filename="?([^"]+)"?/i);
    const name = match ? match[1] : `converted-${tool}.bin`;

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    status.className = "success";
    status.textContent = "Done — your converted file has been downloaded.";
  } catch (err) {
    status.className = "error";
    status.textContent = err.message;
  } finally {
    convert.disabled = false;
    convert.textContent = config[tool].button;
  }
});
