import { useNavigate } from 'react-router-dom';
import { Lock, Play, ShoppingBag, Trophy, User, Settings, LogOut } from 'lucide-react';
import { Logo, Character } from '../components';
import { useApp } from '../App';

const PLAYOFF_GAMES_REQUIRED = 5;

export default function Menu() {
  const navigate = useNavigate();
  const { player, setPlayer } = useApp();
  const playoffGames = player?.playoffGames || 0;
  const locked = playoffGames < PLAYOFF_GAMES_REQUIRED;
  const remaining = Math.max(0, PLAYOFF_GAMES_REQUIRED - playoffGames);

  function openPlayoffs() {
    if (locked) {
      new Audio('/audio/wrong.wav').play().catch(() => undefined);
      document.querySelector('.lock-note')?.classList.add('shake');
    } else {
      navigate('/playoffs');
    }
  }

  return (
    <main className="menu">
      <header>
        <Logo />
        <div className="profile-chip">
          <Character small hair={player?.hair} clothing={player?.clothing} />
          <span><small>WELCOME BACK</small><b>{player?.username}</b></span>
          <em>LVL {Math.max(1, Math.floor((player?.gamesPlayed || 0) / 5) + 1)}</em>
          <strong>🪙 {player?.coins.toLocaleString()}</strong>
        </div>
      </header>

      <div className="menu-body">
        <section>
          <small>CAREER MODE</small>
          <h1>WHAT’S YOUR<br /><em>NEXT MOVE?</em></h1>
          <p>Every game writes your story.</p>
          <nav>
            <button className="play" onClick={() => navigate('/game')}><Play /><span><b>PLAY NOW</b><small>Find a matchup</small></span><i>→</i></button>
            <button onClick={() => navigate('/shop')}><ShoppingBag /><span><b>PLAYER SHOP</b><small>Gear up & stand out</small></span><i>→</i></button>
            <button onClick={() => navigate('/profile')}><User /><span><b>MY PLAYER</b><small>Stats & career</small></span><i>→</i></button>
            <button className={locked ? 'locked' : ''} onClick={openPlayoffs}>
              {locked ? <Lock /> : <Trophy />}
              <span><b>PLAYOFFS</b><small>{locked ? `${remaining} games until unlocked` : 'Chase the championship'}</small></span><i>→</i>
            </button>
          </nav>
          <div className="lock-note">
            <Trophy /> PLAYOFFS PROGRESS <b>{Math.min(playoffGames, PLAYOFF_GAMES_REQUIRED)}/{PLAYOFF_GAMES_REQUIRED}</b>
            <div><i style={{ width: `${Math.min(100, (playoffGames / PLAYOFF_GAMES_REQUIRED) * 100)}%` }} /></div>
          </div>
          <footer>
            <button onClick={() => navigate('/settings')}><Settings /> SETTINGS</button>
            <button onClick={() => { localStorage.removeItem('token'); setPlayer(null); navigate('/'); }}><LogOut /> LOGOUT</button>
          </footer>
        </section>
        <div className="menu-player">
          <div className="speech">READY TO BALL?</div>
          <Character hair={player?.hair} clothing={player?.clothing} />
          <div className="overall"><small>OVERALL</small><b>{Math.round(((player?.shooting || 70) + (player?.speed || 70) + (player?.defense || 70)) / 3)}</b><span>RISING STAR</span></div>
        </div>
      </div>
    </main>
  );
}
