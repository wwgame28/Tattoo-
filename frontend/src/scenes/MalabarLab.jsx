import {useMemo,useState} from 'react';
import {ArrowRight,Dices,Fingerprint,Lock,ScanLine,Sparkles,Unlock} from 'lucide-react';
import {Button} from '../components/ui/button';
import {useRouter} from '../router';

const FIELDS=['style','genre','mood','source','reference','placement'];
const LABELS={style:'Стиль',genre:'Жанр',mood:'Характер',source:'Источник',reference:'Референс',placement:'Часть тела'};
const EMPTY={style:'',genre:'',mood:'',source:'',reference:'',placement:''};

const dnaQuestions=[
  {id:'line',title:'Какая линия тебя цепляет?',options:[
    {label:'Тонкая и точная',sub:'Воздух, детали, чистота',values:{style:'Fine line',mood:'Нежно'}},
    {label:'Жирная и чёрная',sub:'Контраст и сила',values:{style:'Blackwork',mood:'Смело'}},
    {label:'Живая и нервная',sub:'Штрих, движение, характер',values:{style:'Графика',mood:'Странно'}}]},
  {id:'subject',title:'Что хочется носить на себе?',options:[
    {label:'Живое',sub:'Цветы, растения, анатомия природы',values:{genre:'Ботаника',reference:'Studio Ghibli'}},
    {label:'Необъяснимое',sub:'Символы, магия, сны',values:{genre:'Мистика',reference:'The Witcher'}},
    {label:'Лицо / персонаж',sub:'История через героя',values:{genre:'Портрет',reference:'DC'}}]},
  {id:'emotion',title:'Какое чувство должно остаться?',options:[
    {label:'Тишина',sub:'Спокойно и интимно',values:{mood:'Нежно',style:'Минимализм'}},
    {label:'Напряжение',sub:'Темно, кинематографично',values:{mood:'Тёмно',genre:'Готика'}},
    {label:'Провокация',sub:'Смело и заметно',values:{mood:'Смело',style:'Нео-традишнл'}}]},
  {id:'world',title:'Откуда хочется взять атмосферу?',options:[
    {label:'Кино',sub:'Свет, кадр, персонаж',values:{source:'Фильм',reference:'Star Wars'}},
    {label:'Игра',sub:'Мир, предметы, символика',values:{source:'Игра',reference:'Silent Hill'}},
    {label:'Легенда',sub:'Миф, архетип, ритуал',values:{source:'Мифология',reference:'The Lord of the Rings'}}]},
  {id:'density',title:'Сколько визуального шума тебе нужно?',options:[
    {label:'Минимум',sub:'Один знак — один удар',values:{style:'Минимализм',genre:'Абстракция'}},
    {label:'Баланс',sub:'Детали, но без перегруза',values:{style:'Графика',genre:'Мистика'}},
    {label:'Максимум',sub:'Плотно и коллекционно',values:{style:'Blackwork',genre:'Фэнтези'}}]},
  {id:'risk',title:'Насколько далеко можно зайти?',options:[
    {label:'Чисто',sub:'Легко жить каждый день',values:{mood:'Нежно',source:'Книга'}},
    {label:'Странно',sub:'Пусть задают вопросы',values:{mood:'Странно',source:'Аниме',reference:'Berserk'}},
    {label:'На грани',sub:'Сексуально, тёмно, смело',values:{mood:'18+',source:'Сериал',reference:'The Witcher'}}]}
];

const bodyZones=[
  {name:'Шея',note:'Компактная вертикаль или знак с сильным силуэтом.'},
  {name:'Плечо',note:'Округлая композиция, которая обнимает сустав.'},
  {name:'Грудь',note:'Широкая фронтальная композиция с центром и дыханием.'},
  {name:'Рёбра',note:'Вытянутая диагональ, хорошо работает с движением корпуса.'},
  {name:'Предплечье',note:'Вертикальный читаемый сюжет — один из лучших форматов для детализации.'},
  {name:'Кисть',note:'Компактный контрастный знак без мелкой перегрузки.'},
  {name:'Спина',note:'Большое поле для сложного сюжета, симметрии и нескольких планов.'},
  {name:'Бедро',note:'Крупная свободная композиция, хорошо держит пластику и детали.'},
  {name:'Голень',note:'Вытянутый силуэт и сильная вертикаль.'}
];

