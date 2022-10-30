const router = require("express").Router();
const { Product, Category, Tag, ProductTag } = require("../../models");

// The `/api/products` endpoint

// get all products
router.get("/", async (req, res) => {
  // find all products
  // be sure to include its associated Category and Tag data
  try {
    const allProds = await Product.findAll({
      include: [{ model: Category }, { model: Tag }],
    });
    res.status(200).json(allProds);
  } catch (err) {
    res.status(500).json(err);
  }
});

// get one product
router.get("/:id", async (req, res) => {
  // find a single product by its `id`
  // be sure to include its associated Category and Tag data
  try {
    const oneProd = await Product.findByPk(req.params.id, {
      include: [{ model: Category }, { model: Tag }],
    });
    res.status(200).json(oneProd);
  } catch (err) {
    res.status(500).json(err);
  }
});

// create new product
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
      // if no product tags, just respond
      res.status(200).json(product);
    })
    .then((productTagIds) => res.status(200).json(productTagIds))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

// update product
router.put("/:id", (req, res) => {
  // update product data
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
      // console.log(err);
      res.status(400).json(err);
    });
});

router.delete("/:id", async (req, res) => {
  // delete one product by its `id` value
  try {
    const delProd = await Product.destroy({
      where: {
        id: req.params.id,
      },
    });
    res.status(200).json(delProd);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
