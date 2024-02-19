const express = require("express");
const router = express.Router();
const supabaseProvider = require("../provider/supabase");
const flattenObject = require("../utils/flattenObject");

router.get("/", async (_req, res) => {
  const { data } = await supabaseProvider.from("starred_restaurants").select(`
		id,
		comment,
		restaurants (
			id,
			name
		)
	`);

  const flattenedData = data.map((record) => flattenObject(record));

  res.json(flattenedData);
});

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  const { data } = await supabaseProvider.from("starred_restaurants").select("*").eq("id", id);
  const restaurant = data.length > 0 ? data[0] : undefined;

  if (!restaurant) {
    res.sendStatus(404);
    return;
  }

  res.json(restaurant);
});

router.post("/", async (req, res) => {
  const { body } = req;
  const { id } = body;

  const { data: restaurantData } = await supabaseProvider.from("restaurants")
    .select("*")
    .eq("id", id);
  const restaurant = restaurantData.length > 0 ? restaurantData[0] : undefined;

  if (!restaurant) {
    res.sendStatus(404);
    return;
  }

  const { data, error } = await supabaseProvider.from("starred_restaurants").insert([
    { restaurantId: id, comment: null }]).select(`
		id,
		comment,
		restaurants (
			id,
			name
		)
	`);

  if (error || data.length !== 1) {
    res.status(400).send({ error });
    return;
  }

  res.json(flattenObject(data[0]));
});

router.delete("/:id", async (req, res) => {
  const { id } = req.params;

  const { error } = await supabaseProvider.from("starred_restaurants")
    .delete()
    .match({ id: id });

  if (error) {
    res.status(404).send({ error });
    return;
  }

  res.sendStatus(200);
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { newComment } = req.body;

  const { error } = await supabaseProvider.from("starred_restaurants")
    .update({ comment: newComment })
    .match({ id: id });
  if (error) {
    res.status(404).send({ error });
    return;
  }

  res.sendStatus(200);
});

module.exports = router;