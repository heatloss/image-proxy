import express from 'express'
import http from 'http'
import fetch from 'node-fetch'
import sharp from 'sharp'
import apicache from 'apicache'
import cors from 'cors'

let cache = apicache.middleware

//create the web server
let app = express()
let server = http.createServer(app)
const port = process.env.PORT || 3000

const corsOptions = {
  origin: ''
}

app.get('/', (req, res)=>{
  const message = `
    Visit /image/proxy?url=<your image url here>&x=<pixel dimensions for x>&y=<pixel dimensions for y> to proxy.
    Visit /url/proxy?url=<your url here> to add CORS headers
    
    For example: https://image-url-proxy.glitch.me/image/proxy?url=https://www.endcomic.com/wp-content/uploads/2023/06/31.png&x=600
  
  `
  res.end(message)
})

app.get('/image/proxy', cache('60 minutes'), async (req, res)=>{
  try {
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
    } else if (req.query.x) {
      output = await sharp(original_buffer)
        .resize({
          width: parseInt(req.query.x), 
          height: undefined,
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
  } catch (err) {
    console.log(err)
    res.status(500).json({type:"Error fetching image", message:err.message})
  }
})

app.get('/url', (req, res)=>{
  const message = "Visit /url/proxy?url=<your url here> to proxy."
  res.end(message)
})

app.get('/url/proxy', cors(), async (req, res)=>{
  try {
    console.log(req.query.url)
    const data = await fetch(req.query.url).then(r=>r.text())
    res.end(data);
  } catch (err) {
    console.log(err)
    res.status(500).json({type:"Error fetching url", message:err.message})
  }
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