import express from 'express';
import methodOverride from 'method-override';
import cookieParser from 'cookie-parser';
import { add, read, write } from './jsonFileStorage.js';

const app = express();
app.set('view engine', 'ejs');

// Serve up static CSS files in /public folder when called in ejs files
app.use('/public', express.static('public'));

// Configure Express to parse request body data into request.body
app.use(express.urlencoded({ extended: false }));

// Override POST requests with query param ?_method=PUT to be PUT requests
app.use(methodOverride('_method'));

// use cookie
app.use(cookieParser());

// Save new recipe data sent via POST request from our form
// app.post('/newsighting', (request, response) => {
//   // Add new recipe data in request.body to recipes array in data.json.
//   add('data.json', 'sightings', request.body, (err) => {
//     console.log(request.body);
//     if (err) {
//       response.status(500).send('DB write error.');
//       return;
//     }

//     // redirect to page
//     read('data.json', (err, data) => {
//       const { sightings } = data;
//       response.redirect(`/sightings/${sightings.length - 1}`);
//     });
//   });
// });

// Render the form to input new recipes
// app.get('/newsighting', (request, response) => {
//   response.render('fileNewSighting');
// });

// app.get('/index', (request, response) => {
//   read('data.json', (err, data) => {
//     const { sightings } = data;
//     response.render('index', { sightings });
//   });
// });

// Render a form that will create a new sighting.
app.get('/sighting', (req, res) => {
  res.render('sighting');
});

// Accept a POST request to create a new sighting.
// fix this so that it doesn't rewrite the entire json db
app.post('/sighting', (req, res) => {
  // Add new recipe data in request.body to recipes array in data.json.
  add('data.json', 'sightings', req.body, (err) => {
    console.log(req.body);
    if (err) {
      res.status(500).send('DB write error.');
    }

    res.send('Saved entry!');

    // redirect to sighting entry just added
    // read('data.json', (err, data) => {
    //   const { sightings } = data;
    //   response.redirect(`/sightings/${sightings.length - 1}`);
    // });
  });
});

// Render a single sighting.
app.get('/sighting/:index', (request, response) => {
  let sighting;
  const { index } = request.params;
  read('data.json', (err, data) => {
    if (err) { console.log(err, 'readError'); }

    sighting = data.sightings[index];
    // console.log('sighting', sighting);
    response.render('index', { sighting });
  });
});

// Render a list of sightings.
app.get('/', (req, res) => {
  console.log('request came in for index');
  let listings;
  let visitCounter = 1;

  read('data.json', (err, data) => {
    if (err) {
      console.log('computer says no');
    }

    listings = data.sightings;
    console.log('what are listings ', listings);

    console.log('read json success');
    if (req.cookies.visit) {
      console.log(req.cookies);
      visitCounter = Number(req.cookies.visit) + 1;
    }
    console.log('visit count: ', visitCounter);
    // shows up in response header, stored in browser
    res.cookie('visit', visitCounter);
    res.cookie('exit', 'here');

    res.render('listings', { listings, visitCounter });
  });
});

// Render a form to edit a sighting.
app.get('/sighting/:index/edit', (req, res) => {
  const { index } = req.params;

  read('data.json', (err, data) => {
    if (err) {
      res.status(500).send('DB read error.');
    }

    const sighting = data.sightings[index];
    sighting.index = index;
    res.render('edit', sighting);
  });
});

// Accept a request to edit a single sighting
app.put('/sighting/:index/edit', (req, res) => {
  // const { index } = req.params;

  console.log(req.body);
  const { index } = req.params;
  read('data.json', (err, data) => {
    // Replace the data in the object at the given index
    data.sightings[index] = req.body;
    write('data.json', data, (err) => {
      res.send('Done!');
    });
  });
});

// Render a single sighting to delete.
app.get('/sighting/:index/delete', (req, res) => {
  const { index } = req.params;

  read('data.json', (err, data) => {
    if (err) {
      res.status(500).send('DB write error.');
      return;
    }

    const sighting = data.sightings[index];
    sighting.index = index;
    res.render('delete', sighting);
  });
});

// Accept a request to delete a sighting.
app.delete('/sighting/:index/delete', (req, res) => {
  console.log('is this working');
  // Remove element from DB at given index
  const { index } = req.params;
  read('data.json', (err, data) => {
    data.sightings.splice(index, 1);
    console.log(data.sightings);
    write('data.json', data, (err) => {

    });
  });

  res.redirect('/');
});

// Render a list of sighting shapes.
app.get('/shapes', (req, res) => {
  // console.log('request came in for shapes');

  read('data.json', (err, data) => {
    if (err) {
      console.log('computer says no');
    }

    const shapesObj = {};
    const listings = data.sightings;
    for (let i = 0; i < listings.length; i++) {
      const ufoShape = listings[i].shape;

      if (!(ufoShape in shapesObj)) {
        shapesObj[ufoShape] = ufoShape;
      }
    }

    const shapes = Object.values(shapesObj);
    // console.log('what are ', shapes);
    res.render('shapes', { shapes });
  });
});

// Render a list of sightings that has one shape.
app.get('/shapes/:shape', (req, res) => {
  const { shape } = req.params;
  const currentShape = shape.toLowerCase();
  // const currentShapeSightings = [];

  console.log('currant ', currentShape);
  console.log('what are req param', req.params);
  console.log('current shape ', shape);
  read('data.json', (err, data) => {
    if (err) { console.log(err, 'readError'); }

    const listings = data.sightings;
    // console.log('entries: ', listings);
    // console.log('LISTING SHAPE', (listings[0].shape));

    // const isCurrentShape = (e) => e.shape === currentShape;

    console.log('current shaep is ', currentShape);

    const currentShapeSightings = listings.filter((e) => e.shape.toLowerCase() === currentShape);

    console.log('current shape sighting array ', currentShapeSightings);

    // create array for entries with same shape

    res.render('shape', { currentShapeSightings });
  });
});

// app.get('/sighting/:index', (request, response) => {
//   let sighting;
//   const { index } = request.params;
//   read('data.json', (err, data) => {
//     if (err) { console.log(err, 'readError'); }

//     sighting = data.sightings[index];
//     // console.log('sighting', sighting);
//     response.render('index', { sighting });
//   });
// });

app.listen(3004);
