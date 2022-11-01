const router = require("express").Router();
const { Tag, Product, ProductTag } = require("../../models");

// The `/api/tags` endpoint

// Get all tags
router.get("/", async (req, res) => {

  try {
    // Get all tags
    const allTags = await Tag.findAll({
      include: [{ model: Product }], // Include associated products
    });
    // Respond with all queried content
    res.status(200).json(allTags);
  } catch (err) {
    // Send back the error if one is thrown
    res.status(500).json(err);
  }
});


// Get a tag by ID
router.get("/:id", async (req, res) => {
  try {
    // Get a tag by ID
    const oneTag = await Tag.findByPk(req.params.id, {
      include: [{ model: Product }], // Include associated products
    });
    // Respond with all queried content
    res.status(200).json(oneTag);
  } catch (err) {
    // Send back the error if one is thrown
    res.status(500).json(err);
  }
});


// Create a new tag (and any associated new ProductTags)
router.post("/", async (req, res) => {
    /* req.body should look like this...
    {
      tag_name: "Sports",
      prodIds: [1, 2, 3, 4]
    }
  */

  try {
    // Create a new tag
    const newTag = await Tag.create({
      tag_name: req.body.tag_name,
    });

    // If there are any defined new product ID's...
    if (req.body.prodIds.length) {
      // Create an array of objects that define new ProductTag entities
      const productTagIdArr = req.body.prodIds.map((product_id) => {
        return {
          product_id,
          tag_id: newTag.id,
        };
      });
      // Create the actual ProductTag entries based on the generated array
      ProductTag.bulkCreate(productTagIdArr);
    }

    // Respond with the created tag only
    res.status(200).json(newTag);
  } catch (err) {
    // Send back the error if one is thrown
    console.log(err);
    res.status(400).json(err);
  }
});



router.put("/:id", async (req, res) => {
  /* req.body should look like this...
    {
      tag_name: "Sports",
      prodIds: [1, 2, 3, 4]
    }
  */

  try {
    // Update Tag by ID
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

    // Get all ProductTags associated with the tag being modified
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

    // Respond back with the updated tag
    res.status(200).json(updTag);
  } catch (err) {
    // Send back the error if one is thrown
    res.status(500).json(err);
  }
});

// Delete tag by id value
router.delete("/:id", async (req, res) => {

  try {
    // Delete tag by id value
    const delTag = await Tag.destroy({
      where: {
        id: req.params.id,
      },
    });
    // Respond with deletion confirmation
    res.status(200).json(delTag);
  } catch (err) {
    // Send back the error if one is thrown
    res.status(500).json(err);
  }
});

module.exports = router;
