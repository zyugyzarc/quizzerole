# Quizzerole

<img src="https://github.com/zyugyzarc/quizzerole/blob/main/icon.png?raw=true" width="150">

This project is a demonstration of my custom made ui-framework for javascript, inspired by react's component-like architecture.

Quizzerole is a quiz app, that makes you complete your homework to play board games. Part of [BC-Hacks](https://bchacks.dev/) 2024.

This particular version implements a game of snake-and-ladders, up to 2 players, on a configurable set of questions (in `questions.json`).

## How to play

running `server.py` (`flask` is the only dependency) will host an instance of the application at `http://localhost:8888/`. The left panel contains all the questions, while the right panel contains the game board.

If you want to play with a friend, type in a username, and your friends username, and click connect. Once both players connect and play a turn, both players will be visible on the game board.

Answering questions correctly on the left panel will grant you "turns", which you can use to roll the dice on the right panel, and advance on the board.

## About the framework

Currently taking name suggessions.

This framework has zero dependencies, and runs in vanilla javascript -- no nodejs, no babel. The framework is inspired by react's components -- where each Component is a class, which can be instanced. This is also intuituve in that all the HTML, CSS and javascript for a functional component end up in the same class.

For example, here is a quickstart:

```js

class MyComponent extends Component{

	constructor(dom){

		super(dom, {

			style: `
				this button{
					color: blue;
				}
			`,
			HTML: `
				<p dynamic> {{this.state.message}} </p>
				<button onclick="this.buttonClicked()">Click me</button>
			`
		})

		this.state.message = "..."
	}

	buttonClicked(){
		this.state.message = "Hello World!"
	}

}
```

(and a boilerplate HTML file)
```HTML
<html>
	<head>
		<title>Hello Component</title>
	</head>
	<body>
		<div component=MyComponent args=[]></div>

		<script src=component.js></script>
		<script src=myfile.js></script>
		<script> componentsInit() // component.js exports `componentsInit()` </script>
	</body>
</html>
```

### Components

Each component is a class that extends off `Component` (provided in `component.js`). Objects created from these components are "allocated" DOM nodes to live in, and styles that apply to them.

The easiest way to create a component is to make a HTML element (any element, but generally a `div`), with the `component=<classname>` and `args=<args>` (as seen in the example above). The `args` is a javascript array, that gets passed to the constructor of your component.

Each component has its own snippet of HTML and CSS, which is heavily tied together with yout Component Object:
- CSS selectors and styles (using the "this" prefix) only affect the current component, or the elements inside it.
- Any HTML element with the `dynamic` attribute will be reactive -- changing any attribute of `this.state` will update the reactive/dynamic content of the element. (dynamic elements cannot contain other dynamic elements or components.)
- Event handlers for the HTML-elements can be hooked in directly as shown in the example, without needing additional callbacks.

Most important of all: Components can contain other components.

### A bigger Example

For this example, I've implemented a Simple Todo-list using this framework.

```js

class TodoList extends Component{

	constructor(dom){

		super(dom, {
			style:``,
			HTML: `
				<h1>Todo List:</h1>
				
				<p dynamic> {{this.state.tasks}} tasks ({{this.state.completed}} completed,
				{{this.state.tasks - this.state.completed}} Pending)</p>
				
				<div id=todos></div>
				<button onclick="this.add()"> Add Task </button>
			`
		}, 'todolist')

		this.state.tasks = 0
		this.state.completed = 0

	}

	add(){ // adds a `Todo` element.

		let e = document.createElement('div')
		this.elem('#todos').appendChild(e)

		new Todo(e, this);
		this.state.tasks += 1
	}
}
```
```js
class Todo extends Component{

	constructor(dom, parent){

		super(dom, {
			style: `
				this{
					border: 1px solid black;
				}
				this p{
					text-decoration: {{this.cssvars.strikeName}};
					display: {{this.cssvars.showText}};
					color: {{this.cssvars.textColor}}
				}
				this .complete-btn {
					display: {{this.cssvars.showText}}
				}
				this input{
					display: {{this.cssvars.showInput}};
				}
			`,
			HTML: `
				<p dynamic>{{this.state.name}}</p>
				<input type=text oninput="this.edit()">

				<button onclick="this.edit_toggle()" dynamic>
					{{this.state.editing? "Save" : "Edit"}} </button>
				
				<button class=complete-btn onclick="this.completed()">Complete</button>
			`
		}, 'todoitem')

		this.parent = parent
		this.state.name = "Untittled Task"
		this.state.completed = false
		this.state.editing = false

		this.cssvars.strikeName = state => state.completed? "line-through" : "none"
		this.cssvars.textColor = state => state.completed? "#444" : "#000"
		this.cssvars.showInput = state => state.editing? "inline-block" : "none"
		this.cssvars.showText  = state => (!state.editing)? "inline-block" : "none"

		this.update()
	}

	edit_toggle(){
		this.state.editing = !this.state.editing;

		if(this.state.editing){
			this.elem('input').focus()
		}
	}

	edit(){
		this.state.name = this.elem('input').value
	}

	completed(){
		this.state.completed = !this.state.completed
		if(this.state.completed){
			this.parent.state.completed += 1
		}else{
			this.parent.state.completed -= 1
		}
	}
}
```


(and the boilerplate HTML)
```HTML
<html>
<head></head>
<body>

<div component=TodoList args=[]>

<script src=component.js></script>
<script src=todo.js></script>
<script> componentsInit() </script>

</body>
</html>
```

### Additional Features:

- Any component can be constructed in javascript, by calling its constructor and providing it a DOM node: such as `thing = new MyThing(document.getElementById('root'), some_other_args)`, similar to react's `createRoot`, but applies to all components (and not just the root one)

- `this.cssvars` are similar to `this.state`, but are for JS expressions that would be embedded in a css rule: for example, a style like `color: {{'green' if this.state.correct else 'red'}}` would be replimemented as `color: {{this.cssvars.correctColor}}` with `this.cssvars.correctColor = state => 'green' if state.correct else 'red'` in javascript.

More to come!