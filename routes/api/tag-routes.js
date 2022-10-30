const router = require("express").Router();
const { Tag, Product, ProductTag } = require("../../models");

// The `/api/tags` endpoint

router.get("/", async (req, res) => {
  // find all tags
  // be sure to include its associated Product data
  try {
    const allTags = await Tag.findAll({
      include: [{ model: Product }],
    });
    res.status(200).json(allTags);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get("/:id", async (req, res) => {
  // find a single tag by its `id`
  // be sure to include its associated Product data
  try {
    const oneTag = Tag.findByPk(req.params.id, {
      include: [{ model: Product }],
    });
    res.status(200).json(oneTag);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post("/", async (req, res) => {
  // create a new tag
  try {
    const newTag = await Tag.create({
      tag_name: req.body.tag_name,
    });

    if (req.body.prodIds.length) {
      const productTagIdArr = req.body.prodIds.map((product_id) => {
        return {
          product_id,
          tag_id: newTag.id,
        };
      });
      return ProductTag.bulkCreate(productTagIdArr);
    }

    // In the case of no products to tag, just return the bare tag
    res.status(200).json(newTag);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.put("/:id", async (req, res) => {
  /* req.body should look like this...
    {
      tag_name: "Sports",
      prodIds: [1, 2, 3, 4]
    }
  */

  // update a tag's name by its `id` value
  try {
    // Update the target tag's name (the only parameter that can be updated)
    const updTag = await Tag.update(
      {
        tag_name: req.body.tag_name,
      },
      {
        where: {
          id: req.params.id,
        },
      }
    );

    // Get all ProductTag's associated with the tag being modified
    const associatedProductTags = await ProductTag.findAll({
      where: {
        tag_id: req.params.id,
      },
    });

    // Get all Product id's associated with the tag being modified
    const tagProductIds = associatedProductTags.map(
      ({ product_id }) => product_id
    );

    // Find any new Product Id's that weren't already associated with the tag
    const newTagProducts = req.body.prodIds
      // Keep just those product_ids that weren't already included for the given tag
      .filter((product_id) => !tagProductIds.includes(product_id))
      // ...and create an array of objects that define new ProductTags
      .map((product_id) => {
        return {
          product_id,
          tag_id: req.params.id,
        };
      });

    // Find the complement set of Product Id's that are not associated with the updated tag
    const tagProductsToRemove = associatedProductTags
      // Select any ProductTag objects that aren't included in the list of product_id's
      .filter(({ product_id }) => !req.body.prodIds.includes(product_id))
      // ...and get the id's of those ProductTag's
      .map(({ id }) => id);

    // Destroy any ProductTags that are no longer relevant and create the new ones if they didn't already exist
    const completedActions = Promise.all([
      ProductTag.destroy({
        where: {
          id: tagProductsToRemove,
        },
      }),
      ProductTag.bulkCreate(newTagProducts),
    ]);

    res.status(200).json(completedActions);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.delete("/:id", async (req, res) => {
  // delete on tag by its `id` value
  try {
    const delTag = await Tag.destroy({
      where: {
        id: req.params.id,
      },
    });
    res.status(200).json(delTag);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
