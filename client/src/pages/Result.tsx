import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Character } from '../components';
import { useApp } from '../App';
import { api } from '../api';

export default function Result() {
  const navigate = useNavigate();
  const state = useLocation().state || {
    win: false,
    score: '0 : 12',
    coins: 0,
  };
  const { setPlayer } = useApp();

  // The match has already been saved by Game. Refresh the shared player
  // object once so every coin counter updates immediately without a reload.
  useEffect(() => {
    api.me().then(setPlayer).catch(() => undefined);
  }, [setPlayer]);

  return (
    <main className={`result ${state.win ? 'victory' : 'defeat'}`}>
      <div className="confetti">✦　●　✦　●　✦　●</div>
      <small>FINAL SCORE</small>
      <h1>{state.win ? 'YOU WON!!!' : 'TOUGH LOSS'}</h1>
      <div className="final-score">{state.score}</div>
      <div className="result-players">
        <Character mood={state.win ? 'jump' : 'cry'} />
        <Character clothing="orange" mood={state.win ? 'cry' : 'jump'} />
      </div>
      <div className="reward">🪙 +{state.coins.toLocaleString()} COINS</div>
      <button className="primary" onClick={() => navigate('/menu')}>
        NEXT →
      </button>
    </main>
  );
}
