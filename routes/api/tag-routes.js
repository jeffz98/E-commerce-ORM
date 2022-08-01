const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

router.get('/', async (req, res) => {
  // find all tags
  // be sure to include its associated Product data
  try {
    const tag_data = await Tag.findAll({
      include: [{model: Product}]
    });
    res.status(200).json(tag_data);
  } catch (err) {
      res.status(500).json(err);
  }
});

router.get('/:id', async (req, res) => {
  // find a single tag by its `id`
  // be sure to include its associated Product data
  try {
    const tag_data = await Tag.findByPk(req.params.id, {
      include: [{model: Product}]
    });
    if (!tag_data) {
      res.status(404).json({message: 'No tag found with that id.'});
      return;
    }
    res.status(200).json(tag_data);
  } catch (err) {
      res.status(500).json(err);
  }
});

router.post('/', async (req, res) => {
  // create a new tag
  await Tag.create(req.body)
    .then((tag) => {
      if (req.body.productIds.length) {
        const productIdMap = req.body.productIds.map((product_id) => {
          return {
            tag_id: tag.id,
            product_id,
          };
        });
        return ProductTag.bulkCreate(productIdMap);
      }
      res.status(200).json(tag);
    })
    .then((tagID) => res.status(200).json(tagID))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

router.put('/:id', async (req, res) => {
  // update a tag's name by its `id` value
  await Tag.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((tag) => {
      // find all associated tags from ProductTag
      return ProductTag.findAll({ where: {
         tag_id: req.params.id
      }});
    })
    .then((tagProds) => {
      // get list of current tag_ids
      const tagProdIds = tagProds.map(({ product_id }) => product_id);
      const newProductTags = req.body.productIds
        .filter((product_id) => !tagProdIds.includes(product_id))
        .map((product_id) => {
          return {
            tag_id: req.params.id,
            product_id,
          };
        });
      // figure out which ones to remove
      const productTagsToRemove = tagProds
        .filter(({ product_id }) => !req.body.productIds.includes(product_id))
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

router.delete('/:id', async (req, res) => {
  // delete on tag by its `id` value
});

module.exports = router;
