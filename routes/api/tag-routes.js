const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

router.get('/', (req, res) => {
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

router.get('/:id', (req, res) => {
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

router.post('/', (req, res) => {
  // create a new tag
  Tag.create(req.body)
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

router.put('/:id', (req, res) => {
  // update a tag's name by its `id` value
});

router.delete('/:id', (req, res) => {
  // delete on tag by its `id` value
});

module.exports = router;
