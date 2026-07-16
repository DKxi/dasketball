let ctx:AudioContext|undefined,themeTimer:number|undefined;const get=()=>ctx||(ctx=new AudioContext());
function tone(freq:number,duration=.15,type:OscillatorType='sine',gain=.08,delay=0){const c=get(),o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.value=freq;g.gain.setValueAtTime(gain,c.currentTime+delay);g.gain.exponentialRampToValueAtTime(.001,c.currentTime+delay+duration);o.connect(g).connect(c.destination);o.start(c.currentTime+delay);o.stop(c.currentTime+delay+duration)}
export function wrong(){tone(180,.2,'square',.09);tone(130,.28,'square',.08,.16)}
export function cheer(){[0,1,2,3,4,5].forEach(i=>tone(430+Math.random()*550,.35,'sawtooth',.025,i*.045))}
export function startTheme(muted:boolean){stopTheme();if(muted)return;let step=0;const notes=[110,138,165,220,165,138,123,165];const beat=()=>tone(notes[step++%notes.length],.32,'triangle',.025);beat();themeTimer=window.setInterval(beat,360)}
export function stopTheme(){if(themeTimer)clearInterval(themeTimer);themeTimer=undefined}
