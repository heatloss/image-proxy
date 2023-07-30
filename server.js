import express from 'express'
import http from 'http'
import fetch from 'node-fetch'
import sharp from 'sharp'
import apicache from 'apicache'

let cache = apicache.middleware

//create the web server
let app = express()
let server = http.createServer(app)
const port = process.env.PORT || 3000


app.get('/', (req, res)=>{
  const message = `
    Visit /proxy?url=<your image url here>&x=<pixel dimensions for x>&y=<pixel dimensions for y> to proxy.
    For example: 
  
  `
  res.end(message)
})

app.get('/proxy', cache('60 minutes'), async (req, res)=>{
  const url = req.query.url
  let original = await fetch(url)
  let original_buffer = Buffer.from(await original.arrayBuffer())
  
  let output
  
  if(req.query.x && req.query.y) {
    output = await sharp(original_buffer)
      .resize({
        width: parseInt(req.query.x), 
        height: parseInt(req.query.y),
        withoutEnlargement: true
      })
      .webp({ smartSubsample: true })
      .toBuffer()
  } else {
    output = await sharp(original_buffer)
      .webp({ smartSubsample: true, effort: 0 })
      .toBuffer()
  }
  res.setHeader('Content-Type', 'image/webp')
  return res.end(output)
})

app.get('/demo', async (req, res)=>{
  const url = req.query.url
  let original = await fetch(url)
  let original_buffer = Buffer.from(await original.arrayBuffer())
  
  const resized = await sharp(original_buffer)
    .resize(320, 240)
    .png()
    .toBuffer()
  
  res.setHeader('Content-Type', 'image/png')
  return res.end(resized)
})



//launch the server
server.listen(port, ()=>{
  console.log(`listening on port :${port}`)
})