const rouletteBase={
  style:['Графика','Fine line','Blackwork','Реализм','Нео-традишнл','Японский','Dotwork','Минимализм'],
  genre:['Ботаника','Животные','Мистика','Готика','Хоррор','Фэнтези','Абстракция','Портрет'],
  mood:['Нежно','Смело','Тёмно','Романтика','Странно','18+'],
  source:['Фильм','Сериал','Аниме','Игра','Книга','Мифология'],
  reference:['Marvel','DC','Harry Potter','Star Wars','The Lord of the Rings','The Witcher','Berserk','Studio Ghibli','Silent Hill'],
  placement:['Рука','Предплечье','Плечо','Кисть','Грудь','Рёбра','Спина','Шея','Бедро','Голень']
};

const pick=(arr)=>arr[Math.floor(Math.random()*arr.length)];
function roll(level='wild',current=EMPTY,locks={}){
  const source={...rouletteBase};
  if(level==='clean'){
    source.genre=source.genre.filter(v=>!['Хоррор'].includes(v));
    source.mood=['Нежно','Романтика','Смело'];
    source.reference=['Studio Ghibli','Harry Potter','The Lord of the Rings','Marvel'];
  }
  if(level==='chaos'){
    source.genre=['Хоррор','Мистика','Абстракция','Фэнтези','Портрет'];
    source.mood=['Тёмно','Странно','18+','Смело'];
    source.reference=['Silent Hill','Berserk','The Witcher','DC','Star Wars'];
  }
  return Object.fromEntries(FIELDS.map(key=>[key,locks[key]&&current[key]?current[key]:pick(source[key]) ]));
}

function profileName(result){
  if(result.mood==='18+')return 'ТЁМНЫЙ СОБЛАЗНИТЕЛЬ';
  if(result.mood==='Тёмно'&&['Мистика','Готика','Хоррор'].includes(result.genre))return 'КИНЕМАТОГРАФИЧЕСКИЙ МИСТИК';
  if(['Fine line','Минимализм'].includes(result.style))return 'ТИХИЙ МИНИМАЛИСТ';
  if(['Blackwork','Нео-традишнл'].includes(result.style))return 'КОНТРАСТНЫЙ МАКСИМАЛИСТ';
  return 'ГРАФИЧЕСКИЙ РАССКАЗЧИК';
}

function BodyFigure({back=false,selected,onSelect}){
  const zone=(name,props)=><g role="button" tabIndex="0" aria-label={name} className={`body-zone ${selected===name?'active':''}`} onClick={()=>onSelect(name)} onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();onSelect(name)}}} {...props}/>;
  return <div className="lab-body-figure-wrap">
    <span>{back?'СПИНА':'ПЕРЕД'}</span>
    <svg className="lab-body-figure" viewBox="0 0 200 430" aria-label={back?'Карта тела сзади':'Карта тела спереди'}>
      <circle className="body-outline" cx="100" cy="35" r="20"/>
      <path className="body-outline" d="M77 67 Q100 58 123 67 L139 164 Q125 192 119 225 L81 225 Q75 192 61 164 Z"/>
      <path className="body-outline" d="M65 78 L42 190 L50 280"/><path className="body-outline" d="M135 78 L158 190 L150 280"/>
      <path className="body-outline" d="M87 224 L72 402"/><path className="body-outline" d="M113 224 L128 402"/>
      {!back&&<>
        {zone('Шея',{children:<rect x="89" y="54" width="22" height="24" rx="8"/>})}
        {zone('Плечо',{children:<><circle cx="70" cy="82" r="20"/><circle cx="130" cy="82" r="20"/></>})}
        {zone('Грудь',{children:<rect x="73" y="90" width="54" height="48" rx="16"/>})}
        {zone('Рёбра',{children:<><rect x="62" y="132" width="23" height="58" rx="12"/><rect x="115" y="132" width="23" height="58" rx="12"/></>})}
        {zone('Предплечье',{children:<><rect x="38" y="157" width="18" height="94" rx="9" transform="rotate(8 47 204)"/><rect x="144" y="157" width="18" height="94" rx="9" transform="rotate(-8 153 204)"/></>})}
        {zone('Кисть',{children:<><circle cx="49" cy="274" r="14"/><circle cx="151" cy="274" r="14"/></>})}
        {zone('Бедро',{children:<><rect x="72" y="232" width="27" height="92" rx="14"/><rect x="101" y="232" width="27" height="92" rx="14"/></>})}
        {zone('Голень',{children:<><rect x="70" y="318" width="24" height="78" rx="12"/><rect x="106" y="318" width="24" height="78" rx="12"/></>})}
      </>}
      {back&&<>
        {zone('Шея',{children:<rect x="89" y="54" width="22" height="24" rx="8"/>})}
        {zone('Плечо',{children:<><circle cx="70" cy="82" r="20"/><circle cx="130" cy="82" r="20"/></>})}
        {zone('Спина',{children:<rect x="70" y="90" width="60" height="112" rx="24"/>})}
        {zone('Бедро',{children:<><rect x="72" y="232" width="27" height="92" rx="14"/><rect x="101" y="232" width="27" height="92" rx="14"/></>})}
        {zone('Голень',{children:<><rect x="70" y="318" width="24" height="78" rx="12"/><rect x="106" y="318" width="24" height="78" rx="12"/></>})}
      </>}
    </svg>
  </div>
}

