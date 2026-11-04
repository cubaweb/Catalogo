const express = require('express');
const movieController = require('../controllers/movieController');
const { requireAuth } = require('../middlewares/auth');
const validators = require('../middlewares/validators');

const router = express.Router();

router.use(requireAuth);

router.get('/', movieController.index);
router.get('/new', movieController.newForm);
router.post('/', validators.movie, movieController.create);

router.get('/:id', validators.movieId, movieController.show);
router.get('/:id/edit', validators.movieId, movieController.editForm);
router.put('/:id', validators.movieId, validators.movie, movieController.update);
router.delete('/:id', validators.movieId, movieController.destroy);

module.exports = router;
