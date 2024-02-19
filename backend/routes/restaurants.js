const express = require("express");
const router = express.Router();
const supabaseProvider = require("../provider/supabase");

router.get("/", async (_req, res) => {
  const { data } = await supabaseProvider.from("restaurants").select("*");

  res.json(data);
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  const { data } = await supabaseProvider.from("restaurants").select("*").eq("id", id);
  const restaurant = data.length > 0 ? data[0] : undefined;

  if (!restaurant) {
    res.sendStatus(404);
    return;
  }

  res.json(restaurant);
});

router.post("/", async (req, res) => {
  const { body } = req;
  const { name } = body;

  const { data, error } = await supabaseProvider.from("restaurants").insert([{ name }]).select();

  if (error || data.length !== 1) {
    res.status(400).send({ error });
    return;
  }

  res.json(data[0]);
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  const { error } = await supabaseProvider.from("restaurants").delete().match({ id });

  if (error) {
    res.status(404).send({ error });
    return;
  }

  res.sendStatus(200);
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { newName } = req.body;

  const { error } = await supabaseProvider.from("restaurants")
    .update({ name: newName })
    .match({ id });

  if (error) {
    res.status(404).send({ error });
    return;
  }

  res.sendStatus(200);
});

exports.router = router;
