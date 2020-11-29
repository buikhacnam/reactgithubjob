import { useReducer, useEffect } from 'react'; //use this to handle state when fetching jobs
import axios from "axios";
//define all actions by creating a constant variable:
const ACTIONS = {
    MAKE_REQUEST: 'make-request',
    GET_DATA: 'get-data1',
    ERROR: 'error',
    UPDATE_HAS_NEXT_PAGE: "update-has-next-page"
};

const BASE_URL = "https://cors-anywhere.herokuapp.com/https://jobs.github.com/positions.json";

//reducer get call every time we call dispatch, and dispatch-whatever we passed into it is populated inside the action variable, and state is the current state of the application.
function reducer(state, action){
    switch (action.type){
        case ACTIONS.MAKE_REQUEST:
            return { loading: true, jobs: []}; //everytime make a request clear all the jobs we have
        case ACTIONS.GET_DATA:
            return {...state, loading: false, jobs: action.payload.jobs };
        case ACTIONS.ERROR:
            return {...state, loading: false, error: action.payload.error, jobs: [] };
        case ACTIONS.UPDATE_HAS_NEXT_PAGE:
            return {...state, hasNextPage: action.payload.hasNextPage }
        default:
            return state;
    }
};



//params is a object that hold all the information of the job like location, description or time...
// page is represent which page are we currently on.
export default function useFetchJob(params, page) {
    //use reducer gonna take a function reducer and initial state
    const [state, dispatch] = useReducer(reducer, { jobs: [], loading: true});
    
    //example of how dispatch work:
    //dispatch({ type: "hello", payload: {x : 3}})
    //in reducer function up there: action.type will be equal to "hello" and action.payload.x equal to 3
    // for invention: type is action and payload is data of that action

    useEffect(() => {
        //dont want to make request every time you type:
        const cancelToken1 = axios.CancelToken.source()
        dispatch( { type: ACTIONS.MAKE_REQUEST });
        axios.get(BASE_URL, {
            cancelToken: cancelToken1.token,
            params: { markdown: true, page: page, ...params }
        }).then(res => {
            dispatch({ type: ACTIONS.GET_DATA, payload: { jobs: res.data } });
        }).catch(e => {
            if (axios.isCancel(e)) return
            dispatch({ type: ACTIONS.ERROR, payload: { error: e } })
        });

        const cancelToken2 = axios.CancelToken.source();
        axios.get(BASE_URL, {
          cancelToken: cancelToken2.token,
          params: { markdown: true, page: page + 1, ...params }
        }).then(res => {
          dispatch({ type: ACTIONS.UPDATE_HAS_NEXT_PAGE, payload: { hasNextPage: res.data.length !== 0 } }) 
        }).catch(e => {
          if (axios.isCancel(e)) return
          dispatch({ type: ACTIONS.ERROR, payload: { error: e } }) 
        });

        return () => {
            cancelToken1.cancel();
            cancelToken2.cancel();
        }

    }, [params, page]);
    console.log(state);
    return state;
    //    return {
//        jobs: ["job1", "job2", "job2"],
//        loading: false,
//        error: false
//    }
   
    
};
