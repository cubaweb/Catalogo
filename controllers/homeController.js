exports.index = (req, res) => {
  if (req.user) {
    return res.redirect('/movies');
  }
  res.render('index', { title: null });
};

exports.health = (req, res) => {
  res.json({ status: 'ok' });
};
