
/**
 * Approach 1: vertical partitioning of entities.Inspired by vuex.
 *  - action types(verbs)
 *  - action dispatcher class (to be used by components to compose redux actions)
 *  - action parser class (to be used by reducers to immute states) 
 */
export enum TodoVerbs {
    CREATE_TODO="CREATE_TODO", 
    UPDATE_TODO="UPDATE_TODO", 
    DELETE_TODO="DELETE_TODO"
}
/**
 * This is equivalent to:
 * type LogLevelStrings = 'CREATE'|'UPDATE'|'DELETE';
 */
export type TodoVerbNames = keyof typeof TodoVerbs
interface TodoAction {
    type: TodoVerbs;
    details: any;
}
export interface TodoStateEntryType {
    id: string;
    text: string;
    done: boolean;
}
const reducer = (state: Array<TodoStateEntryType>, action: TodoAction) => {
    // Doing the same work being done in reducer function but in a separate class
    return (new TodoActionParser(state, action)).getState()
}
export default reducer

/**
 * Handles immutation of state. loads state from localstorage if previously stored
 */
class TodoActionParser {
    state: Array<TodoStateEntryType>
    constructor(state: Array<TodoStateEntryType> = localStorage.getItem("todos")===null?[]:JSON.parse(localStorage.getItem("todos") as string), action: TodoAction) {
        this.state = state
        switch (action.type) {
            case TodoVerbs.CREATE_TODO:
                this.create(action.details)
                break;
            case TodoVerbs.UPDATE_TODO:
                this.update(action.details)
                break;
            case TodoVerbs.DELETE_TODO:
                this.delete(action.details.id)
                break;
            default:
                break;
        }
    }
    private create(todo: TodoStateEntryType) {
        if (this.state.push) this.state.push(todo)

    }
    private update(todoData: TodoStateEntryType) {
        this.state = this.state.map((todo) => {
            if (todoData.id === todo.id) {
                return todoData
            }
            return todo
        })
    }
    private delete(todoId: string) {
        this.state = this.state.filter((todo) => {
            if (todo.id.indexOf(todoId) > -1) {
                return false;
            }
            return true
        })
    }
    getState() {
        // store state in localstorage to be retrieved in case of page reload. allows component to resume from where we left off
        if (this.state !== null) localStorage.setItem("todos", JSON.stringify(this.state))
        /**
         * Always return deep copy of state 
         * and not the same object again, 
         * else your components won't re-render  
         */
        return this.state !== null?[...this.state]:[]
    }

}
/**
 * Prepares action data for dispatch.
 */
export class TodoActionDispatcher {
    private storedDispatch: Function
    /**
     * Stores dispatch prop for action calls
     * @param dispatch dispatch argument received in mapDispatchToProps
     */
    constructor(dispatch: Function) {
        this.storedDispatch = dispatch
    }
    //----- action methods -----//
    createToDo(text: string) {
        const todo: TodoStateEntryType = {
            id: `todo-${Math.ceil(Math.random() * 10000)}-${(new Date()).getTime()}`,
            text,
            done: false
        };
        this.storedDispatch({
            type: TodoVerbs.CREATE_TODO,
            details: todo
        })

    }
    updateToDo(id: string, done: boolean, text: string) {
        this.storedDispatch({
            type: TodoVerbs.UPDATE_TODO,
            details: {
                id,done,text
            }
        })
    }
    deleteToDo(id: string) {
        this.storedDispatch({
            type: TodoVerbs.DELETE_TODO,
            details: {
                id
            }
        })
    }
    //----- !action methods -----//

    /**
     * returns function list to return in mapDispatchToProps
     */
    getDispatchToPropsMap() {
        const { deleteToDo, createToDo, updateToDo } = this
        // remember to bind functions in returned object so that they don't lose access to current context 
        return { createToDo: createToDo.bind(this), updateToDo: updateToDo.bind(this), deleteToDo: deleteToDo.bind(this) }
    }
}