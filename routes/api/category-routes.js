const router = require("express").Router();
const { Category, Product } = require("../../models");

// The `/api/categories` endpoint

router.get("/", async (req, res) => {
  // find all categories
  // be sure to include its associated Products
  try {
    const allCats = await Category.findAll({
      include: [{ model: Product }],
    });
    res.status(200).json(allCats);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/:id", async (req, res) => {
  // find one category by its `id` value
  // be sure to include its associated Products
  try {
    const idCat = await Category.findByPk(req.params.id, {
      include: [{ model: Product }],
    });
    res.status(200).json(idCat);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post("/", async (req, res) => {
  // create a new category
  try {
    const newCat = await Category.create({
      category_name: req.body.category_name,
    });
    res.status(200).json(newCat);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.put("/:id", async (req, res) => {
  // update a category by its `id` value
  try {
    const updCat = await Category.update(
      {
        category_name: req.body.category_name,
      },
      {
        where: {
          id: req.params.id,
        },
      }
    );
    res.status(200).json(updCat);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.delete("/:id", async (req, res) => {
  // delete a category by its `id` value
  try {
    const delCat = await Category.destroy({
      where: {
        id: req.params.id,
      },
    });
    res.status(200).json(delCat);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
