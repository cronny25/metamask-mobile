import { REHYDRATE } from 'redux-persist';
import Engine from '../core/Engine';
import { store } from '../store';

const initialState = {
	backgroundState: {}
};

function initalizeEngine(state = {}) {
	Engine.init(state);
	Engine.datamodel.subscribe(() => {
		store.dispatch({ type: 'UPDATE_BG_STATE' });
	});
}

const rootReducer = (state = initialState, action) => {
	switch (action.type) {
		case REHYDRATE:
			initalizeEngine(action.payload && action.payload.backgroundState);
			return { ...state, ...action.payload };
		case 'UPDATE_BG_STATE':
			return { ...state, backgroundState: Engine.state };
		default:
			return state;
	}
};
export default rootReducer;
