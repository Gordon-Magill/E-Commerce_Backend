const router = require("express").Router();
const { Category, Product } = require("../../models");

// The `/api/categories` endpoint

router.get("/", async (req, res) => {

  try {
    // Get all categories
    const allCats = await Category.findAll({
      include: [{ model: Product }], // with associated Products
    });
    // Respond back with queried content
    res.status(200).json(allCats);
  } catch (err) {
    // Send back the error if one is thrown
    res.status(500).json(err);
  }

});

router.get("/:id", async (req, res) => {
  
  try {
    // Find one category by ID
    const idCat = await Category.findByPk(req.params.id, {
      include: [{ model: Product }], // with associated products
    });
    // Respond back with queried content
    res.status(200).json(idCat);
  } catch (err) {
    // Send back the error if one is thrown
    res.status(500).json(err);
  }
});

router.post("/", async (req, res) => {
  
  try {
    // Create a new category
    const newCat = await Category.create({
      category_name: req.body.category_name,
    });
    // Respond back with created content
    res.status(200).json(newCat);
  } catch (err) {
    // Send back the error if one is thrown
    res.status(500).json(err);
  }
});

router.put("/:id", async (req, res) => {
  
  try {
    // Update category by ID
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
    // Respond back with updated content
    res.status(200).json(updCat);
  } catch (err) {
    // Send back the error if one is thrown
    res.status(500).json(err);
  }
});

router.delete("/:id", async (req, res) => {
  // Delete category by ID
  try {
    const delCat = await Category.destroy({
      where: {
        id: req.params.id,
      },
    });
    // Respond back with confirmation of deletion
    res.status(200).json(delCat);
  } catch (err) {
    // Send back the error if one is thrown
    res.status(500).json(err);
  }
});

module.exports = router;
