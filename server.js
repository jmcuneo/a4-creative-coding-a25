const express = require( 'express' ),
      app = express()

app.use( express.static( 'public' ))
app.use( express.json())
app.use( express.urlencoded({ extended:true }) )

const appdata = []

app.get( '/', (req,res) => {
  res.render( 'index' )
})

app.listen( process.env.PORT || 3000)	