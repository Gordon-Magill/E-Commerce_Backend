const router = require("express").Router();
const { Product, Category, Tag, ProductTag } = require("../../models");

// The `/api/products` endpoint

// Get all existing products
router.get("/", async (req, res) => {
  
  try {
    // Find all products
    const allProds = await Product.findAll({
      include: [{ model: Category }, { model: Tag }], // Include associated categories and tags
    });
    // Respond with all queried content
    res.status(200).json(allProds);
  } catch (err) {
    // Send back the error if one is thrown
    res.status(500).json(err);
  }
});

// Get one product by ID
router.get("/:id", async (req, res) => {

  try {
    // Get one product by ID
    const oneProd = await Product.findByPk(req.params.id, {
      include: [{ model: Category }, { model: Tag }], // Include associated categories and tags
    });
    // Respond with queried content
    res.status(200).json(oneProd);
  } catch (err) {
    // Send back the error if one is thrown
    res.status(500).json(err);
  }
});



// Create a new product
router.post("/", (req, res) => {
  /* req.body should look like this...
    {
      product_name: "Basketball",
      price: 200.00,
      stock: 3,
      tagIds: [1, 2, 3, 4]
    }
  */
  Product.create(req.body)
    .then((product) => {
      // if there's product tags, we need to create pairings to bulk create in the ProductTag model
      if (req.body.tagIds.length) {
        const productTagIdArr = req.body.tagIds.map((tag_id) => {
          return {
            product_id: product.id,
            tag_id,
          };
        });
        return ProductTag.bulkCreate(productTagIdArr);
      }

      // Respond with all new content if no tagIds were defined
      res.status(200).json(product);
    })
    .then((productTagIds) => res.status(200).json(productTagIds)) //Respond with all created content if tagId's were defined
    .catch((err) => {
      // Send back the error if one is thrown
      console.log(err);
      res.status(400).json(err);
    });
});



// Update existing product
router.put("/:id", (req, res) => {
  // Update the product as specified by req.params.id
  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((product) => {
      // find all associated tags from ProductTag
      return ProductTag.findAll({ where: { product_id: req.params.id } });
    })
    .then((productTags) => {
      // get list of current tag_ids for the product
      const productTagIds = productTags.map(({ tag_id }) => tag_id);

      // create filtered list of new tag_ids
      const newProductTags = req.body.tagIds
        // Keep just those tag_id's that aren't already included for the given product
        .filter((tag_id) => !productTagIds.includes(tag_id))
        // ...and create an array of new objects that define new ProductTags
        .map((tag_id) => {
          return {
            product_id: req.params.id,
            tag_id,
          };
        });

      // figure out which ones to remove
      const productTagsToRemove = productTags
        // Select any ProductTag objects that aren't included in the new list of tag_id's for the updated product
        .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
        // ...and create an array of id's of those ProductTag's
        .map(({ id }) => id);

      // run both actions
      return Promise.all([
        ProductTag.destroy({ where: { id: productTagsToRemove } }),
        ProductTag.bulkCreate(newProductTags),
      ]);
    })
    .then((updatedProductTags) => res.json(updatedProductTags))
    .catch((err) => {
      // Send back the error if one is thrown
      console.log(err);
      res.status(400).json(err);
    });
});

// Deleting products
router.delete("/:id", async (req, res) => {

  try {
    // Delete product based on ID
    const delProd = await Product.destroy({
      where: {
        id: req.params.id,
      },
    });
    // Respond with confirmation of deletion
    res.status(200).json(delProd);
  } catch (err) {
    // Send back the error if one is thrown
    res.status(500).json(err);
  }
});

module.exports = router;