export default function MalabarLab(){
  const{navigate}=useRouter();
  const[dna,setDna]=useState({});
  const[selectedBody,setSelectedBody]=useState('');
  const[level,setLevel]=useState('wild');
  const[locks,setLocks]=useState({});
  const[roulette,setRoulette]=useState(()=>roll('wild'));
  const[labPreset,setLabPreset]=useState(EMPTY);

  const dnaProgress=Object.keys(dna).length;
  const dnaResult=useMemo(()=>{
    if(dnaProgress<dnaQuestions.length)return null;
    const votes=Object.fromEntries(FIELDS.map(k=>[k,{}]));
    dnaQuestions.forEach(q=>{
      const answer=q.options[dna[q.id]];
      Object.entries(answer?.values||{}).forEach(([key,value])=>{votes[key][value]=(votes[key][value]||0)+1});
    });
    const result={...EMPTY};
    FIELDS.slice(0,5).forEach(key=>{
      const ranked=Object.entries(votes[key]).sort((a,b)=>b[1]-a[1]);
      result[key]=ranked[0]?.[0]||'';
    });
    result.placement=labPreset.placement||'';
    return result;
  },[dna,dnaProgress,labPreset.placement]);

  const selectedBodyData=bodyZones.find(z=>z.name===selectedBody);
  const filled=FIELDS.filter(k=>labPreset[k]).length;

  const saveAndGo=(preset=labPreset,idea='')=>{
    const choice={...EMPTY,...preset};
    sessionStorage.setItem('malabar-lab-preset',JSON.stringify({choice,idea}));
    navigate('/constructor');
  };

  const applyDna=()=>{
    if(!dnaResult)return;
    setLabPreset(prev=>({...prev,...dnaResult,placement:prev.placement||dnaResult.placement}));
  };

  const chooseBody=(name)=>{
    setSelectedBody(name);
    setLabPreset(prev=>({...prev,placement:name}));
  };

  const spin=()=>setRoulette(prev=>roll(level,prev,locks));
  const applyRoulette=()=>setLabPreset(roulette);

  return <div className="lab-page">
    <header className="lab-hero">
      <span className="eyebrow">MALABAR / EXPERIMENTAL TATTOO LAB</span>
      <h1>НЕ ВЫБИРАЙ<br/><i>как все.</i></h1>
      <p>Три инструмента, которые собирают идею татуировки из вкуса, тела и случайности.</p>
      <div className="lab-index"><a href="#dna">01 DNA</a><a href="#body-map">02 BODY MAP</a><a href="#roulette">03 ROULETTE</a></div>
    </header>

    <section className="lab-section" id="dna">
      <div className="lab-section-head"><div><span className="eyebrow">01 / TATTOO DNA</span><h2>УЗНАЙ<br/><i>свой код.</i></h2></div><Fingerprint size={54}/></div>
      <p className="lab-lead">Не спрашиваем «какую тату хочешь». Сначала определяем, что тебя визуально притягивает.</p>
      <div className="dna-progress"><span style={{width:`${dnaProgress/dnaQuestions.length*100}%`}}/></div>
      <div className="dna-grid">{dnaQuestions.map((q,index)=><article className="dna-question" key={q.id}>
        <small>0{index+1}</small><h3>{q.title}</h3>
        <div>{q.options.map((option,optionIndex)=><button type="button" aria-pressed={dna[q.id]===optionIndex} key={option.label} onClick={()=>setDna(v=>({...v,[q.id]:optionIndex}))}><b>{option.label}</b><span>{option.sub}</span></button>)}</div>
      </article>)}</div>
      {dnaResult&&<div className="dna-result">
        <span className="eyebrow">ТВОЙ TATTOO DNA</span><h3>{profileName(dnaResult)}</h3>
        <div className="lab-preset-row">{FIELDS.slice(0,5).map(key=><span key={key}><small>{LABELS[key]}</small>{dnaResult[key]}</span>)}</div>
        <div className="lab-actions"><Button onClick={applyDna}>ЗАПОМНИТЬ DNA <Sparkles size={18}/></Button><Button variant="outline" onClick={()=>saveAndGo({...labPreset,...dnaResult})}>В КОНСТРУКТОР <ArrowRight size={18}/></Button></div>
      </div>}
    </section>

    <section className="lab-section lab-body-section" id="body-map">
      <div className="lab-section-head"><div><span className="eyebrow">02 / BODY MAP</span><h2>ТЕЛО —<br/><i>часть дизайна.</i></h2></div><ScanLine size={54}/></div>
      <p className="lab-lead">Нажми прямо на тело. MALABAR передаст выбранную зону в AI-конструктор и подстроит направление композиции.</p>
      <div className="body-map-layout">
        <div className="body-figures"><BodyFigure selected={selectedBody} onSelect={chooseBody}/><BodyFigure back selected={selectedBody} onSelect={chooseBody}/></div>
        <aside className="body-map-panel">
          <span className="eyebrow">ВЫБРАННАЯ ЗОНА</span>
          <h3>{selectedBody||'НАЖМИ НА ТЕЛО'}</h3>
          <p>{selectedBodyData?.note||'Можно выбирать зоны на фигуре или кнопками ниже.'}</p>
          <div className="body-zone-list">{bodyZones.map(zone=><button type="button" key={zone.name} aria-pressed={selectedBody===zone.name} onClick={()=>chooseBody(zone.name)}>{zone.name}</button>)}</div>
          {selectedBody&&<Button onClick={()=>saveAndGo({...labPreset,placement:selectedBody},selectedBodyData?.note||'')}>В КОНСТРУКТОР <ArrowRight size={18}/></Button>}
        </aside>
      </div>
    </section>

    <section className="lab-section lab-roulette-section" id="roulette">
      <div className="lab-section-head"><div><span className="eyebrow">03 / TATTOO ROULETTE</span><h2>ОТПУСТИ<br/><i>контроль.</i></h2></div><Dices size={54}/></div>
      <p className="lab-lead">Выбери уровень риска. Зафиксируй то, что нравится, и перекручивай только остальное.</p>
      <div className="roulette-levels">{[['clean','ЧИСТО'],['wild','СТРАННО'],['chaos','БЕЗУМНО']].map(([value,label])=><button type="button" key={value} aria-pressed={level===value} onClick={()=>{setLevel(value);setRoulette(prev=>roll(value,prev,locks))}}>{label}</button>)}</div>
      <div className="roulette-grid">{FIELDS.map((key,index)=><article key={key}>
        <small>0{index+1} / {LABELS[key]}</small><strong>{roulette[key]}</strong>
        <button type="button" className="roulette-lock" aria-label={locks[key]?'Разблокировать параметр':'Зафиксировать параметр'} onClick={()=>setLocks(v=>({...v,[key]:!v[key]}))}>{locks[key]?<Lock size={17}/>:<Unlock size={17}/>} {locks[key]?'ЗАКРЕПЛЕНО':'ЗАКРЕПИТЬ'}</button>
      </article>)}</div>
      <div className="lab-actions"><Button onClick={spin}>КРУТИТЬ ЕЩЁ <Dices size={18}/></Button><Button variant="outline" onClick={applyRoulette}>ЗАПОМНИТЬ КОМБИНАЦИЮ <Sparkles size={18}/></Button><Button variant="outline" onClick={()=>saveAndGo(roulette)}>СРАЗУ В КОНСТРУКТОР <ArrowRight size={18}/></Button></div>
    </section>

    <section className="lab-memory">
      <div><span className="eyebrow">LAB MEMORY · {filled}/6</span><h2>СОБРАНО<br/><i>сейчас.</i></h2></div>
      <div className="lab-preset-row">{FIELDS.map(key=><span key={key}><small>{LABELS[key]}</small>{labPreset[key]||'—'}</span>)}</div>
      <Button disabled={!filled} onClick={()=>saveAndGo()}>ПРОДОЛЖИТЬ В КОНСТРУКТОР <ArrowRight size={18}/></Button>
    </section>
  </div>
}
