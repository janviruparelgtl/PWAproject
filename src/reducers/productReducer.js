import {PRODUCT_RESULT_SUCCESS, PRODUCT_RESULT_ERROR} from '../constants/types'
const initialState = {
  prodArr: [],
  flag:'',
  prodError:''
}

export default (state = initialState, { type, payload }) => {
  switch (type) {

  case PRODUCT_RESULT_SUCCESS:
    return { 
      ...state,
      prodArr:payload,
      flag:false
  }
  case PRODUCT_RESULT_ERROR:
    return { 
      ...state,
      prodError:payload,
  }
  default:
    return state
  }
}
