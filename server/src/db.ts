import { createClient } from '@libsql/client';

const isVercel=Boolean(process.env.VERCEL);
if(isVercel&&!process.env.TURSO_DATABASE_URL)throw new Error('TURSO_DATABASE_URL is required on Vercel');

export const db=createClient({
  url:process.env.TURSO_DATABASE_URL||'file:dasketball.db',
  authToken:process.env.TURSO_AUTH_TOKEN,
});

export const ready=(async()=>{
  await db.batch([
    `CREATE TABLE IF NOT EXISTS players(id INTEGER PRIMARY KEY AUTOINCREMENT,username TEXT UNIQUE NOT NULL,password TEXT NOT NULL,createdAt TEXT DEFAULT CURRENT_TIMESTAMP,coins INTEGER DEFAULT 1000,wins INTEGER DEFAULT 0,losses INTEGER DEFAULT 0,shooting INTEGER DEFAULT 72,speed INTEGER DEFAULT 74,defense INTEGER DEFAULT 68,dribbling INTEGER DEFAULT 76,strength INTEGER DEFAULT 65,stamina INTEGER DEFAULT 75,hair TEXT DEFAULT 'fade',height REAL DEFAULT 6.4,clothing TEXT DEFAULT 'purple',build TEXT DEFAULT 'Athletic',gamesPlayed INTEGER DEFAULT 0,playoffGames INTEGER DEFAULT 0,difficulty TEXT DEFAULT 'Pro',championshipsWon INTEGER DEFAULT 0,tutorialDone INTEGER DEFAULT 0)`,
    `CREATE TABLE IF NOT EXISTS opponents(id INTEGER PRIMARY KEY AUTOINCREMENT,name TEXT,shooting INTEGER,speed INTEGER,defense INTEGER,dribbling INTEGER,strength INTEGER,stamina INTEGER,hair TEXT,clothing TEXT)`,
    `CREATE TABLE IF NOT EXISTS matches(id INTEGER PRIMARY KEY AUTOINCREMENT,playerId INTEGER,opponentId INTEGER,result TEXT,score TEXT,createdAt TEXT DEFAULT CURRENT_TIMESTAMP,FOREIGN KEY(playerId) REFERENCES players(id),FOREIGN KEY(opponentId) REFERENCES opponents(id))`,
    `CREATE TABLE IF NOT EXISTS inventory(id INTEGER PRIMARY KEY AUTOINCREMENT,playerId INTEGER,item TEXT,UNIQUE(playerId,item))`,
  ],'write');
  const count=await db.execute('SELECT COUNT(*) AS n FROM opponents');
  if(Number(count.rows[0]?.n||0)===0){
    const names=['Jax Voltage','Milo Buckets','Trey Nova','Ace Wilder','Zion Sparks','Kobe Cruz','Dante Frost','Rio Blaze'];
    await db.batch(names.map((name,i)=>({sql:'INSERT INTO opponents(name,shooting,speed,defense,dribbling,strength,stamina,hair,clothing) VALUES(?,?,?,?,?,?,?,?,?)',args:[name,64+i*3,72+i*2,62+i*3,67+i*2,63+i*2,70+i,'curls',i%2?'orange':'cyan']})),'write');
  }
})();

export function publicPlayer(player:any){const{password,...safe}=player;return{...safe,id:Number(safe.id),coins:Number(safe.coins),wins:Number(safe.wins),losses:Number(safe.losses),gamesPlayed:Number(safe.gamesPlayed),playoffGames:Number(safe.playoffGames),tutorialDone:Boolean(safe.tutorialDone)}}
