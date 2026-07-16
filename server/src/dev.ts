import app from './index.js';
const port=Number(process.env.PORT||3001);
app.listen(port,()=>console.log(`Dasketball API running at http://localhost:${port}`));
