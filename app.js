const express = require('express')
const path = require('path')

const app = express()
app.use(express.json())

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const dbPath = path.join(__dirname, 'moviesData.db')

let db = null

const intilizeDatabaseAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })

    app.listen(3000, () => {
      console.log(`Server Running at http://localhost:3000`)
    })
  } catch (e) {
    console.log(`Db Error ${e.message}`)
    process.exit(1)
  }
}

intilizeDatabaseAndServer()

//Get movie API
app.get('/movies/', async (request, response) => {
  const getMoviesQuery = `
    SELECT
        *
    FROM
        movie;`
  const moviesArray = await db.all(getMoviesQuery)
  response.send(moviesArray)
})

//Add movie API
app.post('/movies/', async (request, response) => {
  const getDetails = request.body
  const {directorId, movieName, leadActor} = getDetails
  const addMovieQuery = `
  INSERT INTO 
      movie(director_id, movie_name, lead_actor)
  VALUES(
    ${directorId},
    '${movieName}',
    '${leadActor}'
  );`
  const dbResponse = await db.run(addMovieQuery)
  response.send('Movie Successfully Added')
})

//Get movie API
app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getMovieQuery = `
  SELECT 
    *
  FROM
      movie
  WHERE
   movie_id = ${movieId};`
  const movie = await db.get(getMovieQuery)
  const {movie_id, director_id, movie_name, lead_actor} = movie
  const dbResponse = {
    movieId: movie_id,
    directorId: director_id,
    movieName: movie_name,
    leadActor: lead_actor,
  }
  response.send(dbResponse)
})

//update movie API
app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getBody = request.body
  const {directorId, movieName, leadActor} = getBody
  const updateMovieQuery = `
  UPDATE
    movie
  SET 
    director_id:${directorId},
    movie_name: '${movieName}',
    lead_actor: '${leadActor}'
  WHERE
    director_id = ${movieId} ;`
  await db.run(updateMovieQuery)
  response.send('Movie Details Updated')
})

//Delete movie API
app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deleteMovieQuery = `
    DELETE
      FROM movie
    WHERE
      movie_id = ${movieId};`
  await db.run(deleteMovieQuery)
  response.send('Movie Removed')
})

//Get movie API
app.get('/directors/', async (request, response) => {
  const getDirectorQuery = `
    select
        *
    From
       director;`
  const moviesArray = await db.all(getDirectorQuery)
  response.send(moviesArray)
})

//Get movie API

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const getDirectorQuery = `
    SELECT
        movie_name
    FROM
        movie joins director on movie.director_id = director.director_id
    WHERE director_id = ${directorId};`
  const director = await db.get(getDirectorQuery)
  const {movie_name} = director
  const dbResponse = {
    movieName: movie_name,
  }
  response.send(dbResponse)
})

module.exports = app
