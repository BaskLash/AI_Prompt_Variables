const router = require('express').Router();
const c = require('../controllers/promptController');

router.get('/', c.list);
router.get('/:id', c.get);
router.post('/', c.create);
router.put('/:id', c.update);
router.delete('/:id', c.remove);
router.post('/:id/duplicate', c.duplicate);
router.post('/:id/render', c.render);

module.exports = router;
