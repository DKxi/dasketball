import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db, publicPlayer, ready } from './db.js';

const app=express();
const SECRET=process.env.JWT_SECRET||'dev-only-change-me';
app.disable('x-powered-by');app.use(cors());app.use(express.json({limit:'32kb'}));
type Req=express.Request&{playerId?:number};

function asyncRoute(fn:(req:Req,res:express.Response)=>Promise<any>){return(req:Req,res:express.Response,next:express.NextFunction)=>{fn(req,res).catch(next)}}
async function auth(req:Req,res:express.Response,next:express.NextFunction){try{await ready;const raw=req.headers.authorization?.replace('Bearer ','');if(!raw)throw new Error();req.playerId=Number((jwt.verify(raw,SECRET)as any).id);next()}catch{res.status(401).json({error:'Please sign in again'})}}
async function getPlayer(id:number){const result=await db.execute({sql:'SELECT * FROM players WHERE id=?',args:[id]});return result.rows[0]as any}
const makeToken=(id:number)=>jwt.sign({id},SECRET,{expiresIn:'14d'});

app.get('/api/health',(_req,res)=>res.json({ok:true}));
app.post('/api/signup',asyncRoute(async(req,res)=>{await ready;const{username,password}=req.body;if(!username||username.length<3||!password||password.length<6)return res.status(400).json({error:'Use 3+ characters for username and 6+ for password'});try{const hash=await bcrypt.hash(password,12);const result=await db.execute({sql:'INSERT INTO players(username,password) VALUES(?,?)',args:[username.trim(),hash]});const p=await getPlayer(Number(result.lastInsertRowid));return res.status(201).json({token:makeToken(p.id),player:publicPlayer(p)})}catch{return res.status(409).json({error:'That username is already on the court'})}}));
app.post('/api/login',asyncRoute(async(req,res)=>{await ready;const result=await db.execute({sql:'SELECT * FROM players WHERE username=?',args:[req.body.username?.trim()||'']});const p=result.rows[0]as any;if(!p||!await bcrypt.compare(req.body.password||'',String(p.password)))return res.status(401).json({error:'Username or password is incorrect'});return res.json({token:makeToken(Number(p.id)),player:publicPlayer(p)})}));
app.get('/api/player/me',auth,asyncRoute(async(req,res)=>res.json(publicPlayer(await getPlayer(req.playerId!)))));
app.get('/api/player/:id',auth,asyncRoute(async(req,res)=>{const p=await getPlayer(Number(req.params.id));return p?res.json(publicPlayer(p)):res.status(404).json({error:'Player not found'})}));
app.post('/api/tutorial/complete',auth,asyncRoute(async(req,res)=>{await db.execute({sql:'UPDATE players SET tutorialDone=1 WHERE id=?',args:[req.playerId!]});return res.json(publicPlayer(await getPlayer(req.playerId!)))}));
app.post('/api/avatar/update',auth,asyncRoute(async(req,res)=>{const{hair='fade',height=6.4,clothing='purple',build='Athletic'}=req.body;await db.execute({sql:'UPDATE players SET hair=?,height=?,clothing=?,build=? WHERE id=?',args:[hair,Math.max(5.6,Math.min(7.2,Number(height))),clothing,build,req.playerId!]});return res.json(publicPlayer(await getPlayer(req.playerId!)))}));
app.post('/api/match/start',auth,asyncRoute(async(_req,res)=>{const result=await db.execute('SELECT * FROM opponents ORDER BY RANDOM() LIMIT 1');return res.json({opponent:result.rows[0]})}));
app.post('/api/match/end',auth,asyncRoute(async(req,res)=>{const{opponentId,result,score}=req.body;if(!['win','loss'].includes(result))return res.status(400).json({error:'Invalid result'});const earned=result==='win'?500:0;await db.batch([{sql:'INSERT INTO matches(playerId,opponentId,result,score) VALUES(?,?,?,?)',args:[req.playerId!,opponentId,result,String(score)]},{sql:'UPDATE players SET gamesPlayed=gamesPlayed+1,playoffGames=playoffGames+1,coins=coins+?,wins=wins+?,losses=losses+? WHERE id=?',args:[earned,result==='win'?1:0,result==='loss'?1:0,req.playerId!]}],'write');return res.json({player:publicPlayer(await getPlayer(req.playerId!)),coinsEarned:earned})}));
app.post('/api/shop/buy',auth,asyncRoute(async(req,res)=>{const{item,cost}=req.body,p=await getPlayer(req.playerId!);if(!Number.isInteger(cost)||cost<0||Number(p.coins)<cost)return res.status(400).json({error:'Not enough coins'});const[type,value]=String(item).split(':');if(!['hair','clothing'].includes(type))return res.status(400).json({error:'Invalid shop item'});await db.batch([{sql:'UPDATE players SET coins=coins-? WHERE id=?',args:[cost,req.playerId!]},{sql:'INSERT OR IGNORE INTO inventory(playerId,item) VALUES(?,?)',args:[req.playerId!,item]},{sql:`UPDATE players SET ${type}=? WHERE id=?`,args:[value,req.playerId!]}],'write');return res.json(publicPlayer(await getPlayer(req.playerId!)))}));

async function bracket(){const result=await db.execute('SELECT name FROM opponents ORDER BY RANDOM() LIMIT 8');const names=result.rows.map(x=>String(x.name));return{rounds:[{name:'1ST ROUND',games:[[names[0],names[1]],[names[2],names[3]],[names[4],names[5]],[names[6],names[7]]].map(x=>({a:x[0],b:x[1],aWins:0,bWins:0}))},{name:'2ND ROUND',games:[{a:'TBD',b:'TBD',aWins:0,bWins:0},{a:'TBD',b:'TBD',aWins:0,bWins:0}]},{name:'CONFERENCE FINALS',games:[{a:'TBD',b:'TBD',aWins:0,bWins:0}]},{name:'FINALS',games:[{a:'YOU',b:'TBD',aWins:0,bWins:0}]},{name:'3RD PLACE',games:[{a:'TBD',b:'TBD',aWins:0,bWins:0}]}]}}
app.get('/api/playoffs/bracket',auth,asyncRoute(async(_req,res)=>res.json(await bracket())));
app.post('/api/playoffs/start',auth,asyncRoute(async(req,res)=>{const p=await getPlayer(req.playerId!);if(Number(p.playoffGames)<5)return res.status(403).json({error:`Playoffs unlock after ${5-Number(p.playoffGames)} more games`});const odds:Record<string,number>={Rookie:.9,Pro:.72,'All-Star':.55,'Hall of Fame':.38};const champion=Math.random()<(odds[req.body.difficulty]??.72);let reward=0;if(champion){reward=(Number(p.championshipsWon)+1)*5000;await db.execute({sql:'UPDATE players SET championshipsWon=championshipsWon+1,playoffGames=0,coins=coins+?,difficulty=? WHERE id=?',args:[reward,req.body.difficulty,req.playerId!]})}const b=await bracket();b.rounds.forEach(r=>r.games.forEach(g=>{g.aWins=champion?3:Math.floor(Math.random()*3);g.bWins=champion?Math.floor(Math.random()*3):3}));return res.json({champion,reward,bracket:b,player:publicPlayer(await getPlayer(req.playerId!))})}));

app.use((error:unknown,_req:express.Request,res:express.Response,_next:express.NextFunction)=>{console.error(error);res.status(500).json({error:'The court is temporarily unavailable'})});
export default app;
