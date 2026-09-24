import {useMemo,useState} from 'react';
import {ArrowRight,Dices,Fingerprint,Lock,Sparkles,Unlock} from 'lucide-react';
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
    {label:'Кино',sub:'Кадр, объект, персонаж',values:{source:'Фильм',reference:'Star Wars'}},
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

const rouletteBase={
  style:['Графика','Fine line','Blackwork','Реализм','Нео-традишнл','Японский','Dotwork','Минимализм'],
  genre:['Ботаника','Животные','Мистика','Готика','Хоррор','Фэнтези','Абстракция','Портрет'],
  mood:['Нежно','Смело','Тёмно','Романтика','Странно','18+'],
  source:['Фильм','Сериал','Аниме','Игра','Книга','Мифология'],
  reference:['Marvel','DC','Harry Potter','Star Wars','The Lord of the Rings','The Witcher','Berserk','Studio Ghibli','Silent Hill'],
  placement:['Рука','Предплечье','Плечо','Кисть','Грудь','Рёбра','Спина','Шея','Бедро','Голень']
};

const pick=arr=>arr[Math.floor(Math.random()*arr.length)];
function roll(level='wild',current=EMPTY,locks={}){
  const source={...rouletteBase};
  if(level==='clean'){
    source.genre=source.genre.filter(v=>v!=='Хоррор');
    source.mood=['Нежно','Романтика','Смело'];
    source.reference=['Studio Ghibli','Harry Potter','The Lord of the Rings','Marvel'];
  }
  if(level==='chaos'){
    source.genre=['Хоррор','Мистика','Абстракция','Фэнтези','Портрет'];
    source.mood=['Тёмно','Странно','18+','Смело'];
    source.reference=['Silent Hill','Berserk','The Witcher','DC','Star Wars'];
  }
  return Object.fromEntries(FIELDS.map(key=>[key,locks[key]&&current[key]?current[key]:pick(source[key])]));
}

function profileName(result){
  if(result.mood==='18+')return 'ТЁМНЫЙ СОБЛАЗНИТЕЛЬ';
  if(result.mood==='Тёмно'&&['Мистика','Готика','Хоррор'].includes(result.genre))return 'КИНЕМАТОГРАФИЧЕСКИЙ МИСТИК';
  if(['Fine line','Минимализм'].includes(result.style))return 'ТИХИЙ МИНИМАЛИСТ';
  if(['Blackwork','Нео-традишнл'].includes(result.style))return 'КОНТРАСТНЫЙ МАКСИМАЛИСТ';
  return 'ГРАФИЧЕСКИЙ РАССКАЗЧИК';
}

export default function MalabarLab(){
  const{navigate}=useRouter();
  const[dna,setDna]=useState({});
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

  const filled=FIELDS.filter(k=>labPreset[k]).length;
  const saveAndGo=(preset=labPreset,idea='')=>{
    const choice={...EMPTY,...preset};
    sessionStorage.setItem('malabar-lab-preset',JSON.stringify({choice,idea}));
    navigate('/constructor');
  };
  const applyDna=()=>dnaResult&&setLabPreset(prev=>({...prev,...dnaResult,placement:prev.placement||dnaResult.placement}));
  const spin=()=>setRoulette(prev=>roll(level,prev,locks));
  const applyRoulette=()=>setLabPreset(roulette);

  return <div className="lab-page">
    <header className="lab-hero">
      <span className="eyebrow">MALABAR / EXPERIMENTAL TATTOO LAB</span>
      <h1>НЕ ВЫБИРАЙ<br/><i>как все.</i></h1>
      <p>Два инструмента собирают идею татуировки из твоего вкуса и управляемой случайности. Место на теле выбирается уже в конструкторе.</p>
      <div className="lab-index"><a href="#dna">01 DNA</a><a href="#roulette">02 ROULETTE</a></div>
    </header>

    <section className="lab-section" id="dna">
      <div className="lab-section-head"><div><span className="eyebrow">01 / TATTOO DNA</span><h2>КАКАЯ ТАТУ<br/><i>похожа на тебя?</i></h2></div><Fingerprint size={52}/></div>
      <p className="lab-lead">Не выбирай готовый стиль. Отвечай интуитивно — лаборатория соберёт твой визуальный профиль.</p>
      <div className="dna-progress"><span style={{width:`${dnaProgress/dnaQuestions.length*100}%`}}/></div>
      <div className="dna-grid">{dnaQuestions.map((q,qi)=><article className="dna-question" key={q.id}><small>0{qi+1}</small><h3>{q.title}</h3><div>{q.options.map((option,oi)=><button type="button" key={option.label} aria-pressed={dna[q.id]===oi} onClick={()=>setDna(v=>({...v,[q.id]:oi}))}><b>{option.label}</b><span>{option.sub}</span></button>)}</div></article>)}</div>
      {dnaResult&&<div className="dna-result"><span className="eyebrow">ТВОЙ TATTOO DNA</span><h3>{profileName(dnaResult)}</h3><div className="lab-preset-row">{FIELDS.slice(0,5).map(key=><span key={key}><small>{LABELS[key]}</small>{dnaResult[key]||'—'}</span>)}</div><div className="lab-actions"><Button onClick={applyDna}>ЗАПОМНИТЬ DNA <Sparkles size={17}/></Button><Button variant="outline" onClick={()=>saveAndGo(dnaResult)}>В КОНСТРУКТОР <ArrowRight size={17}/></Button></div></div>}
    </section>

    <section className="lab-section" id="roulette">
      <div className="lab-section-head"><div><span className="eyebrow">02 / TATTOO ROULETTE</span><h2>ОТПУСТИ<br/><i>контроль.</i></h2></div><Dices size={52}/></div>
      <p className="lab-lead">Зафиксируй то, что нравится, и перекручивай остальное. Рандом управляемый — результат сразу совместим с AI-конструктором.</p>
      <div className="roulette-levels">{[['clean','ЧИСТО'],['wild','СТРАННО'],['chaos','БЕЗУМНО']].map(([value,label])=><button type="button" key={value} aria-pressed={level===value} onClick={()=>{setLevel(value);setRoulette(prev=>roll(value,prev,locks))}}>{label}</button>)}</div>
      <div className="roulette-grid">{FIELDS.map(key=><article key={key}><small>{LABELS[key]}</small><strong>{roulette[key]}</strong><button className="roulette-lock" type="button" onClick={()=>setLocks(v=>({...v,[key]:!v[key]}))}>{locks[key]?<Lock size={13}/>:<Unlock size={13}/>} {locks[key]?'ЗАКРЕПЛЕНО':'ЗАКРЕПИТЬ'}</button></article>)}</div>
      <div className="lab-actions"><Button onClick={spin}>КРУТИТЬ ЕЩЁ <Dices size={17}/></Button><Button variant="outline" onClick={applyRoulette}>ЗАПОМНИТЬ НАБОР <Sparkles size={17}/></Button><Button variant="outline" onClick={()=>saveAndGo(roulette)}>СРАЗУ В КОНСТРУКТОР <ArrowRight size={17}/></Button></div>
    </section>

    <section className="lab-memory">
      <div><span className="eyebrow">LAB MEMORY · {filled}/6</span><h2>ТВОЙ<br/><i>набор.</i></h2></div>
      <div className="lab-preset-row">{FIELDS.map(key=><span key={key}><small>{LABELS[key]}</small>{labPreset[key]||'—'}</span>)}</div>
      <Button onClick={()=>saveAndGo()} disabled={!filled}>ПРОДОЛЖИТЬ В КОНСТРУКТОР <ArrowRight size={17}/></Button>
    </section>
  </div>
}
