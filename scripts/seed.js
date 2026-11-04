const config = require('../config');
const db = require('../config/database');
const User = require('../models/User');
const Movie = require('../models/Movie');
const { initDatabase } = require('../config/init');

const movies = [
  {
    title: 'Parásitos',
    director: 'Bong Joon-ho',
    year: 2019,
    genre: 'Suspenso',
    rating: 8.5,
    duration: 132,
    synopsis: 'Una familia sin recursos se infiltra poco a poco en la vida de una familia adinerada, con consecuencias que nadie esperaba.'
  },
  {
    title: 'El viaje de Chihiro',
    director: 'Hayao Miyazaki',
    year: 2001,
    genre: 'Animación',
    rating: 8.6,
    duration: 125,
    synopsis: 'Una niña queda atrapada en un mundo de espíritus y debe trabajar en unas termas para rescatar a sus padres.'
  },
  {
    title: 'Blade Runner 2049',
    director: 'Denis Villeneuve',
    year: 2017,
    genre: 'Ciencia ficción',
    rating: 8.0,
    duration: 164,
    synopsis: 'Un nuevo agente descubre un secreto enterrado que podría arrastrar a la sociedad al caos y lo lleva a buscar a un antiguo cazador de replicantes.'
  },
  {
    title: 'El padrino',
    director: 'Francis Ford Coppola',
    year: 1972,
    genre: 'Crimen',
    rating: 9.2,
    duration: 175,
    synopsis: 'El patriarca de una familia mafiosa traspasa el control de su imperio a su hijo más reservado.'
  },
  {
    title: 'Amélie',
    director: 'Jean-Pierre Jeunet',
    year: 2001,
    genre: 'Romance',
    rating: 8.3,
    duration: 122,
    synopsis: 'Una joven parisina decide mejorar en secreto la vida de quienes la rodean mientras busca su propio camino hacia el amor.'
  },
  {
    title: 'Mad Max: Furia en el camino',
    director: 'George Miller',
    year: 2015,
    genre: 'Acción',
    rating: 8.1,
    duration: 120,
    synopsis: 'En un desierto devastado, una guerrera y un fugitivo huyen de un tirano a bordo de un camión blindado.'
  },
  {
    title: 'La La Land',
    director: 'Damien Chazelle',
    year: 2016,
    genre: 'Romance',
    rating: 8.0,
    duration: 128,
    synopsis: 'Una aspirante a actriz y un pianista de jazz persiguen sus sueños en Los Ángeles mientras su relación se pone a prueba.'
  },
  {
    title: 'Whiplash',
    director: 'Damien Chazelle',
    year: 2014,
    genre: 'Drama',
    rating: 8.5,
    duration: 107,
    synopsis: 'Un joven baterista ingresa a un conservatorio de élite y queda bajo la presión de un profesor implacable.'
  },
  {
    title: 'El laberinto del fauno',
    director: 'Guillermo del Toro',
    year: 2006,
    genre: 'Fantasía',
    rating: 8.2,
    duration: 118,
    synopsis: 'En la España de posguerra, una niña descubre un laberinto habitado por criaturas fantásticas y tres pruebas que debe superar.'
  },
  {
    title: 'Coco',
    director: 'Lee Unkrich',
    year: 2017,
    genre: 'Animación',
    rating: 8.4,
    duration: 105,
    synopsis: 'Un niño que sueña con ser músico viaja a la Tierra de los Muertos para descubrir la historia de su familia.'
  },
  {
    title: 'Interestelar',
    director: 'Christopher Nolan',
    year: 2014,
    genre: 'Ciencia ficción',
    rating: 8.7,
    duration: 169,
    synopsis: 'Un grupo de astronautas atraviesa un agujero de gusano en busca de un nuevo hogar para la humanidad.'
  },
  {
    title: 'Perfect Blue',
    director: 'Satoshi Kon',
    year: 1997,
    genre: 'Suspenso',
    rating: 8.0,
    duration: 81,
    synopsis: 'Una cantante que abandona su grupo para convertirse en actriz empieza a perder la línea entre la realidad y la ficción.'
  },
  {
    title: 'Fresa y chocolate',
    director: 'Tomás Gutiérrez Alea',
    year: 1993,
    genre: 'Drama',
    rating: 7.8,
    duration: 110,
    synopsis: 'En La Habana de los años noventa, la amistad entre un joven universitario y un artista homosexual desafía prejuicios y consignas.'
  }
];

async function seed() {
  if (!config.adminEmail || !config.adminPassword) {
    throw new Error('Define ADMIN_EMAIL y ADMIN_PASSWORD para cargar los datos de ejemplo');
  }

  await initDatabase();

  const admin = await User.ensureAdmin({
    name: config.adminName,
    email: config.adminEmail,
    password: config.adminPassword
  });

  if ((await Movie.countByUser(admin.id)) > 0) {
    console.log('El administrador ya tiene películas. No se agregó nada.');
    return;
  }

  for (const movie of movies) {
    await Movie.create(admin, movie);
  }
  console.log(`Se agregaron ${movies.length} películas de ejemplo.`);
}

seed()
  .catch((err) => {
    console.error(err.message);
    process.exitCode = 1;
  })
  .finally(() => db.pool.end());
