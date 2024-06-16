
class MainBox extends Component{
	constructor(dom){

		super(dom, {
			style: `
				this{
					width: 100%;
					height: 100%;
					display: flex;
					flex-direction: column;
				}
				this img{
					vertical-align:middle;
					width: 3rem;
					margin-right: 1rem;	
					margin-left	: 1rem;	
				}
				this > .header{
					height: 5rem;
					background-color: #222;
					color: #fff;
					display:flex;
					flex-direction: row;
					align-items:center;
					flex-gap: 2rem;
				}
				this > div:not(.header){
					width: 100%;
					height: calc(100% - 3rem);
					display: flex;
					flex-direction: row;
				}
			`,
			HTML: `	
				<div class=header>
					<img src=favicon.png>
					<h1>Quizzerole</h1>
				</div>
				<div>
					<div component=Homework args=[]></div>
					<div component=Game args=[]></div>
				</div>
			`
		})
	}
}

class Homework extends Component{

	constructor(dom){

		super(dom, {
			style: `
				this #questions{
					height: calc(100% - 3rem);
					overflow-y: scroll;
				}
				this{
					padding-right: 1rem;
				}
			`,
			HTML: `
				<p dynamic> You completed {{this.state.completed}} Questions out of {{this.state.total}}. You have {{this.state.turns}} Turns.</p>
				<div id=questions></div>
			`
		})

		let t = this

		t.state.total = '?'
		t.state.completed = 0;
		t.state.turns = 0;

		fetch('/questions.json').then( response=>{
			response.json().then( questions=>{
				
				for(let q of questions){
					let e = document.createElement('div')
					t.elem('#questions').appendChild(e)
					new Question(e, this, q)
				}

				t.state.total = questions.length;
			})
		})

	}
}

class Question extends Component{

	constructor(dom, parent, questiondata){

		super(dom, {
			style: `
				this p{
					color: {{this.cssvars.qColor}};
				}
				this{
					padding-right: 2rem;
				}
			`,
			HTML: `
				<p>${questiondata.question}</p>
				<input type=text>
				<button onclick="this.checkAnswer()">Submit</button>
			`
		})

		this.answer = questiondata.answer
		this.parent = parent
		this.state.answerState = 0 // {0: Unanswered, 1: Correct, 2: Incorrect}

		this.cssvars.qColor = state => ["black", "#080", "red"][state.answerState]
	}

	checkAnswer(){

		this.elem('button').setAttribute('disabled', 'true')

		this.parent.state.completed += 1

		console.log(this.parent)

		if( this.elem('input').value == this.answer){

			this.parent.state.turns += 1
			document.querySelector('#dice button').removeAttribute('disabled')

			this.state.answerState = 1
		}else{
			this.state.answerState = 2
		}

	}

}

class Game extends Component{

	constructor(dom){

		super(dom, {
			style: `
				this #board{
					display: grid;
					grid-template-rows: repeat(10, 50px);
					grid-template-columns: repeat(10, 50px);
				}
				this div span{
					border: 1px solid #000;
				}

				this #dice{
					margin-top: 10px;
				}

				this #dice span{
					width: 50px;
					height: 50px;
					display: flex;
					justify-content: center;
					align-items: center;
				}

				this > p{
					color: {{this.cssvars.connectedcolor}}
				}

				this #board span.a{
					background: rgba(0, 255, 0, 0.25)
				}

				this #board span span{
					display: inline;
					color: #f00;
				}

				this #board span span.you{
					color: #00f;
				}

			`,
			HTML: `
				Enter your name: <input type=text oninput="this.setPlayer(true)">
				Enter Opponent's name: <input type=text oninput="this.setPlayer(false)">
				<p dynamic>You are {{this.state.playername}}, Connected to {{this.state.otherplayer}}</p>
				<button onclick="this.connect()">connect</button>

				<div id=board>
				</div>
				<div id=dice>
					<span>x</span>
					<button onclick="this.roll()" disabled>Roll</button>
				</div>
			`
		})

		let s = ''
		for(let i = 0; i < 100; i++){
			let n = i;
			if(Math.floor(n/10) % 2){
				n = Math.floor(n/10)*10 + (9 - (n%10));
			}
			n = 100-n
			s += `<span class=${(n%2)?'a':'b'}>${n}</span>`
		}
		this.elem('#board').innerHTML = s

		this.parent = window.components[1]

		this.state.position = 0;
		this.state.connected = false

		this.state.playername = '???'
		this.state.otherplayer = '???'

		this.otherposition = 0

		this.cssvars.connectedcolor = state => state.connected?"#080":"black"

	}

	setPlayer(isPlayer){
		if(isPlayer){
			this.state.playername = this.elem('input').value
		}
		else{
			this.state.otherplayer = this.elem('input:nth-child(2)').value
		}
	}

	roll(){

		this.elem('#dice span').innerHTML = 'X'
		this.elem('#dice button').setAttribute('disabled', true)
		setTimeout(()=>{this.rollAfter()}, 500)

		this.parent.state.turns -= 1;

	}

	rollAfter(){

		console.log(this.parent)

		if(this.parent.state.turns > 0){
			this.elem('#dice button').removeAttribute('disabled')
		}

		let number = Math.floor(Math.random() * 6) + 1;

		this.board(this.state.position).innerHTML = 
			this.board(this.state.position).innerHTML.replace(/<span .*?>you<\/span>/g, '')

		console.log('please work', this.board(this.state.position))

		this.state.position += number;

		this.elem('#dice span').innerHTML = number;

		this.board(this.state.position).innerHTML += '<span class=you>you</span>'

		fetch('/play/' + this.state.playername + '/' + this.state.position)

	}

	connect(){
		fetch('/play/' + this.state.playername + '/' + this.state.position)
		this.serverloop()
	}

	serverloop(){

		let t = this

		fetch('/player/' + this.state.otherplayer).then( response =>{

			this.state.connected = response.ok

			if( response.ok ){

				response.json().then(
					data => {
						this.setOtherPosition(data)
					}
				)	
			}

		})

		setTimeout(()=>{t.serverloop()}, 1000)
	}

	setOtherPosition(pos){

		this.board(this.otherposition).innerHTML = 
			this.board(this.otherposition).innerHTML.replace(`<span>${this.state.otherplayer}</span>`, '')

		this.otherposition = pos

		this.board(this.otherposition).innerHTML += `<span>${this.state.otherplayer}</span>`

	}

	board(n){
		
		n += 1

		if(n == 0){return this.elem(`#board span:nth-child(${91})`)}

		// what even is this
		let f = n=> ((10 - Math.floor((n-1)/10) - 1) * 10) + (((Math.floor((n-1)/10))%2 == 0)? ((n-1)%10) +1 : 10 - ((n-1)%10))

		console.log(`board convert: ${n} to ${f(n)}`)

		return this.elem(`#board span:nth-child(${f(n)})`)
	}

}