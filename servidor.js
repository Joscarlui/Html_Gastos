const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'datos_compartidos.json');

function leerDatos() {
    try { if (fs.existsSync(DATA_FILE)) return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8')); } catch(e){}
    return { tx: [], cats: ['Comida','Gas','Alquiler','Internet','Extras'] };
}
function guardarDatos(d){ fs.writeFileSync(DATA_FILE, JSON.stringify(d, null, 2)); }

const mime = {'.html':'text/html','.js':'application/javascript','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.css':'text/css'};

const server = http.createServer((req,res)=>{
  res.setHeader('Access-Control-Allow-Origin','*');
  res.setHeader('Access-Control-Allow-Methods','GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers','Content-Type');
  if(req.method==='OPTIONS'){res.writeHead(204);return res.end()}

  if(req.url==='/data'){
    if(req.method==='GET'){res.writeHead(200,{'Content-Type':'application/json'});return res.end(JSON.stringify(leerDatos()))}
    if(req.method==='POST'){let b='';req.on('data',c=>b+=c);req.on('end',()=>{guardarDatos(JSON.parse(b));res.writeHead(200,{'Content-Type':'application/json'});res.end('{"ok":true}')});return}
  }

  // archivos estáticos
  let filePath = req.url==='/'? '/index.html' : req.url;
  filePath = path.join(__dirname, filePath);
  if(fs.existsSync(filePath) && fs.statSync(filePath).isFile()){
    const ext = path.extname(filePath);
    res.writeHead(200,{'Content-Type': mime[ext]||'application/octet-stream'});
    return fs.createReadStream(filePath).pipe(res);
  }
  res.writeHead(404);res.end('Not found');
});

server.listen(PORT,'0.0.0.0',()=>{
  console.log(`✅ Listo en http://localhost:${PORT}`);
  require('os').networkInterfaces()['Wi-Fi']?.forEach(i=>{if(i.family==='IPv4')console.log(`   → http://${i.address}:${PORT}`)});
});
