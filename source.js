// Slomux - реализация Flux, в которой, как следует из нвазвания, что-то сломано.
// Нужно выяснить что здесь сломано

const createStore = (reducer, initialState) => {
  let currentState = initialState
  const listeners = []

  const getState = () => currentState
  const dispatch = action => {
    currentState = reducer(currentState, action)
    listeners.forEach(listener => listener())
  }

  const subscribe = listener => listeners.push(listener)

  return { getState, dispatch, subscribe }
}

const connect = (mapStateToProps, mapDispatchToProps) =>
  Component => {
    return class extends React.Component {
      render() {
        return (
          <Component
            {...mapStateToProps(store.getState())}
            {...mapDispatchToProps(store.dispatch)}
            {...this.props}
          />
        )
      }

      componentDidMount() {
        store.subscribe(this.handleChange)
      }

      handleChange = () => {
        this.forceUpdate()
      }
    }
  }

class Provider extends React.Component {
  componentWillMount() {
    window.store = this.props.store
  }
  
  render() {
    return this.props.children
  }
}

// APP

// actions
const ADD_TODO = 'ADD_TODO'

// action creators
const addTodo = todo => ({
  type: ADD_TODO,
  payload: todo,
})

// reducers
const reducer = (state = [], action) => {
  switch(action.type) {
    case ADD_TODO:
      state.unshift(action.payload)
      return state
    default:
      return state
  }
}

// components
class ToDoComponent extends React.Component {
  state = {
    todoText: ''
  }

  render() {
    return (
      <div>
        <label>{this.props.title || 'Без названия'}</label>
        <div>
          <form>
            <input
              value={this.state.todoText}
              placeholder="Название задачи"
              onChange={this.updateText.bind(this)}
            />
            <button type="submit" onClick={this.addTodo.bind(this)}>Добавить</button>
          </form>
          <ul>
            {this.props.todos.map((todo, idx) => <li key={idx}>{todo}</li>)}
          </ul>
        </div>
      </div>
    )
  }

  updateText(e) {
    this.setState({
      todoText: e.target.value
    })
  }

  addTodo(e) {
    e.preventDefault()
    if(this.state.todoText.trim() === '') {
      alert('Введите название'); return false
    }
    this.props.addTodo(this.state.todoText)

    this.setState({
      todoText: ''
    })
  }
}

const ToDo = connect(state => ({
  todos: state,
}), dispatch => ({
  addTodo: text => dispatch(addTodo(text)),
}))(ToDoComponent)

// init
ReactDOM.render(
  <Provider store={createStore(reducer, [])}>
    <ToDo title="Список задач"/>
  </Provider>,
  document.getElementById('app')
)
