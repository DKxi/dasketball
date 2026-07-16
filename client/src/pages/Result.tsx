import { useEffect, useState } from 'react';
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
  const [syncing, setSyncing] = useState(true);

  async function syncPlayer() {
    try {
      const updatedPlayer = await api.me();
      setPlayer(updatedPlayer);
    } finally {
      setSyncing(false);
    }
  }

  // The match has already been saved by Game. Refresh the shared player
  // object so coins, wins, losses, and playoff progress update together.
  useEffect(() => {
    syncPlayer().catch(() => undefined);
  }, []);

  async function continueToMenu() {
    // Prevent fast navigation from beating the profile request. A final fetch
    // here also recovers cleanly if the initial background sync failed.
    await syncPlayer().catch(() => undefined);
    navigate('/menu');
  }

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
      <button className="primary" disabled={syncing} onClick={continueToMenu}>
        {syncing ? 'UPDATING CAREER...' : 'NEXT →'}
      </button>
    </main>
  );
}
