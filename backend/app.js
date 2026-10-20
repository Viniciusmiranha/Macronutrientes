
const express = require("express");
const app = express();

app.get("/", (req, res) => {
    res.send("SEJA BEM-VINDO AO NUTRIQ!");
});

app.get("/artigos/:id", function(req, res) => {
  if (req.params.id == 1) {
    res.send("Artigo 1: Dicas de alimentação saudável");
  });

app.listen(8081, () => {
    console.log("Servidor NUTRIQ rodando em http://localhost:8081");
});
